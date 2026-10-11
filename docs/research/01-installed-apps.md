# 01 — Installed applications

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

## Windows follow-up ? 2026-10-04

**VERIFIED local installation metadata and readable files; app execution UNTESTED.**
This supersedes the earlier Ubuntu environment result, which remains below as a
dated record. All parsing used private copies; no original app was launched.

| Product | Actual installation path | Recorded version |
| --- | --- | --- |
| Home Edition | `C:\Program Files (x86)\LEGO Software\LEGO MINDSTORMS EV3 Home Edition` | Uninstall record 1.4.4; Home content/support 1.4.4 |
| Lab / Education | `C:\Program Files (x86)\LEGO Software\LEGO MINDSTORMS Edu EV3` | Uninstall 1.4.16; content 1.4.19, Spanish support 1.4.13, teacher edition 1.0.398 |
| Classroom | `C:\Program Files\EV3 Classroom\EV3 Classroom-win-1.5.3.4056.exe` | Uninstall 1.5.3; executable ProductVersion 1.5.3.4056; 515,207,680 bytes |

Home and Education launcher FileVersion/ProductVersion are both 1.0.10317.5;
launcher version is not a substitute for app/content package versions. Inventories
contained 4,015 Home and 5,316 Education files. Of their 117 `.ev3` archives
(34 Home / 83 Education), all passed ZIP CRC inspection on copies.

Readable user content: `C:\Users\stomp\OneDrive\Documentos\LEGO Education EV3 Content`
and `C:\Users\stomp\OneDrive\Documentos\LEGO Education EV3\Proyecto.lmsp`.
App-specific directories were found under `C:\Users\stomp\AppData\Local\LEGO`,
including MINDSTORMS EV3 caches, and `C:\Users\stomp\AppData\Roaming\MINDSTORMS_EDU`.
Cache indexes are not proof that every listed bonus resource was downloaded.

Search scope actually inspected: relevant entries under Program Files, Program
Files (x86), ProgramData, current user's Local/Roaming/LocalLow AppData, redirected
Documents and public Documents, Start menus, uninstall records and current-user
Appx package listing. The Appx listing had 167 entries, no name match for these
products. `C:\Program Files\WindowsApps` listing was denied: **UNKNOWN / UNAVAILABLE
IN THIS ENVIRONMENT** for its content. Other profiles are UNKNOWN. D: and E:
were listed at root only, not recursively searched. Negative results do not apply
to these uninspected scopes.

Private audit copies and inventory were kept under
`C:\Users\stomp\AppData\Local\Temp\ev3-readonly-audit-5g7muly0`;
this is local working evidence, not a repository asset or distribution package.
The reproducible mission metadata is [15](15-track3r-mission-01.md).

## Superseded Ubuntu inventory ? 2026-10-03

## Result

The requested EV3 Home Edition, EV3 Lab / Education, and EV3 Classroom installations were **not available to inspect** in this environment. The observed machine is Ubuntu 24.04.5 LTS (x86_64), not a Windows desktop with the referenced applications. This inventory is limited to the paths accessible in this sandbox.

| Application / location | Result |
| --- | --- |
| EV3 Home Edition | UNKNOWN — no installation found in searched locations |
| EV3 Lab / Education | UNKNOWN — no installation found in searched locations |
| EV3 Classroom | UNKNOWN — no installation found in searched locations |
| `/Program Files`, `/Program Files (x86)`, `/ProgramData` | Absent |
| `/mnt/c/Program Files`, `/mnt/c/Program Files (x86)`, `/mnt/c/ProgramData`, `/mnt/c/Users` | Absent |
| Linux app locations under `/opt`, `/usr/local/share`, `/usr/share/applications`, `/var/lib/snapd/desktop/applications` | No EV3 application found |
| `/home/runner/.local/share`, `/home/runner/.config`, `/home/runner/Documents` | No EV3 application or content found |
| Installed Debian package names | No relevant EV3/LEGO/MINDSTORMS package found; the substring search's only result was unrelated `libblockdev3` |
| Windows registry / application package database | UNAVAILABLE |

The worktree contains only the initial `README.md`; the repository itself provides no installed application artifacts. Search results are negative only for the listed paths, not proof that the apps do not exist on the user's device.

## Read-only handling

The investigation only listed paths and queried package names. No app was launched and no original installation or resource was changed. There were no candidate files to copy for isolated analysis.

## Required follow-up

Repeat on the actual Windows machine with access to the installed applications. Include per-user install roots, application package locations, known-folder paths, shortcuts and uninstall records, and app-specific data folders. Do not export private user data or copy proprietary assets into this public repository. Record precise paths, app versions, and checksums for any samples analyzed.
