import fs from 'node:fs/promises';
import {convertLegacyProgram} from '../src/legacy-program-converter.js';

const catalogPath=new URL('../public/content/catalog.json',import.meta.url);
const catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const sources=JSON.parse(await fs.readFile(new URL('../.preservation/legacy-programs.json',import.meta.url),'utf8'));
let ready=0,pending=0;
const report=[];
catalog.brickAssets=[...new Map(sources.flatMap(source=>Object.entries(source.brickAssets||{}).map(([name,file])=>[file,{name,file}]))).values()].sort((a,b)=>a.name.localeCompare(b.name));
for(const source of sources){
  const activity=catalog.activities.find(a=>a.id===source.activityId);if(!activity)continue;
  activity.modernPrograms=source.programs.map(program=>convertLegacyProgram(program,source.brickAssets));
  activity.steps=activity.steps.filter(step=>!step.generatedModernProgram);
  if(activity.id.startsWith('legacy-home-')){
    const program=activity.modernPrograms.find(program=>program.xml);
    if(program){
      const codeSlides=source.slides.filter(slide=>slide.images.some(name=>/^pi_\d+_\d+\.png$/i.test(name)));
      const original=source.programs.find(p=>p.name===program.name);
      const progressive=original.diagram.nodes.every(node=>['StartBlock','ConfigurableMethodCall','ConfigurableWaitFor'].includes(node.kind))&&original.diagram.nodes.length-1===codeSlides.length;
      const steps=(progressive?codeSlides:[codeSlides[0]]).filter(Boolean).map((slide,index)=>({id:`modern-code-${index+1}`,title:progressive?`Programa en bloques: paso ${index+1}`:'Programa completo en bloques',description:progressive?'Construye esta secuencia con los bloques modernos. Puedes cargarla, revisar sus valores y modificarla en el editor.':'Este es el programa completo de la misión, convertido a bloques modernos. Incluye sus bucles y valores originales. Cárgalo en el editor para explorar cada operación.',image:null,video:null,toolbox:['ev3motor_motorTurnFor','control_wait','control_repeat','ev3sound_playSoundUntilDone','ev3display_displayImage'],manualIds:[],generatedModernProgram:true,programName:program.name,programPrefix:progressive?index+1:null,sourceCodeImages:(progressive?[slide]:codeSlides).map(slide=>slide.images.find(name=>/^pi_\d+_\d+\.png$/i.test(name)))}));
      const position=activity.steps.findIndex(step=>/ready to try|robot.Connect|ejecuta|prueba/i.test(step.description));
      activity.steps.splice(position<0?activity.steps.length:position,0,...steps);
    }
  }
  for(const program of activity.modernPrograms){program.xml?ready++:pending++;report.push({activityId:activity.id,...program});}
}
await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
await fs.writeFile(new URL('../.preservation/program-conversion-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(`${ready} exact program conversions; ${pending} programs require additional operations.`);
