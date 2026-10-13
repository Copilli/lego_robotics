import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const file='public/content/catalog.json',catalog=JSON.parse(fs.readFileSync(file,'utf8'));
const sources=JSON.parse(fs.readFileSync('.preservation/legacy-programs.json','utf8'));
fs.mkdirSync('public/content/videos',{recursive:true});
const copied=new Map();
for(const activity of catalog.activities){
  const source=sources.find(source=>source.activityId===activity.id);
  const homeSlides=source?.slides.filter(slide=>/^(Brief|Build|Program|Go)\d+$/.test(slide.name));
  const originals=activity.steps.filter(step=>!step.generatedModernProgram);
  if(activity.id.startsWith('legacy-home-')&&homeSlides?.length===originals.length){
    originals.forEach((step,index)=>{step.sourceSlideName=homeSlides[index].name;});
    // Keep source objective -> construction -> programming -> run order.
    const rank=step=>({Brief:0,Build:1,Program:2,Go:4})[step.sourceSlideName?.replace(/\d+$/,'')]??(step.generatedModernProgram?3:5);
    activity.steps.sort((a,b)=>rank(a)-rank(b));
  }
  for(const step of activity.steps){
    if(activity.id.startsWith('legacy-')){
      const construction=/^Build\d+$/.test(step.sourceSlideName||'')||/constr[uú]|build/i.test(step.title);
      if(!construction)step.manualIds=[];
    }
    if(!step.video?.startsWith('../media/lego-local/'))continue;
    const original=path.resolve('public/content',step.video);
    if(!fs.existsSync(original))throw new Error(`Missing tutorial video: ${activity.id} / ${step.id}`);
    if(!copied.has(original)){
      const bytes=fs.readFileSync(original),name=createHash('sha256').update(bytes).digest('hex').slice(0,20)+path.extname(original);
      fs.writeFileSync('public/content/videos/'+name,bytes);copied.set(original,'videos/'+name);
    }
    step.video=copied.get(original);
  }
}
for(const unit of catalog.units.filter(unit=>unit.group==='home')){
  unit.activities.sort((a,b)=>Number(a.split('-').at(-1))-Number(b.split('-').at(-1)));
}
fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
console.log(`Prepared tutorial order, construction steps and ${copied.size} portable local videos.`);
