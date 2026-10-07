import fs from 'node:fs';
const file='public/content/catalog.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
fs.mkdirSync('.preservation',{recursive:true});
fs.writeFileSync('.preservation/curriculum-inventory.json',JSON.stringify(catalog,null,2));
for(const a of catalog.activities)delete a.source;
for(const m of catalog.manuals){m.title=m.title.trim();if(m.images)m.stepCount=m.images.length;}
delete catalog.assets;
fs.writeFileSync(file,JSON.stringify(catalog,null,2));
console.log(JSON.stringify({units:catalog.units.length,activities:catalog.activities.length,manuals:catalog.manuals.length,steps:catalog.activities.reduce((n,a)=>n+a.steps.length,0)}));
