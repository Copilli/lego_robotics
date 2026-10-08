import {test,expect} from '@playwright/test';

test('workshop cover and brick lesson use modern captures and programs',async({page})=>{
  await page.goto('');await page.locator('[data-view="units"]').click();
  await expect(page.locator('[data-unit="legacy-base-3"] img')).toHaveAttribute('src',/content\/programs\//);
  await page.locator('[data-unit="legacy-base-3"]').click();
  await expect(page.locator('.unit-hero img')).toHaveAttribute('src',/content\/programs\//);
  const lesson=page.locator('[data-activity="legacy-base-3-re_Basics_Brick-Programming"]');
  await expect(lesson.locator('..').locator('img')).toHaveAttribute('src',/content\/programs\//);
  await page.screenshot({path:'.preservation/workshop-modern-unit.png'});
  await lesson.click();
  page.on('dialog',dialog=>dialog.accept());
  await expect(page.locator('.classroom-guide>img')).toHaveAttribute('src',/content\/programs\//);
  await page.locator('#tutorial-example').click();
  await page.getByRole('checkbox',{name:'Simulador (sin robot)'}).check();
  await page.getByRole('button',{name:'Ejecutar',exact:true}).click();
  await expect(page.locator('#console')).toContainText('Programa terminado.');
  await expect(page.locator('#console')).toContainText('B+C');
  for(let i=0;i<8;i++)await page.locator('#tutorial-next').click();
  await expect(page.locator('.classroom-guide h2')).toHaveText('Reto: retrocede y repite cuatro veces');
  await page.locator('#tutorial-example').click();
  await page.getByRole('button',{name:'JavaScript',exact:true}).click();
  await expect(page.locator('.cm-content')).toContainText('count1');
  await expect(page.locator('.cm-content')).toContainText('"B+C", -30, 30');
});
