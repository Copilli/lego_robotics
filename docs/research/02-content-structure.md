# 02 — Cross-application content structure

**Status: UNKNOWN.** No Home, Lab/Education, or Classroom installation, content pack, or sample project was present to inspect. No app-specific hierarchy, manifest, database, or resource relationship is claimed.

## What evidence is missing

- Root content directories and manifests for each app/version.
- A file listing with sizes and hashes, including hidden and extensionless files.
- Cross-references between robots, activities, videos, builds, images, and programs.
- A copy of representative project and lesson files for isolated analysis.
- Runtime evidence of how each app resolves references.

## Next investigation

On a machine with an installation, inventory metadata first, then copy representative files to a separate analysis directory. Record the original path and SHA-256 hash, identify files by signatures as well as extensions, and inspect references before proposing an importer. Keep app/version boundaries visible; do not assume that similarly named resources share a format.
