import {test,expect} from '@playwright/test';

test('Classroom execution controls remain inside blocks and JavaScript editors',async({page})=>{
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
  const checkControls=async()=>{
    await expect(page.locator('.editor-heading .run-actions')).toHaveCount(0);
    await expect(page.locator('.editor-grid>section>.run-actions')).toBeVisible();
    const canvas=await page.locator('.editor-grid>section').boundingBox();
    for(const id of ['run','stop']){
      const bounds=await page.locator('#'+id).boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(canvas.x);
      expect(bounds.y).toBeGreaterThanOrEqual(canvas.y);
      expect(bounds.x+bounds.width).toBeLessThanOrEqual(canvas.x+canvas.width);
      expect(bounds.y+bounds.height).toBeLessThanOrEqual(canvas.y+canvas.height);
      await expect(page.locator('#'+id+' img')).toBeVisible();
      expect(await page.locator('#'+id).evaluate(button=>{
        const rect=button.getBoundingClientRect();
        return button.contains(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2));
      })).toBe(true);
    }
  };
  await checkControls();
  const icon=await page.request.get('content/connection/ev3.svg');
  expect(await icon.text()).toContain('fill="none" stroke="#000"');
  await page.getByRole('button',{name:'Ampliar editor',exact:true}).click();await checkControls();
  await page.screenshot({path:'.preservation/classroom-editor-controls.png'});
  await page.getByRole('checkbox',{name:'Simulador (sin robot)'}).check();
  await page.getByRole('button',{name:'Ejecutar',exact:true}).click();
  await expect(page.locator('#console')).toContainText('Programa terminado.');
  await page.getByRole('button',{name:'JavaScript',exact:true}).click();await checkControls();
  await page.locator('.cm-content').fill('await wait(10000); log("No debería llegar aquí");');
  await page.getByRole('button',{name:'Ejecutar',exact:true}).click();
  await expect(page.locator('#console')).toContainText('Programa iniciado');
  const stopsBefore=await page.locator('#console').evaluate(node=>node.textContent.split('Motores detenidos').length);
  await page.getByRole('button',{name:'Detener',exact:true}).click();
  await expect.poll(()=>page.locator('#console').evaluate(node=>node.textContent.split('Motores detenidos').length)).toBe(stopsBefore+1);
  await page.setViewportSize({width:390,height:844});await checkControls();
  await page.getByRole('button',{name:'Restaurar editor',exact:true}).click();await checkControls();
});

test('Blockly scrollbars cannot intercept execution controls',async({page})=>{
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
  for(const id of ['run','stop']){
    // Reproduce the overlap seen in CI, including Blockly's high scrollbar layer.
    const hit=await page.evaluate(id=>{
      const button=document.getElementById(id),box=button.getBoundingClientRect();
      const editor=document.getElementById('blocks-editor'),editorBox=editor.getBoundingClientRect();
      const scrollbar=editor.querySelector('.blocklyScrollbarHorizontal');
      scrollbar.style.cssText=`position:absolute;left:0;top:${box.y+box.height/2-editorBox.y-5}px;width:100%;height:11px;z-index:1000;pointer-events:auto;`;
      const target=document.elementFromPoint(box.x+box.width/2,box.y+box.height/2);
      return button.contains(target);
    },id);
    expect(hit).toBe(true);
    await page.locator('#'+id).click({trial:true});
  }
});
