# 05 — EV3 Classroom

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

## Windows follow-up ? 2026-10-04

**VERIFIED local Classroom metadata and content samples; app operation UNTESTED.**
Installed executable/version: [01](01-installed-apps.md). Local content root:
`C:\Users\stomp\OneDrive\Documentos\LEGO Education EV3 Content`.
Its 499 files include 181 JSON, 216 PNG, 44 JPG, 55 WEBM and one MP4.

Lobby and unit JSON identify:

| Unit file | Unit | Lessons in index |
| --- | --- | --- |
| `bltf18f6ad5a7a7f2ec.json` | Robot trainer | 7 |
| `blt32c97dfaa91ec1d5.json` | Engineering | 6 |
| `blt7ca7f45e8287d070.json` | Space | 8 |

207 of 231 sampled URL values matched exact local relative files; the remainder
is not proof of missing content because alternative URL/resolution rules were
not tested. `_version` records prepacked 0.0.34, web 1.5.2-latest-edu.275910,
content 18; checksum URLs refer to ev3/19. These are distinct version sources,
not grounds to assert every cached asset matches a single release.

`...\LEGO Education EV3\Proyecto.lmsp` is ZIP containing manifest.json,
scratch.sb3 and icon.svg; nested sb3 contains project.json with ev3events extension.
This verifies a Scratch serialization sample, not the entire app UI framework,
block editor implementation or connectivity stack. Full lesson graph, media
playback, export behavior and proprietary package internals remain UNKNOWN or
UNTESTED. No iOS Classroom binary was inspected.

## Superseded discovery note ? 2026-10-03

**Status: UNKNOWN — no Classroom installation or package was available.** The implementation is not known. Electron, Chromium, React, Angular, Blockly, Scratch, bundle formats, databases, lesson representations, project persistence, and EV3 connection mechanisms were not verified.

## Required investigation

1. Identify installer/package type and app runtime from package metadata and files.
2. Inventory bundles, manifests, databases, and assets; inspect copies, not originals.
3. Trace a sample lesson from library listing to steps and referenced media.
4. Identify the block editor and serialization only from package/source evidence.
5. Find project storage and export/import behavior using a disposable test profile.
6. Trace the hardware connection route with an isolated test brick only if available.

Do not infer technology from the user interface or app name.
