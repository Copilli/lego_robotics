import fs from 'node:fs/promises';

const file=new URL('../public/content/catalog.json',import.meta.url);
const catalog=JSON.parse(await fs.readFile(file,'utf8'));
const activity=catalog.activities.find(a=>a.id==='legacy-base-3-re_Basics_Brick-Programming');
const unit=catalog.units.find(u=>u.id===activity.unitId)||catalog.units.find(u=>u.activities.includes(activity.id));
// An authored web-editor adaptation: the original brick UI has no .ev3p file.
// Keep original instructional material outside the application for preservation.
const archive=new URL('../.preservation/workshop-brick-original.json',import.meta.url);
if(!activity.webEditorAdaptation)await fs.writeFile(archive,JSON.stringify(activity,null,2)+'\n');
const field=(name,value)=>`<field name="${name}">${value}</field>`;
const number=(name,value)=>`<value name="${name}"><shadow type="math_number">${field('NUM',value)}</shadow></value>`;
const chain=blocks=>blocks.length?`<block type="${blocks[0].type}">${blocks[0].body||''}${blocks.length>1?`<next>${chain(blocks.slice(1))}</next>`:''}</block>`:'';
const xml=blocks=>`<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_whenflagclicked" x="40" y="40"><next>${chain(blocks)}</next></block></xml>`;
const motion=(speed,turn=0)=>({type:'ev3_motion',body:field('PORTS','B+C')+field('SPEED',speed)+field('TURN',turn)+field('UNIT','start')+field('AMOUNT',0)+field('BRAKE','TRUE')});
const wait=seconds=>({type:'control_wait',body:number('DURATION',seconds)});
const stop={type:'ev3_motor_stop',body:field('PORTS','B+C')+field('BRAKE','TRUE')};
const tone={type:'ev3_tone',body:field('FREQUENCY',440)+field('SECONDS',0.3)+field('VOLUME',30)+field('WAIT','TRUE')};
const first=[motion(30),wait(2),stop,tone];
const challenge=[{type:'control_repeat',body:number('TIMES',4)+`<statement name="SUBSTACK">${chain([...first,motion(-30,30),wait(1),stop])}</statement>`}];
activity.webEditorAdaptation=true;
activity.summary='Programa la base motriz con los bloques del editor web: avanza, espera, detente y reproduce un sonido.';
activity.modernPrograms=[{name:'Base motriz',xml:xml(first),diagnostics:[],adaptation:true},{name:'Reto: cuatro repeticiones',xml:xml(challenge),diagnostics:[],adaptation:true}];
const palette=['ev3motor_motorTurnFor','control_wait','control_repeat','ev3sound_playSoundUntilDone'];
const step=(id,title,description,extra={})=>({id,title,description,image:null,video:null,manualIds:[],toolbox:palette,...extra});
const program=(prefix=null,name='Base motriz')=>({generatedModernProgram:true,programName:name,programPrefix:prefix});
const manual=catalog.manuals.find(m=>m.title==='Base motriz'&&m.stepCount===46);
activity.steps=[
  step('web-goal','Tu primer programa de la base motriz','Aprende a programar desde este navegador con bloques modernos. Conecta los motores a B y C. La bandera inicia el programa; el botón azul lo ejecuta. Empezaremos a velocidad 30.',program()),
  step('web-build','Construye la base motriz','Si todavía no la has construido, abre el manual. Conecta los dos motores a los puertos B y C antes de continuar.',{image:manual?.image,manualIds:manual?[manual.id]:[]}),
  step('web-connect','Conecta tu EV3','Enciende el ladrillo y pulsa conectar dentro del editor. Puedes seleccionar Bluetooth o cable USB. En PC usa Chrome o Edge. Para practicar sin el robot, activa Simulador.',{image:'connection/ev3.svg'}),
  step('web-move','Enciende los motores B+C','Desde Motores, coloca el bloque de motores debajo de la bandera. Selecciona B+C, velocidad 30, dirección 0 y unidad iniciar. Este bloque enciende los motores; los siguientes pasos añaden la espera y la parada. Completa esos pasos antes de ejecutarlo.',program(1)),
  step('web-wait','Espera dos segundos','Desde Control, conecta esperar 2 segundos debajo del bloque de motores. Los motores seguirán moviéndose durante esa espera.',program(2)),
  step('web-stop','Detén la base motriz','Añade detener motores B+C con freno sí. Así la base se detendrá al terminar la espera.',program(3)),
  step('web-sound','Añade un sonido','Desde Sonido, añade tocar tono 440 Hz durante 0.3 segundos, volumen 30 y esperar sí. Esta versión usa un tono editable del editor web en lugar del selector de sonidos numerados del ladrillo.',program(4)),
  step('web-run','Ejecuta tu programa','Carga el programa del tutorial o construye los mismos bloques. Coloca la base en un espacio despejado. Pulsa el botón azul dentro del editor: avanzará dos segundos, se detendrá y emitirá un tono. El botón rojo detiene la ejecución.',program()),
  step('web-challenge','Reto: retrocede y repite cuatro veces','Dentro de repetir 4, conserva el avance y el sonido. Después añade motores B+C con velocidad -30 y dirección 30, esperar 1 segundo y detener motores B+C. Prueba primero en el simulador y ajusta la curva en tu robot.',program(null,'Reto: cuatro repeticiones')),
];
activity.modernThumbnailProgram='Base motriz';
unit.summary='Aprende a programar y explorar tu EV3 con actividades de robótica.';
unit.modernThumbnailActivity=activity.id;
await fs.writeFile(file,JSON.stringify(catalog,null,2)+'\n');
console.log('Adapted all brick-programming steps to the current web editor.');
