# Visual editor and first program

The default new-project editor uses the actual Scratch Blocks 2.1.30 library. Supported blocks include the green-flag event, motors A–D, sound, stop, console output, six sensor modes, waits, repeat/forever loops, conditionals and arithmetic/boolean operators. A supported block tree is compiled into the existing asynchronous EV3 browser runtime. This is not the full Scratch VM and does not import `.sb3`, `.ev3` or native Classroom projects.

Projects store both `blocksXML` and generated JavaScript in localStorage. JSON export/import and duplication preserve editable blocks. Existing JavaScript projects open as JavaScript. Switching from blocks regenerates JavaScript; editing JavaScript does not reverse-convert it to blocks. Invalid block programs remain saveable but cannot execute or export stale JavaScript.

The home screen provides project cards and an Iniciar entry opening the activity collection. All practices share the same editor, projects and video library; Home/Lab names appear only as optional material provenance. The introduction follows the preserved Classroom steps; compatible practice examples cover a greeting and tone, timed motor movement and sensor readings. Loading an example is explicit and replaces the current blocks. Progress and the current guide step persist locally.

The simulator executes the same generated program with command validation, console output and fixed test sensor readings. It is not a physics simulator. Real EV3 commands use the paired Bluetooth serial port through Web Serial in desktop Chrome/Edge over HTTPS or localhost. A physical brick remains untested.

The full local preservation library contains 146 videos; all 47 WMV originals have MP4 playback derivatives. Five original MP4 videos for the basic tutorials are included in `public/media/tutorials` (about 17 MB) so a clean checkout/build does not depend on LEGO's video servers. The app prefers the full local library when present, then falls back to this bundled catalog. The larger preservation collection remains outside Git. No offline application cache is implemented; the site must first load from its server.

Classroom 1.5.3 is now installed and its Spanish content has been imported alongside Home/Lab. The UI follows the supplied Classroom screenshots: introduction cards, grouped units and sessions, construction library, and tutorials inside the full-window editor. See [content inventory and limitations](classroom-content.md).

Validation covers generated control flow, string escaping, real Scratch field editing, JSON restore, guided simulation, mocked serial EV3 responses, mobile layout and self-hosted video playback with external requests blocked. These checks do not prove operation with a physical EV3.
