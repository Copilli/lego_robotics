import {test,expect} from '@playwright/test';

test('editor expands and restores without changing the program',async({page})=>{
  await page.goto('');
  await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
  const before=await page.locator('#blocks-editor').boundingBox();
  await page.getByRole('button',{name:'Guardar',exact:true}).click();
  const saved=await page.evaluate(()=>localStorage.getItem('copilli-lego-projects'));
  await page.getByRole('button',{name:'Ampliar editor',exact:true}).click();
  await expect(page.locator('#expand-editor')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.examples')).toBeHidden();
  await expect.poll(async()=>(await page.locator('#blocks-editor').boundingBox()).height).toBeGreaterThan(before.height);
  await page.getByRole('button',{name:'Ajustar programa',exact:true}).click();
  await expect(page.locator('#editor-connect')).toBeVisible();
  await page.screenshot({path:'.preservation/expanded-code-editor.png'});
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Ampliar editor',exact:true})).toBeVisible();
  await expect(page.locator('.examples')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('copilli-lego-projects'))).toBe(saved);
  await page.getByRole('button',{name:'JavaScript',exact:true}).click();
  await page.getByRole('button',{name:'Ampliar editor',exact:true}).click();
  await expect(page.locator('.cm-editor')).toBeVisible();
  await page.getByRole('button',{name:'Restaurar editor',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Ampliar editor',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const code=await page.locator('.cm-editor').boundingBox();
  expect(code.y+code.height).toBeLessThanOrEqual(844);
  await page.getByRole('button',{name:'Restaurar editor',exact:true}).click();
});

test('rebuilding the media palette does not leave blocks at its origin',async({page})=>{
  await page.goto('');
  await page.locator('[data-view="start"]').click();
  await page.locator('[data-activity]').first().click();
  for(let i=0;i<3;i++){
    await page.locator('#all-blocks').click();
    await page.locator('#all-blocks').click();
    await page.locator('#toggle-palette').click();
    await page.locator('#toggle-palette').click();
  }
  const orphans=await page.locator('.blocklyFlyout .blocklyBlockCanvas > .blocklyDraggable').evaluateAll(blocks=>blocks.filter(block=>{
    const transform=block.transform.baseVal.consolidate()?.matrix;
    return transform&&transform.e===0&&transform.f===0;
  }).length);
  expect(orphans).toBe(0);
});
