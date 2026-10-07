import {test,expect} from '@playwright/test';
test('tutorial palette switches to all blocks and the edited program persists',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('');await page.locator('[data-view="start"]').click();await page.locator('[data-activity]').first().click();
 await expect(page.locator('#blocks-editor .blocklySvg')).toBeVisible();await expect(page.locator('.classroom-guide h2')).toContainText('Ladrillo EV3');
 await expect(page.locator('.blocklyToolbox')).not.toContainText('Operadores');await page.getByRole('button',{name:'Todos los bloques de código',exact:true}).click();await expect(page.locator('.blocklyToolbox')).toContainText('Operadores');
 for(let i=0;i<4;i++)await page.getByRole('button',{name:'Paso siguiente',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Cargar ejemplo compatible',exact:true}).click();await page.getByRole('checkbox',{name:'Simulador (sin robot)'}).check();await page.getByRole('button',{name:'Ejecutar'}).click();await expect(page.locator('#console')).toContainText('Programa terminado.');
 await page.getByRole('button',{name:'Paso anterior',exact:true}).click();await page.locator('#save').click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('copilli-lego-projects'))[0].blocksXML)).toContain('Ejemplo de práctica compatible');await page.reload();await page.locator('[data-view="projects"]').click();await page.getByRole('button',{name:'Abrir',exact:true}).click();await expect(page.locator('.tutorial-count')).toContainText('04');expect(errors).toEqual([]);
});
test('blocks backup imports and preserves the editable workspace',async({page})=>{
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto'}).click();
  await page.getByRole('button',{name:'Motor A',exact:true}).click();
  await page.getByRole('button',{name:'Guardar',exact:true}).click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('copilli-lego-projects'))[0]);
  expect(saved.code).toContain('robot.motor("A", 30, 1000)');
  await page.locator('#file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...saved,name:'Bloques importados'}))});
  await expect(page.locator('#project-name')).toHaveValue('Bloques importados');
  await expect(page.locator('#blocks-editor .blocklySvg')).toBeVisible();
  await page.getByRole('button',{name:'Duplicar',exact:true}).click();
  await expect(page.locator('#project-name')).toHaveValue('Bloques importados (copia)');
  await page.getByRole('button',{name:'JavaScript',exact:true}).click();
  await expect(page.locator('.cm-content')).toContainText('robot.motor("A", 30, 1000)');
});
