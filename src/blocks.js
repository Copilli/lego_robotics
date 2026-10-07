import * as Scratch from 'scratch-blocks';
import {compileBlocks,exampleXML} from './block-code.js';

Scratch.ScratchMsgs.setLocale('es');
const dropdown=(name,values)=>({type:'field_dropdown',name,options:values});
const number=(name,value,min,max)=>({type:'field_number',name,value,min,max});
const ports=dropdown('PORT',[['A','A'],['B','B'],['C','C'],['D','D']]);
Scratch.defineBlocksWithJsonArray([
  {type:'ev3_motor',message0:'motor %1 velocidad %2 durante %3 segundos',args0:[ports,number('SPEED',30,-100,100),number('SECONDS',1,0.001,10)],colour:'#168b89',extensions:['shape_statement']},
  {type:'ev3_tone',message0:'tocar tono %1 Hz durante %2 segundos',args0:[number('FREQUENCY',440,250,10000),number('SECONDS',0.3,0.001,5)],colour:'#b24cd3',extensions:['shape_statement']},
  {type:'ev3_stop',message0:'detener todos los motores y sonido',colour:'#168b89',extensions:['shape_statement']},
  {type:'ev3_log',message0:'mostrar %1 en la consola',args0:[{type:'input_value',name:'VALUE'}],colour:'#5275d9',extensions:['shape_statement']},
  {type:'ev3_sensor',message0:'leer %1 en puerto %2',args0:[dropdown('KIND',[['distancia (cm)','distance'],['color (0–7)','color'],['luz reflejada (%)','reflection'],['contacto (0/1)','touch'],['giro (grados)','gyro'],['infrarrojo (%)','infrared']]),dropdown('PORT',[['1','1'],['2','2'],['3','3'],['4','4']])],colour:'#42a5ce',extensions:['output_number']},
]);
const shadow=(type,field,value)=>({kind:'block',type,fields:{[field]:value});
const block=(type,inputs)=>({kind:'block',type,...(inputs?{inputs}:{})});
const category=(name,colour,contents)=>({kind:'category',name,colour,contents});
const toolbox={kind:'categoryToolbox',contents:[
  category('Eventos','#ffbf00',[block('event_whenflagclicked')]),
  category('Motores','#168b89',[block('ev3_motor'),block('ev3_stop')]),
  category('Sonido','#b24cd3',[block('ev3_tone')]),
  category('Control','#ffab19',[
    block('control_wait',{DURATION:{shadow:{type:'math_positive_number',fields:{NUM:1}}}}),
    block('control_repeat',{TIMES:{shadow:{type:'math_whole_number',fields:{NUM:3}}}}),block('control_forever'),block('control_if'),block('control_if_else'),
  ]),
  category('Sensores','#42a5ce',[block('ev3_sensor')]),
  category('Operadores','#59c059',[
    ...['operator_add','operator_subtract','operator_multiply','operator_divide'].map(type=>block(type,{NUM1:{shadow:{type:'math_number',fields:{NUM:1}}},NUM2:{shadow:{type:'math_number',fields:{NUM:2}}}})),
    ...['operator_lt','operator_gt','operator_equals'].map(type=>block(type,{OPERAND1:{shadow:{type:'math_number',fields:{NUM:1}}},OPERAND2:{shadow:{type:'math_number',fields:{NUM:2}}}})),block('operator_and'),block('operator_or'),block('operator_not'),shadow('math_number','NUM',0),
  ]),
  category('Consola','#5275d9',[block('ev3_log',{VALUE:{shadow:{type:'text',fields:{TEXT:'¡Hola, EV3!'}}}})]),
]};

export function createBlocks(container,{xml,onChange}){
  const workspace=Scratch.inject(container,{toolbox,media:`${import.meta.env.BASE_URL}scratch-media/`,scrollbars:true,trashcan:true,comments:true,sounds:false,zoom:{controls:true,wheel:true,startScale:0.8,maxScale:1.5,minScale:0.4,scaleSpeed:1.1}});
  function load(value){
    const dom=Scratch.utils.xml.textToDom(value);
    Scratch.Events.disable();
    try{workspace.clear();Scratch.Xml.domToWorkspace(dom,workspace);}finally{Scratch.Events.enable();}
    Scratch.svgResize(workspace);
  }
  try{load(xml||exampleXML());}catch(error){workspace.dispose();throw error;}
  workspace.addChangeListener(event=>{if(!event.isUiEvent)onChange();});
  const observer=new ResizeObserver(()=>Scratch.svgResize(workspace));observer.observe(container);
  return {
    workspace,
    serialize:()=>Scratch.Xml.domToText(Scratch.Xml.workspaceToDom(workspace)),
    compile:()=>compileBlocks(workspace),
    loadExample(kind){load(exampleXML(kind));onChange();},
    undo:()=>workspace.undo(false),redo:()=>workspace.undo(true),
    destroy(){observer.disconnect();workspace.dispose();},
  };
}
