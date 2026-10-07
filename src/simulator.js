import {motorOps,toneOps,sensorOps,motionOps,motorStopOps} from './ev3-protocol.js';
export class SimulatedEv3 {
  constructor(output){this.output=output;this.connected=true;this.readings={distance:50,color:5,reflection:60,touch:0,gyro:0,infrared:40};}
  async motor(port,speed,duration){motorOps(port,speed,duration);this.output(`[Simulador] Motor ${port}: velocidad ${speed}, ${duration} ms.\n`);}
  async motion(ports,speed,turn,unit,amount,brake){motionOps(ports,speed,turn,unit,amount,brake);this.output(`[Simulador] Motores ${ports}: velocidad ${speed}, dirección ${turn}, ${amount} ${unit}, freno ${brake}.\n`);}
  async motorStop(ports,brake){motorStopOps(ports,brake);this.output(`[Simulador] Detener ${ports}, freno ${brake}.\n`);}
  async tone(frequency,duration){toneOps(frequency,duration);this.output(`[Simulador] Tono: ${frequency} Hz, ${duration} ms.\n`);}
  async sensor(port,kind){sensorOps(port,kind);const value=this.readings[kind];this.output(`[Simulador] Sensor ${kind} en puerto ${port}: ${value}.\n`);return value;}
  async stop(){this.output('[Simulador] Motores detenidos.\n');}
}
