# 02 — Cross-application content structure

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

## Windows follow-up ? 2026-10-04

**VERIFIED static samples, runtime resolution UNTESTED.** Home separates localized
`Resources/ContentPacks/Retail/en-US/LEGO/packN` from shared media at
`Resources/ContentPacks/Retail/nonlocalized/LEGO/packN`. `pack.xml` describes robot
context; numbered `.ev3` projects contain activity XML, programs and nested assets;
external sibling media are referenced by controls. [15](15-track3r-mission-01.md)
traces one mission, including robot context, two program paths and help dependencies.

Education uses analogous ContentPacks with `Education/es` samples; do not assume
its lesson controls map identically. Classroom user content contains lobby/unit/
lesson JSON and referenced media URLs/files rather than Home's same project graph.
[05](05-classroom-content.md) records scope. A normalized model must preserve
relationships while avoiding direct runtime coupling to these formats.

## Superseded discovery note ? 2026-10-03

**Status: UNKNOWN.** No Home, Lab/Education, or Classroom installation, content pack, or sample project was present to inspect. No app-specific hierarchy, manifest, database, or resource relationship is claimed.

## What evidence is missing

- Root content directories and manifests for each app/version.
- A file listing with sizes and hashes, including hidden and extensionless files.
- Cross-references between robots, activities, videos, builds, images, and programs.
- A copy of representative project and lesson files for isolated analysis.
- Runtime evidence of how each app resolves references.

## Next investigation

On a machine with an installation, inventory metadata first, then copy representative files to a separate analysis directory. Record the original path and SHA-256 hash, identify files by signatures as well as extensions, and inspect references before proposing an importer. Keep app/version boundaries visible; do not assume that similarly named resources share a format.
