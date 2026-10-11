# iPad ↔ EV3: accessory Bluetooth evidence

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

**Reviewed 2026-10-04. VERIFIED documentary/source observations; proposed native
adapter EXPERIMENTAL; all EV3 Studio hardware behavior UNTESTED.** No iPad/brick,
packet capture, official iOS binary or running official iOS app was inspected.
Windows installations do not prove this path.

## Candidate and primary evidence

`web UI → Swift platform adapter → ExternalAccessory/EASession → EV3 iOS mode`

Capacitor is a candidate host for this single-app path. No extra student-managed
bridge/server is proposed. Swift-only and React Native alternatives face the same
OS/accessory permissions; switching UI frameworks does not bypass them.

| Observation | Evidence and status | Limit |
| --- | --- | --- |
| Bluetooth 2.1 EDR and primary SPP usage | VERIFIED: [LEGO Communication Kit](https://www.lego.com/cdn/cs/set/assets/blt6879b00ae6951482/LEGO_MINDSTORMS_EV3_Communication_Developer_Kit.pdf), p.3 | Not every firmware/profile or iPad API |
| Official app enables iPhone/iPad/iPod mode, visibility and pairing | VERIFIED documented behavior: [LEGO support](https://education.lego.com/en-gb/product-resources/mindstorms-ev3/troubleshooting/app-bluetooth-support/), iOS section | Current operation and independent-app authorization UNTESTED/UNKNOWN |
| ExternalAccessory provides sessions and streams to supported MFi accessories | VERIFIED: [Apple framework](https://developer.apple.com/documentation/externalaccessory), [programming topics](https://developer.apple.com/library/archive/featuredarticles/ExternalAccessoryPT/Introduction/Introduction.html) | Does not grant LEGO protocol access |
| CoreBluetooth Classic is GATT over BR/EDR | VERIFIED: [Apple WWDC19](https://developer.apple.com/videos/play/wwdc2019/901/), BR/EDR section | Not general SPP/RFCOMM access; EV3 GATT service UNKNOWN |
| Web Bluetooth is GATT-based | VERIFIED: [specification](https://webbluetoothcg.github.io/web-bluetooth/) | No demonstrated EV3/Safari route |

## Firmware source: Mode2

Inspected [mindboards/ev3sources, 78ebaf5b6f8fe31cc17aa5dce0f8e4916a4fc072](https://github.com/mindboards/ev3sources/tree/78ebaf5b6f8fe31cc17aa5dce0f8e4916a4fc072).
Source has LEGO copyright headers; correspondence to a target brick's installed
firmware is UNKNOWN.

- [`c_bt.c` L1382–1441](https://github.com/mindboards/ev3sources/blob/78ebaf5b6f8fe31cc17aa5dce0f8e4916a4fc072/lms2012/c_com/source/c_bt.c#L1382)
  registers Mode2's custom SDP service, Serial Port profile and RFCOMM channel 1.
- [`c_bt.c` L879–910](https://github.com/mindboards/ev3sources/blob/78ebaf5b6f8fe31cc17aa5dce0f8e4916a4fc072/lms2012/c_com/source/c_bt.c#L879)
  adds Mode2 decoding before ordinary decoding.
- [`c_i2c.c` L480–572](https://github.com/mindboards/ev3sources/blob/78ebaf5b6f8fe31cc17aa5dce0f8e4916a4fc072/lms2012/c_com/source/c_i2c.c#L480)
  exchanges data with a decoder, passes recovered app data to DecodeMode1, and
  transfers bundle/seed identifiers.

Inference: these layers are consistent with accessory/iAP encapsulation of EV3
commands. Exact iAP generation, authentication and decoder firmware are UNKNOWN.
Do not equate radio transport, Apple accessory protocol and EV3 command payload.

## Open-source corroboration, not dependency adoption

### andiikaa/ev3ios

[Pinned snapshot d7e2f9e](https://github.com/andiikaa/ev3ios/tree/d7e2f9ee6353aba43d7dcda4dc6b5c3ec43df9bb),
repository declares MIT. Its README reports original firmware 1.06h–1.08h tests;
these are the author's results, not ours. It specifies
`COM.LEGO.MINDSTORMS.EV3` in UISupportedExternalAccessoryProtocols.

[`Ev3Connection.swift`](https://github.com/andiikaa/ev3ios/blob/d7e2f9ee6353aba43d7dcda4dc6b5c3ec43df9bb/EV3IOS/Ev3Connection.swift)
opens EASession and reads/writes streams. Its empirical 125 ms delay, buffering
policy and documented late replies require independent reliability review.
[`Ev3Command.swift` L116](https://github.com/andiikaa/ev3ios/blob/d7e2f9ee6353aba43d7dcda4dc6b5c3ec43df9bb/EV3IOS/Ev3Command.swift#L116)
serializes length-prefixed EV3 commands. This supports investigating EV3 payload
over an EA stream; it is not proof of current-iPad operation. No code was vendored.

### CrispStrobe/brickwright-ios

[Pinned snapshot 5f08c2e](https://github.com/CrispStrobe/brickwright-ios/tree/5f08c2ea65fc84e7f95d0db4c9a2019d40f7bb44)
uses a webview/native architecture. Its
[`BTSession.swift`](https://github.com/CrispStrobe/brickwright-ios/blob/5f08c2ea65fc84e7f95d0db4c9a2019d40f7bb44/CodePM/ScratchWebKit/Sources/ScratchWebKit/BTSession.swift)
opens EASession using the first protocol string, while
[`Release/Info.plist`](https://github.com/CrispStrobe/brickwright-ios/blob/5f08c2ea65fc84e7f95d0db4c9a2019d40f7bb44/CodePM/CodePM/Release/Info.plist)
declares `com.lego.les`. That discrepancy needs resolution before compatibility
claims. Repository declares GPL-3.0; component licensing needs separate review.
Not built or adopted. Its internal web-server/shim approach is not our decision.

## MFi/accessory authorization

[Apple's MFi participation guidance](https://mfi.apple.com/en/who-should-join)
distinguishes app developers from accessory manufacturers. Developers of apps
communicating with MFi accessories do not need MFi membership solely for this use;
they use the Apple Developer Program. The accessory manufacturer determines
third-party authorization; see also [Apple accessories](https://developer.apple.com/accessories/).

UNKNOWN: LEGO's present authorization route, protocol documentation availability
and applicable review/distribution requirements for EV3 Studio. Adding a protocol
string neither establishes authorization nor guarantees acceptance. Separate
accessory authentication, technical development-build session access, and public
distribution. No messages or authorization requests were sent.

## Planned native proof

1. Record exact iPad/iPadOS, brick hardware/firmware and iOS mode; start with stock
   firmware. Check API availability in the target SDK.
2. Enumerate EA accessories/notifications and actual protocolStrings; identify
   the correct robot. A Bluetooth setting or pairing alone is insufficient.
3. Evaluate Apple's [accessory picker](https://developer.apple.com/documentation/externalaccessory/eaaccessorymanager/showbluetoothaccessorypicker(withnamefilter:completion:)).
   System prompts are allowed; an additional student-managed app is not.
4. Open only the verified protocol; handle partial reads/writes, frame lengths,
   counters, timeout, serialized sends and error states.
5. Read battery/firmware/ports; perform bounded movement, stop and reconnect with
   a physical stop procedure. Never replay uncertain movement commands.
6. Test permission denial, brick off, link loss, suspension/termination, multiple
   robots and no Internet. Do not rely on JavaScript timers for hardware safety.
7. After a native proof, expose the same behavior behind a Capacitor adapter and
   record results/captures. Manufacturer conditions remain a separate gate.

No transport proof is available here. This blocks hardware claims and host
commitment, **not** the independent content/lesson/library/offline design.
