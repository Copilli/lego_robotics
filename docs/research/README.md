# Phase 1 — Discovery & Research

These notes record what could and could not be verified in the current coding environment. **UNKNOWN** means evidence was unavailable; it is not evidence that a feature, file, or application does not exist elsewhere.

## Evidence boundary

- Inventory date: 2026-10-03.
- Host observed: Ubuntu 24.04.5 LTS, x86_64, Linux kernel 6.17.0-1022-azure.
- Repository worktree: `/home/runner/work/lego_robotics/lego_robotics`.
- Read-only checks found only a 15-byte initial README in the worktree; no app packages, manifests, tests, or workflows.
- Searched conventional Windows install roots (`/Program Files`, `/Program Files (x86)`, `/ProgramData`, `/mnt/c/...`) and Linux locations under `/opt`, `/usr/local/share`, `/usr/share/applications`, `/var/lib/snapd/desktop/applications`, `/home/runner/.local/share`, `.config`, and `Documents`. Windows roots were absent. No EV3/MINDSTORMS app or content was found in the searched locations.
- Checked installed Debian package names for EV3/LEGO/MINDSTORMS; the substring search returned only unrelated `libblockdev3`. No Windows registry or Windows user profile is available here.
- Direct web fetches from this environment failed DNS resolution. Secondary research yielded GitHub source references, but official LEGO, Apple, and MDN pages were not fetched; citations remain leads unless explicitly described as verified.
- No legacy app was launched, no installation was modified, and no original content was available to copy or inspect.

## Documents

| Document | Scope | Status |
| --- | --- | --- |
| [01 — Installed apps](01-installed-apps.md) | Host and local installation inventory | VERIFIED for this sandbox only |
| [02 — Content structure](02-content-structure.md) | Cross-app resource relationships | UNKNOWN |
| [03 — Home content](03-home-content.md) | Home robots and missions | UNKNOWN |
| [04 — Lab content](04-lab-content.md) | Lab / Education library | UNKNOWN |
| [05 — Classroom content](05-classroom-content.md) | App technology and content | UNKNOWN |
| [06 — File formats](06-file-formats.md) | Containers, signatures, media | UNKNOWN |
| [07 — EV3 protocol](07-ev3-protocol.md) | Protocol evidence plan | EXPERIMENTAL (secondary-source review) |
| [08 — iOS connectivity](08-ios-ev3-connectivity.md) | iPad transport feasibility | UNTESTED |
| [09 — Android connectivity](09-android-connectivity.md) | Android transport feasibility | UNTESTED |
| [10 — Web connectivity](10-web-connectivity.md) | Browser and desktop options | UNTESTED |
| [11 — Tablet architecture](11-tablet-architecture.md) | Evidence-bounded proposal | PLANNED |
| [12 — Content schema](12-content-schema.md) | Draft normalized content model | PLANNED |
| [13 — Import strategy](13-import-strategy.md) | Safe, provenance-preserving workflow | PLANNED |
| [14 — Roadmap](14-roadmap.md) | Phases and exit criteria | PLANNED |

## How to continue the investigation

Run a read-only inventory on a machine that actually has the official applications installed. Record app version, OS, install path, and access date. Inspect copies of candidate files, preserve originals, and cite hashes and tool output in follow-up notes. Do not infer app internals from product names or file extensions.
