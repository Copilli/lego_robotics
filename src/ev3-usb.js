import {LegoBluetooth} from './ev3-transport.js';
import {connectionSupport} from './connection-support.js';

// Original EV3 firmware exposes an unnumbered HID report (64 or 1024 bytes).
// WebHID supplies the report payload without a report-ID byte.
export class LegoUsb extends LegoBluetooth {
  async connect(){
    const support=connectionSupport(globalThis,'usb');
    if(!support.supported)throw new Error(support.message);
    if(this.connected)return;
    const devices=await navigator.hid.requestDevice({filters:[{vendorId:0x0694,productId:0x0005}]});
    if(!devices.length)throw new DOMException('Selección cancelada.','NotFoundError');
    this.device=devices[0];this.closing=false;
    try{
      if(this.device.vendorId!==0x0694||this.device.productId!==0x0005)throw new Error('Selecciona un Ladrillo EV3 con firmware original.');
      await this.device.open();
      const reports=[];
      const visit=collections=>{for(const collection of collections){reports.push(...collection.outputReports);visit(collection.children);}};
      visit(this.device.collections);
      const report=reports.find(r=>r.reportId===0);
      const size=report?.items.reduce((bits,item)=>bits+item.reportSize*item.reportCount,0)/8;
      if(!Number.isInteger(size)||![64,1024].includes(size))throw new Error('El dispositivo no presenta la interfaz USB del firmware EV3 original.');
      this.reportSize=size;this.transferChunkSize=Math.min(480,size-7);this.initializeParser();
      this.onReport=event=>{
        if(!this.connected||event.reportId!==0)return;
        try{
          const data=new Uint8Array(event.data.buffer,event.data.byteOffset,event.data.byteLength);
          if(data.length<5)throw new Error('Respuesta USB EV3 incompleta.');
          const length=(data[0]|data[1]<<8)+2;
          if(length<5||length>data.length)throw new Error('Longitud de respuesta USB EV3 inválida.');
          this.parser.push(data.slice(0,length)); // Ignore HID report padding.
        }catch(error){this.output(`Error USB: ${error.message}\n`);void this.disconnect();}
      };
      this.onDisconnect=event=>{if(event.device===this.device)void this.disconnect();};
      this.device.addEventListener('inputreport',this.onReport);
      navigator.hid.addEventListener('disconnect',this.onDisconnect);
      this.writer={write:async bytes=>{
        if(bytes.length>this.reportSize)throw new Error('El comando supera el tamaño del informe USB EV3. Usa una conexión USB de alta velocidad.');
        const payload=new Uint8Array(this.reportSize);payload.set(bytes);
        await this.device.sendReport(0,payload);
      }};
      this.connected=true;
      await this.command([0x94,0]);
      this.status('connected','EV3 USB');this.output('EV3 conectado mediante cable USB.\n');
    }catch(error){await this.disconnect();throw error;}
  }
  async disconnect(){
    if(this.closing)return;
    this.closing=true;this.connected=false;this.generation++;this.assets.clear();this.rejectPending();
    this.device?.removeEventListener('inputreport',this.onReport);
    if(this.onDisconnect)navigator.hid.removeEventListener('disconnect',this.onDisconnect);
    try{if(this.device?.opened)await this.device.close();}catch{}
    this.device=null;this.writer=null;this.status('disconnected');
  }
}
