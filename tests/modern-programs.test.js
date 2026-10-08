import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {motionOps,systemPacket,imageFileOps,soundFileOps,brickAssetPath} from '../src/ev3-protocol.js';
import {LegoBluetooth} from '../src/ev3-transport.js';
import {convertLegacyProgram} from '../src/legacy-program-converter.js';

test('rotation movements encode encoder degrees rather than estimated time',()=>{
  assert.deepEqual(motionOps('B+C',50,0,'rotations',2,true),{mask:6,ops:[0xb0,0,6,0x81,50,0,0x82,0xd0,2,1]});
  assert.deepEqual(motionOps('A',-75,0,'degrees',360,false),{mask:1,ops:[0xae,0,1,0x81,181,0,0x82,104,1,0,0]});
  assert.throws(()=>motionOps('B+B',50,0,'rotations',2));assert.throws(()=>motionOps('A',50,100,'seconds',1));assert.throws(()=>motionOps('A',50,0,'degrees',0));
});
test('finite motion waits for EV3 busy replies; starting motion does not wait',async()=>{
  const transport=new LegoBluetooth({output:()=>{},status:()=>{}});transport.connected=true;
  const commands=[];let polls=0;transport.command=async ops=>{commands.push(ops);return new Uint8Array(ops[0]===0xa9?[polls++===0?1:0]:[]);};
  await transport.motion('A',30,0,'rotations',1,true);assert.equal(polls,2);
  commands.length=0;await transport.motion('A',30,0,'start',0,true);assert.equal(commands.length,1);
});
test('system transfer and media operations use confined file paths',()=>{
  assert.deepEqual([...systemPacket(1,[0x93,2,10,20])],[7,0,1,0,1,0x93,2,10,20]);
  const asset='assets/0123456789abcdef0123.rsf';assert.equal(brickAssetPath(asset,'rsf'),'../prjs/copilli/0123456789abcdef0123.rsf');
  assert.deepEqual(soundFileOps(asset,100,2).slice(0,4),[0x94,3,0x81,100]);
  assert.deepEqual(imageFileOps(asset.replace('rsf','rgf'),0,0,true).slice(0,8),[0x84,19,0,0,0,0x84,28,1]);
  assert.throws(()=>brickAssetPath('assets/../../x.rsf','rsf'));assert.throws(()=>soundFileOps(asset,101,0));
});
test('download sends exact byte count and accepts EOF only on its final chunk',async()=>{
  const transport=new LegoBluetooth({output:()=>{},status:()=>{}});transport.connected=true;
  const oldFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new Uint8Array(500).buffer});
  const commands=[];transport.command=async ops=>{commands.push(ops);return new Uint8Array(ops[0]===0x92?[0x92,0,2]:[0x93,commands.length===3?8:0,2]);};
  try{
    const asset='assets/0123456789abcdef0123.rsf';await transport.prepareAsset(asset,'rsf',0);
    assert.deepEqual(commands[0].slice(0,5),[0x92,244,1,0,0]);assert.equal(commands[1].length,482);assert.equal(commands[2].length,22);
    await transport.prepareAsset(asset,'rsf',0);assert.equal(commands.length,3);
    transport.assets.clear();transport.command=async ops=>new Uint8Array(ops[0]===0x92?[0x92,0,2]:[0x93,8,2]);
    await assert.rejects(transport.prepareAsset(asset,'rsf',0),/rechazó/);assert.equal(transport.assets.size,0);
    await assert.rejects(transport.prepareAsset(asset,'rsf',-1),/cancelada/);
  }finally{globalThis.fetch=oldFetch;}
});
test('published conversions include real captures and every referenced brick asset exists',()=>{
  const catalog=JSON.parse(fs.readFileSync(new URL('../public/content/catalog.json',import.meta.url),'utf8'));
  const track=catalog.activities.find(a=>a.id==='legacy-home-0-1');
  assert.equal(track.modernPrograms[0].diagnostics.length,0);
  assert.match(track.modernPrograms[0].code,/robot.imageFile/);assert.match(track.modernPrograms[0].code,/"B\+C", 75, 0, "rotations", 2/);assert.match(track.modernPrograms[0].code,/robot.soundFile/);
  for(const activity of catalog.activities)for(const program of activity.modernPrograms||[]){if(!program.xml){assert.ok(program.diagnostics.length);continue;}assert.ok(fs.existsSync(new URL('../public/content/'+program.image,import.meta.url)));for(const match of program.xml.matchAll(/<data>(assets\/[a-f0-9]+\.(?:rsf|rgf))<\/data>/g))assert.ok(fs.existsSync(new URL('../public/content/'+match[1],import.meta.url)));}
});
test('converter does not substitute a stale constant for a wired motor input',()=>{
  const node={id:'motor',kind:'ConfigurableMethodCall',target:'MotorTime\\.vix',args:[{name:'MotorPort',value:'A'},{name:'Speed',value:'75',wire:'data'},{name:'Seconds',value:'1'}],terminals:[],diagrams:[]};
  const result=convertLegacyProgram({name:'test',diagram:{nodes:[{id:'start',kind:'StartBlock',target:'StartBlock',args:[],diagrams:[],terminals:[{name:'SequenceOut',wire:'seq'}]},{...node,terminals:[{name:'SequenceIn',wire:'seq'}]}]}});
  assert.equal(result.xml,null);assert.match(result.diagnostics[0],/cable de datos/);
});
