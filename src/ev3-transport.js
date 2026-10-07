import { packet, ReplyParser, stopOps, motorOps, toneOps, sensorOps } from './ev3-protocol.js';
import {connectionSupport} from './connection-support.js';
export class LegoBluetooth {
  constructor({output,status}){this.output=output;this.status=status;this.pending=new Map();this.counter=0;this.queue=Promise.resolve();this.connected=false;this.closing=false;}
  async connect(){
    const support=connectionSupport();if(!support.supported)throw new Error(support.message);
    if(this.connected)return;
    this.port=await navigator.serial.requestPort();
    try{
      await this.port.open({baudRate:115200});this.closing=false;
      this.writer=this.port.writable.getWriter();this.reader=this.port.readable.getReader();this.connected=true;
      this.parser=new ReplyParser(reply=>{const pending=this.pending.get(reply.counter);if(!pending)return;this.pending.delete(reply.counter);clearTimeout(pending.timer);reply.type===2?pending.resolve(reply.data):pending.reject(new Error(`EV3 rechazó el comando (0x${reply.type.toString(16)}).`));});
      this.readTask=this.readLoop();
      // A tone-stop reply proves this serial device speaks EV3 without moving motors.
      await this.command([0x94,0]);
      this.status('connected','EV3');this.output('EV3 conectado por puerto serie Bluetooth.\n');
    }catch(error){await this.disconnect();throw error;}
  }
  async readLoop(){
    try{while(!this.closing){const {value,done}=await this.reader.read();if(done)break;if(value)this.parser.push(value);}}
    catch(error){if(!this.closing)this.output(`\nError de conexión: ${error.message}\n`);}
    finally{if(!this.closing){this.connected=false;this.rejectPending();this.status('disconnected');await this.disconnect();}}
  }
  rejectPending(){for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new Error('EV3 desconectado.'));}this.pending.clear();}
  command(ops,globals=0){
    const operation=this.queue.then(async()=>{
      if(!this.connected)throw new Error('Conecta el EV3 primero.');
      this.counter=(this.counter+1)&65535;const counter=this.counter;
      const response=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(counter);reject(new Error('EV3 no respondió en 4 segundos. Comprueba el puerto Bluetooth.'));},4000);this.pending.set(counter,{resolve,reject,timer});});
      // Observe rejection immediately, including when the serial write itself fails.
      response.catch(()=>{});
      try{await this.writer.write(packet(counter,ops,globals));return await response;}
      catch(error){const p=this.pending.get(counter);if(p){clearTimeout(p.timer);this.pending.delete(counter);p.reject(error);}throw error;}
    });this.queue=operation.catch(()=>{});return operation;
  }
  async motor(port,speed,duration){await this.command(motorOps(port,speed,duration));}
  async tone(frequency,duration){await this.command(toneOps(frequency,duration));}
  async sensor(port,kind){const data=await this.command(sensorOps(port,kind),4);if(data.length!==4)throw new Error('Lectura EV3 incompleta.');const value=new DataView(data.buffer,data.byteOffset,4).getFloat32(0,true);if(!Number.isFinite(value))throw new Error('Sensor ausente, modo incorrecto o lectura inválida.');return value;}
  async stop(){await this.command([...stopOps(),0x94,0]);this.output('Se solicitó detener los motores y el sonido.\n');}
  async disconnect(){
    if(this.closing)return;this.closing=true;this.connected=false;this.rejectPending();
    try{await this.reader?.cancel();}catch{}try{this.reader?.releaseLock();}catch{}
    try{this.writer?.releaseLock();}catch{}try{await this.port?.close();}catch{}
    this.reader=null;this.writer=null;this.port=null;this.status('disconnected');
  }
}
