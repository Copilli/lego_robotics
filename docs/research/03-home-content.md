# 03 — EV3 Home content

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

## Windows follow-up ? 2026-10-04

**VERIFIED static Home 1.4.4 content.** Under localized Retail/en-US/LEGO:

| Pack | Robot | Numbered missions observed |
| --- | --- | --- |
| pack0 | TRACK3R | 01?05 |
| pack1 | SPIK3R | 01?05 |
| pack2 | EV3RSTORM | 01?06 |
| pack3 | R3PTAR | 01?04 |
| pack4 | GRIPP3R | 01?04 |

Home had 34 `.ev3` projects and 29 nested ActivityAssets.laz ZIP containers.
This is an inventory, not full reconstruction of every mission. TRACK3R 01 is
fully traced in [15](15-track3r-mission-01.md): objective/text bindings, 22 slides,
48 build images, video, thumbnails, programs, RGF display and RSF sound, shared
assets and unresolved help actions. Bonus model XML indexes in Local AppData are
VERIFIED; complete bonus content availability is UNKNOWN. No independently
verified Free Play step is invented for this mission; terminal advice/extension
is identified from the actual source instead.

## Superseded discovery note ? 2026-10-03

**Status: UNKNOWN — no EV3 Home installation or sample content was available.** This note does not assert that any named robot, mission, bonus model, video, build, or program was present in a particular app release.

| Requested item | Evidence here |
| --- | --- |
| EV3RSTORM, TRACK3R, R3PTAR, SPIK3R, GRIPP3R | UNKNOWN |
| Bonus robots | UNKNOWN |
| Robot covers and descriptions | UNKNOWN |
| Intro and mission videos / thumbnails | UNKNOWN |
| Build instructions | UNKNOWN |
| Mission explanations, programs, and challenges | UNKNOWN |
| Free Play content | UNKNOWN |

## Analysis checklist for a real installation

For each app version, find robot entry points, follow their references to media/build/program assets, note shared resources and localization, and capture the mapping as paths and hashes. Record inaccessible or dynamically fetched resources distinctly. Work from copies only, and do not republish proprietary source assets.
