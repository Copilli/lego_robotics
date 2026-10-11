# 06 — File formats

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

## Windows follow-up ? 2026-10-04

**VERIFIED signatures/structure for inspected samples only.**

| Sample | Observation | Limits |
| --- | --- | --- |
| 117 Home/Education `.ev3` | ZIP containers, CRC inspection passed on copies | Not every member's semantics validated |
| 29 Home / 22 Education ActivityAssets.laz | Nested ZIP | Not a general LAZ specification |
| TRACK3R Activity.x3a | XML controls, texts, actions, slide groups | Visual rendering/order UNTESTED |
| TRACK3R `.ev3p` | XML NI source model 1.0.2.6, nodes/constants/wires | Not downloadable bytecode; conversion partial |
| TRACK3R robot thumbnail `.jpg` | PNG signature, 460?259 | Extension misleading |
| TRACK3R intro `.wmv` | ISO BMFF/MP4, avc1 + mp4a, 1280?720, 16.04s | Target decode/audio profile UNTESTED/UNKNOWN |
| TRACK3R mission `.mp4` | ISO BMFF, avc1 + mp4a, 1280?720, 5.6s | Header inspection, not playback test |
| Pinch left `.rgf`, Fanfare `.rsf` | Located, copied and hashed | Format decoding/playback UNKNOWN |
| Classroom `.lmsp` / `.sb3` | Outer/nested ZIP, JSON + SVG | No runtime execution or import test |

Hashes, sizes, exact locators and importability classifications for the selected
mission: [15](15-track3r-mission-01.md), [16](16-track3r-program.md) and
[evidence JSON](evidence/track3r-01.inspection.json). Future importer must use
signature-based detection, bounded parsing, explicit unknowns and separate
media playback/semantic acceptance. No proprietary bytes are included here.

## Superseded discovery note ? 2026-10-03

**Status: UNKNOWN.** No `.ev3`, `.ev3p`, `.laz`, archive, media, database, or other candidate sample was present in the worktree or searched application locations. No magic bytes, headers, internal paths, compression, or schema were examined.

| Candidate | Observed sample | Format conclusion |
| --- | --- | --- |
| `.ev3`, `.ev3p`, `.laz` | None | UNKNOWN |
| `.zip`, `.xml`, `.json`, `.sqlite`, `.db` | None | UNKNOWN |
| `.js`, `.html`, `.css`, `.asar`, `.pak`, `.bin`, `.dat` | None | UNKNOWN |
| `.png`, `.jpg`, `.svg`, `.gif`, video, audio | None | UNKNOWN |

An extension is not evidence of the file's actual structure. On follow-up, record hashes and use file-signature identification on copies, list archive entries without extraction first, then extract only into a controlled scratch directory. Preserve originals and note tool/version, errors, and nested containers. Media codecs, dimensions, and lesson associations remain UNKNOWN.
