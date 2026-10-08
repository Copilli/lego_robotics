// Translate the supported Scratch Blocks tree into the EV3 browser runtime API.
export function compileBlocks(workspace) {
  const starts=workspace.getTopBlocks(true).filter(b=>b.type==='event_whenflagclicked'&&b.isEnabled());
  if(starts.length!==1)throw new Error('Conecta tu programa a un único bloque «al hacer clic en la bandera».');
  let visited=0,loopId=0;
  const field=(b,name)=>b.getFieldValue(name);
  function expression(b){
    if(!b)return '0';
    if(++visited>1000)throw new Error('El programa supera el límite de 1000 bloques.');
    const input=name=>expression(b.getInputTargetBlock(name));
    if(['math_number','math_positive_number','math_whole_number','math_integer','math_angle'].includes(b.type)){
      const number=Number(field(b,'NUM'));if(!Number.isFinite(number))throw new Error('Hay un número inválido.');return String(number);
    }
    if(b.type==='text')return JSON.stringify(String(field(b,'TEXT')));
    if(b.type==='ev3_sensor')return `(await robot.sensor(${Number(field(b,'PORT'))}, ${JSON.stringify(field(b,'KIND'))}))`;
    const arithmetic={operator_add:'+',operator_subtract:'-',operator_multiply:'*',operator_divide:'/'};
    if(arithmetic[b.type])return `(Number(${input('NUM1')}) ${arithmetic[b.type]} Number(${input('NUM2')}))`;
    const comparisons={operator_lt:'<',operator_gt:'>',operator_equals:'==='};
    if(comparisons[b.type])return `(Number(${input('OPERAND1')}) ${comparisons[b.type]} Number(${input('OPERAND2')}))`;
    if(b.type==='operator_and'||b.type==='operator_or')return `(${input('OPERAND1')} ${b.type==='operator_and'?'&&':'||'} ${input('OPERAND2')})`;
    if(b.type==='operator_not')return `(!${input('OPERAND')})`;
    throw new Error(`Este bloque no está admitido: ${b.type}`);
  }
  function sequence(first){
    let code='';
    for(let b=first;b;b=b.getNextBlock()){
      if(++visited>1000)throw new Error('El programa supera el límite de 1000 bloques.');
      if(!b.isEnabled())continue;
      const input=name=>expression(b.getInputTargetBlock(name));
      const sub=name=>sequence(b.getInputTargetBlock(name));
      switch(b.type){
        case 'ev3_image_file':case 'ev3_sound_file':{
          const extension=b.type==='ev3_image_file'?'rgf':'rsf';if(!new RegExp(`^assets/[a-f0-9]{20}\\.${extension}$`).test(b.data||''))throw new Error('Falta el archivo local del ladrillo para este bloque.');
          code+=b.type==='ev3_image_file'?`await robot.imageFile(${JSON.stringify(b.data)}, ${Number(field(b,'X'))}, ${Number(field(b,'Y'))}, ${field(b,'CLEAR')==='TRUE'});\n`:`await robot.soundFile(${JSON.stringify(b.data)}, ${Number(field(b,'VOLUME'))}, ${Number(field(b,'MODE'))});\n`;break;
        }
        case 'ev3_sound_stop':code+='await robot.soundStop();\n';break;
        case 'ev3_log':code+=`log(${input('VALUE')});\n`;break;
        case 'ev3_motor':code+=`await robot.motor(${JSON.stringify(field(b,'PORT'))}, ${Number(field(b,'SPEED'))}, ${Math.round(Number(field(b,'SECONDS'))*1000)});\n`;break;
        case 'ev3_motion':code+=`await robot.motion(${JSON.stringify(field(b,'PORTS'))}, ${Number(field(b,'SPEED'))}, ${Number(field(b,'TURN'))}, ${JSON.stringify(field(b,'UNIT'))}, ${Number(field(b,'AMOUNT'))}, ${field(b,'BRAKE')==='TRUE'});\n`;break;
        case 'ev3_motor_stop':code+=`await robot.motorStop(${JSON.stringify(field(b,'PORTS'))}, ${field(b,'BRAKE')==='TRUE'});\n`;break;
        case 'ev3_tone':code+=`await robot.tone(${Number(field(b,'FREQUENCY'))}, ${Math.round(Number(field(b,'SECONDS'))*1000)}, ${Number(field(b,'VOLUME')??30)}, ${field(b,'WAIT')!=='FALSE'});\n`;break;
        case 'ev3_stop':code+='await robot.stop();\n';break;
        case 'control_wait':code+=`await wait(Math.round(Number(${input('DURATION')}) * 1000));\n`;break;
        case 'control_repeat':{
          const id=++loopId;code+=`{ const count${id} = Math.max(0, Math.min(10000, Math.floor(Number(${input('TIMES')}))));\nfor (let i${id} = 0; i${id} < count${id}; i${id}++) {\n${sub('SUBSTACK')}await wait(0);\n} }\n`;break;
        }
        case 'control_forever':code+=`while (true) {\n${sub('SUBSTACK')}await wait(10);\n}\n`;break;
        case 'control_wait_until':code+=`while (!(${input('CONDITION')})) { await wait(30); }\n`;break;
        case 'control_if':code+=`if (${input('CONDITION')}) {\n${sub('SUBSTACK')}}\n`;break;
        case 'control_if_else':code+=`if (${input('CONDITION')}) {\n${sub('SUBSTACK')}} else {\n${sub('SUBSTACK2')}}\n`;break;
        default:throw new Error(`Este bloque no está admitido: ${b.type}`);
      }
    }
    return code;
  }
  return '// Generado desde bloques Scratch · Copilli EV3\n'+sequence(starts[0].getNextBlock());
}
export function exampleXML(kind='hello'){
  const log=value=>`<block type="ev3_log"><value name="VALUE">${value}</value>`;
  const text=value=>`<shadow type="text"><field name="TEXT">${value}</field></shadow>`;
  const tone='<block type="ev3_tone"><field name="FREQUENCY">440</field><field name="SECONDS">0.3</field></block>';
  let stack=log(text('¡Hola, EV3!'))+`<next>${tone}</next></block>`;
  if(kind==='motor')stack='<block type="ev3_motor"><field name="PORT">A</field><field name="SPEED">30</field><field name="SECONDS">1</field><next><block type="ev3_stop"/></next></block>';
  if(['sensor','distance','color','touch','gyro'].includes(kind)){
    const sensor={sensor:['1','distance'],distance:['1','distance'],color:['2','color'],touch:['3','touch'],gyro:['4','gyro']}[kind];
    stack=log(`<block type="ev3_sensor"><field name="PORT">${sensor[0]}</field><field name="KIND">${sensor[1]}</field></block>`)+ '</block>';
  }
  return `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_whenflagclicked" x="50" y="45"><next>${stack}</next></block></xml>`;
}
