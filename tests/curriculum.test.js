import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const catalog=JSON.parse(fs.readFileSync('public/content/catalog.json','utf8'));
test('curriculum has unique records and every lesson/manual points to existing content',()=>{
  for(const list of [catalog.units,catalog.activities,catalog.manuals])assert.equal(new Set(list.map(x=>x.id)).size,list.length);
  const lessons=new Set(catalog.activities.map(a=>a.id)),manuals=new Set(catalog.manuals.map(a=>a.id));
  for(const u of catalog.units){assert.ok(u.title);assert.ok(u.activities.length);for(const id of u.activities)assert.ok(lessons.has(id),id);}
  const checkAsset=file=>{if(!file)return;assert.ok(!/^https?:/.test(file));if(!file.startsWith('../media/lego-local/'))assert.ok(fs.existsSync(path.join('public/content',file)),file);};
  for(const a of catalog.activities){assert.ok(a.title,a.id);assert.ok(a.steps.length,a.id);checkAsset(a.image);for(const s of a.steps){checkAsset(s.image);checkAsset(s.video);for(const id of s.manualIds||[])assert.ok(manuals.has(id),id);}}
  for(const m of catalog.manuals){checkAsset(m.image);checkAsset(m.video);for(const page of m.images||[])checkAsset(page);}
});
test('introduction, five Home robots, core models and expansion models are available',()=>{
  assert.equal(catalog.activities.filter(a=>a.unitId==='introduction').length,3);
  assert.equal(catalog.units.filter(u=>u.group==='home').length,5);
  assert.equal(catalog.units.filter(u=>u.group==='base').length,4);
  assert.equal(catalog.units.filter(u=>u.group==='expansion').length,6);
});
