# 13 — Content import strategy

**Status: PLANNED.** An importer cannot be implemented or tested until source application paths, file formats, and sample content are available.

## Proposed flow

1. User explicitly selects an installation folder or package they can access.
2. Scanner inventories paths and metadata without writing into the source tree.
3. User selects content for personal import; original files remain untouched.
4. Extractor works on copies in a temporary destination and identifies formats by signature as well as extension.
5. Normalizer writes a versioned EV3 Studio manifest and preserves source app/product/version/path and hashes when known.
6. Validator reports missing assets, unsupported formats, and provenance; user can review before adding to a local library.

The application must not silently scan unrelated user files or assume permission to redistribute proprietary content. A personal import workflow does not itself grant distribution rights. Imported originals should not be committed to the public repository.

## Prerequisites

- Representative user-provided installation samples with recorded versions and hashes.
- Confirmed layouts and parsers for each supported app/version.
- Tests based on legally usable fixtures or synthetic fixtures.
- Explicit error handling for truncated, encrypted, unknown, or unsupported data.
- A policy for source metadata, duplicate assets, and safe archive extraction.
