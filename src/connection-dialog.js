import {connectionSupport} from './connection-support.js';
const base=import.meta.env.BASE_URL+'content/connection/';
export function createConnectionDialog({connect,disconnect,isConnected,onError}){
  const dialog=document.createElement('dialog');dialog.className='connection-dialog';
  dialog.setAttribute('aria-labelledby','connection-title');
  dialog.innerHTML=`<div class="connection-dialog-top"><button id="connection-method">CONECTAR MEDIANTE CABLE USB</button><button id="connection-close" aria-label="Cerrar conexión"><img alt="" src="${base}close.svg"></button></div><h1 id="connection-title">Conectar mediante Bluetooth</h1><div class="connection-instructions"><ol><li><button data-connection-step="0">1. Enciende tu Ladrillo EV3.</button></li><li><button data-connection-step="1">2. Activa Bluetooth.</button></li><li><button data-connection-step="2">3. Empareja tu Ladrillo EV3.</button></li></ol><video id="connection-animation" playsinline preload="auto" aria-label="Pasos animados para conectar el Ladrillo EV3"></video></div><div class="connection-dialog-footer"><p id="connection-state" role="status" aria-live="polite"></p><div class="connection-spinner" hidden aria-hidden="true"></div><p id="connection-help"></p><button id="connection-audio" aria-pressed="false">Silenciar animación</button><button id="connection-replay" hidden>Reproducir animación</button><button id="connection-select" class="primary">Seleccionar EV3</button><button id="connection-disconnect" hidden>Desconectar EV3</button></div>`;
  document.body.append(dialog);
  const $=selector=>dialog.querySelector(selector);
  const video=$('#connection-animation');let step=0,usb=false,busy=false,audioMuted=false;
  const files=['BT-Startup.webm','BT-Enable.webm','BT-Pair.webm'];
  function showStep(index){step=index;dialog.querySelectorAll('[data-connection-step]').forEach(b=>{const active=Number(b.dataset.connectionStep)===step;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'step':'false');});video.loop=step===2||usb;video.src=base+(usb?'USB.webm':files[step]);video.muted=audioMuted;$('#connection-replay').hidden=true;video.play().catch(()=>{$('#connection-replay').hidden=false;$('#connection-help').textContent='Pulsa Reproducir animación para escuchar y ver los pasos.';});}
  function refresh(){
    const support=connectionSupport(globalThis,usb?'usb':'bluetooth'),connected=isConnected();
    $('#connection-select').hidden=connected;
    $('#connection-select').disabled=busy||!support.supported;
    $('#connection-disconnect').hidden=!connected;
    $('#connection-disconnect').disabled=busy;
    $('#connection-method').disabled=busy;
    $('.connection-spinner').hidden=!busy;
    $('#connection-state').textContent=busy?'Buscando…':connected?'Ladrillo EV3 conectado':usb?'Conexión USB':'Prepara tu Ladrillo EV3';
    $('#connection-help').textContent=usb||!support.supported?support.message:'Empareja el EV3 en Windows. Después selecciona aquí su puerto Bluetooth de salida.';
  }
  $('#connection-audio').onclick=()=>{audioMuted=!audioMuted;video.muted=audioMuted;$('#connection-audio').textContent=audioMuted?'Activar sonido':'Silenciar animación';$('#connection-audio').setAttribute('aria-pressed',String(audioMuted));};
  $('#connection-replay').onclick=()=>video.play().then(()=>{$('#connection-replay').hidden=true;}).catch(()=>{$('#connection-help').textContent='El navegador bloqueó la reproducción. Revisa los permisos de sonido del sitio.';});
  video.addEventListener('ended',()=>{if(!usb&&step<2)showStep(step+1);});
  video.addEventListener('error',()=>{$('#connection-help').textContent='No se pudo reproducir la animación local. Puedes seguir los tres pasos y seleccionar tu EV3.';});
  dialog.querySelectorAll('[data-connection-step]').forEach(b=>b.onclick=()=>showStep(Number(b.dataset.connectionStep)));
  $('#connection-close').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>video.pause());
  $('#connection-method').onclick=()=>{usb=!usb;dialog.classList.toggle('usb',usb);$('#connection-title').textContent=usb?'Conectar mediante cable USB':'Conectar mediante Bluetooth';$('#connection-method').textContent=usb?'CONECTAR MEDIANTE BLUETOOTH':'CONECTAR MEDIANTE CABLE USB';showStep(0);refresh();};
  $('#connection-select').onclick=async()=>{
    if(busy)return;busy=true;refresh();
    try{await connect(usb?'usb':'bluetooth');if(isConnected())dialog.close();}
    catch(error){onError(error);$('#connection-state').textContent=error.name==='NotFoundError'?'Selección cancelada':error.message;}
    finally{busy=false;$('.connection-spinner').hidden=true;$('#connection-select').disabled=!connectionSupport(globalThis,usb?'usb':'bluetooth').supported;$('#connection-method').disabled=false;$('#connection-disconnect').disabled=false;if(!dialog.open)video.pause();}
  };
  $('#connection-disconnect').onclick=async()=>{if(busy)return;busy=true;refresh();try{await disconnect();}catch(error){onError(error);}finally{busy=false;refresh();}};
  return {open(){if(dialog.open){refresh();return;}usb=false;dialog.classList.remove('usb');$('#connection-title').textContent='Conectar mediante Bluetooth';$('#connection-method').textContent='CONECTAR MEDIANTE CABLE USB';refresh();dialog.showModal();showStep(0);},refresh(){if(dialog.open)refresh();}};
}
