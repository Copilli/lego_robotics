import fs from 'node:fs';
import crypto from 'node:crypto';
const source='.preservation/classroom/extracted/assets';
const target='public/content/connection';
fs.mkdirSync(target,{recursive:true});
fs.mkdirSync('public/content/editor-audio',{recursive:true});
const records=[];
for(const name of ['click.wav','click.mp3','click.ogg','delete.wav','delete.mp3','delete.ogg']){
  const bytes=fs.readFileSync(`${source}/webapp/renderer/static/media/${name}`);
  fs.writeFileSync(`public/content/editor-audio/${name}`,bytes);
  records.push({file:`../editor-audio/${name}`,source:`Classroom/assets/webapp/renderer/static/media/${name}`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
for(const name of ['BT-Startup.webm','BT-Enable.webm','BT-Pair.webm','BT-WinChrome.webm','USB.webm']){
  const bytes=fs.readFileSync(`${source}/prepacked/videos/${name}`);
  fs.writeFileSync(`${target}/${name}`,bytes);
  records.push({file:name,source:`Classroom/assets/prepacked/videos/${name}`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const sprite=fs.readFileSync(`${source}/webapp/renderer/static/svg/sprite.svg`,'utf8');
for(const [name,id] of Object.entries({ev3:'_48MindstormsHub',close:'_48Cross',play:'MissingIconsGenericPlayIcon',stop:'MissingIconsGenericStopIcon'})){
  const match=[...sprite.matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/g)].find(m=>m[1].includes(`id="${id}"`));
  if(!match)throw new Error('Connection icon missing');
  // Standalone images cannot inherit the sprite's application stroke styles.
  const content=name==='ev3'?match[2].replace('<rect stroke-width=', '<rect fill="none" stroke="#000" stroke-width=').replace('<rect mask=', '<rect fill="none" stroke="#000" stroke-width="1.5" mask='):match[2];
  fs.writeFileSync(`${target}/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" ${match[1].match(/viewBox="[^"]+"/)?.[0]||''}>${content}</svg>`);
}
fs.writeFileSync(`${target}/inventory.json`,JSON.stringify({application:'EV3 Classroom 1.5.3',records},null,2));
console.log('Preserved original Classroom connection animations.');
