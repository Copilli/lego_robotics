# Preservation milestone: TRACK3R Mission 01

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

**Evidence collected 2026-10-04; synthesis 2026-10-05.** The checkout began with
README and research proposals only. This milestone adds local inspection tools
and a traceable reference model. There is still no EV3 Studio application,
production importer, lesson renderer, transport adapter or runtime.

## Deliverables and acceptance boundary

| Requested deliverable | Result | Evidence / remaining acceptance |
| --- | --- | --- |
| Mission reconstruction | VERIFIED static: robot, mission, objective text locators, 22 slides and two programming routes | [15](15-track3r-mission-01.md); actual visual order must be compared with the original app |
| Resource graph | VERIFIED source relationships; sequential navigation EXPERIMENTAL | 334 media references, 112 assets, 48 ordered build images; graph and JSON in [15](15-track3r-mission-01.md) |
| Normalized model | PROPOSED, grounded in one Home sample | [12](12-content-schema.md); not validated across Lab/Classroom |
| Example manifest | Generated reference-only draft, structurally checked | [manifest](../content/track3r-01.manifest.example.json); payloads absent and execution disabled |
| Importability classification | Static formats and dependencies classified | [15, Importability](15-track3r-mission-01.md#automatic-importability-classification); playback and production import UNTESTED |
| Program analysis | VERIFIED XML nodes, constants and sequence wires | [16](16-track3r-program.md); no automatic Blockly conversion or hardware execution |
| iPad Bluetooth research | VERIFIED primary documentation and pinned source observations | [18](18-ipad-accessory-bluetooth.md); all new hardware behavior UNTESTED |
| Transport matrix | Updated documentary feasibility | [10](10-web-connectivity.md); platform/firmware combinations remain UNTESTED |
| Unknowns / blockers | Explicit below | Each requires separate evidence, not a guessed compatibility claim |
| Next milestone | Proposed independent content and hardware tracks | Acceptance below |

This is an end-to-end **static traceability proof** from selected installation
files to a reference manifest. It does not yet demonstrate complete preservation
as a functioning educational experience. Proprietary texts were inspected in
private copies and represented publicly by locators/hashes; media bytes remain
outside the repository. Neither local access nor technical importability grants
redistribution permission.

## Verification performed — 2026-10-05

- Sixteen automated checks passed: synthetic archive/XML/media safety cases and
  metadata-only graph/provenance/payload-boundary regression checks.
- Example validation passed: 22 reachable steps, 112 assets and 48 build-image
  mappings; two programming choices and terminal boundaries retained.
- Repeating inspection against the selected installation yielded an identical
  metadata report; regenerating the example yielded identical bytes.
- The source mission SHA-256 before and after the repeat matched the recorded
  source hash. Parsing operated on new private copies.
- Local Markdown file targets resolved and `git diff --check` passed.

These checks do not establish playback, original-app visual fidelity, malicious
input certification, hardware behavior or distribution rights. No commits,
publication, mass import or proprietary asset payloads were added.

## UNKNOWN / UNTESTED / blockers

| Gap | Classification | Evidence needed / scope affected |
| --- | --- | --- |
| Independent app authorization for LEGO accessory protocol | UNKNOWN; release gate | Manufacturer authorization requirements and permitted protocol use for EV3 Studio; Apple app review/distribution route |
| Current iPad discovers EV3 and opens EASession | UNTESTED; Bluetooth product gate | iPad model, iPadOS, brick firmware, visible iOS mode, protocol strings observed, pairing/session logs |
| Safe motor control and recovery | UNTESTED; runtime gate | Battery/ports response; motor run/stop; disconnect, suspend, reconnect, timeout and queued command tests |
| Original lesson's rendered sequence and navigation | UNTESTED | Observe original Home app on an authorized copy/test setup; compare both branches with 22-slide trace |
| Playback on target tablets | UNTESTED | Decode/play the copied MP4 and actual image formats offline; audio profile, captions, seeking and lifecycle tests |
| Legacy HTML help resolution | UNKNOWN | Resolve six help actions from installed help routing, document target pages; do not execute arbitrary legacy actions |
| Guide PDF page and construction semantics | UNTESTED | Render copied PDF page 21 and review all 48 build images; physical port/attachment check |
| NI node behavior and enum meanings | UNKNOWN / partial static recovery | Decode relevant block definitions or corroborate with documented behavior and controlled original-app/brick execution |
| Program safety after host loss | UNKNOWN | Brick-side watchdog/autonomous execution semantics and bounded direct command behavior |
| Lab/Classroom schema generality | UNKNOWN | One representative Lab lesson and one Classroom lesson, including branches, localized media and programs |
| Accessible alternatives and translations | UNKNOWN | Authored/authorized alt text, captions, screen-reader flow; source language completeness |
| Original asset licenses | UNKNOWN; public payload gate | License/permission evidence for each product and asset class; absence keeps payload out of releases |
| WindowsApps and other user profiles | UNAVAILABLE / UNKNOWN | Explicit readable package/profile access; no negative claims about inaccessible folders |

## Next milestone: two independent tracks

**Owner clarification 2026-10-05:** the final product is for internal, non-profit
use and must reuse the original videos, tutorials, code and educational flows
inside EV3 Studio. The private lesson library must contain usable imported
resources, not just references. Preserve originals and provenance; keep public
repository/distribution questions separate from this internal product outcome.

**A — Local mission experience.** Implement a bounded importer and normalizer
for this sample, a formal versioned schema, and a minimal tablet lesson renderer.
Keep imported payloads local. Acceptance: all 22 source slides traceable; both
branches navigable without falling through; 48 build images ordered; objective,
instructions and program reference displayed; shared assets deduplicated by hash;
missing help explicit; no legacy URI/script execution; no network needed after
import; restart retains content and progress. Compare the experience with the
original on copies before calling it a complete preservation result. Program
references remain inert until runtime semantics and safety are established.

**B — Native accessory feasibility.** Build a minimal iPad test app, independent
of editor/content decisions, using the ExternalAccessory route in [18](18-ipad-accessory-bluetooth.md).
Acceptance: one installed app; documented accessory protocol visibility/session;
battery/ports response with packet correlation; safe bounded motor stop and
recovery; permission and lifecycle logs; measured reliability across named
hardware/OS/firmware configurations. Resolve manufacturer authorization before
claiming a distributable solution. No additional student bridge.

After A, evaluate one Lab and one Classroom sample before generalizing the
importer. After B, select the mobile host through an ADR. Blockly touch evaluation
and the transport-independent runtime contract can proceed alongside both.

## Decisions for the owner

1. Which iPad models/iPadOS versions and brick firmware must the first classroom
   support, and is that hardware available for recorded tests?
2. Is an Apple Developer account and a contact/authorization route with LEGO
   available for accessory-protocol distribution?
3. Should first local imports occur on a desktop and transfer a private package
   to iPad, or must iPad import user-selected source archives directly?
4. Does preservation require visual fidelity to Home, or equivalent pedagogy
   with a redesigned accessible layout? Who will validate both lesson branches?
5. Which source languages, accessibility needs and offline storage budget are
   mandatory for the first school pilot?
6. Which controlled execution environment will validate the preserved original
   programs and their eventual runtime mappings against original behavior?
7. How should schools back up shared-device libraries and separate students'
   progress without cloud accounts?
