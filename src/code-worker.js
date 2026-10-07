let counter=0;const pending=new Map();
const request=(method,args=[])=>new Promise((resolve,reject)=>{const id=++counter;pending.set(id,{resolve,reject});postMessage({type:'call',id,method,args});});
const robot=Object.freeze({motor:(...args)=>request('motor',args),tone:(...args)=>request('tone',args),sensor:(...args)=>request('sensor',args),stop:()=>request('stop')});
const wait=async ms=>{if(!Number.isInteger(ms)||ms<0||ms>30000)throw new Error('Espera: 0–30000 ms.');await new Promise(resolve=>setTimeout(resolve,ms));};
onmessage=async ({data})=>{
  if(data.type==='reply'){const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.value);return;}
  if(data.type==='run'){
    try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;await new AsyncFunction('robot','log','wait',`"use strict";\n${data.code}`)(robot,(...args)=>postMessage({type:'log',text:args.map(String).join(' ')}),wait);postMessage({type:'done'});}
    catch(error){postMessage({type:'error',text:error.message});}
  }
};
