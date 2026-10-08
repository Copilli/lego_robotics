export class Runtime {
  constructor(transport,output){this.transport=transport;this.output=output;this.worker=null;}
  async run(code){
    if(this.worker)throw new Error('Hay un programa en ejecución. Deténlo antes de iniciar otro.');
    if(!this.transport.connected)throw new Error('Conecta un EV3 primero.');
    if(!code.trim())throw new Error('El proyecto está vacío.');
    if(code.length>100000)throw new Error('El programa debe tener menos de 100000 caracteres.');
    const worker=new Worker(new URL('./code-worker.js',import.meta.url),{type:'module'});this.worker=worker;
    this.timer=setTimeout(()=>{this.output('Tiempo máximo de ejecución: 2 minutos.\n');this.stop().catch(e=>this.output(e.message));},120000);
    let inFlight=false;
    worker.onmessage=async({data})=>{
      if(worker!==this.worker)return;
      if(data.type==='log')this.output(data.text+'\n');
      if(data.type==='call'){
        if(inFlight){worker.postMessage({type:'reply',id:data.id,error:'Usa await para esperar cada operación del robot.'});return;}
        inFlight=true;
        try{
          if(!['motor','motion','motorStop','imageFile','soundFile','soundStop','tone','sensor','stop'].includes(data.method)||!Array.isArray(data.args))throw new Error('Operación EV3 no admitida.');
          const value=await this.transport[data.method](...data.args);
          if(data.method==='motor')await new Promise(resolve=>setTimeout(resolve,data.args[2]));
          if(data.method==='tone'&&data.args[3]!==false)await new Promise(resolve=>setTimeout(resolve,data.args[1]));
          if(worker===this.worker)worker.postMessage({type:'reply',id:data.id,value});
        }catch(error){if(worker===this.worker)worker.postMessage({type:'reply',id:data.id,error:error.message});}
        finally{inFlight=false;}
      }
      if(data.type==='done'||data.type==='error'){this.output(data.type==='done'?'Programa terminado.\n':`Error: ${data.text}\n`);await this.stop().catch(e=>this.output(`No se confirmó la detención: ${e.message}\n`));}
    };
    worker.onerror=()=>{this.output('Error al ejecutar el programa.\n');this.stop().catch(e=>this.output(e.message));};
    worker.postMessage({type:'run',code});this.output('Programa iniciado en el navegador.\n');
  }
  halt(){clearTimeout(this.timer);this.worker?.terminate();this.worker=null;}
  async stop(){this.halt();if(this.transport.connected)await this.transport.stop();}
}
