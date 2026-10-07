import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionSupport} from '../src/connection-support.js';
test('requires secure origin and a functional Web Serial entry point',()=>{
  assert.equal(connectionSupport({isSecureContext:true,navigator:{serial:{requestPort(){}}}}).supported,true);
  assert.match(connectionSupport({isSecureContext:false,navigator:{serial:{requestPort(){}}}}).message,/HTTPS/);
  for(const navigator of [{},{serial:{}},{bluetooth:{requestDevice(){}}}]){
    const result=connectionSupport({isSecureContext:true,navigator});
    assert.equal(result.supported,false);assert.match(result.message,/iPad/);
  }
});
