import {motorOps,toneOps,sensorOps} from './ev3-protocol.js';
export class SimulatedEv3 {
  constructor(output){this.output=output;this.connected=true;this.readings={distance:50,color:5,reflection:60,touch:0,gyro:0,infrared:40};}
  async motor(port,speed,duration){motorOps(port,speed,duration);this.output(`[Simulador] Motor ${port}: velocidad ${speed}, ${duration} ms.\n`);}
  async tone(frequency,duration){toneOps(frequency,duration);this.output(`[Simulador] Tono: ${frequency} Hz, ${duration} ms.\n`);}
  async sensor(port,kind){sensorOps(port,kind);const value=this.readings[kind];this.output(`[Simulador] Sensor ${kind} en puerto ${port}: ${value}.\n`);return value;}
  async stop(){this.output('[Simulador] Motores detenidos.\n');}
}
