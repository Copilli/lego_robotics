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

El catálogo descargado contiene Entrenador de robots, Laboratorio de Ingeniería y Desafío espacial. La importación final reúne 19 unidades/grupos, 126 actividades, 745 pasos y 77 manuales. Los conteos incluyen el Taller de robótica de Lab, los modelos educativos y las misiones Home.

Los bloques originales y comentarios de las sesiones de Classroom se conservan como referencia. **El editor todavía no ejecuta todos los programas originales de LEGO**: faltan movimientos por grados/rotaciones, eventos del ladrillo, pantalla, sonidos grabados y otras operaciones. Cargar ejemplo compatible inserta explícitamente una práctica del editor y solicita confirmación antes de reemplazar los bloques; no traduce silenciosamente el programa original. Los proyectos nuevos muestran toda la paleta, las actividades muestran categorías relevantes y el botón Todos los bloques permite ampliarla. El paso y el programa se conservan en el respaldo JSON.

La conexión EV3 por Web Serial y el runtime no cambian: Chrome/Edge de escritorio, Bluetooth previamente emparejado y HTTPS/localhost. Las pruebas con respuestas simuladas no equivalen a una prueba con robot físico.

El botón Conectar aparece en la esquina superior izquierda del lienzo del editor, con icono EV3 y estado rojo/verde. Abre un modal con las animaciones originales `BT-Startup`, `BT-Enable` y `BT-Pair`, pasos seleccionables, cierre con Escape y cambio a la animación USB. La web requiere pulsar Seleccionar EV3 para abrir el selector de puertos; solo durante esa selección/confirmación muestra Buscando. Cancelar permite reintentar. La animación USB es informativa: el transporte USB nativo EV3 no está implementado. Los archivos y sus hashes se preservan mediante `scripts/preserve-connection-media.mjs`, incluido en `npm run import:content`.

El push a main activa el despliegue de Pages. Esta actualización se trabaja localmente y requiere instrucciones explícitas independientes para commit, push y publicación.
