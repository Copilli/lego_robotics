// Independent encoding, cross-checked against Scratch's EV3 extension.
export function integer(value) {
  if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) throw new Error('Parámetro entero fuera de rango.');
  if(value >= -32 && value <= 31) return [value & 0x3f];
  if(value >= -128 && value <= 127) return [0x81, value & 255];
  if(value >= -32768 && value <= 32767) return [0x82, value & 255, (value >> 8) & 255];
  return [0x83,value & 255,(value >> 8) & 255,(value >> 16) & 255,(value >> 24) & 255];
}
export function packet(counter, ops, globals=0) {
  if (!Number.isInteger(globals)||globals<0||globals>1023) throw new Error('Memoria global inválida.');
  const body=[counter & 255,(counter >> 8)&255,0,globals & 255,(globals >> 8)&3,...ops];
  return new Uint8Array([body.length & 255,body.length >> 8,...body]);
}
export function systemPacket(counter,ops){const body=[counter&255,(counter>>8)&255,1,...ops];return new Uint8Array([body.length&255,body.length>>8,...body]);}
export const ev3String=value=>[0x84,...new TextEncoder().encode(value),0];
export function brickAssetPath(asset,extension){if(!new RegExp(`^assets/[a-f0-9]{20}\\.${extension}$`).test(asset))throw new Error('Archivo local del ladrillo inválido.');return '../prjs/copilli/'+asset.slice(7);}
export function imageFileOps(asset,x,y,clear){
  const path=brickAssetPath(asset,'rgf');if(!Number.isInteger(x)||!Number.isInteger(y)||Math.abs(x)>178||Math.abs(y)>128)throw new Error('Coordenadas de pantalla fuera de rango.');
  return [...(clear?[0x84,19,0,0,0]:[]),0x84,28,1,...integer(x),...integer(y),...ev3String(path),0x84,0];
}
export function soundFileOps(asset,volume,mode){const path=brickAssetPath(asset,'rsf');if(!Number.isInteger(volume)||volume<0||volume>100||![0,1,2].includes(mode))throw new Error('Parámetros de sonido inválidos.');return [0x94,mode===2?3:2,...integer(volume),...ev3String(path.slice(0,-4))];}
export class ReplyParser {
  constructor(onReply){this.buffer=new Uint8Array();this.onReply=onReply;}
  push(chunk){
    const buffer=new Uint8Array(this.buffer.length+chunk.length);buffer.set(this.buffer);buffer.set(chunk,this.buffer.length);this.buffer=buffer;
    while(this.buffer.length>=2){
      const size=this.buffer[0]|(this.buffer[1]<<8);
      if(size<3||size>1024)throw new Error('Respuesta EV3 inválida. Revisa que seleccionaste el puerto correcto.');
      if(this.buffer.length<size+2)return;
      const reply=this.buffer.slice(2,size+2);this.buffer=this.buffer.slice(size+2);
      this.onReply({counter:reply[0]|(reply[1]<<8),type:reply[2],data:reply.slice(3)});
    }
  }
}
export const stopOps=()=>[0xa3,0,15,1];
export function motionOps(ports,speed,turn,unit,amount,brake=true){
  if(!/^[A-D](\+[A-D])?$/.test(ports)||new Set(ports.split('+')).size!==ports.split('+').length)throw new Error('Selecciona uno o dos motores distintos.');
  if(!Number.isInteger(speed)||Math.abs(speed)>100||!Number.isInteger(turn)||Math.abs(turn)>200)throw new Error('Velocidad o dirección fuera de rango.');
  if(!['seconds','degrees','rotations','start'].includes(unit)||!Number.isFinite(amount)||amount<0)throw new Error('Unidad o distancia inválida.');
  if(ports.length===1&&turn!==0)throw new Error('La dirección necesita dos motores.');
  const mask=ports.split('+').reduce((mask,p)=>mask|(1<<'ABCD'.indexOf(p)),0);
  const steps=unit==='start'?0:Math.round(amount*(unit==='seconds'?1000:unit==='rotations'?360:1));
  if(unit!=='start'&&(steps<1||steps>2147483647))throw new Error('Movimiento fuera de rango.');
  if(unit==='seconds'&&amount>30)throw new Error('Movimiento: máximo 30 segundos.');
  // EV3 STEP_SPEED/TIME_SPEED use degrees/ms; SYNC takes steering -200..200.
  const ops=ports.length===1?[unit==='seconds'?0xaf:0xae,0,mask,...integer(speed),0,...integer(steps),0,brake?1:0]:[unit==='seconds'?0xb1:0xb0,0,mask,...integer(speed),...integer(turn),...integer(steps),brake?1:0];
  return {ops,mask};
}
export function motorStopOps(ports,brake=true){const {mask}=motionOps(ports,0,0,'start',0,brake);return [0xa3,0,mask,brake?1:0];}
export function motorOps(port,speed,duration){
  if(!['A','B','C','D'].includes(port))throw new Error('Puerto motor: A, B, C o D.');
  if(!Number.isInteger(speed)||speed < -100||speed>100)throw new Error('Velocidad: entero de -100 a 100.');
  if(!Number.isInteger(duration)||duration<1||duration>10000)throw new Error('Duración del motor: 1–10000 ms.');
  return [0xaf,0,1<<('ABCD'.indexOf(port)),...integer(speed),0,...integer(duration),0,1];
}
export function toneOps(frequency,duration,volume=30){
  if(!Number.isInteger(volume)||volume<0||volume>100)throw new Error('Volumen: entero de 0 a 100.');
  if(!Number.isInteger(frequency)||frequency<250||frequency>10000||!Number.isInteger(duration)||duration<1||duration>5000)throw new Error('Sonido: 250–10000 Hz y 1–5000 ms.');
  return [0x94,1,...integer(volume),...integer(frequency),...integer(duration)];
}
export function sensorOps(port,kind){
  const modes={distance:[30,0],color:[29,2],reflection:[29,0],touch:[16,0],gyro:[32,0],infrared:[33,0]};
  if(!Number.isInteger(port)||port<1||port>4||!modes[kind])throw new Error('Sensor inválido. Usa puerto 1–4 y un tipo documentado.');
  const [type,mode]=modes[kind];return [0x9d,0,port-1,...integer(type),...integer(mode),0x60];
}
