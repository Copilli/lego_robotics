# Content integration and acceptance checklist

Owner scope: **all Home missions, Lab/Education activities and Classroom lessons**,
reusing original tutorials, media, programs and educational flows for internal use.

## Reconciled baseline (2026-10-11)

The current application is in `src/`; its build and imports use the existing
Vite configuration and `scripts/`. The earlier `app/` prototype and its Python
server/importer were removed locally because main supersedes them.

[Current content documentation](classroom-content.md) reports 19 units/groups,
126 activities, 75 visible building manuals, and 23 fully converted programs out
of 230 nonempty Home/Lab programs. These are repository-reported results, not a
new per-activity audit. Importing an activity does not establish complete program
conversion, source-flow fidelity, accessibility or physical robot execution.

- [x] Keep main's block editor, JavaScript editor, projects and content pipeline.
- [x] Preserve TRACK3R 01 static evidence, reference manifest and inspection tests.
- [ ] Reconcile each source entry below with the current catalog by stable ID.
- [ ] Record per-activity original-flow and media validation results.
- [ ] Complete conversion or expose unsupported semantics for each program.
- [ ] Validate physical iPad/Safari touch, playback, storage and project transfer.
- [ ] Validate real EV3 transports, bounded execution, stop and recovery.
- [ ] Audit captions, alternative descriptions and keyboard/screen-reader access.
- [ ] Validate offline cold restart, persistence and backup on target platforms.

## Historical inventory (2026-10-04/05)

The following lists preserve the earlier observed source inventory. **UNRECONCILED**
means acceptance has not been matched to the newer main catalog, not that the
activity is absent from the app. These lists do not prove completeness across
all releases or downloadable packs. Original resources remain subject to their
licenses; internal use does not establish redistribution permission.

## Acceptance checklist for every activity

- [ ] Inventory: source app/content version, source IDs/paths, language and hashes.
- [ ] Trace robot → activity → step/branch → text/media/program dependencies.
- [ ] Copy actual assets into the private library, deduplicating shared bytes.
- [ ] Preserve original prose, images, videos, instructions, sounds and code.
- [ ] Normalize navigation/roles; never execute legacy links as arbitrary code.
- [ ] Resolve missing assets and help, or expose precise unsupported dependencies.
- [ ] Validate media playback, construction order, tutorial branches and terminals.
- [ ] Preserve programs; document semantic mappings before executable conversion.
- [ ] Compare with the source experience and verify tablet interactions.
- [ ] Test local progress, backup/export and offline cold restart on target platform.

An inventory or imported file alone does not check off the activity as complete.
Public reference manifests and private libraries remain separate.

## Home: 24 numbered missions observed

Source: Home 1.4.4, `Resources/ContentPacks/Retail/en-US/LEGO/packN/projects/N.ev3`.
Robot overview `0.ev3`, shared files, any extra activities and bonus models need
their own inventory in addition to this numbered-mission checklist.

| Robot / source pack | Mission | Status |
| --- | --- | --- |
| TRACK3R / pack0 | 01 | Static evidence retained; acceptance UNRECONCILED |
| TRACK3R / pack0 | 02 | UNRECONCILED |
| TRACK3R / pack0 | 03 | UNRECONCILED |
| TRACK3R / pack0 | 04 | UNRECONCILED |
| TRACK3R / pack0 | 05 | UNRECONCILED |
| SPIK3R / pack1 | 01 | UNRECONCILED |
| SPIK3R / pack1 | 02 | UNRECONCILED |
| SPIK3R / pack1 | 03 | UNRECONCILED |
| SPIK3R / pack1 | 04 | UNRECONCILED |
| SPIK3R / pack1 | 05 | UNRECONCILED |
| EV3RSTORM / pack2 | 01 | UNRECONCILED |
| EV3RSTORM / pack2 | 02 | UNRECONCILED |
| EV3RSTORM / pack2 | 03 | UNRECONCILED |
| EV3RSTORM / pack2 | 04 | UNRECONCILED |
| EV3RSTORM / pack2 | 05 | UNRECONCILED |
| EV3RSTORM / pack2 | 06 | UNRECONCILED |
| R3PTAR / pack3 | 01 | UNRECONCILED |
| R3PTAR / pack3 | 02 | UNRECONCILED |
| R3PTAR / pack3 | 03 | UNRECONCILED |
| R3PTAR / pack3 | 04 | UNRECONCILED |
| GRIPP3R / pack4 | 01 | UNRECONCILED |
| GRIPP3R / pack4 | 02 | UNRECONCILED |
| GRIPP3R / pack4 | 03 | UNRECONCILED |
| GRIPP3R / pack4 | 04 | UNRECONCILED |

