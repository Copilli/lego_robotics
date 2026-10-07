let catalog={units:[],activities:[],manuals:[]},selectedUnit,selectedManual,manualPage=0,returnToEditor=false;
const base=import.meta.env.BASE_URL+'content/';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=s=>{const d=document.createElement('div');d.innerHTML=s||'';return d.textContent.replace(/&nbsp;/g,' ').trim();};
function teacherText(value){
 if(!value||typeof value!=='object')return '';
 return Object.entries(value).flatMap(([key,item])=>{
  if(typeof item==='string')return /^(content|description|value|lesson_plan|learning_objectives|assessment|differentiation|preparation)$/.test(key)?[text(item)]:[];
  return item&&typeof item==='object'?[teacherText(item)]:[];
 }).filter(Boolean).join('\n\n');
}
const image=(url,alt)=>url?`<img src="${base+url}" alt="${esc(alt)}" loading="lazy">`:'';
function practiceKind(step){const content=step.title+' '+step.description;if(/color/i.test(content))return 'color';if(/contacto|táctil|touch/i.test(content))return 'touch';if(/girosensor|giroscopio|gyro/i.test(content))return 'gyro';if(/sensor|distancia|ultrasónico/i.test(content))return 'distance';if(/motor|motriz|movimiento/i.test(content))return 'motor';return 'hello';}
export async function loadCurriculum(){const r=await fetch(base+'catalog.json');if(!r.ok)throw new Error('Biblioteca no disponible');catalog=await r.json();return catalog;}
export function curriculumView(view,container,{navigate,newProject,projects,openProject}){
  const card=(a,index)=>`<button class="curriculum-card" data-activity="${esc(a.id)}">${image(a.image,a.title)}<div class="curriculum-card-copy">${index!==undefined?`<span class="intro-number">${index+1}</span>`:''}<div><h2>${esc(text(a.title))}</h2><p>${esc(text(a.summary))}</p></div></div></button>`;
  const launch=id=>{const a=catalog.activities.find(a=>a.id===id);if(a)newProject(undefined,text(a.title),{activityId:id,activityStep:0,blocksXML:'<xml xmlns="https://developers.google.com/blockly/xml"></xml>'});};
  if(view==='start')container.innerHTML=`<h1 class="classroom-title">Introducción</h1><div class="introduction-cards">${catalog.activities.filter(a=>a.unitId==='introduction').map(card).join('')}</div>`;
  else if(view==='class')container.innerHTML=`<section class="classroom-welcome"><div><p>LEGO MINDSTORMS EV3</p><h1>¿Qué vas a crear hoy?</h1><button class="primary" id="welcome-new">Nuevo proyecto</button></div>${image(catalog.activities[2]?.image,'Base motriz EV3')}</section><div class="home-destinations"><button data-destination="start"><h2>Iniciar</h2><p>Tu primer programa, motores y sensores.</p></button><button data-destination="units"><h2>Unidades</h2><p>Robots, misiones y retos para aprender.</p></button><button data-destination="build"><h2>Construir</h2><p>Instrucciones de todos tus modelos.</p></button></div><h2>Mis proyectos</h2><div class="project-shelf">${projects.slice(0,4).map(p=>`<button data-curriculum-project="${p.id}"><strong>${esc(p.name)}</strong><small>${p.editorMode==='blocks'?'Bloques':'JavaScript'}</small></button>`).join('')}</div>`;
  else if(view==='units'||view==='tutorials')container.innerHTML=`<h1 class="classroom-title">Unidades</h1>${[['classroom','Aprender con misiones'],['home','Robots y misiones'],['base','Robots del kit base'],['expansion','Robots del set de expansión']].map(([g,label])=>`<section class="unit-group"><h2>${label}</h2><div class="unit-cards">${catalog.units.filter(u=>u.group===g).map(u=>`<button class="curriculum-card" data-unit="${u.id}">${image(u.image,u.title)}<div class="curriculum-card-copy"><div><h2>${esc(text(u.title))}</h2><p>${esc(text(u.summary))}</p><small>${u.activities.length} sesiones</small></div></div></button>`).join('')}</div></section>`).join('')}`;
  else if(view==='unit'){
    const u=catalog.units.find(u=>u.id===selectedUnit);if(!u){navigate('units');return true;}
    container.innerHTML=`<button data-destination="units">Volver a unidades</button><section class="unit-hero"><div><h1>${esc(text(u.title))}</h1><p>${esc(text(u.summary))}</p></div>${image(u.image,u.title)}</section><div class="session-tabs"><strong>SESIONES</strong><button id="teacher-tab">RECURSOS PARA PROFESORES</button></div><div id="teacher-resources" hidden></div><div class="session-list">${u.activities.map(id=>{const a=catalog.activities.find(a=>a.id===id);return `<article>${image(a.image||u.image,a.title)}<div><h2>${esc(text(a.title))}</h2><p>${esc(text(a.summary))}</p></div><button class="outline" data-activity="${id}">INICIAR</button></article>`;}).join('')}</div>`;
    container.querySelector('#teacher-tab').onclick=()=>{const target=container.querySelector('#teacher-resources');target.hidden=!target.hidden;target.innerHTML=u.activities.map(id=>{const a=catalog.activities.find(a=>a.id===id);return a.teacherSupport?`<article><h3>${esc(text(a.title))}</h3><p>${esc(teacherText(a.teacherSupport))}</p></article>`:'';}).join('')||'<p>No hay recursos para profesores en esta copia.</p>';};
  }
  else if(view==='build')container.innerHTML=`<h1 class="classroom-title">Construir</h1><p>Instrucciones conservadas en este sitio. Elige tu modelo.</p><button data-destination="library">Videos locales</button><div class="unit-cards">${catalog.manuals.map(m=>`<button class="curriculum-card" data-manual="${m.id}">${image(m.image||m.images?.[0],m.title)}<div class="curriculum-card-copy"><div><h2>${esc(text(m.title))}</h2><p>${m.stepCount||m.images?.length||''} pasos</p></div></div></button>`).join('')}</div>`;
  else if(view==='manual'){
    const m=catalog.manuals.find(m=>m.id===selectedManual);if(!m){navigate('build');return true;}
    container.innerHTML=`<div class="manual-heading"><button id="manual-back">${returnToEditor?'Volver al tutorial':'Volver a Construir'}</button><h1>${esc(text(m.title))}</h1></div><div class="manual-viewer">${m.video?`<video controls preload="metadata" src="${base+m.video}" aria-label="Instrucciones de ${esc(text(m.title))}"></video>`:image(m.images?.[manualPage],`Paso ${manualPage+1}`)}</div>${m.images?`<div class="manual-navigation"><button id="manual-prev" ${manualPage===0?'disabled':''}>Anterior</button><span>${manualPage+1} / ${m.images.length}</span><button id="manual-next" ${manualPage===m.images.length-1?'disabled':''}>Siguiente</button></div>`:`<p class="manual-caption">${m.stepCount} pasos de construcción. Usa los controles del video para pausar y revisar cada paso.</p>`}`;
    container.querySelector('#manual-back').onclick=()=>navigate(returnToEditor?'editor':'build');
    container.querySelector('#manual-prev')?.addEventListener('click',()=>{manualPage--;navigate('manual');});container.querySelector('#manual-next')?.addEventListener('click',()=>{manualPage++;navigate('manual');});
  }else return false;
  container.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>launch(b.dataset.activity));
  container.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{selectedUnit=b.dataset.unit;navigate('unit');});
  container.querySelectorAll('[data-manual]').forEach(b=>b.onclick=()=>{selectedManual=b.dataset.manual;manualPage=0;returnToEditor=false;navigate('manual');});
  container.querySelectorAll('[data-destination]').forEach(b=>b.onclick=()=>navigate(b.dataset.destination));
  container.querySelectorAll('[data-curriculum-project]').forEach(b=>b.onclick=()=>openProject(b.dataset.curriculumProject));
  container.querySelector('#welcome-new')?.addEventListener('click',()=>newProject());
  return true;
}
export function mountCurriculumGuide(p,{studio,save,render,navigate,notify}){
  if(!p.activityId)return;
  const a=catalog.activities.find(a=>a.id===p.activityId);if(!a)return;
  const index=Math.max(0,Math.min(a.steps.length-1,p.activityStep||0)),s=a.steps[index];
  const aside=document.querySelector('.examples');aside.className='examples classroom-guide';
  const originalStacks=[...(s.codeStacks||[]),...(typeof s.sourceXML==='string'?[{xml:s.sourceXML,comments:[]}]:[])];
  aside.innerHTML=`<div class="tutorial-count"><strong>${String(index+1).padStart(2,'0')}</strong><span>/${String(a.steps.length).padStart(2,'0')}</span><button id="expand-tutorial" aria-label="Ampliar tutorial">⤢</button></div>${s.video?`<video controls preload="metadata" src="${base+s.video}"></video>`:image(s.image,s.title)}<h2>${esc(text(s.title)||text(a.title))}</h2><p class="tutorial-description">${esc(text(s.description))}</p>${originalStacks.length?`<details><summary>Programa original y comentarios</summary>${originalStacks.map(c=>`<p>${(c.comments||[]).map(esc).join('<br>')}</p><pre>${esc(c.xml)}</pre>`).join('')}<p>Este programa utiliza bloques originales de LEGO. Su ejecución requiere adaptar los bloques que aún no admite el editor.</p></details>`:''}<button id="tutorial-example">Cargar ejemplo compatible</button><p class="example-caption">Ejemplo de práctica del editor: ${({hello:'saludo y tono',motor:'motor A durante un segundo',distance:'sensor de distancia en puerto 1',color:'sensor de color en puerto 1',touch:'sensor de contacto en puerto 1',gyro:'giroscopio en puerto 1'})[practiceKind(s)]}. No reemplaza el programa original.</p><div class="tutorial-nav"><button id="tutorial-prev" aria-label="Paso anterior" ${index===0?'disabled':''}>❮</button>${s.manualIds?.length?`<button id="tutorial-build" class="outline">CONSTRUIR</button>`:''}<button id="tutorial-next" aria-label="Paso siguiente">${index===a.steps.length-1?'Terminar':'❯'}</button></div><button id="tutorial-close">Cerrar tutorial</button>`;
  const palette=[...a.steps.slice(0,index+1)].reverse().find(step=>step.toolbox?.length)?.toolbox||a.toolbox||[];
  studio?.setLessonPalette(palette);
  const all=document.createElement('button');all.id='all-blocks';all.textContent=p.allBlocks?'Bloques del tutorial':'Todos los bloques de código';all.onclick=()=>{p.allBlocks=!p.allBlocks;studio?.setLessonPalette(p.allBlocks?null:palette);all.textContent=p.allBlocks?'Bloques del tutorial':'Todos los bloques de código';save();};document.querySelector('.editor-toolbar').prepend(all);
  if(p.allBlocks)studio?.setLessonPalette(null);
  aside.querySelector('#tutorial-prev').onclick=()=>{save();p.activityStep=index-1;save();render();};
  aside.querySelector('#tutorial-next').onclick=()=>{save();if(index===a.steps.length-1){p.activityCompleted=true;delete p.activityId;save();render();notify('Sesión completada. Tu proyecto sigue disponible.');}else{p.activityStep=index+1;save();render();}};
  aside.querySelector('#tutorial-close').onclick=()=>{save();delete p.activityId;render();};
  aside.querySelector('#tutorial-example').onclick=()=>{if(!studio){notify('Abre Bloques para cargar el ejemplo.');return;}if(!confirm('¿Reemplazar los bloques actuales con el ejemplo de práctica?'))return;studio.loadExample(practiceKind(s),'Ejemplo de práctica compatible del editor: '+text(s.title)+'. Revisa los puertos de los bloques antes de ejecutarlo. El programa original se conserva en el tutorial.');save();};
  if(!originalStacks.length&&(!/program|código|motor|sensor/i.test(s.title)||s.manualIds?.length)){
    aside.querySelector('#tutorial-example').hidden=true;aside.querySelector('.example-caption').hidden=true;
  }
  aside.querySelector('#tutorial-build')?.addEventListener('click',()=>{save();selectedManual=s.manualIds[0];manualPage=0;returnToEditor=true;navigate('manual');});
  aside.querySelector('#expand-tutorial').onclick=()=>aside.classList.toggle('expanded');
}
