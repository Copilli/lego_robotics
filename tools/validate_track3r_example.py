"""Check the draft example's graph, provenance and content boundaries."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def validate(manifest, report):
    if manifest["profile"] != "reference-example" or manifest["runtime"]["executionAllowed"]:
        raise ValueError("Example must not be executable")
    if manifest["rights"]["assetPayloadsIncluded"] or manifest["runtime"]["workspace"] is not None:
        raise ValueError("Reference example must not contain content or a workspace")
    if manifest["source"]["sha256"] != report["source"]["sha256"]:
        raise ValueError("Source hash mismatch")
    assets = {a["id"]: a for a in manifest["assets"]}
    expected = {a["id"]: a for a in report["assets"]}
    if len(assets) != len(manifest["assets"]) or assets.keys() != expected.keys():
        raise ValueError("Missing or duplicate assets")
    for key, asset in assets.items():
        if asset["payloadPath"] is not None or asset["rights"]["redistribution"] != "UNKNOWN":
            raise ValueError("Payload or rights boundary changed")
        if asset["sha256"] != expected[key]["sha256"] or asset["sourceLocators"] != expected[key]["sources"]:
            raise ValueError("Asset provenance mismatch")
    steps = {s["id"]: s for s in manifest["steps"]}
    if len(steps) != 22 or len(manifest["steps"]) != 22:
        raise ValueError("All 22 source slides must remain traceable")
    if {s["sourceSlideIndex"] for s in steps.values()} != set(range(22)):
        raise ValueError("Source slide coverage is incomplete or duplicated")
    for step in steps.values():
        original = report["slides"][step["sourceSlideIndex"]]
        if step["sourceLocator"] != original["sourceLocator"] or step["executionAllowed"]:
            raise ValueError("Step provenance or execution boundary changed")
        if any(ref not in assets for ref in step["assetIds"]) or any(n not in steps for n in step["next"]):
            raise ValueError("Broken graph reference")
        if any(t["normalizedPayload"] is not None for t in step["textBindings"]):
            raise ValueError("Proprietary text payload in reference example")
    if steps["s02"]["next"] != ["s03", "s09"]:
        raise ValueError("Programming branch lost")
    if [choice["next"] for choice in steps["s02"]["choices"]] != steps["s02"]["next"]:
        raise ValueError("Branch choices disagree with graph edges")
    if steps["s08"]["next"] or steps["s21"]["next"]:
        raise ValueError("Branch completion must not fall through to another route")
    visited, pending = set(), [manifest["entryStep"]]
    while pending:
        current = pending.pop()
        if current not in visited:
            visited.add(current)
            pending.extend(steps[current]["next"])
    if visited != steps.keys():
        raise ValueError("Unreachable lesson steps")
    sequence = steps["s01"]["buildSequence"]
    if [x["ordinal"] for x in sequence] != list(range(48)):
        raise ValueError("Construction image order lost")
    for item in sequence:
        if not any(s.endswith(f"/bi_1_{item['ordinal'] + 1}.jpg") for s in assets[item["assetId"]]["sourceLocators"]):
            raise ValueError("Construction image mapping changed")
    if report["summary"]["missing"] or report["summary"]["ambiguous"]:
        raise ValueError("Unresolved media references in inspected mission")
    return {"slides": len(steps), "assets": len(assets), "buildImages": len(sequence), "reachableSteps": len(visited)}


if __name__ == "__main__":
    manifest = json.loads((ROOT / "docs/content/track3r-01.manifest.example.json").read_text(encoding="utf-8"))
    report = json.loads((ROOT / "docs/research/evidence/track3r-01.inspection.json").read_text(encoding="utf-8"))
    print("VALID:", validate(manifest, report))
