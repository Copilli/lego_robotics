# 10 — Browser and desktop connectivity

**Estado actual (2026-10-08):** Bluetooth por Web Serial y USB por WebHID implementados en la aplicación. Probados con dispositivos simulados; falta validar ambos transportes con un EV3 físico. Las notas históricas siguientes corresponden a la investigación inicial.

## Conexión USB implementada

En Chrome o Edge de escritorio, abre la web en HTTPS o localhost. Cierra otras aplicaciones LEGO, enciende el EV3 con firmware original y conecta el cable al puerto mini-USB del ladrillo. Dentro del editor pulsa **conectar → CONECTAR MEDIANTE CABLE USB → Seleccionar EV3**. Autoriza el dispositivo en el selector del navegador. La aplicación confirma la conexión únicamente después de recibir una respuesta del EV3, sin mover motores durante esa comprobación.

La implementación usa WebHID; no requiere instalar un servidor local ni sustituir el controlador USB. La disponibilidad depende del navegador y de que el sistema permita abrir el dispositivo. Consulta la [documentación de WebHID de Chrome](https://developer.chrome.com/docs/capabilities/hid). Si el navegador no expone WebHID, el modal explica la limitación y deshabilita la selección USB.

Se verificaron los identificadores `0694:0005` contra el [controlador original de LEGO](https://github.com/mindboards/ev3sources/blob/master/lms2012/d_usbdev/Linuxmod_AM1808/d_usbdev.c). Sus [descriptores HID](https://github.com/mindboards/ev3sources/blob/master/lms2012/d_usbdev/Linuxmod_AM1808/computil.c) definen informes sin identificador, de 64 o 1024 bytes. La aplicación usa ID 0, rellena los informes de salida, recorta el relleno de entrada según la longitud EV3 y reutiliza los comandos y contadores existentes. La desconexión USB rechaza operaciones pendientes y termina el programa del navegador.

Pruebas pendientes con hardware: detección en Windows, autorización, sonido inicial, motor A a velocidad baja, sensor conectado, transferencia de imágenes/sonidos y desconexión durante ejecución. No se ha confirmado el funcionamiento físico.

Web Bluetooth is BLE-oriented; it is not a solution to the Classic Bluetooth RFCOMM path used by the cited EV3 implementation. Consult the [MDN Web Bluetooth API reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) and verify its support on each exact target browser. The page could not be fetched here, and iPad Safari support is UNKNOWN.

The [`ev3-python3` implementation](https://github.com/ChristophGaukel/ev3-python3) lists Bluetooth and Wi-Fi transports, with Bluetooth implemented using RFCOMM. This is evidence that a third-party implementation supports those host-side paths, not proof that EV3 Studio, iPad browsers, or every brick/network supports them.

| Transport | iPad | Android | Browser / desktop | Native layer | Status |
| --- | --- | --- | --- | --- | --- |
| Bluetooth | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNTESTED |
| Wi-Fi | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNTESTED |
| USB | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNTESTED |

Investigate browser API support and EV3 profile compatibility on exact target devices. For USB, establish VID/PID, interface/endpoints, driver behavior, and browser permission requirements from a real brick before evaluating WebUSB/Web Serial. For Wi-Fi, measure discovery, ports, handshake, and protocol using documented captures. If a native host is required, make it an explicit adapter rather than pretending a browser can open arbitrary sockets.
