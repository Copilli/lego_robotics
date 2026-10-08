import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root=new URL('../',import.meta.url);
const catalogFile=new URL('public/content/catalog.json',root);
const catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4175','--strictPort'],{cwd:root,stdio:'pipe',windowsHide:true});
const address='http://127.0.0.1:4175/scripts/blocks-preview.html';
let browser;
try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.once('exit',code=>reject(new Error(`Preview exited (${code})`)));server.stdout.on('data',data=>{if(String(data).includes('4175'))resolve();});});
  browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined});
  const page=await browser.newPage({viewport:{width:2000,height:1500},deviceScaleFactor:2});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(address);await page.waitForFunction(()=>typeof window.captureProgram==='function');
  await fs.mkdir(new URL('public/content/programs/',root),{recursive:true});
  let captures=0;
  for(const activity of catalog.activities){
    for(const program of activity.modernPrograms||[]){
      if(!program.xml)continue;
      program.code=await page.evaluate(xml=>window.captureProgram(xml),program.xml);
      await page.evaluate(()=>document.fonts.ready);
      const filename=createHash('sha256').update(program.xml).digest('hex').slice(0,20)+'.png';
      program.image='programs/'+filename;
      await page.locator('#preview').screenshot({path:fileURLToPath(new URL('public/content/'+program.image,root))});
      if(errors.length)throw new Error(errors.join('\n'));
      captures++;
    }
    for(const step of activity.steps.filter(step=>step.generatedModernProgram)){
      const program=activity.modernPrograms.find(program=>program.name===step.programName&&program.xml);if(!program)throw new Error('Missing program for generated step');
      step.modernXML=step.programPrefix===null?program.xml:await page.evaluate(({xml,count})=>{
        const document=new DOMParser().parseFromString(xml,'application/xml');let current=document.documentElement.firstElementChild.querySelector(':scope > next > block');
        for(let index=1;index<count&&current;index++)current=current.querySelector(':scope > next > block');
        current?.querySelector(':scope > next')?.remove();return new XMLSerializer().serializeToString(document);
      },{xml:program.xml,count:step.programPrefix});
      await page.evaluate(xml=>window.captureProgram(xml),step.modernXML);
      step.image='programs/'+createHash('sha256').update(step.modernXML).digest('hex').slice(0,20)+'.png';
      await page.locator('#preview').screenshot({path:fileURLToPath(new URL('public/content/'+step.image,root))});
      captures++;
    }
  }
  await fs.writeFile(catalogFile,JSON.stringify(catalog,null,2)+'\n');
  const images=new Set(catalog.activities.flatMap(activity=>[...(activity.modernPrograms||[]).map(p=>p.image),...activity.steps.map(step=>step.image)]).filter(path=>path?.startsWith('programs/')));
  const directory=new URL('public/content/programs/',root);
  for(const filename of await fs.readdir(directory))if(/^[a-f0-9]{20}\.png$/.test(filename)&&!images.has('programs/'+filename))await fs.unlink(new URL(filename,directory));
  console.log(`Captured and compiled ${captures} modern programs using the editor renderer.`);
}finally{await browser?.close();server.kill();}
