# TRACK3R Mission 01: original program analysis

> Historical research snapshot (2026-10-04/05), recovered onto main on 2026-10-11. Evidence and proposals below retain their original dates; they do not describe the current implementation. See [current development](../development.md), [content and conversion limits](../classroom-content.md) and [hardware validation](../manual-connection-validation.md). Hardware behavior remains UNTESTED unless a later recorded test establishes it.

**VERIFIED static parsing; EXPERIMENTAL semantic interpretation; execution and
EV3 → Blockly conversion UNTESTED.** No original program was executed or copied
into the repository. Evidence is in the `programs` field of the
[inspection report](evidence/track3r-01.inspection.json).

## Format and relationships

The mission `.ev3` is ZIP. Both `Program.ev3p` and `TRACK3R 01.ev3p` are UTF-8 XML
with a BOM, NI SourceModel root version 1.0.2.6, and a VirtualInstrument with
OverridingModelDefinitionType `X3VIDocument`. They are source graphs, not EV3 VM
bytecode files or Blockly serialization. Parsing with the bounded XML reader
succeeds. `Project.lvprojx` links the programs and NI runtime components.

`Program.ev3p` contains only StartBlock `n1`; it is the guided starting workspace.
The completed program has one start and five operation nodes. Their XML order is
not execution order: sequence wires determine the graph.

Completed program: 11,442 bytes; SHA-256
`947be54417dd20ae183f06c6273d78c17b97ed308ef4d958e1a60415ca1d72a8`.

## Recovered sequence and literal parameters

```mermaid
flowchart LR
  n1[Start n1] --> n14[Display n14]
  n14 --> n2[Move B+C n2]
  n2 --> n4[Medium motor A n4]
  n4 --> n10[Return B+C n10]
  n10 --> n12[Sound n12]
```

| Order / node | Original target | Recovered ConfiguredValue inputs |
| --- | --- | --- |
| 0 / n1 | `X3\.Lib:StartBlockTest` | Start; no configurable inputs |
| 1 / n14 | `DisplayFile\.vix` | Filename `Pinch left`; Clear Screen `True`; X=0; Y=0 |
| 2 / n2 | `MoveDistanceRotations\.vix` | Ports `B+C`; Steering=0; Speed=75; Rotations=2; Brake At End=True |
| 3 / n4 | `MediumMotorDistanceRotations\.vix` | MotorPort=A; Speed=75; Rotations=3; Brake At End=True |
| 4 / n10 | `MoveDistanceRotations\.vix` | Ports `B+C`; Steering=0; Speed=-75; Rotations=2; Brake At End=True |
| 5 / n12 | `PlaySoundFile\.vix` | Name `Fanfare`; Volume=100; Play Type=0 |

Every operation also has an interrupt-listen input configured to 0. Preserve its
raw terminal ID/value rather than inventing behavior. Sequence wires are
`w14: n1→n14`, `w12: n14→n2`, `w9: n2→n4`, `w11: n4→n10`, `w13: n10→n12`.

Interpretation: display the supplied image, drive forward, rotate the attachment,
return, play the supplied sound. The activity instructions corroborate rotations
2 and 3 and return power -75. Nevertheless, the source terminal is named `Speed`;
do not silently replace it with regulated speed/power semantics in a new runtime.
`Play Type=0` is an enum value whose precise wait/repeat behavior is not verified.
Blocking, synchronization, gearing and brake behavior require method-definition
analysis and a real-brick comparison.

## Hardware and dependencies

- A: medium motor, identified by method target and port value.
- B+C: drive motor pair, directly verified ports; **large motor type is inferred**
  from TRACK3R description and still needs build/hardware confirmation.
- Brick: display and sound; `.rgf` and `.rsf` are included in the mission archive.
- **No sensor-read operation occurs in this program.** This is not proof that the
  physical robot has no sensor; TRACK3R's overview describes an infrared sensor.
- D and inputs 1–4: not used by the recovered graph; physical inventory UNKNOWN.
- PBR definitions located at `Resources/Blocks/LEGO/VIs/PBR/`:
  `DisplayFile.vix`, `MoveDistanceRotations.vix`,
  `MediumMotorDistanceRotations.vix`, `PlaySoundFile.vix`. Located/hashes verified;
  their full semantics and transitive dependencies were not decoded.

## Conversion classification

| Information | Classification | Limit |
| --- | --- | --- |
| Node IDs, constants, sequence edges and resource links | Directly convertible to a **structural intermediate record** | This is metadata conversion, not executable Blockly |
| Start plus straight-line motor/display/sound intentions | Partially convertible conceptually | Needs verified block mappings, units, scheduling and resource loading |
| Original XML programs, screenshots, RGF/RSF | Representable as local reference | Keep immutable source and provenance; no public payload |
| Motor execution, Play Type enum, interrupts, target resolution | UNKNOWN / UNTESTED | Decode definitions and compare against real EV3 execution |
| Full EV3 → Blockly conversion | Not attempted | Do not generate a workspace claimed to be equivalent |

The manifest sets workspace to null and executionAllowed to false. Source data
must remain distinct from any later translated program. A derivative needs its
own hash, converter/version, mapping report, unsupported operations and validation
result. Stop on unknown semantics rather than dropping a block silently.
