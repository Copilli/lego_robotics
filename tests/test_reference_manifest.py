"""Metadata-only regression checks: no installation or copyrighted payloads."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validation", ROOT / "tools/validate_track3r_example.py")
validation = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validation)


class ReferenceManifestTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.example = json.loads((ROOT / "docs/content/track3r-01.manifest.example.json").read_text(encoding="utf-8"))
        cls.report = json.loads((ROOT / "docs/research/evidence/track3r-01.inspection.json").read_text(encoding="utf-8"))

    def test_reference_is_traceable(self):
        self.assertEqual(validation.validate(self.example, self.report)["reachableSteps"], 22)

    def assert_rejected(self, change):
        candidate = copy.deepcopy(self.example)
        change(candidate)
        with self.assertRaises(ValueError):
            validation.validate(candidate, self.report)

    def test_rejects_lost_programming_route(self):
        self.assert_rejected(lambda m: m["steps"][2].update(next=["s03"]))

    def test_rejects_terminal_fallthrough(self):
        self.assert_rejected(lambda m: m["steps"][8].update(next=["s09"]))

    def test_rejects_changed_build_order(self):
        self.assert_rejected(lambda m: m["steps"][1]["buildSequence"].reverse())

    def test_rejects_payload_in_public_reference(self):
        self.assert_rejected(lambda m: m["assets"][0].update(payloadPath="media/original.png"))

    def test_rejects_changed_provenance(self):
        self.assert_rejected(lambda m: m["assets"][0].update(sha256="0" * 64))

    def test_rejects_duplicate_source_slide(self):
        self.assert_rejected(lambda m: m["steps"][1].update(sourceSlideIndex=0))

    def test_rejects_inconsistent_branch_choices(self):
        self.assert_rejected(lambda m: m["steps"][2]["choices"][0].update(next="s09"))


if __name__ == "__main__":
    unittest.main()
