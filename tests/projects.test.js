import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjects, saveProjects} from '../src/projects.js';
import {lessons} from '../src/lessons.js';
test('project storage roundtrip and recovery from corrupt data',()=>{
  let value; const storage={getItem:()=>value,setItem:(_,v)=>{value=v;}};
  const projects=[{id:'one',name:'Robot',code:'print("hola")'}];
  saveProjects(storage,projects);assert.deepEqual(loadProjects(storage),projects);
  value='broken';assert.deepEqual(loadProjects(storage),[]);
  value='[{"id":"bad"}]';assert.deepEqual(loadProjects(storage),[]);
  value='{}';assert.deepEqual(loadProjects(storage),[]);
});
test('every lesson has an official embedded video and practical steps',()=>{
  assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
  for(const l of lessons){assert.equal(new URL(l.video).hostname,'legoeducation.23video.com');assert.ok(new URL(l.video).searchParams.get('token'));assert.ok(l.steps.length>=4);assert.ok(l.challenge);}
});
