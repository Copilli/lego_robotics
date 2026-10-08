import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const file='public/content/catalog.json';
const catalog=JSON.parse(await fs.readFile(file,'utf8'));
const ffmpeg=process.env.FFMPEG_PATH||(process.platform==='win32'?'C:/Program Files/XPG/XPG-Prime/ProDllSDK/ffmpeg.exe':'ffmpeg');
// Classroom encodes each building instruction as one video frame. Decode every
// frame, without sampling or duplicating frames. Some source counts exclude a
// cover page; the carousel counts the actual decoded pages, keeping that cover.
for(const manual of catalog.manuals.filter(manual=>manual.video&&!manual.images?.length)){
  const name=path.basename(manual.video,path.extname(manual.video));
  const directory=path.join('public/content/building',name);await fs.mkdir(directory,{recursive:true});
  const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',path.join('public/content',manual.video),'-vsync','0','-q:v','2',path.join(directory,'%04d.jpg')],{encoding:'utf8',windowsHide:true});
  if(result.error)throw result.error;if(result.status!==0)throw new Error(result.stderr);
  const frames=(await fs.readdir(directory)).filter(name=>/^\d{4}\.jpg$/.test(name)).sort();
  if(!frames.length)throw new Error(`${manual.title}: no building pages decoded.`);
  if(frames.length!==Number(manual.stepCount))manual.sourceStepCount=manual.stepCount;
  manual.stepCount=frames.length;
  manual.images=frames.map(frame=>`building/${name}/${frame}`);manual.image ||=manual.images.at(-1);
}
// These three records are the same 46-step driving base from the introduction,
// Classroom unit and legacy Lab. Keep the illustrated Classroom entry and remap
// every tutorial reference. Other robots/manual variants retain their identity.
const duplicates=catalog.manuals.filter(manual=>/^base motriz$/i.test(manual.title.trim())&&manual.stepCount===46);
if(duplicates.length>1){
  const canonical=duplicates.find(manual=>manual.id==='manual-1')||duplicates.find(manual=>manual.image)||duplicates[0];
  const aliases=new Set(duplicates.filter(manual=>manual!==canonical).map(manual=>manual.id));
  catalog.manuals=catalog.manuals.filter(manual=>!aliases.has(manual.id));
  for(const activity of catalog.activities)for(const step of activity.steps)step.manualIds=[...new Set((step.manualIds||[]).map(id=>aliases.has(id)?canonical.id:id))];
}
await fs.writeFile(file,JSON.stringify(catalog,null,2)+'\n');
console.log(`Prepared ${catalog.manuals.length} building manuals as image carousels.`);
