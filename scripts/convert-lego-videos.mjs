import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const workspace=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const media=path.join(workspace,'public/media/lego-local');
const archive=path.join(workspace,'.preservation');
const executable=process.argv[2] || process.env.FFMPEG_PATH || 'ffmpeg';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function run(args,allowFailure=false){return new Promise((resolve,reject)=>{
  const child=spawn(executable,args,{windowsHide:true,shell:false});let stdout='',stderr='';
  child.stdout.on('data',chunk=>{stdout=(stdout+chunk).slice(-100000);});child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-100000);});
  child.on('error',reject);child.on('close',code=>code===0||allowFailure?resolve({stdout,stderr,code}):reject(new Error(`FFmpeg failed (${code}): ${stderr.slice(-3000)}`)));
});}
function metadata(text){
  const duration=text.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  return {duration:duration?Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3]):NaN,hasAudio:/Stream .*Audio:/.test(text),videoCodec:text.match(/Video: ([^ ,]+)/)?.[1],audioCodec:text.match(/Audio: ([^ ,]+)/)?.[1]};
}
async function inspect(file){const result=await run(['-hide_banner','-i',file],true);return metadata(result.stderr);}
const version=(await run(['-version'])).stdout.split('\n')[0].trim();
const catalog=JSON.parse(await fs.readFile(path.join(media,'catalog.json'),'utf8'));
const reportFile=path.join(archive,'conversions.json');let report;
try{report=JSON.parse(await fs.readFile(reportFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;report={schemaVersion:1,conversions:[]};}
await fs.mkdir(path.join(archive,'conversion-work'),{recursive:true});
const originals=catalog.entries.filter(entry=>entry.format==='wmv');
let converted=0,reused=0;
for(const [index,entry] of originals.entries()){
  if(!/^[a-f0-9]{64}\.wmv$/.test(entry.file))throw new Error('Invalid original filename.');
  const original=path.join(media,entry.file);
  if(hash(await fs.readFile(original))!==entry.sha256)throw new Error(`Original hash mismatch: ${entry.file}`);
  const previous=report.conversions.find(c=>c.sourceSha256===entry.sha256);
  if(previous){
    if(!/^[a-f0-9]{64}\.mp4$/.test(previous.file)||hash(await fs.readFile(path.join(media,previous.file)))!==previous.sha256)throw new Error(`Converted copy hash mismatch: ${entry.label}`);
    reused++;console.log(`[${index+1}/${originals.length}] Verified existing MP4: ${entry.label}`);continue;
  }
  const source=await inspect(original);
  if(!Number.isFinite(source.duration)||source.duration<=0)throw new Error(`Invalid original duration: ${entry.label}`);
  const temporary=path.join(archive,'conversion-work',`${entry.sha256}-${crypto.randomUUID()}.mp4`);
  const options=['-nostdin','-hide_banner','-loglevel','error','-i',original,'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-threads','4','-c:a','aac','-b:a','160k','-movflags','+faststart','-n',temporary];
  await run(options);
  const targetMetadata=await inspect(temporary);
  if(targetMetadata.videoCodec!=='h264'||source.hasAudio!==targetMetadata.hasAudio||(source.hasAudio&&targetMetadata.audioCodec!=='aac')||Math.abs(targetMetadata.duration-source.duration)>Math.max(0.5,source.duration*0.01))throw new Error(`Converted stream/duration mismatch: ${entry.label}`);
  // Decode every frame and audio packet before adding this file to the catalog.
  await run(['-nostdin','-v','error','-xerror','-i',temporary,'-map','0:v:0','-map','0:a:0?','-f','null','-']);
  const bytes=await fs.readFile(temporary),sha256=hash(bytes),filename=sha256+'.mp4',target=path.join(media,filename);
  try{await fs.writeFile(target,bytes,{flag:'wx'});}catch(error){if(error.code!=='EEXIST'||hash(await fs.readFile(target))!==sha256)throw error;}
  if(hash(await fs.readFile(target))!==sha256)throw new Error('Converted output verification failed.');
  await fs.unlink(temporary);
  report.conversions.push({sourceSha256:entry.sha256,file:filename,sha256,bytes:bytes.length,sourceDuration:source.duration,duration:targetMetadata.duration,hasAudio:targetMetadata.hasAudio,videoCodec:'h264',audioCodec:targetMetadata.audioCodec||null,pixelFormat:'yuv420p',encoder:version,convertedAt:new Date().toISOString(),validation:'full-decode',settings:{crf:18,preset:'fast',audioBitrate:'160k',faststart:true}});
  await fs.writeFile(reportFile+'.tmp',JSON.stringify(report,null,2)+'\n');await fs.rename(reportFile+'.tmp',reportFile);
  converted++;console.log(`[${index+1}/${originals.length}] Converted and decoded: ${entry.label} (${source.duration}s)`);
}
console.log(JSON.stringify({originals:originals.length,converted,reused,encoder:version},null,2));
console.log('Run npm run preserve:media to attach verified MP4 copies to the app catalog.');
