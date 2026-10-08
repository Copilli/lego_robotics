import {test,expect} from '@playwright/test';

test('USB modal selects EV3, confirms its reply, executes blocks and disconnects',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    const hid=new EventTarget(),device=new EventTarget();window.usbSent=[];window.usbFilters=[];
    Object.assign(device,{vendorId:0x0694,productId:5,opened:false,
      collections:[{outputReports:[{reportId:0,items:[{reportSize:8,reportCount:1024}]}],children:[]}],
      async open(){this.opened=true;},async close(){this.opened=false;},
      async sendReport(reportId,bytes){
        window.usbSent.push(Array.from(bytes));
        const data=new Uint8Array(1024);data.set([3,0,bytes[2],bytes[3],2]);
        const event=new Event('inputreport');Object.assign(event,{reportId,data:new DataView(data.buffer)});this.dispatchEvent(event);
      }});
    hid.requestDevice=async options=>{window.usbFilters=options.filters;return [device];};
    Object.defineProperty(navigator,'hid',{configurable:true,value:hid});
    Object.defineProperty(navigator,'serial',{configurable:true,value:undefined});
  });
  await page.goto('');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();
  await page.locator('#editor-connect').click();
  await expect(page.locator('#connection-select')).toBeDisabled();
  await page.locator('#connection-method').click();
  await expect(page.locator('#connection-select')).toBeEnabled();
  await expect(page.locator('#connection-animation')).toHaveAttribute('src',/USB\.webm$/);
  await page.locator('#connection-select').click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#hub-status')).toContainText('EV3 USB conectado');
  expect(await page.evaluate(()=>window.usbFilters)).toEqual([{vendorId:0x0694,productId:5}]);
  await page.getByRole('button',{name:'Ejecutar',exact:false}).click();
  await expect(page.locator('#console')).toContainText('Programa terminado.');
  expect(await page.evaluate(()=>window.usbSent.some(packet=>packet[7]===0x94&&packet[8]===1))).toBe(true);
  await page.locator('#editor-connect').click();await page.locator('#connection-disconnect').click();
  await expect(page.locator('#hub-status')).toContainText('sin conexión');
  expect(errors).toEqual([]);
});
