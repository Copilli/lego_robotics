import {motionOps,motorStopOps,toneOps} from './ev3-protocol.js';

const clean=value=>String(value||'').replaceAll('\\','').replace(/\.vix$/,'');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const fields=values=>Object.entries(values).map(([name,value])=>`<field name="${name}">${escape(value)}</field>`).join('');
const number=(name,value)=>`<value name="${name}"><shadow type="math_number"><field name="NUM">${value}</field></shadow></value>`;
const block=(type,content='')=>({type,content});
const chain=blocks=>blocks.length?`<block type="${blocks[0].type}">${blocks[0].content}${blocks.length>1?`<next>${chain(blocks.slice(1))}</next>`:''}</block>`:'';

// Follow sequence wires rather than file order. Never silently omit an instruction,
// replace a wired value with its stale constant, or approximate rotations by time.
export function convertLegacyProgram(program,assets={}){
  const diagnostics=[];
  function argument(node,name,fallback){
    const arg=node.args.find(a=>clean(a.name)===name);
    if(!arg){if(fallback!==undefined)return fallback;throw new Error(`${clean(node.target)}: falta ${name}`);}
    if(arg.wire)throw new Error(`${clean(node.target)}: ${name} depende de un cable de datos`);
    return arg.value;
  }
  const numeric=(node,name,fallback)=>{const value=Number(argument(node,name,fallback));if(!Number.isFinite(value))throw new Error(`${name}: número inválido`);return value;};
  const boolean=(node,name,fallback)=>{const value=String(argument(node,name,fallback)).toLowerCase();if(!['true','false'].includes(value))throw new Error(`${name}: booleano inválido`);return value==='true';};
  const ports=node=>{const value=argument(node,node.args.some(a=>clean(a.name)==='Ports')?'Ports':'MotorPort');if(/^\d\./.test(value)&&!value.startsWith('1.'))throw new Error('Motores de una cadena de ladrillos');return value.replace(/^1\./,'');};
  function instruction(node){
    const target=clean(node.target);
    if(node.args.some(arg=>arg.direction==='Input'&&/^Interrupt/.test(clean(arg.name))&&(arg.wire||Number(arg.value)!==0)))throw new Error('Interrupción del programa pendiente de convertir');
    if(node.kind==='StartBlock'||node.role==='LoopIndex')return null;
    if(node.kind==='ConfigurableWhileLoop'){
      const body=node.diagrams[0];if(!body)throw new Error('Bucle sin cuerpo');
      const stop=body.nodes.find(n=>n.role==='StopCondition');if(!stop)throw new Error('Bucle sin condición');
      const stopTarget=clean(stop.target),sub=sequence(body,body.nodes.find(n=>n.role==='LoopIndex'),stop);
      if(stopTarget==='StopNever')return block('control_forever',`<statement name="SUBSTACK">${chain(sub)}</statement>`);
      if(stopTarget==='StopAfterNumberIterations'){
        const count=numeric(stop,'Iterations To Run');if(!Number.isInteger(count)||count<0||count>10000)throw new Error('Número de repeticiones fuera de rango');
        return block('control_repeat',number('TIMES',count)+`<statement name="SUBSTACK">${chain(sub)}</statement>`);
      }
      throw new Error(`Condición de bucle: ${stopTarget}`);
    }
    if(/^(MediumMotor|Motor|Move)(Time|Distance|DistanceRotations|Unlimited)$/.test(target)){
      const unit=target.endsWith('DistanceRotations')?'rotations':target.endsWith('Distance')?'degrees':target.endsWith('Time')?'seconds':'start';
      const amount=unit==='start'?0:numeric(node,{seconds:'Seconds',degrees:'Degrees',rotations:'Rotations'}[unit]);
      const speed=numeric(node,'Speed'),turn=numeric(node,'Steering',0),brake=boolean(node,'Brake At End','True'),selected=ports(node);
      motionOps(selected,speed,turn,unit,amount,brake);
      return block('ev3_motion',fields({PORTS:selected,SPEED:speed,TURN:turn,UNIT:unit,AMOUNT:amount,BRAKE:brake?'TRUE':'FALSE'}));
    }
    if(/^(MediumMotor|Motor|Move)Stop$/.test(target)){
      const selected=ports(node),brake=boolean(node,'Brake?','True');motorStopOps(selected,brake);
      return block('ev3_motor_stop',fields({PORTS:selected,BRAKE:brake?'TRUE':'FALSE'}));
    }
    if(target==='TimeCompare'&&node.kind==='ConfigurableWaitFor'){
      const seconds=numeric(node,'How Long');if(seconds<0||seconds>30)throw new Error('Espera fuera de rango');
      return block('control_wait',number('DURATION',seconds));
    }
    if(target==='PlayTone'){
      const frequency=numeric(node,'Frequency'),seconds=numeric(node,'Duration');
      const volume=numeric(node,'Volume'),playType=numeric(node,'Play Type',0);
      if(![0,1].includes(playType))throw new Error('Repetición de sonido pendiente de convertir');
      toneOps(frequency,Math.round(seconds*1000),volume);
      return block('ev3_tone',fields({FREQUENCY:frequency,SECONDS:seconds,VOLUME:volume,WAIT:playType===0?'TRUE':'FALSE'}));
    }
    if(target==='DisplayFile'||target==='PlaySoundFile'){
      const name=argument(node,target==='DisplayFile'?'Filename':'Name'),asset=assets[name];
      if(!asset)throw new Error(`Archivo del ladrillo no conservado: ${name}`);
      if(target==='DisplayFile')return block('ev3_image_file',fields({FILE:name,X:numeric(node,'X'),Y:numeric(node,'Y'),CLEAR:boolean(node,'Clear Screen')?'TRUE':'FALSE'})+`<data>${escape(asset)}</data>`);
      const volume=numeric(node,'Volume'),playType=numeric(node,'Play Type');
      if(!Number.isInteger(volume)||volume<0||volume>100||![0,1,2].includes(playType))throw new Error('Parámetros de sonido inválidos');
      return block('ev3_sound_file',fields({FILE:name,VOLUME:volume,MODE:String(playType)})+`<data>${escape(asset)}</data>`);
    }
    if(target==='PlaySoundStop')return block('ev3_sound_stop');
    if(target==='TouchCompare'&&node.kind==='ConfigurableWaitFor'){
      const portValue=argument(node,'Port');if(/^\d\./.test(portValue)&&!portValue.startsWith('1.'))throw new Error('Sensor de una cadena de ladrillos');
      const port=Number(portValue.replace(/^1\./,'')),pressed=numeric(node,'Pressed, Released or Bumped');
      if(!Number.isInteger(port)||port<1||port>4||![0,1].includes(pressed))throw new Error('Espera de contacto: modo o puerto pendiente');
      const sensor=`<value name="OPERAND1"><block type="ev3_sensor">${fields({PORT:port,KIND:'touch'})}</block></value>`;
      return block('control_wait_until',`<value name="CONDITION"><block type="operator_equals">${sensor}${number('OPERAND2',pressed)}</block></value>`);
    }
    throw new Error(`Operación pendiente: ${target||node.kind}`);
  }
  function sequence(diagram,start,stop){
    if(!start)throw new Error('No hay bloque de inicio');
    const result=[],visited=new Set();let current=start;
    while(current&&current!==stop){
      if(visited.has(current.id))throw new Error('Secuencia cíclica');visited.add(current.id);
      const converted=instruction(current);if(converted)result.push(converted);
      const wire=current.terminals.find(t=>t.name==='SequenceOut')?.wire;
      if(!wire)break;
      const next=diagram.nodes.filter(n=>n.terminals.some(t=>t.name==='SequenceIn'&&t.wire===wire));
      if(next.length!==1)throw new Error('Cable de secuencia ambiguo o incompleto');current=next[0];
    }
    const unused=diagram.nodes.filter(n=>n!==stop&&!visited.has(n.id)&&n.kind!=='Comment');
    if(unused.length)throw new Error(`Ramas o datos pendientes: ${unused.map(n=>clean(n.target)||n.kind).join(', ')}`);
    return result;
  }
  try{
    const starts=program.diagram.nodes.filter(n=>n.kind==='StartBlock');if(starts.length!==1)throw new Error('Programa con varios inicios');
    const blocks=sequence(program.diagram,starts[0]);if(!blocks.length)throw new Error('Programa vacío');
    return {name:program.name,xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_whenflagclicked" x="24" y="24"><comment pinned="false">${escape(program.name)}: conserva los puertos y valores del programa original.</comment><next>${chain(blocks)}</next></block></xml>`,diagnostics};
  }catch(error){diagnostics.push(error.message);return {name:program.name,xml:null,diagnostics};}
}
