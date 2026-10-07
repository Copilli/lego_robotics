# Prototipo web EV3 · 7 de octubre de 2026

Actualización de contenido: se verificaron las instalaciones Home/Education y se preservaron 146 videos originales localmente. `npm run preserve:media` reconstruye y verifica la copia; las cinco prácticas prefieren videos locales y la nueva sección **Videos locales** consulta el catálogo completo. Ver [evidencia y rutas](research/15-local-installations.md). Las copias quedan excluidas de Git y todavía no están en Pages.

La investigación de `research/` es el punto de partida y se conserva. Ahora existe un prototipo ejecutable de aula estática. Su conectividad se implementó contra referencias de protocolo; no se ha probado un ladrillo físico.

Conversión web: `npm run convert:media` crea copias MP4 de los WMV preservados; `npm run preserve:media` verifica y enlaza los derivados al catálogo. Configura `FFMPEG_PATH` o instala FFmpeg en PATH. Los originales permanecen disponibles por separado. Ver [ajustes, trazabilidad y verificación](research/16-web-video-conversion.md).

## Ejecutar

Node 22, `npm ci`, `npm run dev`. Producción: `npm run build`, `npm run preview`. Verificación: `npm test` y `npm run test:browser` (requiere Chromium de Playwright instalado con `npx playwright install chromium`).

## Editor y contenido

Editor JavaScript CodeMirror: números de línea, sintaxis, autocompletado de lenguaje, sangría, plegado, búsqueda/reemplazo, deshacer/rehacer, tema, tamaño y ajuste de líneas. Los proyectos se guardan en este navegador; importación/exportación `.js`, respaldo individual `.json` y duplicación. No importa `.ev3`/`.ev3p` ni ejecuta Python o programas originales de Classroom.

La interfaz sigue las capturas de EV3 Classroom suministradas por el usuario. Iniciar, Unidades y Construir comparten el editor de bloques y los proyectos. Se importaron recursos locales de Classroom 1.5.3 y las misiones/modelos de Home y Lab. Las sesiones originales se conservan con sus imágenes, videos y manuales; sus programas completos todavía no se ejecutan sin adaptación. Ver [biblioteca y límites](classroom-content.md).

## Transporte y runtime

EV3 usa Bluetooth clásico RFCOMM/SPP. Se implementó Web Serial en Chrome/Edge de escritorio: empareja primero el EV3 en el sistema y después selecciona su puerto serie Bluetooth. En Windows puede aparecer como COM saliente. No selecciona automáticamente un puerto por nombre. HTTPS/localhost y permiso interactivo son necesarios. iPad/Safari no tiene esta ruta; la arquitectura nativa/tablet sigue pendiente.

El handshake envía un comando de detener sonido y espera una respuesta EV3 antes de mostrar conectado. El transporte tiene framing little-endian, contador, parser incremental, cola de comandos, detección de respuestas de error y timeout de 4 segundos. USB serie genérico no equivale a USB nativo EV3.

El código JavaScript se ejecuta en un Worker del navegador, con `robot` y `wait`. No se descarga como programa persistente al ladrillo. El Worker permite detener bucles infinitos sin congelar la interfaz; no constituye un sandbox de seguridad para código malicioso. Ejecuta archivos de confianza.

API implementada:

| Operación | Ejemplo | Límite / unidad |
| --- | --- | --- |
| Motor grande/mediano | `await robot.motor("A", 30, 1000)` | A–D, velocidad -100..100, 1–10000 ms, freno al terminar |
| Sonido | `await robot.tone(440, 300)` | 250–10000 Hz, 1–5000 ms |
| Sensor | `await robot.sensor(1, "distance")` | 1–4, ultrasónico en cm |
| Color | `await robot.sensor(2, "color")` | IDs 0–7 |
| Luz reflejada | `await robot.sensor(2, "reflection")` | porcentaje |
| Contacto | `await robot.sensor(3, "touch")` | 0/1 |
| Giroscopio | `await robot.sensor(4, "gyro")` | ángulo en grados |
| Infrarrojo | `await robot.sensor(1, "infrared")` | proximidad relativa, no cm |
| Detener | `await robot.stop()` | motores A–D y sonido |
| Pausa | `await wait(1000)` | 0–30000 ms |
| Consola | `log("Hola")` | salida local |

Runtime máximo: 2 minutos, 100000 caracteres. La velocidad ordenada no prueba movimiento real. La orden del motor tiene duración finita en el ladrillo. Detener termina el Worker y solicita stop; si se pierde la conexión no se puede confirmar stop. Comprueba batería, puertos, modos y firmware en hardware. Pantalla, LEDs, archivos, calibración y funciones completas de Classroom siguen pendientes.

## Pages

Base Vite de producción `/lego_robotics/`, siguiendo Copilli Apps. Workflow `.github/workflows/pages.yml`: tests y build para PR; publicación para push a `main` y ejecución manual desde `main`. En GitHub selecciona **Settings → Pages → Source → GitHub Actions** y permite `main` en el entorno `github-pages`.

URL esperada tras activar y ejecutar: https://copilli.github.io/lego_robotics/ . No se verificó publicación remota. Commit y push requieren las instrucciones explícitas independientes del usuario; el push a main activará el despliegue automático solicitado.

No incluye autenticación Google ni API Classroom: la referencia a Classroom es visual. No usa backend ni secretos privados; integración futura con identidad y UI compartida Copilli pendiente.

## Fuentes revisadas

- [Scratch EV3: protocolo y opcodes](https://github.com/scratchfoundation/scratch-vm/blob/develop/src/extensions/scratch3_ev3/index.js).
- [Código del firmware EV3: operaciones de entrada](https://github.com/mindboards/ev3sources/blob/master/lms2012/c_input/source/c_input.c). Se consultó como referencia, no se copió código GPL al runtime.
- [Chrome: Serial over Bluetooth](https://developer.chrome.com/blog/serial-over-bluetooth).
- [Videos oficiales EV3](https://education.lego.com/en-us/product-resources/mindstorms-ev3/teacher-resources/scratch-how-to-videos/).
- [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- Local: Vite/workflow y guía de Copilli Apps, exports UI y aplicaciones Activities/Tuition; documentación de micro-bit distingue sus APIs de EV3.
