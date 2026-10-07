import fs from 'node:fs';
import {test,expect} from '@playwright/test';
test('clean Pages build plays all five bundled tutorial videos without external servers',async({page})=>{
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/media/lego-local/catalog.json'))return route.fulfill({status:404,body:''});
    return url.hostname==='127.0.0.1'?route.continue():route.abort();
  });
  await page.goto('');await page.getByRole('button',{name:'Videos locales',exact:true}).click();
  await expect(page.locator('.media-item')).toHaveCount(5);
  for(const id of ['start','motors','touch','color','distance']){
    await page.locator('[data-view="tutorials"]').click();await page.locator(`[data-lesson="${id}"]`).click();
    const video=page.locator('.lesson-layout video');
    await expect(video).toHaveAttribute('src',/\/media\/tutorials\/[a-f0-9]+\.mp4$/);
    await video.evaluate(async v=>{v.muted=true;await v.play();});
    await expect.poll(()=>video.evaluate(v=>v.currentTime>0&&Number.isFinite(v.duration))).toBe(true);
  }
});
test('preserved lesson videos load without external requests',async({page})=>{
  test.skip(!fs.existsSync('public/media/lego-local/catalog.json'),'Local preservation inventory is not shipped in Git.');
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('');await page.getByRole('button',{name:'Videos locales',exact:true}).click();
  await expect(page.locator('.media-item')).toHaveCount(146);
  for(const lessonId of ['start','motors','touch','color','distance']){
    await page.locator('[data-view="tutorials"]').click();await page.locator(`[data-lesson="${lessonId}"]`).click();
    await expect(page.locator('.lesson-layout video')).toBeVisible();
    await expect.poll(()=>page.locator('.lesson-layout video').evaluate(v=>Number.isFinite(v.duration)&&v.duration>0&&v.readyState>=1)).toBe(true);
    await page.locator('.lesson-layout video').evaluate(v=>v.play());
    await expect.poll(()=>page.locator('.lesson-layout video').evaluate(v=>v.currentTime>0)).toBe(true);
  }
});
test('all converted WMV files play and keep separate original downloads',async({page})=>{
  test.setTimeout(120000);
  test.skip(!fs.existsSync('public/media/lego-local/catalog.json'),'Local media not available.');
  const catalog=JSON.parse(fs.readFileSync('public/media/lego-local/catalog.json','utf8'));
  const converted=catalog.entries.filter(e=>e.format==='wmv'&&e.webFile);
  test.skip(converted.length===0,'No conversions in this environment.');
  expect(converted).toHaveLength(catalog.entries.filter(e=>e.format==='wmv').length);
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('');await page.getByRole('button',{name:'Videos locales',exact:true}).click();
  await expect(page.locator('.media-item video')).toHaveCount(catalog.entries.length);
  for(const entry of converted){
    const video=page.locator(`.media-item video[src$="${entry.webFile}"]`);
    const card=page.locator('.media-item').filter({has:page.locator(`video[src$="${entry.webFile}"]`)});
    await expect(card.getByRole('link',{name:/Descargar original/})).toHaveAttribute('href',new RegExp(entry.file.replace('.','\\.')+'$'));
    await video.evaluate(async v=>{v.muted=true;await v.play();});
    await expect.poll(()=>video.evaluate(v=>v.currentTime>0&&v.readyState>=2)).toBe(true);
    await video.evaluate(v=>{v.pause();v.currentTime=Math.max(0,v.duration-0.5);});
    await expect.poll(()=>video.evaluate(v=>!v.seeking&&v.readyState>=2)).toBe(true);
  }
});
