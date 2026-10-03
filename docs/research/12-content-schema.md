# 12 — Draft content schema

**Status: PLANNED.** No original lesson pack was available to validate a model. This sketch describes a possible EV3 Studio interchange/library record; it is not the format of any LEGO application.

```json
{
  "schemaVersion": 1,
  "id": "source-product-activity-id",
  "kind": "lesson",
  "title": { "en": "Activity title" },
  "source": {
    "type": "lego-original",
    "product": "EV3 Home",
    "sourceAppVersion": "unknown",
    "importedAt": "2026-10-03T00:00:00Z"
  },
  "robotId": "robot-id",
  "requirements": {
    "hardware": ["large-motor", "infrared-sensor"],
    "softwareFeatures": []
  },
  "steps": [
    { "id": "intro", "type": "text", "content": { "en": "Introductory text." } },
    { "id": "build", "type": "build", "assetId": "build-id" },
    { "id": "program", "type": "programming", "workspaceAssetId": "workspace-id" }
  ],
  "assets": [
    {
      "id": "build-id",
      "mediaType": "application/json",
      "path": "assets/build.json",
      "sourcePath": "original/path-if-known",
      "sha256": "record-on-import"
    }
  ]
}
```

The production schema should use validated step types, stable IDs, relative packaged asset paths, localized content, explicit provenance per imported asset, and a schema migration policy. Unknown source metadata must remain unknown rather than being filled from guesses. Review licensing and redistribution separately from technical importability.
