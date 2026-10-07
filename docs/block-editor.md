# Visual editor and first program

The default new-project editor uses the actual Scratch Blocks 2.1.30 library. Supported blocks include the green-flag event, motors A–D, sound, stop, console output, six sensor modes, waits, repeat/forever loops, conditionals and arithmetic/boolean operators. A supported block tree is compiled into the existing asynchronous EV3 browser runtime. This is not the full Scratch VM and does not import `.sb3`, `.ev3` or native Classroom projects.

Projects store both `blocksXML` and generated JavaScript in localStorage. JSON export/import and duplication preserve editable blocks. Existing JavaScript projects open as JavaScript. Switching from blocks regenerates JavaScript; editing JavaScript does not reverse-convert it to blocks. Invalid block programs remain saveable but cannot execute or export stale JavaScript.

The home screen provides project cards, an Iniciar entry and the tutorial collection. The four-step guide covers pairing/connection, a greeting and tone, timed motor movement and sensor readings. Loading an example is explicit and replaces the current blocks. Progress and the current guide step persist locally.

The simulator executes the same generated program with command validation, console output and fixed test sensor readings. It is not a physics simulator. Real EV3 commands use the paired Bluetooth serial port through Web Serial in desktop Chrome/Edge over HTTPS or localhost. A physical brick remains untested.

The full local preservation library contains 146 videos; all 47 WMV originals have MP4 playback derivatives. Five original MP4 videos for the basic tutorials are included in `public/media/tutorials` (about 17 MB) so a clean checkout/build does not depend on LEGO's video servers. The app prefers the full local library when present, then falls back to this bundled catalog. The larger preservation collection remains outside Git. No offline application cache is implemented; the site must first load from its server.

No Classroom installation was identified in the checked Windows app/package/uninstall records. Home, Education/Lab and SPIKE were identified. Classroom's Home and Start screens have now been visually verified from online screenshots; see [visual evidence](research/17-classroom-ui-reference.md). The current navigation remains an independent implementation, not a faithful copy of that observed flow. Official reference: https://education.lego.com/en-us/product-resources/mindstorms-ev3/.

Validation covers generated control flow, string escaping, real Scratch field editing, JSON restore, guided simulation, mocked serial EV3 responses, mobile layout and self-hosted video playback with external requests blocked. These checks do not prove operation with a physical EV3.
