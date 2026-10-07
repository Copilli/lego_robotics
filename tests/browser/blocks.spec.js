import {test,expect} from '@playwright/test';

test('first-program guide runs editable Scratch blocks and persists its project',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('');await page.getByRole('button',{name:'Iniciar',exact:true}).click();
  await expect(page.locator('#blocks-editor .blocklySvg')).toBeVisible();
  await expect(page.locator('.examples h3')).toHaveText('Conecta tu EV3');
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await expect(page.locator('#notice')).toContainText('Conecta el EV3 o activa el simulador');
  await page.getByRole('checkbox',{name:'Simulador (sin robot)'}).check();
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await page.getByRole('button',{name:'Cargar ejemplo de este paso'}).click();
  await page.getByRole('button',{name:'Ejecutar'}).click();
  await expect(page.locator('#console')).toContainText('[Simulador] Tono: 440 Hz');
  await expect(page.locator('#console')).toContainText('Programa terminado.');
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await page.getByRole('button',{name:'Cargar ejemplo de este paso'}).click();
  // Edit a real Scratch field through its rendered input.
  const speed=page.locator('#blocks-editor .blocklyText').filter({hasText:/^30$/}).first();
  await speed.dblclick();await page.locator('.blocklyHtmlInput').fill('45');
  await page.locator('.blocklyHtmlInput').press('Enter');
  await page.getByRole('button',{name:'Ejecutar'}).click();
  await expect(page.locator('#console')).toContainText('Motor A: velocidad 45, 1000 ms');
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('copilli-lego-projects'))[0].blocksXML)).toContain('45');
  await page.waitForTimeout(1100);
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await page.getByRole('button',{name:'Cargar ejemplo de este paso'}).click();
  await page.getByRole('button',{name:'Ejecutar'}).click();
  await expect(page.locator('#console')).toContainText('Sensor distance en puerto 1: 50');
  await page.getByRole('button',{name:'Completar',exact:true}).click();
  await page.reload();await expect(page.locator('.progress')).toHaveText('1 / 5 completados');
  await page.locator('[data-home-open]').first().click();
  await expect(page.locator('#blocks-editor .blocklySvg')).toBeVisible();
  await page.getByRole('button',{name:'JavaScript',exact:true}).click();
  await expect(page.locator('.cm-content')).toContainText('robot.sensor(1, "distance")');
  expect(errors).toEqual([]);
});

test('blocks backup imports and preserves the editable workspace',async({page})=>{
  await page.goto('');await page.getByRole('button',{name:'+ Crear proyecto'}).click();
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
