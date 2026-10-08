import {test,expect} from '@playwright/test';
test('browser without Web Serial shows the limitation and still runs the simulator',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'serial',{configurable:true,value:undefined}));await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
 await page.locator('#editor-connect').click();await expect(page.locator('#connection-help')).toContainText('En iPad');await expect(page.locator('#connection-select')).toBeDisabled();await page.locator('#connection-close').click();
 await page.getByRole('checkbox',{name:'Simulador (sin robot)'}).check();await page.getByRole('button',{name:'Ejecutar'}).click();await expect(page.locator('#console')).toContainText('[Simulador] Tono');await expect(page.locator('#console')).toContainText('Programa terminado.');
});
test('editor persists, searches, exports and imports projects',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('');
  await page.getByRole('button',{name:'Nuevo proyecto'}).click();
  await page.getByRole('button',{name:'JavaScript',exact:true}).click();
  await page.locator('#project-name').fill('Robot de prueba');
  await page.getByRole('button',{name:'+ Motor',exact:true}).click();
  await page.getByRole('button',{name:'Guardar',exact:true}).click();
  await page.getByRole('button',{name:'Tema',exact:true}).click();await expect(page.locator('.cm-editor')).toHaveClass(/cm-editor/);
  await page.getByRole('button',{name:'Buscar / reemplazar'}).click();await expect(page.locator('.cm-search')).toBeVisible();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar .js'}).click();expect((await download).suggestedFilename()).toBe('Robot_de_prueba.js');
  await page.reload();await page.getByRole('button',{name:'Mis proyectos'}).click();await expect(page.getByRole('heading',{name:'Robot de prueba'})).toBeVisible();
  await page.getByRole('button',{name:'Abrir',exact:true}).click();await expect(page.locator('.cm-content')).toContainText('robot.motor');
  await page.getByRole('button',{name:'Ejecutar'}).click();await expect(page.locator('#notice')).toContainText('Conecta un EV3');
  await page.locator('#file').setInputFiles({name:'imported.js',mimeType:'text/javascript',buffer:Buffer.from('log("importado");')});await expect(page.locator('#project-name')).toHaveValue('imported');
  expect(errors).toEqual([]);
});
test('Classroom sessions open in the editor with construction access',async({page})=>{
 await page.goto('');await page.locator('[data-view="units"]').click();await page.locator('[data-unit]').first().click();await page.locator('[data-activity]').first().click();
 await expect(page.locator('.classroom-guide')).toBeVisible();await expect(page.locator('.tutorial-count')).toContainText('01');
 await page.getByRole('button',{name:'Paso siguiente',exact:true}).click();await page.getByRole('button',{name:'CONSTRUIR',exact:true}).click();
 await expect(page.locator('.manual-viewer img')).toBeVisible();await expect(page.locator('.manual-viewer video')).toHaveCount(0);await page.getByRole('button',{name:'Volver al tutorial',exact:true}).click();await expect(page.locator('.tutorial-count')).toContainText('02');
});
test('production base and mobile layout',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('');await expect(page.getByRole('heading',{name:/Qué vas a crear/})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Nuevo proyecto'}).click();await expect(page.locator('#blocks-editor svg.blocklySvg')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await expect(page.getByRole('button',{name:'Agregar bloques',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Agregar bloques',exact:true}).click();
  await expect(page.getByRole('button',{name:'Ocultar bloques',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Ocultar bloques',exact:true}).click();
});
test('EV3 simulated serial handshake, worker execution, stop and disconnect',async({page})=>{
  await page.addInitScript(()=>{
    let controller;const sent=[];window.ev3Sent=sent;
    Object.defineProperty(navigator,'serial',{configurable:true,value:{requestPort:async()=>({
      open:async()=>{},close:async()=>{},
      readable:new ReadableStream({start(c){controller=c;}}),
      writable:new WritableStream({write(bytes){sent.push(Array.from(bytes));controller.enqueue(new Uint8Array([3,0,bytes[2],bytes[3],2]));}}),
    })}});
  });
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();await page.locator('#editor-connect').click();await page.locator('#connection-select').click();await expect(page.locator('#hub-status')).toContainText('EV3 conectado');
  await page.getByRole('button',{name:'Ejecutar'}).click();
  await expect(page.locator('#console')).toContainText('Programa terminado.');expect(await page.evaluate(()=>ev3Sent.some(p=>p[7]===0x94&&p[8]===1))).toBe(true);
  await page.locator('#editor-connect').click();await page.locator('#connection-disconnect').click();await expect(page.locator('#hub-status')).toContainText('sin conexión');
});
