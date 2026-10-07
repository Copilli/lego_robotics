# Third-party components and preserved content

The visual editor uses Scratch Blocks 2.1.30 (Scratch Foundation and its contributors), based on Blockly, under the Apache License 2.0. Scratch Blocks code is consumed from the npm dependency without modifications. Its editor media are copied into the build from that dependency. The full license is in `licenses/scratch-blocks-Apache-2.0.txt`. Source: https://github.com/scratchfoundation/scratch-blocks.

The JavaScript editor uses CodeMirror 6, under the MIT license. Source: https://github.com/codemirror.

LEGO tutorial videos retain their original copyrights. They are preserved copies from the locally installed EV3 Home Edition 1.4.4 and EV3 Education/Lab 1.4.16 applications, not original Copilli content. `public/media/tutorials/catalog.json` records the application, relative source path, size and SHA-256 of each included video. These assets are not covered by the open-source editor licenses. Copilli is an independent project and does not claim LEGO affiliation.

The unified curriculum also preserves images, videos, construction instructions, tutorial text, code-stack references and UI icons from EV3 Classroom 1.5.3 and the installed Home/Lab content packs. These assets retain LEGO and their respective authors’ copyrights; Apache/MIT licensing applies to the editor components only. Public content is normalized in `public/content/catalog.json`; the private preservation inventory records source locations and Classroom SHA-256 checksums.
