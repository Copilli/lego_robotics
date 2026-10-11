"""Synthetic fixtures only: no LEGO payloads or installed-app dependencies."""
import importlib.util
import io
from pathlib import Path
import struct
import unittest
import zipfile

SPEC = importlib.util.spec_from_file_location("inspection", Path(__file__).parents[1] / "tools" / "inspect_home_mission.py")
inspection = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(inspection)


def archive(entries):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w") as z:
        for name, data in entries:
            z.writestr(name, data)
    return stream.getvalue()


class InspectionSafetyTests(unittest.TestCase):
    def test_rejects_archive_path_escape(self):
        for name in ("../outside.txt", "/absolute.txt", "C:/outside.txt", "..\\outside.txt"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                inspection.read_archive(archive([(name, b"test")]))

    def test_rejects_duplicate_names(self):
        with self.assertRaises(ValueError):
            inspection.read_archive(archive([("one.xml", b"a"), ("one.xml", b"b")]))

    def test_rejects_symlink_entry(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, "w") as z:
            entry = zipfile.ZipInfo("link")
            entry.create_system = 3
            entry.external_attr = 0o120777 << 16
            z.writestr(entry, "target")
        with self.assertRaises(ValueError):
            inspection.read_archive(stream.getvalue())

    def test_rejects_oversized_archive_before_reading(self):
        old = inspection.MAX_MEMBER
        try:
            inspection.MAX_MEMBER = 3
            with self.assertRaises(ValueError):
                inspection.read_archive(archive([("large", b"1234")]))
        finally:
            inspection.MAX_MEMBER = old

    def test_rejects_xml_entities_in_utf8_and_utf16(self):
        text = '<!DOCTYPE root [<!ENTITY data "bad">]><root>&data;</root>'
        for encoding in ("utf-8", "utf-16"):
            with self.subTest(encoding=encoding), self.assertRaises(ValueError):
                inspection.xml(text.encode(encoding))

    def test_signature_overrides_misleading_extension(self):
        png = b"\x89PNG\r\n\x1a\n" + b"\x00\x00\x00\x0dIHDR" + struct.pack(">II", 20, 30)
        info = inspection.identify(png, "thumbnail.jpg")
        self.assertEqual((info["format"], info["width"], info["height"]), ("PNG", 20, 30))

    def test_invalid_mp4_length_is_rejected(self):
        with self.assertRaises(ValueError):
            inspection.mp4_metadata(struct.pack(">I4s", 100, b"moov"))

    def test_program_order_comes_from_wires_not_xml_position(self):
        data = b'''<SourceFile xmlns="urn:synthetic" Version="test">
        <ConfigurableMethodCall Id="second" Target="motor.vix">
          <ConfigurableMethodTerminal ConfiguredValue="B+C"><Terminal Id="Ports" /></ConfigurableMethodTerminal>
        </ConfigurableMethodCall>
        <StartBlock Id="first" Target="start" />
        <Wire Id="w1" Joints="N(first:SequenceOut) N(second:SequenceIn)" />
        </SourceFile>'''
        program = inspection.analyze_program(data)
        self.assertEqual(program["sequenceEdges"], [{"from": "first", "to": "second", "wire": "w1"}])
        self.assertEqual(program["nodes"][0]["configuredValues"]["Ports"], "B+C")
        self.assertEqual(program["executionStatus"], "UNTESTED")


if __name__ == "__main__":
    unittest.main()
