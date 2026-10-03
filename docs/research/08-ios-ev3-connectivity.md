# 08 — iOS / iPad connectivity

**Status: UNTESTED.** No iPad, EV3 brick, official app installation, Bluetooth capture, or current Apple platform documentation was available. There is no verified iPad-to-EV3 transport in this repository.

## Current evidence and constraints

The EV3 Python library's [Bluetooth implementation](https://github.com/ChristophGaukel/ev3-python3) uses Bluetooth Classic RFCOMM (stream socket, channel 1). This is implementation evidence, not confirmation of LEGO's official profile statement. Apple documents [Core Bluetooth](https://developer.apple.com/documentation/corebluetooth) and [External Accessory](https://developer.apple.com/documentation/externalaccessory) as separate APIs; those pages could not be fetched here. The working platform hypothesis to verify is that Core Bluetooth is BLE-oriented and does not provide a general RFCOMM/SPP socket, while External Accessory requires a compatible accessory protocol. No evidence was found that EV3 qualifies for such an accessory path.

Therefore, a native Capacitor plugin is **not** by itself a solution to direct Classic Bluetooth: it can call platform APIs, but cannot create an API the OS does not expose. Likewise, the community Capacitor Bluetooth LE plugin is explicitly BLE-focused ([project](https://github.com/capacitor-community/bluetooth-le)) and does not establish Classic RFCOMM support. Apple API wording and target iPadOS behavior remain unverified pending access and device testing.

## Questions to resolve

- Which Bluetooth profile and pairing mode does the target EV3 firmware/app use?
- Do current iPadOS public APIs permit a third-party app to connect to that profile?
- What API and entitlement did the historical official apps use, and is that route available to an independent app?
- Can a native Capacitor plugin or another native layer access the required transport?
- What are app-store, accessory, and background/permission implications?

| Candidate | Status | Evidence |
| --- | --- | --- |
| PWA / Web Bluetooth | UNTESTED | Web Bluetooth is BLE-oriented and does not address Classic RFCOMM; verify Safari support on target versions |
| Capacitor + native Swift plugin | UNTESTED | Native plugin does not bypass iOS transport/API limits; Wi-Fi could be evaluated |
| React Native native module | UNTESTED | No implementation or hardware test |
| Native Swift app | UNTESTED | No implementation or hardware test |
| Wi-Fi | UNTESTED | No brick, protocol capture, or iPad networking test |

Do not promise direct iPad Bluetooth or select Capacitor solely because it can host a web UI. First verify Apple's current API constraints and test a permitted transport with a real brick. Evaluate EV3 Wi-Fi and, if needed, an explicitly deployed gateway as alternatives; neither has been tested here. Preserve a web-core/platform-transport boundary whichever host is chosen.
