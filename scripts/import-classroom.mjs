import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const cache = process.env.LEGO_CLASSROOM_CONTENT || 'C:/Users/stomp/OneDrive/Documentos/LEGO Education EV3 Content';
const packed = '.preservation/classroom/extracted/assets/prepacked';
const out = 'public/content';
fs.mkdirSync(`${out}/assets`, {recursive:true});
fs.mkdirSync(`${out}/icons`, {recursive:true});
fs.mkdirSync(`${out}/fonts`, {recursive:true});
for(const weight of ['Regular','Bold']){
  const name=`LEGO-Chalet60-${weight}.woff2`;
  fs.copyFileSync(`.preservation/classroom/extracted/assets/webapp/renderer/fonts/${name}`,`${out}/fonts/${name}`);
}
const sprite=fs.readFileSync('.preservation/classroom/extracted/assets/webapp/renderer/static/svg/sprite.svg','utf8');
for(const [name,id] of Object.entries({home:'_48IconHomeGreyExpanded',start:'_48Spaceship',units:'_48DocMini',build:'_192Box',projects:'_48BookSmall'})){
  const match=[...sprite.matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/g)].find(m=>m[1].includes(`id="${id}"`));
  if(match)fs.writeFileSync(`${out}/icons/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" ${match[1].match(/viewBox="[^"]+"/)?.[0]||''}>${match[2]}</svg>`);
}
const catalog = {version:1,units:[],activities:[],manuals:[],missing:[],assets:[]};
const copied = new Map();
function asset(value) {
  if (!value) return null;
  if (typeof value === 'object') value=value.url;
  if (!value || /^https?:/.test(value)) return null;
  const relative=value.replace(/^\/+/, '');
  if(relative.split('/').includes('..')) throw new Error('Unsafe asset path');
  const file=[path.join(cache,relative),path.join(packed,relative)].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
  if(!file){catalog.missing.push(relative);return null;}
  if(copied.has(file))return copied.get(file);
  const bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
  const target=`assets/${hash.slice(0,20)}${path.extname(file).toLowerCase()}`;
  if(!fs.existsSync(`${out}/${target}`))fs.writeFileSync(`${out}/${target}`,bytes);copied.set(file,target);
  catalog.assets.push({file:target,sha256:hash,bytes:bytes.length,source:file});return target;
}
function video(value){
  if(!value)return null;
  if(typeof value==='string')return /\.[a-z0-9]+$/i.test(value)?asset(value):asset(value+'.webm')||asset(value+'.mp4');
  if(value.relativeOSVideos)return asset(value.relativeOSVideos.windows)||asset(value.relativeOSVideos.unix);
  return video(value.video||value.url);
}
function manual(record){
  if(!record)return null;
  const b=record.building_instruction||record;
  if(b.building_instructions)return b.building_instructions.map(manual).filter(Boolean);
  if(b.buildingInstructions)return b.buildingInstructions.map(x=>manual({...x,title:x.title||b.title})).flat().filter(Boolean);
  const media=video(b.building_instruction_video||b.videoURLs||b.videoUrl||b.videos?.urls?.video_hd_download);
  if(!media)return null;
  let found=catalog.manuals.find(m=>m.video===media);
  if(!found){const inferred=Number(b.videos?.urls?.video_hd_download?.match(/_(\d+)$/)?.[1]||0);found={id:'manual-'+catalog.manuals.length,title:(b.building_instruction_title||b.title||'Instrucciones de construcción').replace('Base notriz','Base motriz'),image:asset(b.building_instruction_thumbnail||b.thumbnail),video:media,stepCount:b.number_of_steps||b.steps||inferred};catalog.manuals.push(found);}
  return found.id;
}
function normalizeStep(s,index){
  if(s.step)s=s.step;
  const result={id:s.id||`step-${index}`,title:s.title||s.overlayInstruction||'',description:s.description||'',image:asset(s.image),video:video(s.video),toolbox:s.toolbox||[],manualIds:[],sourceXML:s.ghostBlocks||s.xml||null,comments:[]};
  if(s.clickHighlight?.location==='hub'){result.title='Conecta tu EV3';result.description='Enciende el EV3 y activa Bluetooth y Visibilidad. Empareja el robot desde la configuración de Windows y confirma la clave. En Chrome o Edge, pulsa Conectar hub y elige el puerto serie Bluetooth de salida. También puedes practicar con el simulador.';}
  if(s.isActivityBuildingInstruction){const id=manual(s);if(id)result.manualIds.push(id);}
  if(s.buildinginstruction)result.manualIds.push(...[manual(s.buildinginstruction)].flat(2).filter(Boolean));
  for(const item of s.content||[]){
    if(item.text)result.description+=item.text.content||'';
    if(item.images)result.image=asset(item.images.image?.[0])||result.image;
    if(item.videos)result.video=video(item.videos.video?.[0])||result.video;
    if(item.video)result.video=video(item.video)||result.video;
    if(item.building_instructions)result.manualIds.push(...item.building_instructions.building_instruction.flatMap(x=>manual(x)||[]));
    for(const p of item.reduced_palettes?.reduced_palette||[])for(const group of p.palette_blocks||[])for(const category of Object.values(group))result.toolbox.push(...category.blocks||[]);
    if(item.code_stacks){result.codeStacks=item.code_stacks.code_stack.map(c=>({xml:c.xml,comments:c.comments?.map(x=>x.comment)||[],title:c.title}));}
  }
  return result;
}
for(let i=1;i<=3;i++){
  const a=JSON.parse(fs.readFileSync(`${packed}/es-MX/gettingstarted/activities/gettingstarted${i}/manifest.json`));
  catalog.activities.push({id:a.id,unitId:'introduction',title:i===3?'¡En marcha!':a.title,summary:['Cómo crear tu primer programa','Cómo controlar las entradas y salidas','Cómo construir una Base motriz'][i-1],image:asset(`/images/gettingstarted${i}-thumbnail.png`),duration:a.duration,steps:a.steps.map(normalizeStep).filter(s=>s.title||s.description||s.image||s.manualIds.length||s.sourceXML),toolbox:a.toolbox});
}
const lobby=JSON.parse(fs.readFileSync(`${cache}/lobby.json`)).locales['es-mx'];
for(const entry of lobby){
  const file=`${cache}/${entry.uid}.json`;
  if(!fs.existsSync(file)){catalog.missing.push(`${entry.uid}.json`);continue;}
  const u=JSON.parse(fs.readFileSync(file))['es-mx'];
  const unit={id:entry.uid,title:u.unit_plan_title||entry.title,summary:u.unit_plan_description||u.student_introduction,image:null,group:'classroom',activities:[]};
  // Image URLs remain local to the application's downloaded catalog.
  function findImage(x){if(!x||typeof x!=='object')return null;for(const [k,v] of Object.entries(x)){if(k==='url'&&typeof v==='string'&&/unit-plan.*\.(png|jpg)/.test(v))return asset(v);const found=findImage(v);if(found)return found;}return null;}
  unit.image=findImage(entry)||findImage(u);
  for(const l of u.lessons){
    const steps=(l.student_worksheet_steps||[]).map(normalizeStep);
    const a={id:l.uid,unitId:unit.id,title:l.lesson_title,summary:l.lesson_sub_title||l.lesson_description,duration:l.lesson_duration,image:steps.find(s=>s.image)?.image,steps,teacherSupport:l.teacher_support};
    catalog.activities.push(a);unit.activities.push(a.id);
  }
  catalog.units.push(unit);
}
const models={id:'classroom-core',title:'Robots del kit base',summary:'Construye y programa los modelos del set educativo.',group:'base',activities:[]};
const modelInfo=JSON.parse(fs.readFileSync(`${packed}/es-MX/models.json`)).units[0].activities;
for(let i=1;i<=4;i++){
  const a=JSON.parse(fs.readFileSync(`${packed}/es-MX/core-models-edu/activities/model-${i}/manifest.json`));
  const steps=a.steps.map(normalizeStep).filter(s=>s.title||s.description||s.image||s.manualIds.length||s.sourceXML);
  const info=modelInfo[i-1];
  const activity={id:`classroom-model-${i}`,unitId:`robot-core-${i}`,title:info.title,summary:info.description||'',image:asset(info.image)||steps.find(s=>s.image)?.image,steps,toolbox:a.toolbox};
  for(const s of steps)for(const id of s.manualIds){const m=catalog.manuals.find(m=>m.id===id);if(m){if(m.title==='Instrucciones de construcción')m.title=info.title;m.image ||= s.image||activity.image;}}
  catalog.activities.push(activity);models.activities.push(activity.id);
  catalog.units.push({id:activity.unitId,title:info.title,summary:info.description,image:activity.image,group:'base',activities:[activity.id]});
}
catalog.missing=[...new Set(catalog.missing)];
fs.writeFileSync(`${out}/catalog.json`,JSON.stringify(catalog,null,2));
console.log(JSON.stringify({units:catalog.units.length,activities:catalog.activities.length,manuals:catalog.manuals.length,assets:catalog.assets.length,missing:catalog.missing}));
