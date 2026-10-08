import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const file='public/content/catalog.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
const ffmpeg=process.env.FFMPEG_PATH||(process.platform==='win32'?'C:/Program Files/XPG/XPG-Prime/ProDllSDK/ffmpeg.exe':'ffmpeg');
// Frame widths verified against all animation strips in each installed Home pack.
const widths={TRACK3R:524,SPIK3R:773,EV3RSTORM:691,R3PTAR:696,GRIPP3R:594};
for(const unit of catalog.units.filter(unit=>unit.group==='home')){
  const source=unit.thumbnailSprite?.source||unit.image;
  const input=path.join('public/content',source),bytes=fs.readFileSync(input);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),frameWidth=widths[unit.title];
  if(!frameWidth||width%frameWidth)throw new Error(`Unknown sprite geometry: ${unit.title}`);
  if(width===frameWidth)continue;
  const temporary=path.join('public/content/assets',`robot-frame-${unit.id}.png`);
  const result=spawnSync(ffmpeg,['-nostdin','-hide_banner','-loglevel','error','-i',input,'-vf',`crop=${frameWidth}:${height}:0:0`,'-frames:v','1','-y',temporary],{encoding:'utf8',windowsHide:true});
  if(result.error)throw result.error;if(result.status!==0)throw new Error(result.stderr);
  const frame=fs.readFileSync(temporary),name=createHash('sha256').update(frame).digest('hex').slice(0,20)+'.png';
  fs.renameSync(temporary,path.join('public/content/assets',name));
  unit.thumbnailSprite={source,frameWidth,frameHeight:height,frameIndex:0,frameCount:width/frameWidth};
  unit.image='assets/'+name;
}
fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
console.log('Home robot thumbnails now contain one original animation frame.');
