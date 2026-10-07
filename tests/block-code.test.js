import test from 'node:test';
import assert from 'node:assert/strict';
import {compileBlocks} from '../src/block-code.js';
const block=(type,fields={},inputs={},next=null)=>({type,getFieldValue:name=>fields[name],getInputTargetBlock:name=>inputs[name],getNextBlock:()=>next,isEnabled:()=>true});
const workspace=next=>({getTopBlocks:()=>[block('event_whenflagclicked',{}, {},next)]});

test('compiles nested repeat, sensor condition and timed motor into awaited commands',()=>{
  const motor=block('ev3_motor',{PORT:'B',SPEED:-20,SECONDS:0.5});
  const sensor=block('ev3_sensor',{PORT:1,KIND:'distance'});
  const condition=block('operator_lt',{}, {OPERAND1:sensor,OPERAND2:block('math_number',{NUM:25})});
  const conditional=block('control_if',{}, {CONDITION:condition,SUBSTACK:motor});
  const repeat=block('control_repeat',{}, {TIMES:block('math_number',{NUM:3}),SUBSTACK:conditional});
  const code=compileBlocks(workspace(repeat));
  assert.match(code,/await robot.sensor\(1, "distance"\)/);
  assert.match(code,/await robot.motor\("B", -20, 500\)/);
  assert.match(code,/for \(let i1/);assert.match(code,/await wait\(0\)/);
  assert.doesNotThrow(()=>new (Object.getPrototypeOf(async function(){}).constructor)('robot','log','wait',code));
});
test('escapes console strings and rejects ambiguous or unsupported programs',()=>{
  const value='"; throw new Error("injection"); //';
  assert.equal(compileBlocks(workspace(block('ev3_log',{}, {VALUE:block('text',{TEXT:value})}))).split('\n')[1],`log(${JSON.stringify(value)});`);
  assert.throws(()=>compileBlocks({getTopBlocks:()=>[]}),/único bloque/);
  assert.throws(()=>compileBlocks({getTopBlocks:()=>[block('event_whenflagclicked'),block('event_whenflagclicked')]}),/único bloque/);
  assert.throws(()=>compileBlocks(workspace(block('unknown'))),/no está admitido/);
});
