# Instalaciones locales verificadas · 7 de octubre de 2026

Esta revisión se hizo en Windows, en la PC del usuario, después de instalar Home y Education. Complementa la investigación anterior, realizada en Linux sin estas aplicaciones.

## Inventario comprobado

| Aplicación | Ruta | Versión registrada | Videos físicos | Tamaño |
| --- | --- | --- | --- | --- |
| EV3 Home Edition | `C:\Program Files (x86)\LEGO Software\LEGO MINDSTORMS EV3 Home Edition` | 1.4.4 | 32 | 235.4 MiB |
| EV3 Education / Lab | `C:\Program Files (x86)\LEGO Software\LEGO MINDSTORMS Edu EV3` | 1.4.16; contenido 1.4.19; español 1.4.13 | 114 | 404.7 MiB |

Total: **146 videos**, **99 MP4 y 47 WMV**, 640.1 MiB aproximadamente. Los 146 archivos tienen hashes distintos. Los MP4 son candidatos a reproducción web; se comprobó la reproducción de los cinco elegidos para las prácticas. No se afirma que los otros 94 hayan sido reproducidos completos.

## Cómo están construidas

Ambas son aplicaciones Windows encabezadas por `MindstormsEV3.exe`, con configuración .NET Framework 4.0. Las instalaciones incluyen componentes `NationalInstruments.X3.*` y `NationalInstruments.VI.VirtualMachine.Runtime.Core.dll`, archivos `.vix`, recursos de bloques y contenido. No se confirmó que su interfaz principal esté hecha en React o Electron. `Resources/WebContent/index.html` es un recurso HTML, no evidencia de que toda la app sea web.

Los contenidos están organizados por paquete y lengua en `Resources/ContentPacks/`. `lobby.xml` y `pack.xml` aportan títulos, categorías, imágenes y referencias a proyectos/videos. En Education se encontró contenido localizado en `es` y material compartido en `nonlocalized`.

Los 117 archivos `.ev3` inspeccionados son contenedores ZIP. Se encontraron entradas como `Activity.x3a`, `Project.lvprojx`, programas `.ev3p` y `ActivityAssets.laz`. Los `.laz` inspeccionados dentro de estos proyectos también son ZIP y contienen recursos de actividades; no se encontraron videos adicionales en esos contenedores. No se implementó la ejecución de proyectos originales.

## Dónde están los videos

- Home, introducciones: `Resources/ContentPacks/Retail/en-US/LEGO/QuickStartItems/{1,3,5}.mp4`. `lobby.xml` los identifica como Getting Started, Software Overview y Content Editor.
- Home, robots/misiones: `Resources/ContentPacks/Retail/nonlocalized/LEGO/pack*/projects/`.
- Education, Robot educador: `Resources/ContentPacks/Education/nonlocalized/LEGO/pack3/projects/`. Incluye `large motor_marker.mp4`, `Touch sensor_marker.mp4`, `Color sensor color_Marker video.mp4` y `ultrasonic sensor_Marker.mp4`.
- Education, videos localizados y presentaciones: carpetas `es/LEGO/pack*/assets/`, `es/LEGO/pack3/projects/` y otros paquetes compartidos.

## Preservación implementada

Actualización posterior: [conversión de los 47 WMV a copias MP4](16-web-video-conversion.md). Los WMV siguen siendo los originales preservados; la aplicación puede reproducir sus derivados verificados.

`npm run preserve:media` lee las instalaciones y copia los videos **sin transcodificarlos** a `public/media/lego-local/`. El nombre de cada copia es su SHA-256 más la extensión original. Se verificó el hash de todas las copias y una segunda ejecución confirmó cero copias nuevas y ninguna discrepancia.

- `public/media/lego-local/catalog.json`: catálogo consumido por la app con formato, tamaño, procedencia relativa, idioma, aplicación y hash.
- `.preservation/inventory.json`: inventario con raíz de origen y metadatos.
- `.preservation/metadata/`: copia de los 12 XML de ContentPacks para preservar las asociaciones y etiquetas originales.

Las cinco prácticas buscan primero sus videos locales. Si no existe un catálogo/copia disponible, conservan el reproductor de internet anterior. La sección **Videos locales** permite consultar las 146 entradas, filtrar y descargar originales. Los 47 WMV se preservan para reproductores compatibles; no se presentan como videos reproducibles en el navegador ni se convierten automáticamente.

Las copias y el inventario están excluidos de Git. El build local sí incluye los archivos de `public/`; el build remoto no los tendrá mientras no se acuerde y configure su distribución. Esta revisión no hizo commit, push ni publicación. Las apps instaladas no se modificaron.

La reproducción local no depende del servidor de videos de LEGO. No se implementó un service worker para garantizar que toda la aplicación pueda abrirse offline desde Pages.
