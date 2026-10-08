import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LegoUsb} from '../src/ev3-usb.js';
import {connectionSupport} from '../src/connection-support.js';

test('USB support requires HTTPS and WebHID independently of serial',()=>{
  assert.equal(connectionSupport({isSecureContext:true,navigator:{hid:{requestDevice(){}}}},'usb').supported,true);
  assert.equal(connectionSupport({isSecureContext:true,navigator:{serial:{requestPort(){}}}},'usb').supported,false);
  assert.equal(connectionSupport({isSecureContext:false,navigator:{hid:{requestDevice(){}}}},'usb').supported,false);
});

test('USB filters EV3, pads output, trims input, reads sensor and handles unplug',async t=>{
  const device=new EventTarget(),hid=new EventTarget(),sent=[],states=[];
  Object.assign(device,{vendorId:0x0694,productId:5,opened:false,
    collections:[{outputReports:[{reportId:0,items:[{reportSize:8,reportCount:1024}]}],children:[]}],
    async open(){this.opened=true;},async close(){this.opened=false;},
    async sendReport(reportId,bytes){
      sent.push({reportId,bytes});
      const sensor=bytes[7]===0x9d;
      const storage=new Uint8Array(1032),data=storage.subarray(8);
      data.set([sensor?7:3,0,bytes[2],bytes[3],2]);
      if(sensor)new DataView(storage.buffer,13,4).setFloat32(0,42.5,true);
      const event=new Event('inputreport');Object.assign(event,{reportId:0,data:new DataView(storage.buffer,8,1024)});this.dispatchEvent(event);
    }});
  hid.requestDevice=async options=>{assert.deepEqual(options.filters,[{vendorId:0x0694,productId:5}]);return [device];};
  for(const [key,value] of Object.entries({navigator:{hid},isSecureContext:true})){
    const original=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{configurable:true,value});
    t.after(()=>original?Object.defineProperty(globalThis,key,original):delete globalThis[key]);
  }
  const transport=new LegoUsb({output:()=>{},status:(...state)=>states.push(state)});
  await transport.connect();assert.equal(transport.connected,true);
  await transport.tone(440,100);await transport.motor('A',20,100);
  assert.equal(await transport.sensor(1,'distance'),42.5);
  assert.equal(sent.length,4);
  assert.ok(sent.every(({reportId,bytes})=>reportId===0&&bytes.length===1024));
  assert.deepEqual([...sent[0].bytes.slice(7,9)],[0x94,0]);
  assert.ok(sent[0].bytes.slice(9).every(byte=>byte===0));
  const unplug=new Event('disconnect');Object.assign(unplug,{device});hid.dispatchEvent(unplug);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(transport.connected,false);assert.equal(device.opened,false);
  assert.equal(states.at(-1)[0],'disconnected');
});

test('USB rejects cancellation, unsupported descriptors and failed handshake cleanly',async t=>{
  const hid=new EventTarget();let devices=[];
  hid.requestDevice=async()=>devices;
  for(const [key,value] of Object.entries({navigator:{hid},isSecureContext:true})){
    const original=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{configurable:true,value});
    t.after(()=>original?Object.defineProperty(globalThis,key,original):delete globalThis[key]);
  }
  const transport=new LegoUsb({output:()=>{},status:()=>{}});
  await assert.rejects(()=>transport.connect(),{name:'NotFoundError'});
  const device=new EventTarget();Object.assign(device,{vendorId:0x0694,productId:5,opened:false,collections:[],async open(){this.opened=true;},async close(){this.opened=false;}});devices=[device];
  await assert.rejects(()=>transport.connect(),/interfaz USB/);assert.equal(device.opened,false);
  device.collections=[{outputReports:[{reportId:0,items:[{reportSize:8,reportCount:64}]}],children:[]}];
  device.sendReport=async()=>{throw new Error('USB ocupado');};
  await assert.rejects(()=>transport.connect(),/USB ocupado/);
  assert.equal(transport.connected,false);assert.equal(transport.pending.size,0);assert.equal(device.opened,false);
});
