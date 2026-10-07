import test from 'node:test';
import assert from 'node:assert/strict';
import {integer,packet,ReplyParser,motorOps,toneOps,sensorOps,stopOps} from '../src/ev3-protocol.js';
import {LegoBluetooth} from '../src/ev3-transport.js';
test('EV3 signed constant boundaries and motor timed packet',()=>{
  assert.deepEqual(integer(-32),[32]);assert.deepEqual(integer(31),[31]);
  assert.deepEqual(integer(-100),[0x81,156]);assert.deepEqual(integer(1000),[0x82,232,3]);
  assert.deepEqual(integer(100000),[0x83,160,134,1,0]);
  assert.deepEqual(Array.from(packet(0x1234,motorOps('A',30,1000))),[15,0,0x34,0x12,0,0,0,0xaf,0,1,30,0,0x82,232,3,0,1]);
});
test('reject invalid ports, speed, duration and tone before writing',()=>{
  for(const args of [['E',30,1000],['A',101,1000],['B',20,0],['B',20,10001],['A',NaN,100]])assert.throws(()=>motorOps(...args));
  assert.throws(()=>toneOps(0,300));assert.throws(()=>sensorOps(0,'touch'));assert.throws(()=>sensorOps(1,'unknown'));
  assert.deepEqual(stopOps(),[0xa3,0,15,1]);assert.deepEqual(sensorOps(1,'distance'),[0x9d,0,0,30,0,0x60]);
});
test('parser handles fragmented and coalesced EV3 replies',()=>{
  const replies=[];const parser=new ReplyParser(r=>replies.push(r));
  parser.push(new Uint8Array([7]));parser.push(new Uint8Array([0,1,0,2,0,0]));assert.equal(replies.length,0);
  parser.push(new Uint8Array([128,63,3,0,2,0,4]));assert.equal(replies.length,2);
  assert.equal(new DataView(replies[0].data.buffer).getFloat32(0,true),1);assert.equal(replies[1].type,4);
  assert.throws(()=>new ReplyParser(()=>{}).push(new Uint8Array([255,255])));
});
test('transport serializes commands and decodes sensor reply',async()=>{
  const transport=new LegoBluetooth({output:()=>{},status:()=>{}});transport.connected=true;
  const sent=[];transport.parser=new ReplyParser(r=>{const p=transport.pending.get(r.counter);clearTimeout(p.timer);transport.pending.delete(r.counter);p.resolve(r.data);});
  transport.writer={write:async bytes=>{sent.push(Array.from(bytes));const sensor=bytes[7]===0x9d;const reply=sensor?[7,0,bytes[2],bytes[3],2,0,0,32,65]:[3,0,bytes[2],bytes[3],2];transport.parser.push(new Uint8Array(reply));}};
  const [,distance]=await Promise.all([transport.motor('B',-30,250),transport.sensor(1,'distance')]);
  assert.equal(distance,10);assert.equal(sent.length,2);assert.equal(sent[0][2],1);assert.equal(sent[1][2],2);assert.equal(transport.pending.size,0);
});
test('disconnection rejects outstanding commands',async()=>{
  const transport=new LegoBluetooth({output:()=>{},status:()=>{}});transport.connected=true;transport.writer={write:async()=>{}};
  const reply=transport.command([0x94,0]);await new Promise(resolve=>setTimeout(resolve,0));
  transport.rejectPending();await assert.rejects(reply,/desconectado/);assert.equal(transport.pending.size,0);
});
