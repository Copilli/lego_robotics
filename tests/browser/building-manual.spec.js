import {test,expect} from '@playwright/test';
test('one driving base opens a 46-page image carousel with arrows and keyboard',async({page})=>{
 await page.goto('');await page.locator('[data-view="build"]').click();
 const base=page.locator('[data-manual]').filter({has:page.getByRole('heading',{name:'Base motriz',exact:true})});
 await expect(base).toHaveCount(1);await expect(base.locator('img')).toBeVisible();await base.click();
 await expect(page.locator('.manual-viewer video')).toHaveCount(0);await expect(page.locator('.manual-navigation')).toContainText('1 / 46');
 const image=page.locator('.manual-viewer img'),first=await image.getAttribute('src');
 await expect(page.getByRole('button',{name:'Paso de construcción anterior',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Paso de construcción siguiente',exact:true}).click();await expect(page.locator('.manual-navigation')).toContainText('2 / 46');expect(await image.getAttribute('src')).not.toBe(first);
 await page.keyboard.press('ArrowLeft');await expect(page.locator('.manual-navigation')).toContainText('1 / 46');
 await page.keyboard.press('ArrowLeft');await expect(page.locator('.manual-navigation')).toContainText('1 / 46');
 await page.locator('.manual-viewer').dispatchEvent('touchstart',{touches:[{identifier:0,clientX:250,clientY:200}]});await page.locator('.manual-viewer').dispatchEvent('touchend',{changedTouches:[{identifier:0,clientX:100,clientY:205}]});await expect(page.locator('.manual-navigation')).toContainText('2 / 46');
 await page.screenshot({path:'.preservation/driving-base-carousel.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
