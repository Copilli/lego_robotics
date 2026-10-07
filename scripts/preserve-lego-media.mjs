import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const workspace=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const installedRoot=path.resolve(process.argv[2] || 'C:/Program Files (x86)/LEGO Software');
const destination=path.join(workspace,'public/media/lego-local');
const archive=path.join(workspace,'.preservation');
const applications=[{id:'home',folder:'LEGO MINDSTORMS EV3 Home Edition',version:'1.4.4'}, {id:'education',folder:'LEGO MINDSTORMS Edu EV3',version:'1.4.16',contentVersion:'1.4.19'}];
const videoExtensions=new Set(['.mp4','.wmv','.webm','.mov','.m4v','.avi','.flv','.mpg','.mpeg']);
async function* walk(root){for(const entry of await fs.readdir(root,{withFileTypes:true})){const full=path.join(root,entry.name);if(entry.isDirectory())yield* walk(full);else if(entry.isFile())yield full;}}
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
await fs.mkdir(destination,{recursive:true});await fs.mkdir(archive,{recursive:true});
const records=[],metadata=[],appInventory=[];let newCopies=0;
let conversions=[];
try{conversions=JSON.parse(await fs.readFile(path.join(archive,'conversions.json'),'utf8')).conversions||[];}catch(error){if(error.code!=='ENOENT')throw error;}
for(const app of applications){
  const root=path.join(installedRoot,app.folder);await fs.access(root);let count=0;
  for await(const file of walk(root)){
    const relative=path.relative(root,file).split(path.sep).join('/');
    const extension=path.extname(file).toLowerCase();
    if(extension==='.xml' && relative.startsWith('Resources/ContentPacks/')){
      const bytes=await fs.readFile(file);const target=path.join(archive,'metadata',app.id,relative);
      await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);
      metadata.push({application:app.id,sourcePath:relative,bytes:bytes.length,sha256:digest(bytes)});
    }
    if(!videoExtensions.has(extension))continue;
    const bytes=await fs.readFile(file),hash=digest(bytes),filename=hash+extension,target=path.join(destination,filename);
    // Validate against the source on repeat runs; never modify the installation.
    let exists=false;try{const saved=await fs.readFile(target);if(digest(saved)!==hash)throw new Error(`Preservation hash mismatch: ${filename}`);exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
    if(!exists){await fs.writeFile(target,bytes,{flag:'wx'});newCopies++;}
    if(digest(await fs.readFile(target))!==hash)throw new Error(`Copy verification failed: ${filename}`);
    const locale=relative.match(/ContentPacks\/[^/]+\/([^/]+)\//)?.[1] || 'unknown';
    const derivative=conversions.find(c=>c.sourceSha256===hash);
    if(derivative){
      if(!/^[a-f0-9]{64}\.mp4$/.test(derivative.file)||digest(await fs.readFile(path.join(destination,derivative.file)))!==derivative.sha256)throw new Error(`Invalid converted copy for ${relative}`);
    }
    records.push({id:digest(Buffer.from(app.id+':'+relative)).slice(0,20),application:app.id,sourcePath:relative,label:path.basename(file,extension),locale,format:extension.slice(1),bytes:bytes.length,sha256:hash,file:filename,browserPlayable:Boolean(derivative)||['.mp4','.webm'].includes(extension),...(derivative?{webFile:derivative.file,webSha256:derivative.sha256,webBytes:derivative.bytes,duration:derivative.duration}: {})});count++;
  }
  appInventory.push({...app,videoCount:count});
}
records.sort((a,b)=>a.application.localeCompare(b.application)||a.sourcePath.localeCompare(b.sourcePath));
const catalog={schemaVersion:1,importedAt:new Date().toISOString(),applications:appInventory,entries:records};
await fs.writeFile(path.join(destination,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
await fs.writeFile(path.join(archive,'inventory.json'),JSON.stringify({...catalog,sourceRoot:installedRoot,metadata},null,2)+'\n');
console.log(JSON.stringify({sourceVideos:records.length,uniqueVideos:new Set(records.map(r=>r.file)).size,mp4:records.filter(r=>r.format==='mp4').length,wmv:records.filter(r=>r.format==='wmv').length,sourceMB:Math.round(records.reduce((n,r)=>n+r.bytes,0)/1048576),newCopies,metadataFiles:metadata.length,destination},null,2));
