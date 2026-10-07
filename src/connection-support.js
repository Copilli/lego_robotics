export function connectionSupport(environment=globalThis){
  if(!environment.isSecureContext)return {supported:false,message:'Abre la aplicación en HTTPS o localhost para conectar el EV3.'};
  if(typeof environment.navigator?.serial?.requestPort!=='function')return {supported:false,message:'Este navegador no permite la conexión Bluetooth serie del EV3. Usa Chrome o Edge de escritorio. En iPad puedes usar los tutoriales, el editor y el simulador, pero la conexión directa al robot no está disponible.'};
  return {supported:true,message:'Empareja el EV3 en el sistema y selecciona su puerto Bluetooth serie. La conexión se confirma cuando el robot responde.'};
}