- [ ] Audit all remaining Home projects, robot overviews and downloadable/bonus indexes.
- [ ] Expand the per-activity inventory for additional Home content actually found.

## Lab / Education

83 `.ev3` archives observed, **not necessarily 83 missions**. Source:
`Resources/ContentPacks/Education/es/LEGO`; package versions in
[installed-app evidence](research/01-installed-apps.md).

- [ ] pack0: four model projects; enumerate and integrate each actual activity.
- [ ] pack1: quick-start activities; enumerate individual entries before integration.
- [ ] pack2: three file-operation projects; enumerate and integrate.
- [ ] pack3: 64 Robot Educator projects; create an ID-level checklist and integrate.
- [ ] pack5: six expansion projects; enumerate and integrate.
- [ ] Reconcile all 83 archive entries with pack/library indexes, avoiding count assumptions.
- [ ] Inventory teacher resources, help, additional packs and cached/downloaded content.
- [ ] Audit availability of Space Challenge, Design Engineering, Coding and Maker
      content individually; availability not established solely by product names.
- [ ] Validate source-flow fidelity and acceptance on representative Lab lessons.

## Classroom: 21 indexed lessons observed

Source: local unit JSON in `LEGO Education EV3 Content`; English source titles
below, stable lesson UIDs preserved. Each entry needs acceptance reconciliation with the current catalog. This is
the inspected local inventory, not a claim that it exhausts every Classroom release.

| Unit | Lesson / source UID | Status |
| --- | --- | --- |
| Robot Trainer | Moves and Turns / blt243bcb5e9b81d06c | UNRECONCILED |
| Robot Trainer | Objects and Obstacles / blt6d3a8dcf2b887651 | UNRECONCILED |
| Robot Trainer | Grab and Release / blt8a081235fa785c87 | UNRECONCILED |
| Robot Trainer | Colors and Lines / blt2bd220f21c632df1 | UNRECONCILED |
| Robot Trainer | Angles and Patterns / blt0acc14d7145a5d72 | UNRECONCILED |
| Robot Trainer | The Factory Robot / blt32257f6898664174 | UNRECONCILED |
| Robot Trainer | The Guided Mission 2021-22 / blt264f611259f50208 | UNRECONCILED |
| Engineering Lab | Trial and Error / bltb816f7e21491514f | UNRECONCILED |
| Engineering Lab | First Gear / blt7e35c186a9a462f2 | UNRECONCILED |
| Engineering Lab | Shifting Gears / bltcbd6e622454987c1 | UNRECONCILED |
| Engineering Lab | Sliding Down a Slope / blt016e2d5fe13529f0 | UNRECONCILED |
| Engineering Lab | Free Falling / bltae3f3d62d6060a13 | UNRECONCILED |
| Engineering Lab | Drive Up a Slope / blte957b27db07915f6 | UNRECONCILED |
| Space Challenge | Get Ready to Go to Mars / blt8fc0890e54a4e43a | UNRECONCILED |
| Space Challenge | Activate Communications / blte6ce179bfcb3a18f | UNRECONCILED |
| Space Challenge | Assemble Your Crew / blt368b0a696c718018 | UNRECONCILED |
| Space Challenge | Free the MSL Robot / blt3cadd13265e563a7 | UNRECONCILED |
| Space Challenge | Launch the Satellite / blt39b3066e8316b800 | UNRECONCILED |
| Space Challenge | Return the Rock Samples / blt4f452b84679650f1 | UNRECONCILED |
| Space Challenge | Secure the Power Supply / blt5d6beaccb81d89fb | UNRECONCILED |
| Space Challenge | Initiate Launch / bltb39839681fcf9006 | UNRECONCILED |

- [ ] Reconcile lobby, unit, lesson, locale, program and all media URL indexes.
- [ ] Investigate unmatched URLs, additional downloads and version differences.
- [ ] Validate source-flow fidelity and acceptance on representative Classroom lessons.
