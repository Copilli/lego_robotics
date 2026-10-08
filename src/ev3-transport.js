import { packet,systemPacket,brickAssetPath,imageFileOps,soundFileOps, ReplyParser, stopOps, motorOps, toneOps, sensorOps, motionOps, motorStopOps } from './ev3-protocol.js';
import {connectionSupport} from './connection-support.js';
export class LegoBluetooth {
  constructor({output,status}){this.output=output;this.status=status;this.pending=new Map();this.counter=0;this.queue=Promise.resolve();this.connected=false;this.closing=false;this.assets=new Set();this.generation=0;}
  async connect(){
    const support=connectionSupport();if(!support.supported)throw new Error(support.message);
    if(this.connected)return;
    this.port=await navigator.serial.requestPort();
    try{
      await this.port.open({baudRate:115200});this.closing=false;
      this.writer=this.port.writable.getWriter();this.reader=this.port.readable.getReader();this.connected=true;
      this.initializeParser();
      this.readTask=this.readLoop();
      // A tone-stop reply proves this serial device speaks EV3 without moving motors.
      await this.command([0x94,0]);
      this.status('connected','EV3');this.output('EV3 conectado por puerto serie Bluetooth.\n');
    }catch(error){await this.disconnect();throw error;}
  }
  initializeParser(){this.parser=new ReplyParser(reply=>{const pending=this.pending.get(reply.counter);if(!pending)return;this.pending.delete(reply.counter);clearTimeout(pending.timer);(pending.system?[3,5].includes(reply.type):reply.type===2)?pending.resolve(reply.data):pending.reject(new Error(`EV3 rechazó el comando (0x${reply.type.toString(16)}).`));});}
  async readLoop(){
    try{while(!this.closing){const {value,done}=await this.reader.read();if(done)break;if(value)this.parser.push(value);}}
    catch(error){if(!this.closing)this.output(`\nError de conexión: ${error.message}\n`);}
    finally{if(!this.closing){this.connected=false;this.rejectPending();this.status('disconnected');await this.disconnect();}}
  }
  rejectPending(){for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new Error('EV3 desconectado.'));}this.pending.clear();}
  command(ops,globals=0,system=false){
    const operation=this.queue.then(async()=>{
      if(!this.connected)throw new Error('Conecta el EV3 primero.');
      this.counter=(this.counter+1)&65535;const counter=this.counter;
      const response=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(counter);reject(new Error('EV3 no respondió en 4 segundos. Comprueba la conexión y cierra otras aplicaciones LEGO.'));},4000);this.pending.set(counter,{resolve,reject,timer,system});});
      // Observe rejection immediately, including when the serial write itself fails.
      response.catch(()=>{});
      try{await this.writer.write(system?systemPacket(counter,ops):packet(counter,ops,globals));return await response;}
      catch(error){const p=this.pending.get(counter);if(p){clearTimeout(p.timer);this.pending.delete(counter);p.reject(error);}throw error;}
    });this.queue=operation.catch(()=>{});return operation;
  }
  async motor(port,speed,duration){await this.command(motorOps(port,speed,duration));}
  async motion(ports,speed,turn,unit,amount,brake){
    const {ops,mask}=motionOps(ports,speed,turn,unit,amount,brake);await this.command(ops);
    if(unit==='start')return;
    const deadline=Date.now()+60000;
    while(this.connected){
      const busy=await this.command([0xa9,0,mask,0x60],1);
      if(busy.length!==1)throw new Error('Respuesta del motor incompleta.');
      if(busy[0]===0)return;
      if(Date.now()>deadline){await this.stop();throw new Error('El motor no terminó en 60 segundos.');}
      await new Promise(resolve=>setTimeout(resolve,30));
    }
    throw new Error('EV3 desconectado durante el movimiento.');
  }
  async motorStop(ports,brake){await this.command(motorStopOps(ports,brake));}
  async prepareAsset(asset,extension,generation){
    const path=brickAssetPath(asset,extension);
    const active=()=>{if(!this.connected||generation!==this.generation)throw new Error('Transferencia del archivo cancelada.');};
    active();if(this.assets.has(asset))return;
    const response=await fetch(`${import.meta.env?.BASE_URL??'/'}content/${asset}`);if(!response.ok)throw new Error('No se encontró el archivo local del ladrillo.');
    const bytes=new Uint8Array(await response.arrayBuffer());if(!bytes.length||bytes.length>1048576)throw new Error('Archivo del ladrillo vacío o demasiado grande.');active();
    const size=bytes.length;
    const begin=await this.command([0x92,size&255,(size>>8)&255,(size>>16)&255,(size>>24)&255,...new TextEncoder().encode(path),0],0,true);
    if(begin.length!==3||begin[0]!==0x92||begin[1]!==0)throw new Error('EV3 no aceptó el archivo del tutorial.');
    const handle=begin[2];
    try{
      const chunkSize=this.transferChunkSize||480;
      for(let offset=0;offset<size;offset+=chunkSize){
        active();const end=Math.min(size,offset+chunkSize),reply=await this.command([0x93,handle,...bytes.slice(offset,end)],0,true);
        if(reply.length<2||reply[0]!==0x93||(reply[1]!==0&&!(end===size&&reply[1]===8)))throw new Error('EV3 rechazó una parte del archivo del tutorial.');
      }
      active();this.assets.add(asset);
    }catch(error){if(this.connected)await this.command([0x98,handle],0,true).catch(()=>{});throw error;}
  }
  async imageFile(asset,x,y,clear){const ops=imageFileOps(asset,x,y,clear),generation=this.generation;await this.prepareAsset(asset,'rgf',generation);if(generation!==this.generation)throw new Error('Programa detenido.');await this.command(ops);}
  async soundFile(asset,volume,mode){
    const ops=soundFileOps(asset,volume,mode),generation=this.generation;await this.prepareAsset(asset,'rsf',generation);if(generation!==this.generation)throw new Error('Programa detenido.');await this.command(ops);
    if(mode!==0)return;
    const deadline=Date.now()+60000;
    while(this.connected&&generation===this.generation){const busy=await this.command([0x95,0x60],1);if(busy.length!==1)throw new Error('Respuesta de sonido incompleta.');if(!busy[0])return;if(Date.now()>deadline){await this.soundStop();throw new Error('El sonido no terminó en 60 segundos.');}await new Promise(resolve=>setTimeout(resolve,30));}
    throw new Error('Reproducción cancelada.');
  }
  async soundStop(){await this.command([0x94,0]);}
  async tone(frequency,duration,volume=30){await this.command(toneOps(frequency,duration,volume));}
  async sensor(port,kind){const data=await this.command(sensorOps(port,kind),4);if(data.length!==4)throw new Error('Lectura EV3 incompleta.');const value=new DataView(data.buffer,data.byteOffset,4).getFloat32(0,true);if(!Number.isFinite(value))throw new Error('Sensor ausente, modo incorrecto o lectura inválida.');return value;}
  async stop(){this.generation++;await this.command([...stopOps(),0x94,0]);this.output('Se solicitó detener los motores y el sonido.\n');}
  async disconnect(){
    if(this.closing)return;this.closing=true;this.connected=false;this.generation++;this.assets.clear();this.rejectPending();
    try{await this.reader?.cancel();}catch{}try{this.reader?.releaseLock();}catch{}
    try{this.writer?.releaseLock();}catch{}try{await this.port?.close();}catch{}
    this.reader=null;this.writer=null;this.port=null;this.status('disconnected');
  }
}
