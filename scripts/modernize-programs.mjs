import fs from 'node:fs/promises';
import {convertLegacyProgram} from '../src/legacy-program-converter.js';

const catalogPath=new URL('../public/content/catalog.json',import.meta.url);
const catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const sources=JSON.parse(await fs.readFile(new URL('../.preservation/legacy-programs.json',import.meta.url),'utf8'));
let ready=0,pending=0;
const report=[];
for(const source of sources){
  const activity=catalog.activities.find(a=>a.id===source.activityId);if(!activity)continue;
  activity.modernPrograms=source.programs.map(convertLegacyProgram);
  for(const program of activity.modernPrograms){program.xml?ready++:pending++;report.push({activityId:activity.id,...program});}
}
await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
await fs.writeFile(new URL('../.preservation/program-conversion-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(`${ready} exact program conversions; ${pending} programs require additional operations.`);
