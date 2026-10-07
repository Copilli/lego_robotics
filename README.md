# EV3 Studio

## Web prototype — October 7, 2026

A runnable Copilli classroom prototype now exists: actual Scratch Blocks 2 visual editor, advanced JavaScript editor, local projects, a four-step first-program guide, a console simulator, five tutorials with bundled local videos, and an experimental Bluetooth serial transport for desktop Chrome/Edge. Run `npm ci` and `npm run dev`. See [visual editor](docs/block-editor.md) and [development and compatibility](docs/development.md) for project formats, media preservation, limitations, tests, and GitHub Pages setup from `main`.

Physical EV3 connectivity has not been verified. The research notes below describe the earlier discovery phase and remain as historical evidence; the prototype does not resolve the iPad transport or proprietary content-import questions.

EV3 Studio is an independent educational preservation project exploring how modern software can help schools, clubs, families, and makers continue using working LEGO MINDSTORMS EV3 hardware.

## Why this project exists

EV3 remains useful for teaching programming, robotics, engineering, and computational thinking. Many schools cannot frequently replace their robotics kits, and working EV3 hardware remains in schools, homes, clubs, makerspaces, and the second-hand market. A modern, accessible application could extend the educational life of that hardware, reduce replacement costs, and avoid discarding equipment that still works.

The project aims to preserve and extend the educational ecosystem—not to reproduce any one historical app or replace LEGO Education.

## Mission

Preserve, modernize, and extend the educational usefulness of the LEGO MINDSTORMS EV3 ecosystem with an accessible, tablet-first platform that helps learners and educators use functional hardware for longer.

**Working hardware + modern software = a longer educational life.**

## Who is this for?

- Schools that already own EV3 or have limited technology budgets
- Teachers and students
- Robotics clubs and makerspaces
- Families and owners of second-hand EV3 kits

## Project principles

- **Preserve working hardware** and document compatibility honestly.
- **Education first:** make learning activities understandable and useful.
- **Affordable:** favor local use and avoid requiring cloud accounts or services.
- **Offline friendly:** plan for lessons and projects to work without Internet access.
- **Tablet first:** prioritize touch, landscape layouts, and accessible controls.
- **Open architecture:** separate content, runtime, protocol, and transport.
- **Easy to use:** keep technical diagnostics out of the normal student flow.
- **Hardware complete:** design for the documented EV3 motors, sensors, and brick capabilities.
- **Maintainable:** prefer proven, reusable technologies over unnecessary custom systems.

## Current status

**Prototype development and preservation in progress.** The current Windows environment contains EV3 Home, Education/Lab and SPIKE. Local inventory preserved 146 original videos and converted all 47 WMV files to browser-playable MP4 derivatives. Classroom is not installed and physical EV3 connectivity remains unverified. Earlier discovery notes describe their original environment; see [`docs/research/`](docs/research/README.md) for the evidence, limits, and unknowns.

There is no runnable app or importer yet. Development and import instructions will be added when those tools exist; do not treat proposed architecture or untested compatibility as implemented features.

## Proposed architecture

The research proposal is to keep a reusable web core separate from platform-specific device access:

`UI / lessons / Blockly` → `runtime` → `EV3 protocol` → `transport adapter` → `EV3 brick`

React, TypeScript, and Vite are candidates for a future web core, not decisions backed by a working prototype. Capacitor, React Native, and native iOS/Android options remain under evaluation; iPad-to-EV3 connectivity is a gating research question. See [`docs/research/11-tablet-architecture.md`](docs/research/11-tablet-architecture.md).

## Roadmap

1. **Research & Preservation** — inventory available legacy installations, analyze formats and protocol, document evidence.
2. **EV3 Connectivity** — prove a transport and a minimal real-brick hardware test.
3. **Programming Environment** — build the runtime and a suitable block editor.
4. **Original Content Import** — import user-owned local content while preserving provenance.
5. **Tablet Experience** — develop the offline-capable, touch-first lesson and programming flow.
6. **Teacher Tools** — add educator-focused planning and assessment capabilities.
7. **Community Lessons** — enable original, shareable educational content.

No dates or unverified transport promises are attached to these phases.

## How to run and develop

Not available yet: this research-only repository has no application, package manifest, or development scripts. The next implementation phase should first establish the web-core scaffold after the transport and platform investigation supports the choice.

## Content imports and provenance

The intended direction is an importer that reads content from a user's own legacy installation and creates a local library with source metadata. No LEGO application content is included in this repository. Importing and redistributing proprietary material are separate questions; non-profit intent alone does not grant redistribution rights. See [`docs/research/13-import-strategy.md`](docs/research/13-import-strategy.md).

## Disclaimer

EV3 Studio is an independent educational project and is not affiliated with, endorsed by, or sponsored by the LEGO Group. LEGO and MINDSTORMS are trademarks of the LEGO Group. This preliminary project wording is not legal advice and should be reviewed before a public release.
