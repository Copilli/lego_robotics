import {test,expect} from '@playwright/test';
import fs from 'node:fs';

test('connection animation decodes its original audio and can be muted',async({page})=>{
  const audioRequests=[],errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(/editor-audio\/(click|delete)\.\w+$/.test(response.url()))audioRequests.push(response);});
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
  await expect.poll(()=>audioRequests.length).toBeGreaterThanOrEqual(2);
  for(const response of audioRequests){
    expect(response.status()).toBe(200);
    const name=new URL(response.url()).pathname.split('/').at(-1);
    expect(Buffer.compare(await response.body(),fs.readFileSync('public/content/editor-audio/'+name))).toBe(0);
  }
  await page.locator('#editor-connect').click();
  const video=page.locator('#connection-animation');
  await expect.poll(()=>video.evaluate(element=>!element.muted&&element.volume>0&&!element.paused&&element.webkitAudioDecodedByteCount>0)).toBe(true);
  await page.getByRole('button',{name:'Silenciar animación',exact:true}).click();
  expect(await video.evaluate(element=>element.muted)).toBe(true);
  await page.getByRole('button',{name:'Activar sonido',exact:true}).click();
  expect(await video.evaluate(element=>element.muted)).toBe(false);
  await page.locator('#connection-method').click();
  await expect.poll(()=>video.evaluate(element=>!element.muted&&!element.paused&&element.webkitAudioDecodedByteCount>0)).toBe(true);
  await page.locator('#connection-close').click();
  expect(await video.evaluate(element=>element.paused)).toBe(true);
  expect(errors).toEqual([]);
});
