import fs from 'node:fs';
import path from 'node:path';
const file=process.env.LEGO_CLASSROOM_EXE||'C:/Program Files/EV3 Classroom/EV3 Classroom-win-1.5.3.4056.exe';
const bytes=fs.readFileSync(file);
const signature=Buffer.from('8b1202b96a612038727b930214d7a03213f5b9e6efae3318ee3b2dce24b36aae','hex');
const marker=bytes.indexOf(signature);
if(marker<8)throw new Error('No .NET bundle found');
let cursor=Number(bytes.readBigInt64LE(marker-8));
const major=bytes.readUInt32LE(cursor),count=bytes.readUInt32LE(cursor+8);cursor+=12;
if(major!==1||count>10000)throw new Error('Unsupported bundle format');
function string(){let length=0,shift=0,value;do{value=bytes[cursor++];length|=(value&127)<<shift;shift+=7;if(shift>35)throw new Error('Invalid string');}while(value&128);const result=bytes.subarray(cursor,cursor+length).toString('utf8');cursor+=length;return result;}
string();
let assembly;
for(let i=0;i<count;i++){
  const offset=Number(bytes.readBigInt64LE(cursor)),size=Number(bytes.readBigInt64LE(cursor+8));cursor+=17;
  const name=string();
  if(/Classroom\.dll$/.test(name)){if(offset<0||size<0||offset+size>bytes.length)throw new Error('Invalid assembly range');assembly={offset,size,name};}
}
if(!assembly)throw new Error('Classroom assembly missing');
const target='.preservation/classroom';fs.mkdirSync(target,{recursive:true});
fs.writeFileSync(path.join(target,path.basename(assembly.name)),bytes.subarray(assembly.offset,assembly.offset+assembly.size));
console.log('Classroom resources assembly copied; installed application unchanged.');
