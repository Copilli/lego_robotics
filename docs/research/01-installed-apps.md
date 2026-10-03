# 01 — Installed applications

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
| Installed Debian package names | No relevant EV3/LEGO/MINDSTORMS package found |
| Windows registry / application package database | UNAVAILABLE |

The worktree contains only the initial `README.md`; the repository itself provides no installed application artifacts. Search results are negative only for the listed paths, not proof that the apps do not exist on the user's device.

## Read-only handling

The investigation only listed paths and queried package names. No app was launched and no original installation or resource was changed. There were no candidate files to copy for isolated analysis.

## Required follow-up

Repeat on the actual Windows machine with access to the installed applications. Include per-user install roots, application package locations, known-folder paths, shortcuts and uninstall records, and app-specific data folders. Do not export private user data or copy proprietary assets into this public repository. Record precise paths, app versions, and checksums for any samples analyzed.
