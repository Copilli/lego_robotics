"""Generate a reference-only design example, not a content import or converter."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "docs/research/evidence/track3r-01.inspection.json"
OUTPUT = ROOT / "docs/content/track3r-01.manifest.example.json"


def build(report):
    def asset_ending(suffix):
        matches = [a["id"] for a in report["assets"] if any(s.endswith(suffix) for s in a["sources"])]
        if len(set(matches)) != 1:
            raise ValueError(f"Expected one asset: {suffix}")
        return matches[0]

    kinds = ["VIDEO", "BUILD", "PROGRAMMING", "HARDWARE_CONNECTION", "PROGRAM_TRANSFER",
             "TEST", "EXECUTION", "TEST", "TEXT", "PROGRAMMING", "PROGRAMMING", "PROGRAMMING",
             "PROGRAMMING", "PROGRAMMING", "PROGRAMMING", "HARDWARE_CONNECTION", "PROGRAM_TRANSFER",
             "TEST", "EXECUTION", "TEST", "QUESTION", "TEXT"]
    labels = ["Mission objective", "Build TRACK3R", "Choose a programming route", "Connect robot",
              "Transfer reference program", "Prepare the mission area", "Run reference program",
              "Compare robot and video", "Extension advice and completion", "Start guided programming",
              "Add display", "Add forward movement", "Add attachment movement", "Add return movement",
              "Add sound", "Connect robot", "Transfer learner program", "Prepare the mission area",
              "Run learner program", "Compare robot and video", "Diagnose movement", "Extension advice and completion"]
    steps = []
    for slide in report["slides"]:
        i = slide["index"]
        refs = list(dict.fromkeys(a for c in slide["controls"] for r in c["references"] for a in r["candidateAssetIds"]))
        text = [{"sourceLocator": c["sourceLocator"], **c["text"], "normalizedPayload": None}
                for c in slide["controls"] if "text" in c]
        step = {"id": f"s{i:02}", "type": kinds[i], "label": labels[i], "labelOrigin": "ev3-studio",
                "sourceSlideIndex": i, "sourceLocator": slide["sourceLocator"], "assetIds": refs,
                "textBindings": text, "legacyActions": {"disposition": "inert-provenance-only"},
                "next": [] if i in (8, 21) else [f"s{i + 1:02}"], "executionAllowed": False}
        if i == 2:
            step["next"] = ["s03", "s09"]
            step["choices"] = [{"route": "reference-program", "next": "s03"}, {"route": "guided-programming", "next": "s09"}]
        build_images = [x for c in slide["controls"] for x in c["buildImages"]]
        if build_images:
            step["buildSequence"] = [{"ordinal": item["index"], "assetId": asset_ending("/" + item["reference"])} for item in build_images]
        if i in (3, 9):
            step["programReference"] = asset_ending("!" + ("TRACK3R 01.ev3p" if i == 3 else "Program.ev3p"))
        steps.append(step)
    assets = [{"id": a["id"], "sha256": a["sha256"], "size": a["size"],
               "mediaType": a["detected"]["mediaType"], "sourceLocators": a["sources"],
               "alsoReferencedBy": a.get("alsoReferencedBy", []), "payloadPath": None,
               "rights": {"localImport": "USER_AUTHORIZATION_REQUIRED", "redistribution": "UNKNOWN"}}
              for a in report["assets"]]
    return {"schemaVersion": "0.1-draft", "profile": "reference-example", "status": "PLANNED",
            "id": "ev3-home.track3r.mission-01.en-US", "kind": "mission", "robotId": "track3r",
            "title": {"en-US": "TRACK3R Mission 01"}, "locale": "en-US", "entryStep": "s00",
            "source": {"type": "lego-original", "product": "EV3 Home", "sourceAppVersion": "1.4.4",
                       "robot": "TRACK3R", "mission": "01", "installationRoot": "${EV3_HOME_INSTALLATION}",
                       "originalPath": report["source"]["originalPath"], "originalResourceId": "Retail/en-US/LEGO/pack0/projects/1.ev3",
                       "sha256": report["source"]["sha256"]},
            "rights": {"redistribution": "UNKNOWN", "assetPayloadsIncluded": False},
            "runtime": {"executionAllowed": False, "workspace": None, "programConversion": "REFERENCE_ONLY"},
            "hardware": {"outputs": [{"ports": ["B", "C"], "type": "large-motor", "status": "EXPERIMENTAL", "basis": "MoveDistanceRotations B+C and robot description"},
                                      {"ports": ["A"], "type": "medium-motor", "status": "VERIFIED_STATIC", "basis": "MediumMotorDistanceRotations A"}],
                         "sensorOperations": [], "physicalSensorInventory": "UNKNOWN", "brickFeatures": ["display", "sound"],
                         "materials": ["mission-pad", "tire", "bi-blade-attachment"], "materialsBasis": "activity-text"},
            "robotContext": {"introVideo": asset_ending("/0_ProjectVideo.wmv"), "thumbnail": asset_ending("/0_ProjectThumbnail.jpg"),
                             "includedInMissionFlow": False},
            "missionMedia": {"video": asset_ending("/1.mp4"), "thumbnail": asset_ending("/mission_1_hover.png")},
            "steps": steps, "assets": assets,
            "dependencies": report["actionDependencies"],
            "completion": {"mode": "learner-confirmation", "automaticAssessment": False, "nextMission": "track3r-02-not-imported"},
            "unknowns": ["hardware execution", "iPad playback", "legacy HTML help resolution", "production normalization",
                         "instruction image accessibility", "redistribution rights", "NI block execution semantics"]}


if __name__ == "__main__":
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(build(report), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Reference example written: {OUTPUT}")
