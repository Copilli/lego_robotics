# Copias web de los videos WMV

WMV (Windows Media Video) es el formato de 47 de los videos encontrados en EV3 Home y Education. Para la biblioteca web se crean derivados MP4 y se conserva cada original sin cambios.

## Proceso reproducible

Se usa FFmpeg. En esta PC se encontró una compilación existente en `C:\Program Files\XPG\XPG-Prime\ProDllSDK\ffmpeg.exe`; no se instaló ni actualizó software del sistema.

```powershell
$env:FFMPEG_PATH = 'C:\Program Files\XPG\XPG-Prime\ProDllSDK\ffmpeg.exe'
npm run convert:media
npm run preserve:media
npm test
npm run build
npm run test:browser
```

También puede pasarse la ruta directamente a `node scripts/convert-lego-videos.mjs RUTA_FFMPEG`. En otros equipos se requiere FFmpeg en PATH o `FFMPEG_PATH`.

- Video H.264, formato de píxel yuv420p, CRF 18 y preset fast.
- Audio AAC a 160 kbit/s cuando el original tiene audio; no se inventa una pista si no existe.
- `faststart` para iniciar la reproducción sin descargar todo el archivo.
- Dimensiones originales; se añade como máximo un píxel de borde por dimensión si es necesario para dimensiones pares.
- Archivo de salida identificado por su propio SHA-256. El WMV conserva su nombre por hash y sus bytes originales.

La conversión es con pérdida; la copia WMV es la referencia de preservación. El script compara duración y presencia de audio, comprueba codecs de salida, decodifica completamente cada MP4 con FFmpeg y verifica su hash antes de registrarlo. Las conversiones completadas se registran individualmente para poder retomar un proceso interrumpido.

## Inventario y aplicación

`.preservation/conversions.json` registra el hash original, hash/tamaño del MP4, duración de ambos archivos, audio, codecs, versión del conversor, ajustes y validación. Una segunda ejecución verifica los derivados existentes antes de reutilizarlos.

`preserve:media` enlaza únicamente las conversiones verificadas al catálogo mediante `webFile`, `webSha256` y `webBytes`. Volver a importar los originales conserva los enlaces. La aplicación usa `webFile` para reproducir, muestra las copias como MP4 y mantiene enlaces separados **Descargar MP4** y **Descargar original**.

Los derivados, originales e inventarios se mantienen locales y excluidos de Git. El build local incluye la biblioteca; esta conversión no publica cambios en Pages.

## Resultado verificado en esta PC

- 47 de 47 WMV convertidos: aproximadamente 125 MiB adicionales.
- Los 47 originales contienen audio; todos sus derivados conservan una pista AAC.
- Diferencia máxima de duración observada: 0.25 segundos.
- Decodificación completa con FFmpeg y hashes correctos para las 47 salidas.
- Segunda ejecución: 47 derivados reutilizados y verificados, cero conversiones nuevas.
- Catálogo: 146 originales conservados, 146 entradas reproducibles mediante MP4.
- Navegador Edge: los 47 derivados empezaron a reproducirse y permitieron buscar cerca del final, sin solicitudes externas; enlaces WMV y MP4 comprobados por separado. Los cinco videos de prácticas también se probaron.
- Nueve pruebas unitarias y seis de navegador pasaron; compilación de producción correcta. No se realizó una revisión visual completa de cada segundo de los videos.

Referencias de herramienta: [documentación FFmpeg](https://ffmpeg.org/ffmpeg.html) y [distribuciones enlazadas por FFmpeg](https://ffmpeg.org/download.html).
