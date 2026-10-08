import * as Scratch from 'scratch-blocks';
import {compileBlocks,exampleXML} from './block-code.js';

Scratch.ScratchMsgs.setLocale('es');
const style=colour=>({colourPrimary:colour,colourSecondary:colour,colourTertiary:colour,hat:''});
const blockStyles=Object.fromEntries(Object.entries(Scratch.Themes.Classic.blockStyles).map(([name,value])=>[name,{...value,colourTertiary:value.colourTertiary||value.colourPrimary||'#888888'}]));
for(const [name,colour] of Object.entries({control:'#ffab19',data:'#ff8c1a',data_lists:'#ff661a',sounds:'#b24cd3',motion:'#4c97ff',looks:'#9966ff',event:'#ffbf00',sensing:'#42a5ce',pen:'#0fbd8c',operators:'#59c059',more:'#ff6680',textField:'#ffffff',ev3_motor:'#168b89',ev3_tone:'#b24cd3',ev3_log:'#5275d9',ev3_sensor:'#42a5ce'}))blockStyles[name]=style(colour);
const createTheme=()=>Scratch.Theme.defineTheme('copilli',{base:Scratch.Themes.Classic,blockStyles:structuredClone(blockStyles)});
const dropdown=(name,values)=>({type:'field_dropdown',name,options:values});
const number=(name,value,min,max)=>({type:'field_number',name,value,text:String(value),min,max});
const ports=dropdown('PORT',[['A','A'],['B','B'],['C','C'],['D','D']]);
const motorPorts=()=>dropdown('PORTS',['A','B','C','D','A+B','A+C','A+D','B+C','B+D','C+D'].map(p=>[p,p]));
Scratch.defineBlocksWithJsonArray([
  {type:'ev3_image_file',message0:'mostrar imagen %1 en x %2 y %3 limpiar %4',args0:[{type:'field_label_serializable',name:'FILE',text:'imagen'},number('X',0,-178,178),number('Y',0,-128,128),dropdown('CLEAR',[['sí','TRUE'],['no','FALSE']])],colour:'#9966ff',extensions:['shape_statement']},
  {type:'ev3_sound_file',message0:'sonido %1 volumen %2 modo %3',args0:[{type:'field_label_serializable',name:'FILE',text:'sonido'},number('VOLUME',100,0,100),dropdown('MODE',[['esperar hasta terminar','0'],['iniciar sin esperar','1'],['repetir','2']])],colour:'#b24cd3',extensions:['shape_statement']},
  {type:'ev3_sound_stop',message0:'detener sonido',colour:'#b24cd3',extensions:['shape_statement']},
  {type:'ev3_motion',message0:'motores %1 velocidad %2 dirección %3 durante %4 %5 freno %6',args0:[motorPorts(),number('SPEED',30,-100,100),number('TURN',0,-200,200),number('AMOUNT',1,0,100000),dropdown('UNIT',[['segundos','seconds'],['grados','degrees'],['rotaciones','rotations'],['iniciar sin esperar','start']]),dropdown('BRAKE',[['sí','TRUE'],['no','FALSE']])],colour:'#168b89',extensions:['shape_statement']},
  {type:'ev3_motor_stop',message0:'detener motores %1 freno %2',args0:[motorPorts(),dropdown('BRAKE',[['sí','TRUE'],['no','FALSE']])],colour:'#168b89',extensions:['shape_statement']},
  {type:'ev3_motor',message0:'motor %1 velocidad %2 durante %3 segundos',args0:[ports,number('SPEED',30,-100,100),number('SECONDS',1,0.001,10)],colour:'#168b89',extensions:['shape_statement']},
  {type:'ev3_tone',message0:'tocar tono %1 Hz durante %2 segundos volumen %3 esperar %4',args0:[number('FREQUENCY',440,250,10000),number('SECONDS',0.3,0.001,5),number('VOLUME',30,0,100),dropdown('WAIT',[['sí','TRUE'],['no','FALSE']])],colour:'#b24cd3',extensions:['shape_statement']},
  {type:'ev3_stop',message0:'detener todos los motores y sonido',colour:'#168b89',extensions:['shape_statement']},
  {type:'ev3_log',message0:'mostrar %1 en la consola',args0:[{type:'input_value',name:'VALUE'}],colour:'#5275d9',extensions:['shape_statement']},
  {type:'ev3_sensor',message0:'leer %1 en puerto %2',args0:[dropdown('KIND',[['distancia (cm)','distance'],['color (0–7)','color'],['luz reflejada (%)','reflection'],['contacto (0/1)','touch'],['giro (grados)','gyro'],['infrarrojo (%)','infrared']]),dropdown('PORT',[['1','1'],['2','2'],['3','3'],['4','4']])],colour:'#42a5ce',extensions:['output_number']},
]);
const shadow=(type,field,value)=>({kind:'block',type,fields:{[field]:value}});
const block=(type,inputs)=>({kind:'block',type,...(inputs?{inputs}:{})});
const category=(name,colour,contents)=>({kind:'category',name,colour,contents});
const toolbox={kind:'categoryToolbox',contents:[
  category('Eventos','#ffbf00',[block('event_whenflagclicked')]),
  category('Motores','#168b89',[block('ev3_motor'),block('ev3_motion'),block('ev3_motor_stop'),block('ev3_stop')]),
  category('Sonido','#b24cd3',[block('ev3_tone')]),
  category('Pantalla','#9966ff',[]),
  category('Control','#ffab19',[
    block('control_wait',{DURATION:{shadow:{type:'math_positive_number',fields:{NUM:1}}}}),
    block('control_repeat',{TIMES:{shadow:{type:'math_whole_number',fields:{NUM:3}}}}),block('control_forever'),block('control_wait_until'),block('control_if'),block('control_if_else'),
  ]),
  category('Sensores','#42a5ce',[block('ev3_sensor')]),
  category('Operadores','#59c059',[
    ...['operator_add','operator_subtract','operator_multiply','operator_divide'].map(type=>block(type,{NUM1:{shadow:{type:'math_number',fields:{NUM:1}}},NUM2:{shadow:{type:'math_number',fields:{NUM:2}}}})),
    ...['operator_lt','operator_gt','operator_equals'].map(type=>block(type,{OPERAND1:{shadow:{type:'math_number',fields:{NUM:1}}},OPERAND2:{shadow:{type:'math_number',fields:{NUM:2}}}})),block('operator_and'),block('operator_or'),block('operator_not'),shadow('math_number','NUM',0),
  ]),
  category('Consola','#5275d9',[block('ev3_log',{VALUE:{shadow:{type:'text',fields:{TEXT:'¡Hola, EV3!'}}}})]),
]};
export function registerBrickAssets(assets){
  const entry=asset=>({kind:'block',type:asset.file.endsWith('.rsf')?'ev3_sound_file':'ev3_image_file',fields:{FILE:asset.name},data:asset.file});
  toolbox.contents.find(category=>category.name==='Sonido').contents=[block('ev3_tone'),block('ev3_sound_stop'),...assets.filter(asset=>asset.file.endsWith('.rsf')).map(entry)];
  toolbox.contents.find(category=>category.name==='Pantalla').contents=assets.filter(asset=>asset.file.endsWith('.rgf')).map(entry);
}

