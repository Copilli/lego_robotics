import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Compartment } from '@codemirror/state';
import { undo, redo } from '@codemirror/commands';
import { openSearchPanel } from '@codemirror/search';
import { starter, snippets, loadProjects, saveProjects } from './projects.js';
import { lessons } from './lessons.js';
import { LegoBluetooth } from './ev3-transport.js';
import { Runtime } from './runtime.js';
import {loadLocalMedia, localMediaUrl, chooseLocalLessonVideo} from './local-media.js';
import {createBlocks} from './blocks.js';
import {exampleXML} from './block-code.js';
import {SimulatedEv3} from './simulator.js';
import './style.css';

const $ = s => document.querySelector(s);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let projects = loadProjects(localStorage), active = projects[0]?.id, view = 'class', lessonId = 'start', filter = '', dark = false;
let completed;
try { completed = JSON.parse(localStorage.getItem('copilli-lego-progress') || '[]'); completed = Array.isArray(completed) ? [...new Set(completed)].filter(id=>lessons.some(l=>l.id===id)) : []; } catch { completed = []; }
let editor, blockStudio, saveTimer;
let simulationEnabled=false;
let localMedia=[],libraryFilter='';
const theme = new Compartment(), wrap = new Compartment();
function notify(message) { $('#notice').textContent = message; }
function persist() { try { saveProjects(localStorage, projects); return true; } catch { notify('No se pudo guardar: revisa el espacio o los permisos del navegador. Exporta tu proyecto.'); return false; } }
function current() { return projects.find(p => p.id === active); }
function newProject(code = starter, name = 'Mi robot', options = {}) { save(); const project = {id:crypto.randomUUID(), name, code, updated:Date.now(), editorMode:'blocks', blocksXML:exampleXML(), ...options}; projects.unshift(project); active = project.id; persist(); view = 'editor'; render(); }
function save() {
  const p=current(); if ((!editor&&!blockStudio)||!p) return;
  if(blockStudio){p.blocksXML=blockStudio.serialize();try{p.code=blockStudio.compile();}catch{}}
  else p.code=editor.state.doc.toString();
  p.updated=Date.now();if(persist()&&$('#saved'))$('#saved').textContent='Guardado en este navegador';
}
function output(text) { const console = $('#console'); console.textContent = (console.textContent + text).slice(-30000); console.scrollTop = console.scrollHeight; }
let connection = 'disconnected', hubName = '';
const bluetooth = new LegoBluetooth({output, status:(state, name) => {connection = state; hubName = name || ''; if(state==='disconnected'&&runtime.transport===bluetooth) runtime.halt(); updateConnection();}});
const runtime = new Runtime(bluetooth,output);
const simulator = new SimulatedEv3(output);
function updateConnection() { $('#connect').textContent = connection === 'connected' ? `Desconectar ${hubName}` : 'Conectar hub'; $('#hub-status').textContent = connection === 'connected' ? `${hubName} conectado` : 'Hub sin conexión'; $('#hub-status').classList.toggle('online', connection === 'connected'); }
async function action(task) { try { await task(); } catch (error) { notify(error.name === 'NotFoundError' ? 'Selección cancelada. Puedes volver a conectar.' : error.message); } }
$('#app').innerHTML = `<header class="topbar"><a class="brand" href="#" aria-label="Copilli Robotics inicio"><span class="logo">C</span><strong>Copilli</strong><span>Robotics</span></a><div class="top-actions"><span id="hub-status">Hub sin conexión</span><button id="connect" class="primary">Conectar hub</button><span class="avatar" aria-label="Aula local">C</span></div></header>
<div class="layout"><aside class="sidebar"><p class="eyebrow">ESPACIO DE APRENDIZAJE</p><button data-view="class">▦ <span>Mi clase</span></button><button data-view="editor">⌘ <span>Editor de código</span></button><button data-view="tutorials">▷ <span>Tutoriales</span></button><button data-view="projects">▤ <span>Mis proyectos</span></button><div class="side-note"><span class="dot"></span> LEGO · MINDSTORMS EV3<p>Aprende, construye y programa.</p></div></aside><main><div id="notice" role="status" aria-live="polite"></div><div id="content"></div><section id="console-panel" hidden><div class="console-head"><strong>Consola EV3</strong><button id="clear-console">Limpiar</button></div><pre id="console" aria-label="Salida del hub" tabindex="0">Conecta un hub para ver su salida aquí.\n</pre></section></main></div><input id="file" type="file" accept=".js,.json" hidden>`;
$('.brand').onclick = e => {e.preventDefault(); save(); view='class'; render();};
const libraryButton=document.createElement('button');
libraryButton.dataset.view='library';libraryButton.innerHTML='<span>Videos locales</span>';
$('.sidebar').insertBefore(libraryButton,$('.side-note'));
document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => {save(); view=button.dataset.view; render();});
$('#connect').onclick = () => action(async () => { if (bluetooth.connected) { await runtime.stop(); await bluetooth.disconnect(); } else {notify('Selecciona el puerto Bluetooth de tu EV3 previamente emparejado.'); await bluetooth.connect(); notify('Hub conectado. Abre el editor para enviar tu programa.');} });
$('#clear-console').onclick = () => {$('#console').textContent = '';};
function cards() { return lessons.filter(l => `${l.title} ${l.label}`.toLowerCase().includes(filter.toLowerCase())).map((l,i) => `<button class="lesson-card" data-lesson="${l.id}"><div class="card-art ${l.color}"><span class="lesson-num">0${lessons.indexOf(l)+1}</span><span class="robot-art" aria-hidden="true">▦</span><span class="pill">${l.label}</span></div><div class="card-body"><small>${l.time} · Video + práctica</small><h3>${l.title}</h3><p>${l.summary}</p><div class="card-footer">${completed.includes(l.id)?'✓ Completado':'Abrir tutorial'} <span>→</span></div></div></button>`).join('') || '<p>No se encontraron tutoriales.</p>'; }
function render() {
  clearTimeout(saveTimer); editor?.destroy(); editor = null; blockStudio?.destroy(); blockStudio=null;
  document.querySelectorAll('[data-view]').forEach(b => {b.classList.toggle('selected',b.dataset.view===view); b.setAttribute('aria-current',b.dataset.view===view?'page':'false');});
  $('#console-panel').hidden = view !== 'editor';
  const container = $('#content');
  if (view === 'class') container.innerHTML = `<section class="hero"><div><p class="eyebrow">COPILLI · AULA DE ROBÓTICA</p><h1>Las grandes ideas<br>empiezan con una pieza.</h1><p>Tu espacio para construir, experimentar y darle vida a tus robots LEGO.</p><button id="start-project" class="white-button">+ Crear proyecto</button></div><div class="hero-robot" aria-hidden="true"><div class="robot-head"><i></i><i></i><b>• • •<br>• • •<br>• • •</b></div><div class="robot-wheels"><span></span><span></span></div><div class="orbit">&lt; / &gt;</div></div></section><div class="class-tabs"><strong>Tablón</strong><button data-go-tutorials>Trabajo de clase</button></div><div class="intro-row"><div><p class="eyebrow">TU SIGUIENTE PASO</p><h2>Construye. Programa. Descubre.</h2><p>Cinco tutoriales para comenzar, a tu propio ritmo.</p></div><span class="progress">${completed.length} / ${lessons.length} completados</span></div><div class="cards">${cards()}</div><section class="announcement"><span class="announcement-icon">i</span><div><h3>Antes de conectar tu robot</h3><p>Programa con bloques o JavaScript para controlar EV3. Empareja el EV3 por Bluetooth en tu sistema y selecciona su puerto serie desde Chrome o Edge de escritorio en HTTPS. El progreso y los proyectos se guardan en este navegador.</p><a href="https://education.lego.com/en-us/product-resources/mindstorms-ev3/" target="_blank" rel="noopener">Recursos y guía de EV3 ↗</a></div></section>`;
  if (view === 'tutorials') container.innerHTML = `<div class="page-heading"><p class="eyebrow">TRABAJO DE CLASE</p><h1>Aprende haciendo</h1><p>Videos oficiales de LEGO y prácticas guiadas dentro del aula.</p></div><label class="search">Buscar tutorial <input id="lesson-search" type="search" value="${escape(filter)}" placeholder="Motores, sensores, Bluetooth…"></label><div class="cards" id="lesson-cards">${cards()}</div>`;
  if (view === 'lesson') {
    const l=lessons.find(l=>l.id===lessonId);
    container.innerHTML = `<button id="back">← Todos los tutoriales</button><div class="page-heading"><p class="eyebrow">${l.label} · ${l.time}</p><h1>${l.title}</h1><p>${l.summary}</p></div><div class="lesson-layout"><section><iframe title="Video oficial LEGO: ${l.title}" src="${l.video}" allow="fullscreen" allowfullscreen loading="lazy"></iframe><p class="video-note">Video de LEGO Education. Requiere internet; puede estar en inglés. <a href="${l.video}" target="_blank" rel="noopener">Abrir video ↗</a> · <a href="${l.source}" target="_blank" rel="noopener">Fuente oficial</a></p><h2>Pasos de la práctica</h2><ol class="steps">${l.steps.map(s=>`<li>${s}</li>`).join('')}</ol></section><aside class="challenge"><p class="eyebrow">TU RETO</p><h2>Ahora te toca a ti</h2><p>${l.challenge}</p><button id="practice" class="primary">Abrir editor</button><button id="complete">${completed.includes(l.id)?'✓ Completado · desmarcar':'Marcar como completado'}</button><a href="https://ev3-help-online.api.education.lego.com/Education/en-us/index.html" target="_blank" rel="noopener">Referencia de EV3 ↗</a></aside></div>`;
    $('#back').onclick=()=>{view='tutorials';render();}; $('#practice').onclick=()=>newProject(starter,l.title,{blocksXML:exampleXML(l.id==='motors'?'motor':l.id==='start'?'hello':l.id),tutorialStep:l.id==='start'?0:undefined});
    $('#complete').onclick=()=>{completed=completed.includes(l.id)?completed.filter(id=>id!==l.id):[...completed,l.id];try{localStorage.setItem('copilli-lego-progress',JSON.stringify(completed));}catch{notify('No se pudo guardar el progreso.');}render();};
    const preserved=chooseLocalLessonVideo(localMedia,l.id);
    if(preserved){
      const video=document.createElement('video');video.controls=true;video.preload='metadata';video.src=localMediaUrl(preserved);video.setAttribute('aria-label',`Video local: ${l.title}`);
      $('.lesson-layout iframe').replaceWith(video);
      $('.video-note').innerHTML=`Copia local de ${preserved.application==='home'?'EV3 Home':'EV3 Education / Lab'}. No necesita el servidor de LEGO. El video muestra el software original; las prácticas de esta aula usan JavaScript. <a href="${localMediaUrl(preserved,true)}" download>Descargar original</a> · <a href="${l.video}" target="_blank" rel="noopener">Video alternativo en internet</a>`;
      video.addEventListener('error',()=>notify('El navegador no puede reproducir esta copia. Puedes descargar el original o abrir el video alternativo.'));
    }
  }
  if(view==='library'){
    container.innerHTML=`<div class="page-heading"><p class="eyebrow">PRESERVACIÓN EV3</p><h1>Videos locales</h1><p>${localMedia.length} videos de Home y Education / Lab disponibles en esta biblioteca. ${localMedia.filter(e=>e.browserPlayable).length} disponibles para reproducir aquí. Las versiones MP4 de los antiguos WMV conservan también su original para descargar.</p></div><label class="search">Buscar video <input id="media-search" type="search" placeholder="Motor, sensor, Home…" value="${escape(libraryFilter)}"></label><div id="media-list" class="media-list"></div>`;
    const paint=()=>{
      const results=localMedia.filter(e=>`${e.application} ${e.label} ${e.sourcePath}`.toLowerCase().includes(libraryFilter.toLowerCase()));
      $('#media-list').innerHTML=results.map(e=>`<article class="media-item"><small>${e.application==='home'?'Home':'Education / Lab'} · ${escape(e.locale)} · ${e.webFile?'MP4 · original WMV':escape(e.format.toUpperCase())}</small><h3>${escape(e.label)}</h3>${e.browserPlayable?`<video controls preload="none" src="${localMediaUrl(e)}" aria-label="${escape(e.label)}"></video>`:'<p>Original preservado. Descárgalo para abrirlo con un reproductor compatible.</p>'}<p class="media-source">${escape(e.sourcePath)}</p>${e.webFile?`<a href="${localMediaUrl(e)}" download>Descargar MP4 (${(e.webBytes/1048576).toFixed(1)} MB)</a> · `:''}<a href="${localMediaUrl(e,true)}" download>Descargar original (${(e.bytes/1048576).toFixed(1)} MB)</a></article>`).join('')||'<p>No hay videos locales disponibles. Prueba otra búsqueda o abre los tutoriales disponibles.</p>';
    };paint();$('#media-search').oninput=e=>{libraryFilter=e.target.value;paint();};
  }
  if (view === 'projects') {
    container.innerHTML = `<div class="page-heading"><p class="eyebrow">TU TALLER</p><h1>Mis proyectos</h1><p>Guardados localmente. Exporta tus archivos para llevarlos a otro equipo.</p></div><div class="project-actions"><button id="start-project" class="primary">+ Crear proyecto</button><button id="import">Importar .js o .json</button></div><div class="project-list">${projects.length ? projects.map(p=>`<article><span class="file-icon">⌘</span><div><h3>${escape(p.name)}</h3><p>${new Date(p.updated).toLocaleString('es-MX')}</p></div><button data-open="${p.id}">Abrir</button><button data-delete="${p.id}" class="danger">Eliminar</button></article>`).join('') : '<div class="empty"><h2>Tu primer robot empieza aquí</h2><p>Crea un proyecto o importa tu archivo JavaScript.</p></div>'}</div>`;
    document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{active=b.dataset.open;view='editor';render();});
    document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar este proyecto guardado en el navegador?')){projects=projects.filter(p=>p.id!==b.dataset.delete);persist();render();}});
  }
  if (view === 'editor') {
    if (!current()) {newProject();return;}
    const p=current();
    const inBlocks=p.editorMode==='blocks';
    container.innerHTML = `<div class="editor-heading"><div><p class="eyebrow">TALLER DE PROGRAMACIÓN</p><label>Proyecto <input id="project-name" value="${escape(p.name)}" maxlength="80"></label><small id="saved">Guardado en este navegador</small></div><div class="run-actions"><button id="run" class="primary">▶ Ejecutar</button><button id="stop" class="danger">■ Detener</button></div></div><div class="editor-modes"><button id="mode-blocks" aria-pressed="${inBlocks}">Bloques</button><button id="mode-js" aria-pressed="${!inBlocks}">JavaScript</button><label><input id="simulation" type="checkbox" ${simulationEnabled?'checked':''}> Simulador (sin robot)</label></div><div class="editor-toolbar"><button id="save">Guardar</button><button id="undo" title="Ctrl+Z">Deshacer</button><button id="redo">Rehacer</button><button id="search-code">Buscar / reemplazar</button><button id="import">Importar</button><button id="export">Exportar .js</button><button id="backup">Respaldo .json</button><button id="duplicate">Duplicar</button><button id="theme">Tema</button><label>Tamaño <select id="font"><option>14</option><option selected>16</option><option>18</option><option>20</option></select></label><label><input id="wrap" type="checkbox" checked> Ajustar líneas</label></div><div class="editor-grid"><section><div class="file-tab">${escape(p.name)}.js <span>JavaScript · EV3</span></div><div id="${inBlocks?'blocks-editor':'code-editor'}"></div></section><aside class="examples"><p class="eyebrow">CAJA DE HERRAMIENTAS</p><h3>Agrega un ejemplo</h3>${Object.keys(snippets).map(k=>`<button data-snippet="${k}">+ ${k}</button>`).join('')}<hr><h3>Conexión real</h3><p>Firmware EV3 original y puerto Bluetooth serie. El programa se ejecuta en el navegador y envía comandos al robot. iPad no admite esta conexión.</p><a href="https://education.lego.com/en-us/product-resources/mindstorms-ev3/" target="_blank" rel="noopener">Preparar mi EV3 ↗</a><p>Comprueba los puertos y despeja el área antes de ejecutar motores.</p></aside></div>`;
    if(!inBlocks) editor=new EditorView({doc:p.code,extensions:[basicSetup,javascript(),theme.of(dark?oneDark:[]),wrap.of(EditorView.lineWrapping),EditorView.contentAttributes.of({'aria-label':'Código JavaScript'}),EditorView.updateListener.of(update=>{if(update.docChanged){$('#saved').textContent='Guardando…';clearTimeout(saveTimer);saveTimer=setTimeout(save,400);}})],parent:$('#code-editor')});
    $('#project-name').oninput=e=>{p.name=e.target.value.trim()||'Mi robot';persist();};
    $('#save').onclick=save; $('#undo').onclick=()=>blockStudio?blockStudio.undo():undo(editor); $('#redo').onclick=()=>blockStudio?blockStudio.redo():redo(editor); $('#search-code').onclick=()=>openSearchPanel(editor);
    $('#theme').onclick=()=>{dark=!dark;editor.dispatch({effects:theme.reconfigure(dark?oneDark:[])});};
    $('#font').onchange=e=>$('#code-editor').style.fontSize=`${e.target.value}px`;
    $('#wrap').onchange=e=>editor.dispatch({effects:wrap.reconfigure(e.target.checked?EditorView.lineWrapping:[])});
    $('#run').onclick=()=>action(async()=>{save();$('#run').disabled=true;try{if(p.editorMode==='blocks'&&!blockStudio)throw new Error('No se pudo abrir el programa de bloques. Revisa el respaldo importado.');if(blockStudio)p.code=blockStudio.compile();runtime.transport=simulationEnabled?simulator:bluetooth;await runtime.run(p.code);}finally{$('#run') && ($('#run').disabled=false);}});
    $('#stop').onclick=()=>action(()=>runtime.stop());
    $('#export').onclick=()=>action(async()=>{if(blockStudio)p.code=blockStudio.compile();save();download(`${p.name.replace(/[^\p{L}\p{N}_-]/gu,'_')}.js`,p.code,'text/javascript');});
    $('#backup').onclick=()=>{save();download('copilli-lego-project.json',JSON.stringify(p,null,2),'application/json');};
    $('#duplicate').onclick=()=>{save();newProject(p.code,`${p.name} (copia)`,{blocksXML:p.blocksXML,editorMode:p.editorMode,tutorialStep:p.tutorialStep});};
    $('#mode-blocks').onclick=()=>{save();p.editorMode='blocks';p.blocksXML ||= exampleXML();persist();render();notify('Los bloques conservan su propio programa. JavaScript se genera al volver a abrir esa pestaña.');};
    $('#mode-js').onclick=()=>action(async()=>{if(blockStudio)p.code=blockStudio.compile();save();p.editorMode='js';persist();render();notify('Puedes editar JavaScript. Los cambios de texto no se convierten automáticamente a bloques.');});
    $('#simulation').onchange=()=>action(async()=>{await runtime.stop();simulationEnabled=$('#simulation').checked;notify(simulationEnabled?'Simulador activo: no envía comandos a un robot.':'Modo robot: conecta tu EV3 para ejecutar.');});
    if(inBlocks){
      try{blockStudio=createBlocks($('#blocks-editor'),{xml:p.blocksXML,onChange:()=>{clearTimeout(saveTimer);saveTimer=setTimeout(save,400);}});}catch(error){notify('No se pudo cargar el proyecto de bloques: '+error.message);}
      for(const id of ['search-code','theme','font','wrap'])$('#'+id).disabled=true;
      if(blockStudio){
        const paletteButton=document.createElement('button');
        paletteButton.id='toggle-palette';
        paletteButton.textContent=blockStudio.paletteVisible?'Ocultar bloques':'Agregar bloques';
        paletteButton.onclick=()=>{paletteButton.textContent=blockStudio.togglePalette()?'Ocultar bloques':'Agregar bloques';};
        $('.editor-toolbar').prepend(paletteButton);
      }
      $('.file-tab').innerHTML='Programa por bloques <span>Arrastra y conecta a la bandera</span>';
      $('.examples').innerHTML='<p class="eyebrow">EMPEZAR</p><h3>Ejemplos editables</h3>'+[['hello','Mi primer programa'],['motor','Motor A'],['distance','Distancia'],['color','Color'],['touch','Contacto'],['gyro','Giroscopio']].map(([id,label])=>'<button data-example="'+id+'">'+label+'</button>').join('')+'<p>Los ejemplos reemplazan los bloques actuales. Guarda una copia para conservar tu programa.</p>';
      document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>{if(!blockStudio)return;blockStudio.loadExample(b.dataset.example);save();});
    }
    mountGuide(p);
    document.querySelectorAll('[data-snippet]').forEach(b=>b.onclick=()=>{const position=editor.state.doc.length;editor.dispatch({changes:{from:position,insert:'\n'+snippets[b.dataset.snippet]}});editor.focus();});
  }
  if(view==='class'){
    $('.class-tabs').outerHTML=`<section class="home-projects"><h2>Mis proyectos</h2><div class="project-shelf"><button id="home-new"><span>＋</span><strong>Nuevo proyecto</strong><small>Programa con bloques</small></button>${projects.slice(0,3).map(p=>`<button data-home-open="${p.id}"><span>⌘</span><strong>${escape(p.name)}</strong><small>${p.editorMode==='blocks'?'Bloques':'JavaScript'}</small></button>`).join('')}</div></section><section class="start-course"><div><p class="eyebrow">INICIAR · 4 PASOS</p><h2>Mi primer programa</h2><p>Conecta tu EV3, reproduce un sonido, mueve un motor y lee un sensor.</p></div><button id="start-guide" class="primary">Iniciar</button></section>`;
  }
  $('#start-project')?.addEventListener('click',()=>newProject()); $('#import')?.addEventListener('click',()=>$('#file').click());
  document.querySelectorAll('[data-go-tutorials]').forEach(b=>b.onclick=()=>{view='tutorials';render();});
  $('#home-new')?.addEventListener('click',()=>newProject());
  $('#start-guide')?.addEventListener('click',()=>newProject(starter,'Mi primer programa',{tutorialStep:0}));
  document.querySelectorAll('[data-home-open]').forEach(b=>b.onclick=()=>{active=b.dataset.homeOpen;view='editor';render();});
  bindLessons();
  $('#lesson-search')?.addEventListener('input',e=>{filter=e.target.value;$('#lesson-cards').innerHTML=cards();bindLessons();});
}
function mountGuide(p){
  const steps=[
    ['Conecta tu EV3','Enciende el EV3. En su menú Bluetooth activa Bluetooth y Visibilidad. Empareja el EV3 desde Configuración de Windows y confirma la clave en ambos dispositivos. Usa Chrome o Edge de escritorio. Pulsa Conectar hub y selecciona el puerto serie Bluetooth de salida del EV3. Si no aparece, cierra otras apps LEGO que puedan ocuparlo.','hello'],
    ['Tu primer programa','Conecta los bloques a la bandera. Este ejemplo muestra un saludo en la consola y reproduce un tono de 440 Hz. Pulsa Ejecutar y espera a ver «Programa terminado».','hello'],
    ['Mueve un motor','Conecta un motor al puerto A y deja espacio para que gire. El ejemplo lo mueve a velocidad 30 durante un segundo y después lo detiene. Puedes cambiar el puerto, la velocidad y el tiempo en el bloque.','motor'],
    ['Lee un sensor','Conecta el sensor ultrasónico al puerto 1. El ejemplo muestra la distancia en centímetros. Si tienes otro sensor, cambia el tipo y puerto en el bloque: color, contacto, giro o infrarrojo. En simulación las lecturas son valores de prueba.','distance'],
  ];
  if(!Number.isInteger(p.tutorialStep))return;
  const index=Math.max(0,Math.min(3,p.tutorialStep)),step=steps[index];
  const aside=$('.examples');aside.innerHTML='<p class="eyebrow">MI PRIMER PROGRAMA · '+(index+1)+' / 4</p><h3>'+step[0]+'</h3><p>'+step[1]+'</p>'+(index===0?'<button id="guide-connect">Conectar EV3</button><p>También puedes activar el simulador para practicar sin robot.</p>':'<button id="guide-example">Cargar ejemplo de este paso</button>')+'<div class="guide-nav"><button id="guide-prev" '+(index===0?'disabled':'')+'>Anterior</button><button id="guide-next">'+(index===3?'Completar':'Siguiente')+'</button></div><button id="guide-close">Cerrar guía</button>';
  $('#guide-connect')?.addEventListener('click',()=>$('#connect').click());
  $('#guide-example')?.addEventListener('click',()=>{if(blockStudio){blockStudio.loadExample(step[2]);save();}else notify('Abre la pestaña Bloques para cargar este ejemplo.');});
  $('#guide-prev').onclick=()=>{save();p.tutorialStep=index-1;persist();render();};
  $('#guide-next').onclick=()=>{
    if(index===0&&!bluetooth.connected&&!simulationEnabled){notify('Conecta el EV3 o activa el simulador antes de continuar.');return;}
    save();
    if(index===3){if(!completed.includes('start'))completed.push('start');try{localStorage.setItem('copilli-lego-progress',JSON.stringify(completed));}catch{notify('No se pudo guardar el progreso.');}delete p.tutorialStep;persist();render();notify('Tutorial completado. Sigue experimentando con tus bloques.');}
    else{p.tutorialStep=index+1;persist();render();}
  };
  $('#guide-close').onclick=()=>{save();delete p.tutorialStep;persist();render();};
}
function bindLessons(){document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{lessonId=b.dataset.lesson;view='lesson';render();});}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#file').onchange=()=>action(async()=>{const file=$('#file').files[0];if(!file)return;try{if(file.size>1000000)throw new Error('El archivo debe pesar menos de 1 MB.');const text=await file.text();if(file.name.endsWith('.json')){const p=JSON.parse(text);if(typeof p.code!=='string'||typeof p.name!=='string')throw new Error('El respaldo debe incluir name y code.');newProject(p.code,p.name.slice(0,80),{editorMode:p.editorMode==='blocks'&&typeof p.blocksXML==='string'?'blocks':'js',blocksXML:typeof p.blocksXML==='string'?p.blocksXML:undefined});}else newProject(text,file.name.replace(/\.js$/i,'').slice(0,80),{editorMode:'js'});notify('Proyecto importado.');}finally{$('#file').value='';}});
window.addEventListener('beforeunload',save);
render();
loadLocalMedia().then(entries=>{localMedia=entries;if(['library','lesson'].includes(view))render();});
