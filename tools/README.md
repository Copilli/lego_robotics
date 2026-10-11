# Local research tools

These Python 3.10+ tools preserve the historical TRACK3R 01 inspection and
metadata-only reference example. They are not a general importer or converter.
The current application and import pipeline live in `src/` and `scripts/`; see
[development](../docs/development.md) and [content](../docs/classroom-content.md). No third-party
Python dependencies are required. Do not run legacy applications or programs as
part of this inspection.

## Inspect one Home mission

```powershell
python tools/inspect_home_mission.py --installation 'C:\Program Files (x86)\LEGO Software\LEGO MINDSTORMS EV3 Home Edition' --output "$env:TEMP\track3r-01.inspection.json"
```

`--pack 0 --mission 1 --locale en-US` are the defaults. The user supplies one
installation explicitly; the tool does not scan unrelated folders. It copies
candidate files into a new private system temporary directory before parsing.
Original installation paths are never written. No URLs, legacy actions,
programs, scripts or binary modules are executed. Archive entries are read in
memory, with path, CRC, size, count, duplicate, encryption and symlink checks.
DTD/entity XML is rejected. This is bounded research handling, not a security
certification of a future importer.

The output contains source-relative paths, SHA-256 hashes, slide/control
locators, resource relationships and raw program parameter values. **It excludes
asset bytes and lesson prose.** Repeated references use the same hash-based asset
ID. Distinct candidates with different hashes remain AMBIGUOUS instead of guessing
the historical runtime's resolution precedence.

The printed `privateScratchDirectory` contains copies and `private-texts.json`
with all nonempty control texts and locators. Keep that directory local and
outside the repository. Do not distribute it or treat local possession as a
license. Use this private text export to compare the proposed paraphrases and
future local normalization with the original.

The evidence snapshot in `docs/research/evidence/` was produced from the local
Home 1.4.4 installation. Report status means static inspection, not playback,
teaching validation, program execution or hardware compatibility.

## Generate the reference example

```powershell
python -B tools/build_track3r_example.py
```

This writes only `docs/content/track3r-01.manifest.example.json` from the checked-in
inspection metadata. It neither accesses an installation nor includes lesson
payloads. It is a sample-specific mapping, not a general normalizer.

## Validation

```powershell
python -B -m unittest discover -s tests -v
python -B tools/validate_track3r_example.py
```

Tests use synthetic XML/ZIP/PNG fixtures only. The example validator checks
semantic consistency of the draft manifest against the inspection snapshot; it
does not load LEGO content or run an EV3 program.

