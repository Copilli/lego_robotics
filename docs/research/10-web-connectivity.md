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

## Historical native/tablet research (2026-10-04)

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. This section records the pre-implementation investigation; see the implemented transports above and [current development](../development.md). Hardware behavior remains UNTESTED.

**No EV3 Studio transport has been tested on hardware.** VERIFIED sources do not
mean implemented support. iPad Bluetooth is the first priority, followed by
Android Bluetooth, Wi-Fi, then desktop.

| Platform / route | Documentary evidence | Product status | Required evidence |
| --- | --- | --- | --- |
| iPad native accessory Bluetooth | Classic/RFCOMM Mode2 source; EASession SDK inspected | EXPERIMENTAL / UNTESTED | Actual protocol strings/session, data, authorization, reliability |
| iPad CoreBluetooth | GATT over BLE and BR/EDR | Compatible EV3 GATT service UNKNOWN; UNTESTED | Compatible service, not general RFCOMM assumption |
| iPad pure PWA / Web Bluetooth | GATT API; no EV3 route demonstrated | UNTESTED; no support claim | Exact browser API plus compatible brick service |
| Android native Bluetooth | RFCOMM protocol/source corroboration | UNTESTED | Current APIs/permissions, pairing and real-brick tests |
| iPad/Android native Wi-Fi | Transport documented by EV3 kit | UNTESTED; secondary priority | Dongle/firmware, discovery/handshake, school network and permissions |
| Desktop native Bluetooth/Wi-Fi | EV3 kit and implementations | UNTESTED | OS APIs and device tests |
| Desktop native USB | EV3 kit | UNTESTED | VID/PID/interfaces/endpoints, drivers and exchange |
| Browser WebUSB/Web Serial | Matching EV3 interface not evaluated | UNKNOWN / UNTESTED | Exact browser API/interface and device proof |
| Student-managed gateway/bridge | No experiment | OUT OF PRODUCT SCOPE | Owner requires a single app with no managed extra server/bridge |

Sources and constraints: [iPad follow-up](18-ipad-accessory-bluetooth.md),
[LEGO kit](https://www.lego.com/cdn/cs/set/assets/blt6879b00ae6951482/LEGO_MINDSTORMS_EV3_Communication_Developer_Kit.pdf),
[Web Bluetooth specification](https://webbluetoothcg.github.io/web-bluetooth/).
For iPad Wi-Fi, investigate [Apple TN3179](https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy)
after determining the actual discovery method. No Internet and no local network
are distinct operating scenarios.

Compatibility records must include date, prototype revision, device/OS,
brick/firmware/mode, protocol, accessories/network, procedure/captures and separate
results for discovery, connect, sensor/motor, stop, reconnect, background and
multiple robots. Maintainer-reported results are distinct from our tests.
