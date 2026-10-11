"""Bounded, copy-first inspection of one EV3 Home mission; never executes content.

Reports references, hashes and structural facts, not proprietary lesson text.
Original text is recorded ONLY in the private scratch directory outside the repo.
This is an inspection tool, not an importer or an EV3-to-Blockly converter.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import struct
import tempfile
import xml.etree.ElementTree as ET
import zipfile

MAX_MEMBER = 32 * 1024 * 1024
MAX_TOTAL = 64 * 1024 * 1024
MAX_ENTRIES = 1000


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tag(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1]


def safe_relative(value: str) -> str:
    value = value.replace("\\", "/")
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ":" in value or ".." in path.parts:
        raise ValueError(f"Unsafe relative resource path: {value!r}")
    return str(path)


def xml(data: bytes) -> ET.Element:
    if len(data) > MAX_MEMBER:
        raise ValueError("XML exceeds size limit")
    # UTF-16/32 must not bypass the declaration checks.
    declarations = data.replace(b"\x00", b"").upper()
    if b"<!DOCTYPE" in declarations or b"<!ENTITY" in declarations:
        raise ValueError("DTD/entity declarations are not accepted")
    return ET.fromstring(data)


def read_archive(data: bytes) -> dict[str, bytes]:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) > MAX_ENTRIES or sum(x.file_size for x in entries) > MAX_TOTAL:
            raise ValueError("Archive exceeds entry/expanded-size limits")
        result = {}
        for item in entries:
            name = safe_relative(item.filename)
            if item.is_dir():
                continue
            if name in result:
                raise ValueError(f"Duplicate archive member: {name}")
            if item.flag_bits & 1 or item.file_size > MAX_MEMBER:
                raise ValueError(f"Encrypted or oversized member: {name}")
            if (item.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError(f"Symlink archive member: {name}")
            if item.file_size > max(1, item.compress_size) * 1000:
                raise ValueError(f"Excessive compression ratio: {name}")
            result[name] = archive.read(item)  # Also checks each member CRC.
        return result


def mp4_metadata(data: bytes) -> dict:
    """Read sample-entry IDs and movie header; not a decoder or playback test."""
    result = {"sampleEntryIds": [], "durationSeconds": None,
              "dimensions": [], "playbackStatus": "UNTESTED"}

    def walk(start: int, end: int, depth: int = 0):
        if depth > 12:
            raise ValueError("MP4 nesting limit")
        pos = start
        while pos + 8 <= end:
            size, kind = struct.unpack_from(">I4s", data, pos)
            header = 8
            if size == 1:
                if pos + 16 > end:
                    raise ValueError("Truncated extended MP4 box")
                size = struct.unpack_from(">Q", data, pos + 8)[0]
                header = 16
            if size == 0:
                size = end - pos
            if size < header or pos + size > end:
                raise ValueError("Invalid MP4 box length")
            body = pos + header
            if kind in (b"moov", b"trak", b"mdia", b"minf", b"stbl"):
                walk(body, pos + size, depth + 1)
            elif kind == b"mvhd" and size >= header + 20:
                version = data[body]
                offset = body + (20 if version == 1 else 12)
                required = 12 if version == 1 else 8
                if offset + required > pos + size:
                    raise ValueError("Truncated movie header")
                scale = struct.unpack_from(">I", data, offset)[0]
                duration = struct.unpack_from(">Q" if version == 1 else ">I", data, offset + 4)[0]
                if scale:
                    result["durationSeconds"] = duration / scale
            elif kind == b"stsd" and size >= header + 8:
                count = struct.unpack_from(">I", data, body + 4)[0]
                if count > 100:
                    raise ValueError("Too many sample entries")
                entry = body + 8
                for _ in range(count):
                    if entry + 8 > pos + size:
                        raise ValueError("Truncated sample entry")
                    length, codec = struct.unpack_from(">I4s", data, entry)
                    if length < 8 or entry + length > pos + size:
                        raise ValueError("Invalid sample entry")
                    result["sampleEntryIds"].append(codec.decode("ascii", errors="replace"))
                    if codec in (b"avc1", b"avc3", b"hvc1", b"hev1", b"mp4v") and length >= 36:
                        width, height = struct.unpack_from(">HH", data, entry + 32)
                        result["dimensions"].append({"width": width, "height": height})
                    entry += length
            pos += size
    walk(0, len(data))
    return result


def identify(data: bytes, name: str) -> dict:
    result = {"format": "UNKNOWN", "mediaType": "application/octet-stream"}
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        w, h = struct.unpack_from(">II", data, 16)
        result.update(format="PNG", mediaType="image/png", width=w, height=h)
    elif data.startswith(b"\xff\xd8\xff"):
        result.update(format="JPEG", mediaType="image/jpeg")
    elif len(data) >= 12 and data[4:8] == b"ftyp":
        result.update(format="ISO-BMFF", mediaType="video/mp4", mp4=mp4_metadata(data))
    elif data.startswith(b"PK\x03\x04"):
        result.update(format="ZIP", mediaType="application/zip")
    elif data.lstrip(b"\xef\xbb\xbf \r\n\t").startswith(b"<?xml"):
        result.update(format="XML", mediaType="application/xml")
    # RSF/RGF stay UNKNOWN binary unless a dedicated format parser verifies them.
    result["extension"] = PurePosixPath(name).suffix.lower()
    return result


def analyze_program(data: bytes) -> dict:
    root = xml(data)
    nodes, wires = [], []
    for element in root.iter():
        kind = tag(element)
        if kind in ("StartBlock", "ConfigurableMethodCall"):
            values = {}
            for child in element:
                if tag(child) == "ConfigurableMethodTerminal":
                    terminal = next((t for t in child if tag(t) == "Terminal"), None)
                    if terminal is not None:
                        values[terminal.attrib["Id"]] = child.attrib.get("ConfiguredValue")
            nodes.append({"id": element.attrib["Id"], "kind": kind,
                          "target": element.attrib.get("Target"), "configuredValues": values})
        elif kind == "Wire":
            joints = re.findall(r"N\(([^:()]+):([^()]+)\)", element.attrib.get("Joints", ""))
            wires.append({"id": element.attrib["Id"], "joints": joints})
    edges = []
    for wire in wires:
        outputs = [n for n, terminal in wire["joints"] if terminal == "SequenceOut"]
        inputs = [n for n, terminal in wire["joints"] if terminal == "SequenceIn"]
        edges.extend({"from": a, "to": b, "wire": wire["id"]} for a in outputs for b in inputs)
    return {"format": "NI SourceModel XML", "rootVersion": root.attrib.get("Version"),
            "nodes": nodes, "sequenceEdges": edges, "wires": wires,
            "executionStatus": "UNTESTED", "conversionStatus": "REFERENCE_ONLY"}


def inspect(installation: Path, pack: int, mission: int, locale: str) -> dict:
    installation = installation.resolve(strict=True)
    scratch = Path(tempfile.mkdtemp(prefix="ev3-mission-copy-"))
    copied = {}

    def copy(relative: str) -> bytes | None:
        relative = safe_relative(relative)
        if relative in copied:
            return copied[relative]
        source = (installation / relative).resolve()
        if not source.is_relative_to(installation):
            raise ValueError("Source escaped installation root")
        if not source.is_file():
            return None
        if source.stat().st_size > 128 * 1024 * 1024:
            raise ValueError("Source file exceeds copy limit")
        destination = scratch / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        copied[relative] = destination.read_bytes()
        return copied[relative]

    localized = f"Resources/ContentPacks/Retail/{safe_relative(locale)}/LEGO/pack{pack}"
    shared = f"Resources/ContentPacks/Retail/nonlocalized/LEGO/pack{pack}"
    archive_path = f"{localized}/projects/{mission}.ev3"
    data = copy(archive_path)
    if data is None:
        raise ValueError("Mission archive not found")
    members = read_archive(data)
    nested = read_archive(members["ActivityAssets.laz"]) if "ActivityAssets.laz" in members else {}
    assets = {}
    references, slides, private_texts = [], [], []

    def register(payload: bytes, source: str) -> str:
        digest = sha(payload)
        asset_id = "sha256:" + digest
        if asset_id not in assets:
            assets[asset_id] = {"id": asset_id, "sha256": digest, "size": len(payload),
                                "detected": identify(payload, source), "sources": [],
                                "payloadIncluded": False}
        if source not in assets[asset_id]["sources"]:
            assets[asset_id]["sources"].append(source)
        return asset_id

    def resolve(value: str, locator: str, role: str, pack_root: bool = False) -> dict:
        value = safe_relative(value)
        candidates = []
        if value in members:
            candidates.append((members[value], f"{archive_path}!{value}"))
        if value in nested:
            candidates.append((nested[value], f"{archive_path}!ActivityAssets.laz!{value}"))
        folders = (localized, shared) if pack_root else (f"{localized}/projects", f"{shared}/projects")
        for folder in folders:
            payload = copy(folder + "/" + value)
            if payload is not None:
                candidates.append((payload, folder + "/" + value))
        ids = list(dict.fromkeys(register(payload, source) for payload, source in candidates))
        record = {"originalReference": value, "locator": locator, "role": role,
                  "candidateAssetIds": ids,
                  "status": "MISSING" if not ids else "RESOLVED" if len(ids) == 1 else "AMBIGUOUS"}
        references.append(record)
        return record

    activity = xml(members["Activity.x3a"])
    slide_elements = [e for e in activity.iter() if tag(e) == "Slide"]
    for index, slide in enumerate(slide_elements):
        locator = f"{archive_path}!Activity.x3a#/Slides/Slide[{index}]"
        info = {"index": index, "sourceLocator": locator, "name": slide.attrib.get("SlideName"),
                "nextButtonEnabled": slide.attrib.get("NextButtonEnabled"),
                "template": slide.attrib.get("TemplateID"), "controls": [], "actions": []}
        for ci, control in enumerate(slide):
            if tag(control) != "SimpleData":
                continue
            location = f"{locator}/SimpleData[{ci}]"
            text = " ".join(control.itertext()).strip()
            record = {"type": control.attrib.get("UniqueID"), "sourceLocator": location,
                      "references": []}
            if text:
                record["text"] = {"sha256": sha(text.encode("utf-8")), "characters": len(text),
                                  "payloadIncluded": False}
                private_texts.append({"sourceLocator": location, "text": text})
            for element in control.iter():
                for key, value in element.attrib.items():
                    if value and (key in ("src", "image", "scrolloverimage", "VideoFileName", "ImageOverlayFileName") or key.startswith("ImageKey")):
                        record["references"].append(resolve(value, location + "/@" + key, key))
                    if key == "action" and value:
                        info["actions"].append({"sourceLocator": location, "value": value,
                                                "executionAllowed": False})
            # Numeric order is explicit; lexical ImageKey order is incorrect.
            record["buildImages"] = [{"index": int(key[8:]), "reference": value}
                                      for key, value in control.attrib.items() if re.fullmatch(r"ImageKey\d+", key)]
            record["buildImages"].sort(key=lambda item: item["index"])
            info["controls"].append(record)
        if slide.attrib.get("OnSlideChanged"):
            info["actions"].append({"sourceLocator": locator + "/@OnSlideChanged",
                                    "value": slide.attrib["OnSlideChanged"], "executionAllowed": False})
        slides.append(info)

    programs = {}
    for name, payload in members.items():
        register(payload, f"{archive_path}!{name}")
        if name.endswith(".ev3p"):
            programs[name] = analyze_program(payload)
            for node in programs[name]["nodes"]:
                target = (node["target"] or "").replace("\\", "")
                dependency = f"Resources/Blocks/LEGO/VIs/PBR/{target}"
                if target.endswith(".vix"):
                    content = copy(dependency)
                    node["definition"] = {"path": dependency, "status": "MISSING" if content is None else "LOCATED_NOT_DECODED"}
                    if content is not None:
                        register(content, dependency)
                for terminal, value in node["configuredValues"].items():
                    if terminal == "Filename" and value:
                        resolve(value + ".rgf", f"{archive_path}!{name}#node={node['id']}", "brick-image")
                    elif terminal == "Name" and value:
                        resolve(value + ".rsf", f"{archive_path}!{name}#node={node['id']}", "brick-sound")
    for member, role in (("___LinkProjectThumbnail", "thumbnail"), ("___LinkProjectVideo", "video")):
        if member in members:
            resolve(members[member].decode("utf-8-sig").strip(), f"{archive_path}!{member}", role)
    # Related robot overview and manifest are recorded, not imported as mission steps.
    related = []
    for relative in (localized + "/pack.xml", localized + "/projects/0.ev3"):
        payload = copy(relative)
        if payload is not None:
            related.append({"path": relative, "sha256": sha(payload), "size": len(payload)})
            register(payload, relative)
            if relative.endswith("pack.xml"):
                pack_xml = xml(payload)
                for element in pack_xml.iter():
                    if element.attrib.get("src"):
                        resolve(element.attrib["src"], relative + "#" + tag(element), "robot-cover", pack_root=True)
            elif relative.endswith("0.ev3"):
                overview = read_archive(payload)
                for member, role in (("___LinkProjectThumbnail", "robot-thumbnail"), ("___LinkProjectVideo", "robot-intro-video")):
                    if member in overview:
                        resolve(overview[member].decode("utf-8-sig").strip(), relative + "!" + member, role)
    # A small structural comparison establishes actual sharing; no sibling payloads
    # enter the report and nothing is imported into a library.
    sharing = {}
    names = {r["originalReference"] for r in references}
    for sibling in sorted((installation / localized / "projects").glob("*.ev3")):
        if sibling.name in (f"{mission}.ev3", "0.ev3"):
            continue
        relative = sibling.relative_to(installation).as_posix()
        sibling_members = read_archive(copy(relative))
        sibling_nested = read_archive(sibling_members["ActivityAssets.laz"]) if "ActivityAssets.laz" in sibling_members else {}
        if "Activity.x3a" not in sibling_members:
            continue
        sibling_names = {v for e in xml(sibling_members["Activity.x3a"]).iter() for k, v in e.attrib.items()
                         if k in ("src", "image", "scrolloverimage", "VideoFileName", "ImageOverlayFileName") or k.startswith("ImageKey")}
        for name in names & sibling_names:
            for payload in (sibling_members.get(name), sibling_nested.get(name), copy(f"{shared}/projects/{name}")):
                if payload is not None and "sha256:" + sha(payload) in assets:
                    sharing.setdefault("sha256:" + sha(payload), set()).add(relative)
    for asset_id, consumers in sharing.items():
        assets[asset_id]["alsoReferencedBy"] = sorted(consumers)
    action_dependencies = []
    for action in sorted({a["value"] for slide in slides for a in slide["actions"]}):
        verb, value = action.split(":", 1)
        dependency = {"action": action, "executionAllowed": False, "status": "UNKNOWN"}
        if verb == "NavigateActivity-GoToNamedSlide":
            dependency.update(status="RESOLVED", targetSlideIndices=[s["index"] for s in slides if s["name"] == value])
            if not dependency["targetSlideIndices"]:
                dependency["status"] = "MISSING"
        elif verb == "GoToProgram":
            dependency["status"] = "RESOLVED" if value in programs else "MISSING"
            dependency["program"] = value
        elif verb == "ShowPaletteItem":
            dependency.update(status="LEGACY_UI_ACTION", paletteItem=value)
        elif verb == "OpenProjectTemplate":
            clean = value.replace("\\", "")
            relative = "Resources/ContentPacks/Retail/" + locale + "/" + clean.split("://", 1)[1]
            payload = copy(relative)
            dependency.update(status="LOCATED_NOT_IMPORTED" if payload is not None else "MISSING", path=relative)
            if payload is not None:
                dependency["sha256"] = sha(payload)
        elif verb == "OpenWebsite":
            clean = value.replace("\\", "")
            if "ev3_user_guide.pdf" in clean:
                relative = f"Resources/EditorHelp/Retail/{locale}/ev3_user_guide.pdf"
                payload = copy(relative)
                dependency.update(status="LOCATED_NOT_RENDERED" if payload is not None else "MISSING", path=relative, fragment=clean.split("#", 1)[-1])
                if payload is not None:
                    dependency["assetId"] = register(payload, relative)
            else:
                dependency.update(status="UNKNOWN_HELP_RESOLUTION", legacyUri=clean)
        action_dependencies.append(dependency)
    (scratch / "private-texts.json").write_text(json.dumps(private_texts, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"reportVersion": 1, "tool": "inspect_home_mission.py", "status": "VERIFIED_STATIC",
            "scope": "one Home mission; no asset payloads; no execution or conversion",
            "source": {"product": "EV3 Home", "locale": locale, "pack": pack, "mission": mission,
                       "originalPath": archive_path, "sha256": sha(data), "size": len(data)},
            "archiveEntries": [{"name": name, "size": len(payload), "sha256": sha(payload)} for name, payload in members.items()],
            "slides": slides, "assets": list(assets.values()), "references": references,
            "programs": programs, "relatedSources": related, "actionDependencies": action_dependencies,
            "summary": {"slides": len(slides), "uniqueAssets": len(assets),
                        "references": len(references), "missing": sum(r["status"] == "MISSING" for r in references),
                        "ambiguous": sum(r["status"] == "AMBIGUOUS" for r in references)},
            "privateScratchDirectory": str(scratch)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--installation", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="Metadata JSON only; no source assets/text")
    parser.add_argument("--pack", type=int, default=0)
    parser.add_argument("--mission", type=int, default=1)
    parser.add_argument("--locale", default="en-US")
    args = parser.parse_args()
    if args.pack < 0 or args.mission < 1:
        parser.error("pack must be nonnegative and mission must be positive")
    output = args.output.resolve()
    installation = args.installation.resolve()
    if output.is_relative_to(installation):
        parser.error("Output must be outside the original installation")
    report = inspect(installation, args.pack, args.mission, args.locale)
    scratch = report.pop("privateScratchDirectory")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "summary": report["summary"], "privateScratchDirectory": scratch}))


if __name__ == "__main__":
    main()
