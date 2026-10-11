# 07 — EV3 protocol

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

## Primary-document follow-up ? 2026-10-04

**VERIFIED documentary framing; all brick behavior UNTESTED.** The official
[LEGO Communication Developer Kit](https://www.lego.com/cdn/cs/set/assets/blt6879b00ae6951482/LEGO_MINDSTORMS_EV3_Communication_Developer_Kit.pdf)
was retrieved and inspected (31 pages). Page 3 documents Bluetooth 2.1 EDR and
primary SPP usage; page 4 describes common EV3 command data across Bluetooth,
USB and Wi-Fi and warns about direct VM interactions/deadlock. Pages 5?6 specify
little-endian message size/counter and direct/system request/reply categories.
The iOS accessory path adds transport-specific handling; do not send arbitrary
raw SPP bytes through a guessed iPad API. See [18](18-ipad-accessory-bluetooth.md).

This establishes framing evidence, not a complete opcode/runtime implementation.
Before execution, validate selected commands, reply sizing, counters, partial
streams, timeouts and motor/sensor semantics against the relevant specification
and controlled brick captures. Keep transport-independent protocol tests and
brick safety tests separate. No protocol module has been implemented here.

## Superseded discovery note ? 2026-10-03

**Status: EXPERIMENTAL (secondary-source review); not verified against a brick or the official kit.** No EV3 brick, transport, or official Communication Developer Kit PDF was available to inspect. External DNS was unavailable, but source references found during research provide independently inspectable leads.

## Findings and evidence

- LEGO's [EV3 Education Developer Kits page](https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits) and a [LEGO-hosted Communication Developer Kit PDF](https://le-www-live-s.legocdn.com/sc/media/files/ev3-developer-kit/lego-mindstorms-ev3-communication-developer-kit-f691e7ad1e0c28a4cfb0835993d76ae3.pdf?la=en-us) are cited by third-party code, but neither URL could be fetched here. Current public availability and PDF contents are **UNKNOWN**.
- Scratch EV3 code points to the LEGO kit for direct-command definitions (see the [Scratch source](https://github.com/scratchfoundation/scratch-vm/blob/develop/src/extensions/scratch3_ev3/index.js#L24-L40), lines 24–40). This is a citation trail, not a verified reading of the LEGO kit.
- The third-party [`ev3-python3` sample](https://github.com/ChristophGaukel/ev3-python3/blob/b12071cd5af52767e21f67d0a5ae46b6025ad873/README.rst#L40-L44) shows a request/reply exchange with a little-endian length field and repeated message counter. Its [constants](https://github.com/ChristophGaukel/ev3-python3/blob/b12071cd5af52767e21f67d0a5ae46b6025ad873/ev3_dc/constants.py#L12-L19) identify direct-with-reply `0x00`, direct-no-reply `0x80`, system-with-reply `0x01`, system-no-reply `0x81`, and reply/error markers. This is corroboration from an implementation, **not** confirmation against LEGO's specification or a new brick capture.
- The same library lists system file-management commands in [`constants.py`](https://github.com/ChristophGaukel/ev3-python3/blob/b12071cd5af52767e21f67d0a5ae46b6025ad873/ev3_dc/constants.py#L59-L80). Its [README](https://github.com/ChristophGaukel/ev3-python3/blob/b12071cd5af52767e21f67d0a5ae46b6025ad873/README.rst#L48-L56) describes Bluetooth use; the implementation opens an `AF_BLUETOOTH` stream socket with `BTPROTO_RFCOMM` on channel 1. This supports RFCOMM as an implementation path, but the official kit's exact profile wording was not checked.

“Direct” is used for EV3 VM operations and “system” for higher-level operations in that implementation; treat this distinction and all byte values as secondary-source findings until confirmed against the official kit.

## Evidence required before implementation

- Retrieve and cite the official EV3 Communication Developer Kit; access to LEGO domains was unavailable during this pass.
- Cross-check each command and byte layout against an independent implementation/documentation source and a captured brick response.
- Test packet lengths, message counters, command/reply distinctions, error replies, and byte order.
- Verify sensor mode/type and motor operations against real hardware.

The desired design boundary remains a protocol module independent of Bluetooth, Wi-Fi, or USB. Function names such as `encodeCommand`, `decodeReply`, and `readSensor` are proposals, not implemented or protocol-verified APIs. Do not encode assumed framing or opcodes until the source material has been reviewed.

Protocol details remain insufficiently verified for implementation. Preserve source version/commit and distinguish LEGO specification evidence, implementation corroboration, and hardware test results in future notes.
