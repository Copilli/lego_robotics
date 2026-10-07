import {test,expect} from '@playwright/test';
test('editor connection modal plays local Classroom steps and waits for a real selection',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    window.portRequests=0;
    Object.defineProperty(navigator,'serial',{configurable:true,value:{requestPort:()=>{window.portRequests++;return new Promise((resolve,reject)=>{window.cancelPort=()=>reject(Object.assign(new Error('Cancelled'),{name:'NotFoundError'}));});}}});
  });
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
  await expect(page.locator('.top-actions #connect')).toBeHidden();
  await page.getByRole('button',{name:'Conectar EV3',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('#connection-title')).toHaveText('Conectar mediante Bluetooth');
  await expect(page.locator('#connection-animation')).toHaveAttribute('src',/BT-Startup\.webm$/);
  await expect.poll(()=>page.locator('#connection-animation').evaluate(v=>v.currentTime>0&&v.readyState>=2)).toBe(true);
  expect(await page.evaluate(()=>window.portRequests)).toBe(0);
  await page.locator('[data-connection-step="1"]').click();await expect(page.locator('#connection-animation')).toHaveAttribute('src',/BT-Enable\.webm$/);
  await page.locator('[data-connection-step="2"]').click();await expect(page.locator('#connection-animation')).toHaveAttribute('src',/BT-Pair\.webm$/);
  await page.locator('#connection-select').click();await expect(page.locator('#connection-state')).toHaveText('Buscando…');await expect(page.locator('.connection-spinner')).toBeVisible();
  expect(await page.evaluate(()=>window.portRequests)).toBe(1);await page.evaluate(()=>window.cancelPort());
  await expect(page.locator('#connection-state')).toHaveText('Selección cancelada');await expect(page.locator('.connection-spinner')).toBeHidden();await expect(page.locator('#connection-select')).toBeEnabled();
  await page.locator('#connection-method').click();await expect(page.locator('#connection-animation')).toHaveAttribute('src',/USB\.webm$/);await expect(page.locator('#connection-select')).toBeHidden();await expect(page.locator('#connection-help')).toContainText('aún no está implementada');
  await page.locator('#connection-method').click();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#editor-connect')).toBeFocused();expect(errors).toEqual([]);
});
