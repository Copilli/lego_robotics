# 14 ? Evidence-driven roadmap

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

**Updated 2026-10-05.** Static inventory, a Home mission traceability proof and
Bluetooth documentary research were available. The one-tutorial browser proof
was later superseded by main. This table records the original roadmap, not current
completion status; see [current content](../classroom-content.md) and the
[acceptance checklist](../CONTENT_CHECKLIST.md).

| Priority / phase | Work | Exit evidence |
| --- | --- | --- |
| Completed narrow research milestone | TRACK3R 01 source ? inspection ? reference manifest; native accessory research | [17](17-preservation-milestone.md) records boundaries; not functional preservation |
| P0 A: local mission experience | Formal content schema, bounded local normalizer/store and touch lesson renderer | 22 traceable slides, both routes, 48 build images, original texts privately, offline restart, fidelity comparison; missing help explicit |
| P0 B: iPad Bluetooth feasibility, parallel | ExternalAccessory proof and manufacturer authorization investigation | Named iPad/OS/firmware, session/protocol logs, battery/ports, safe motor stop/recovery, one installed app; permitted distribution |
| P1: runtime and editor | Typed runtime, protocol tests, Blockly touch/accessibility evaluation | Sensor/motor/display/sound coverage, queue/timeouts, controlled hardware verification; no guessed automatic legacy conversion |
| P1: source generalization | One Lab and one Classroom activity | Model handles their actual pedagogy, localization, media and program references without lossy assumptions |
| P2: school pilot | Offline reliability, accessibility/i18n, shared-device privacy, backups and teacher workflow | Named pilot requirements and measured success/recovery criteria |
| P3: community / public content | Original or licensed lessons and sharing | Per-asset provenance/licenses, review and accessible publishing path |

P0 A does not wait for B. B gates claims of iPad EV3 control and final mobile-host
selection. Editor and runtime interfaces can be explored without claiming hardware
behavior. Broad import and public distribution wait for sample validation and
rights respectively. No dates, BLE compatibility or automatic conversion promises.

Questions and blockers: [17](17-preservation-milestone.md). Record future decisions
as ADRs backed by evidence; keep VERIFIED documentary findings separate from
UNTESTED physical behavior.