export function createBlocks(container,{xml,onChange}){
  let paletteVisible=true;
  const workspace=Scratch.inject(container,{theme:createTheme(),toolbox,media:`${import.meta.env.BASE_URL}scratch-media/`,grid:{spacing:24,length:1,colour:'#dddddd',snap:false},scrollbars:true,trashcan:true,comments:true,sounds:false,zoom:{controls:true,wheel:true,startScale:0.8,maxScale:1.5,minScale:0.4,scaleSpeed:1.1}});
  // The flyout cache keys by block type, but our media entries have different
  // fields and file data. Recycling them leaves orphan blocks and wrong assets.
  workspace.getFlyout().setRecyclingEnabled(false);
  function togglePalette(){
    paletteVisible=!paletteVisible;
    workspace.getToolbox().setVisible(paletteVisible);
    if(paletteVisible)workspace.getToolbox().forceRerender();else workspace.getFlyout().hide();
    Scratch.svgResize(workspace);workspace.scrollCenter();return paletteVisible;
  }
  function load(value){
    const dom=Scratch.utils.xml.textToDom(value);
    Scratch.Events.disable();
    try{workspace.clear();Scratch.Xml.domToWorkspace(dom,workspace);}finally{Scratch.Events.enable();}
    Scratch.svgResize(workspace);
    workspace.scrollCenter();
  }
  try{load(xml||exampleXML());}catch(error){workspace.dispose();throw error;}
  if(container.clientWidth<500)togglePalette();
  workspace.addChangeListener(event=>{if(!event.isUiEvent)onChange();});
  const observer=new ResizeObserver(()=>Scratch.svgResize(workspace));observer.observe(container);
  return {
    workspace,
    get paletteVisible(){return paletteVisible;},
    togglePalette,
    setLessonPalette(types){
      if(!types?.length){workspace.updateToolbox(toolbox);workspace.getToolbox().forceRerender();if(!paletteVisible)workspace.getFlyout().hide();return;}
      const names=new Set(['Eventos']);
      if(types.some(t=>/^control_/.test(t)))names.add('Control');
      if(types.some(t=>/motor|move/i.test(t)))names.add('Motores');
      if(types.some(t=>/sound/i.test(t)))names.add('Sonido');
      if(types.some(t=>/sensor|color|touch|distance|gyro/i.test(t)))names.add('Sensores');
      if(types.some(t=>/display/i.test(t)))names.add('Pantalla');
      if(types.some(t=>/^operator_/.test(t)))names.add('Operadores');
      const contents=toolbox.contents.filter(c=>names.has(c.name)).map(c=>c.name==='Control'?{...c,contents:c.contents.filter(b=>types.includes(b.type))}:c);
      workspace.updateToolbox({...toolbox,contents});
      workspace.getToolbox().forceRerender();if(!paletteVisible)workspace.getFlyout().hide();
    },
    serialize:()=>Scratch.Xml.domToText(Scratch.Xml.workspaceToDom(workspace)),
    compile:()=>compileBlocks(workspace),
    loadXML(value){load(value);onChange();},
    loadExample(kind,comment){load(exampleXML(kind));if(comment)workspace.getTopBlocks(false)[0]?.setCommentText(comment);onChange();},
    undo:()=>workspace.undo(false),redo:()=>workspace.undo(true),
    destroy(){observer.disconnect();workspace.dispose();},
  };
}

// Captures use this same block renderer, without the palette or editor controls.
export function renderBlocksPreview(container,xml){
  const workspace=Scratch.inject(container,{theme:createTheme(),readOnly:true,media:`${import.meta.env.BASE_URL}scratch-media/`,sounds:false,scrollbars:false,zoom:{startScale:1}});
  Scratch.Xml.domToWorkspace(Scratch.utils.xml.textToDom(xml),workspace);
  const bounds=workspace.getBlocksBoundingBox();
  container.style.width=Math.ceil(bounds.right-bounds.left+48)+'px';
  container.style.height=Math.ceil(bounds.bottom-bounds.top+48)+'px';
  Scratch.svgResize(workspace);workspace.translate(24-bounds.left,24-bounds.top);
  return {workspace,compile:()=>compileBlocks(workspace),dispose:()=>workspace.dispose()};
}
