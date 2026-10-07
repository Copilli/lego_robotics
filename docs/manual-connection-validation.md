# Validación de conexión antes de publicar — 7 de octubre de 2026

## Resultado actual

| Plataforma | Estado de la ruta actual | Evidencia |
| --- | --- | --- |
| PC Windows, Chrome/Edge, HTTPS o localhost | API disponible; prueba con EV3 físico pendiente | Edge 154 ofrece `navigator.serial.requestPort`; origen local seguro; Windows enumera COM3–COM6 Bluetooth. Ningún puerto autorizado en el perfil de prueba. No se identificó un dispositivo EV3 por nombre. |
| Safari en iPad | Conexión directa no disponible con este transporte | Web Serial no implementado según los datos de compatibilidad de MDN consultados. |
| Otros navegadores de iPad | No validados; no se promete conexión | La app verifica la API real, no el nombre del navegador. Cambiar de navegador no demuestra acceso al perfil del EV3. |
| Simulador | Verificado en Edge; iPad físico pendiente | Pruebas automatizadas de programa, motor y lectura simulada. No representan comunicación Bluetooth física. |

La API disponible y los puertos Bluetooth no prueban que el dispositivo seleccionado sea EV3. Solo una respuesta válida al handshake confirma el protocolo; aun así hay que probar motores y sensores físicos. Las pruebas de transporte existentes usan respuestas simuladas. No se publica ni se certifica compatibilidad PC+iPad por estos resultados.

## Prueba manual en PC

1. Usar Chrome/Edge actualizado y la web en HTTPS o localhost. Encender el EV3 con firmware original; activar Bluetooth/Visibilidad y emparejarlo en Windows. Cerrar Home, Lab y otras apps que puedan ocupar el puerto.
2. Abrir Iniciar → Abrir guía. Dejar el simulador desactivado. Pulsar Conectar hub y elegir el puerto serie Bluetooth del EV3, de salida si Windows distingue dos puertos. Debe aparecer EV3 conectado después del handshake; un timeout no cuenta como conexión.
3. Ejecutar el primer programa. Confirmar el saludo en la consola y un tono audible en el ladrillo. El saludo por sí solo no prueba comunicación física.
4. Cargar el ejemplo del motor, conectar un motor a A y ejecutar. Confirmar giro a velocidad 30 durante un segundo y detención. Repetir con Detener durante un programa activo y verificar físicamente que se detiene.
5. Conectar el sensor ultrasónico a 1 y ejecutar la lectura. Cambiar la distancia al objeto y confirmar lecturas distintas. Para otros sensores, seleccionar su tipo y puerto reales.
6. Desconectar desde la app; repetir la conexión. Durante una prueba sin motores, apagar el EV3 y confirmar que la app marca desconexión y deja de ejecutar. Registrar navegador, firmware, puerto, sensor y resultado de cada paso.

No se seleccionan ni abren automáticamente COM3–COM6: podrían pertenecer a otros dispositivos. La selección de puerto requiere una acción del usuario en el navegador.

## Prueba manual en iPad

Abrir la aplicación, editar bloques, guardar/restaurar el proyecto, reproducir videos y ejecutar ejemplos con el simulador. Al intentar conectar sin Web Serial, la app debe explicar que la conexión directa no está disponible. No considerar esta prueba una validación Bluetooth.

Para controlar el EV3 desde el navegador del iPad habría que diseñar y validar un puente: el iPad envía órdenes a un servicio y ese servicio se conecta al EV3. Esto modifica la arquitectura, requiere un equipo/dispositivo adicional y no está implementado. Tampoco se ha validado una alternativa nativa.

## Fuentes verificadas

- Chrome, Bluetooth Classic RFCOMM/SPP desde Chrome 117 de escritorio: https://developer.chrome.com/blog/serial-over-bluetooth.
- Datos de compatibilidad Web Serial, Safari e iOS sin implementación: https://github.com/mdn/browser-compat-data/blob/main/api/Serial.json.
