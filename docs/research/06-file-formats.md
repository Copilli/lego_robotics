# 06 — File formats

**Status: UNKNOWN.** No `.ev3`, `.ev3p`, `.laz`, archive, media, database, or other candidate sample was present in the worktree or searched application locations. No magic bytes, headers, internal paths, compression, or schema were examined.

| Candidate | Observed sample | Format conclusion |
| --- | --- | --- |
| `.ev3`, `.ev3p`, `.laz` | None | UNKNOWN |
| `.zip`, `.xml`, `.json`, `.sqlite`, `.db` | None | UNKNOWN |
| `.js`, `.html`, `.css`, `.asar`, `.pak`, `.bin`, `.dat` | None | UNKNOWN |
| `.png`, `.jpg`, `.svg`, `.gif`, video, audio | None | UNKNOWN |

An extension is not evidence of the file's actual structure. On follow-up, record hashes and use file-signature identification on copies, list archive entries without extraction first, then extract only into a controlled scratch directory. Preserve originals and note tool/version, errors, and nested containers. Media codecs, dimensions, and lesson associations remain UNKNOWN.
