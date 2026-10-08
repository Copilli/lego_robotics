# Aula unificada y conservación local

La navegación sigue las capturas proporcionadas: Inicio, Iniciar, Unidades, Construir y Mis proyectos. Iniciar contiene las tres actividades con sus imágenes originales. Las unidades agrupan las sesiones educativas, los cinco robots de Home, los cuatro modelos del kit base y los seis de expansión. Las actividades abren el mismo editor con el tutorial a la derecha. Construir muestra tanto las secuencias de imágenes de Home/Lab como los videos de construcción de Classroom.

Classroom 1.5.3 se encontró en `C:/Program Files/EV3 Classroom`. Sus recursos integrados están en el paquete .NET del ejecutable. Su contenido descargado está en la carpeta Documentos redirigida de OneDrive, `LEGO Education EV3 Content`. La extracción lee los recursos sin ejecutar el ensamblado y sin modificar las instalaciones.

Para reconstruir en este equipo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-classroom.ps1
npm run import:content
```

Las variables `LEGO_CLASSROOM_EXE` y `LEGO_CLASSROOM_CONTENT` permiten cambiar las rutas de Classroom. El importador de Home/Lab utiliza las rutas de instalación verificadas en este equipo. La biblioteca de videos preservados debe existir para reproducir los videos de sus misiones. El inventario con rutas de procedencia permanece en `.preservation/curriculum-inventory.json`; la biblioteca pública no incluye rutas personales.

Los recursos de Classroom, imágenes y manuales importados quedan en `public/content`. Los videos Home/Lab usan las copias ya preservadas en `public/media/lego-local`, incluida la versión MP4 de los WMV. Esa colección permanece excluida de Git; no basta con publicar el catálogo para tener sus videos en Pages. Las cinco prácticas de respaldo continúan incluidas en `public/media/tutorials`.

El catálogo descargado contiene Entrenador de robots, Laboratorio de Ingeniería y Desafío espacial. La importación reúne 19 unidades/grupos, 126 actividades y 77 manuales. Tiene 745 pasos originales y 53 pasos adicionales de programación moderna para las misiones Home convertidas, para un total de 798 pasos.

Los bloques originales y comentarios de Classroom se conservan como referencia. **El editor todavía no ejecuta todos los programas originales de LEGO**: siguen pendientes eventos del ladrillo, variables y cables de datos, ramas, subprogramas, registro de datos y otras operaciones. Las prácticas genéricas de Classroom se identifican como prácticas del editor, no como conversiones del original.

Se extrajeron 230 programas no vacíos de 98 actividades Home/Lab. Actualmente 23 se convierten íntegramente a bloques editables; 207 permanecen con diagnósticos y no se ofrecen como programas equivalentes ejecutables. El editor admite movimientos por segundos, grados y rotaciones, iniciar/detener motores, bucles sencillos, esperas de tiempo/contacto, tonos con volumen y reproducción de archivos locales del ladrillo. El botón Cargar programa del tutorial carga el XML real del programa seleccionado. Su captura utiliza exactamente el mismo renderer Scratch y XML, no un dibujo aproximado. Los pasos Home progresivos se generan únicamente cuando existe correspondencia uno a uno con una secuencia lineal; los programas con bucles se muestran completos.

`scripts/extract-legacy-programs.ps1`, `scripts/modernize-programs.mjs` y `scripts/capture-modern-programs.mjs` forman parte de `npm run import:content`. Las capturas están en `public/content/programs`; los 91 recursos `.rsf`/`.rgf` preservados están en `public/content/assets`. Para capturar se requiere el navegador de Playwright (Edge en Windows) y el puerto local 4175 disponible. El informe privado `.preservation/program-conversion-report.json` enumera los casos todavía pendientes. No se modifican las fotografías de robots ni las instrucciones de construcción.

Al ejecutar un bloque de imagen/sonido, el transporte descarga su recurso local al directorio `../prjs/copilli/` del EV3 usando archivos nombrados por hash y verifica las respuestas de transferencia. Espera la finalización de movimientos finitos mediante OUTPUT_TEST y de sonidos mediante SOUND_TEST. El simulador valida los parámetros y registra las operaciones; no reproduce la física, la pantalla ni el audio del ladrillo. Estos comandos y la transferencia se verificaron con respuestas simuladas; **todavía falta probarlos con un EV3 físico**. Referencias del protocolo: [comunicación del firmware EV3](https://github.com/mindboards/ev3sources/blob/master/lms2012/c_com/source/c_com.h), [bytecodes](https://github.com/mindboards/ev3sources/blob/master/lms2012/lms2012/source/bytecodes.h).

Los proyectos nuevos muestran toda la paleta, las actividades muestran categorías relevantes y Todos los bloques permite ampliarla. El paso y el programa se conservan en el respaldo JSON.

La conexión EV3 por Web Serial y el runtime no cambian: Chrome/Edge de escritorio, Bluetooth previamente emparejado y HTTPS/localhost. Las pruebas con respuestas simuladas no equivalen a una prueba con robot físico.

El botón Conectar aparece en la esquina superior izquierda del lienzo del editor, con icono EV3 y estado rojo/verde. Abre un modal con las animaciones originales `BT-Startup`, `BT-Enable` y `BT-Pair`, pasos seleccionables, cierre con Escape y cambio a la animación USB. La web requiere pulsar Seleccionar EV3 para abrir el selector de puertos; solo durante esa selección/confirmación muestra Buscando. Cancelar permite reintentar. La animación USB es informativa: el transporte USB nativo EV3 no está implementado. Los archivos y sus hashes se preservan mediante `scripts/preserve-connection-media.mjs`, incluido en `npm run import:content`.

El push a main activa el despliegue de Pages. Esta actualización se trabaja localmente y requiere instrucciones explícitas independientes para commit, push y publicación.
Los manuales de construcción se muestran como carruseles de imágenes con flechas, teclado y deslizamiento táctil. `scripts/prepare-building-manuals.mjs` decodifica todos los fotogramas de los archivos de construcción de Classroom a páginas locales, sin muestreo ni reproducción automática. Algunos conteos de origen excluyen una portada: el contador de la web incluye todas las páginas conservadas. Los tres registros de Base motriz de 46 pasos se unifican en uno y las referencias de los tutoriales se redirigen a ese manual. La biblioteca visible contiene 75 manuales; los videos originales siguen preservados.
La sesión «Programación del Bloque EV3» de «Taller de robótica» se adaptó al editor web: nueve pasos con capturas reales de Scratch Blocks, programa B+C → espera de dos segundos → parada → tono y reto de cuatro repeticiones con marcha atrás en curva. La portada de la unidad y la miniatura de esa sesión utilizan el programa moderno. Es una adaptación didáctica explícita, no una conversión exacta de un archivo `.ev3p`; el editor del ladrillo usaba sonidos numerados. El material original queda archivado en `.preservation/workshop-brick-original.json`. El resto de las sesiones del taller conserva su estado de conversión anterior.
