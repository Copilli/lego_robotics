# 10 — Browser and desktop connectivity

**Status: UNTESTED.** No supported browser, desktop host, EV3 brick, or transport test was available. Browser socket or Bluetooth capability must not be assumed.

Web Bluetooth is BLE-oriented; it is not a solution to the Classic Bluetooth RFCOMM path used by the cited EV3 implementation. Consult the [MDN Web Bluetooth API reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) and verify its support on each exact target browser. The page could not be fetched here, and iPad Safari support is UNKNOWN.

The [`ev3-python3` implementation](https://github.com/ChristophGaukel/ev3-python3) lists Bluetooth and Wi-Fi transports, with Bluetooth implemented using RFCOMM. This is evidence that a third-party implementation supports those host-side paths, not proof that EV3 Studio, iPad browsers, or every brick/network supports them.

| Transport | iPad | Android | Browser / desktop | Native layer | Status |
| --- | --- | --- | --- | --- | --- |
| Bluetooth | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNTESTED |
| Wi-Fi | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNTESTED |
| USB | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNTESTED |

Investigate browser API support and EV3 profile compatibility on exact target devices. For USB, establish VID/PID, interface/endpoints, driver behavior, and browser permission requirements from a real brick before evaluating WebUSB/Web Serial. For Wi-Fi, measure discovery, ports, handshake, and protocol using documented captures. If a native host is required, make it an explicit adapter rather than pretending a browser can open arbitrary sockets.
