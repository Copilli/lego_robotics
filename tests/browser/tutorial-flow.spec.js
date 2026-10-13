import {test,expect} from '@playwright/test';

test('Home uses single thumbnails and portable videos with construction only at its step',async({page})=>{
  const catalogRequests=[];page.on('request',request=>{if(request.url().includes('/content/catalog.json'))catalogRequests.push(request.url());});
  // Simulate Pages: the ignored preservation folder is not available.
  await page.route('**/media/lego-local/**',route=>route.fulfill({status:404,body:''}));
  await page.goto('');await page.locator('[data-view="units"]').click();
  expect(catalogRequests[0]).toMatch(/catalog\.json\?v=[a-f0-9]{16}$/);
  for(const [index,width] of [524,773,691,696,594].entries()){
    const image=page.locator(`[data-unit="legacy-home-${index}"] img`);
    await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(image=>image.naturalWidth)).toBe(width);
  }
  await page.locator('[data-unit="legacy-home-0"]').click();
  await page.locator('[data-activity="legacy-home-0-1"]').click();
  await expect(page.locator('#tutorial-close')).toHaveCount(0);
  await expect(page.locator('#tutorial-build')).toHaveCount(0);
  const video=page.locator('.classroom-guide>video');
  await expect(video).toHaveAttribute('src',/\/content\/videos\/[a-f0-9]+\.mp4$/);
  await video.evaluate(async video=>{video.muted=true;await video.play();});
  await expect.poll(()=>video.evaluate(video=>video.currentTime>0&&video.readyState>=2)).toBe(true);
  await page.locator('#tutorial-next').click();await expect(page.locator('#tutorial-build')).toBeVisible();
  await page.locator('#tutorial-build').click();await expect(page.locator('.manual-viewer img')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/manual-fullscreen/);
  const manual=await page.locator('main').boundingBox();
  const viewport=page.viewportSize();expect(manual.width).toBe(viewport.width);expect(manual.height).toBe(viewport.height);
  await page.getByRole('button',{name:'Volver al tutorial',exact:true}).click();
  await page.locator('#tutorial-next').click();await expect(page.locator('#tutorial-build')).toHaveCount(0);
  await expect(page.locator('#tutorial-close')).toHaveCount(0);
  await page.locator('#tutorial-next').click();await expect(page.locator('.classroom-guide h2')).toContainText('Programa en bloques: paso 1');
});
