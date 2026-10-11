# 13 ? Content import strategy

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

**Historical generalized pipeline proposal.** Local Home/Education/Classroom
samples were available on the inspected Windows host. The earlier TRACK3R-only
importer/server has been superseded by main and removed. The retained
[tools](../../tools/README.md) perform static inspection and reference validation;
[current content imports](../classroom-content.md) use the scripts in `scripts/`.

## Required product outcome — owner clarification 2026-10-05

EV3 Studio is intended for internal, non-profit preservation. Reusing existing
videos, tutorials, build instructions, text, images, sounds, programs and flows
is a requirement, not an optional future content source. Imported resources must
be integrated into the new app's private offline library and lesson experience.
Do not replace original content with a metadata catalog, placeholders or rewritten
lessons as the final deliverable. Preserve step order, branches and program/media
relationships while adapting interaction to tablets.

Preserve original program source alongside analysis and any later executable
representation. Correct execution is a separate engineering acceptance criterion:
an unsupported operation must remain explicit, not be silently rewritten. The
reference-only status of the current milestone is temporary and does not narrow
the final product requirement. This clarification does not request a mass import
now or authorize adding proprietary payloads to the repository.

## Pipeline

1. User selects an accessible installation/package explicitly. Record product,
   known versions and scope; do not scan unrelated personal files.
2. Copy selected candidates into private staging; hash and identify signatures.
   Keep originals read-only. Bound ZIP counts, sizes and compression; reject
   traversal, duplicate entries, encryption, symlinks and XML entities.
3. Extract source IR: controls/text, media consumers, archive boundaries, programs,
   actions and missing/ambiguous candidates. Do not execute legacy content.
4. Normalize typed Activity steps and asset roles using version-specific adapters;
   preserve source locators, hashes, raw private originals and conversion warnings.
5. Validate graph, branch/terminal behavior, asset availability/hash, media decode,
   unsupported dependencies, sanitization and rights. Review before atomic local
   library activation. Cancellation/errors must not leave a partial library.
6. Retain provenance and import diagnostics for local repair, export/backup and
   upgrades. Deduplicate identical bytes across activities without losing consumers.

The current [TRACK3R case](15-track3r-mission-01.md) proves resolved direct media
references and recoverable XML program structure. Legacy help remains unresolved;
sequential navigation inferred; playback and teaching equivalence untested. The
[reference manifest](../content/track3r-01.manifest.example.json) has null payloads
and cannot replace a complete private library package.

## Importability versus rights

Technical classification is per resource: copyable/signature-identified, parseable,
partially interpretable, reference-only, unknown or unsupported. It is independent
of redistribution. A person's access to an installed app is not a public license.
Never ship proprietary originals, extracted lesson prose, videos or derived media
in the repository/releases without permission evidence. A future iPad workflow
must decide desktop-assisted private export versus direct user-selected archive
import; this is not an extra connectivity bridge for students.

## Remaining engineering acceptance

Formal schema/migrations, source-version detection, tested decode/transcode,
accessibility alternatives, malicious/truncated-input handling, deterministic
output, resumable/cancellable imports, quota/atomic storage and backup restore.
Use synthetic or licensed fixtures. Validate one Lab and one Classroom activity
before expanding scope; no mass import is part of the current milestone.

The sample importer already verifies assets and atomically publishes a revision
pointer. The browser has explicit secure-origin offline caching; wider transactional
storage, version migration and multi-activity cancellation still need engineering.
