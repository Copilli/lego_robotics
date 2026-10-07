# Classroom UI visual reference — 2026-10-07

The Classroom UI has now been inspected from downloaded screenshots, rather than inferred from legacy EV3 Home/Lab or Google Classroom. This does not establish the internal technology or installed version of Classroom.

## Visually observed

- Home: horizontal navigation Home, Start, Units, Build, My Projects; a large Start Here area with a START button; recent project tiles including New Project; cards for Unit Plans and Core Set Models.
- Start: a Getting Started collection with three numbered cards: Hello World / Creating Your First Program; Motors and Sensors / Controlling Inputs and Outputs; Get Moving / Building a Driving Base. Teacher Preparation appears below.
- The Microsoft Store image shows the Start collection inside a large rounded white panel over the editor. The independent macOS Home screenshot identifies Classroom 1.0.0. They are references to particular versions, not evidence that every platform/version has an identical UI.

## Sources actually inspected

1. Microsoft Store publisher screenshot, downloaded successfully with PowerShell and visually inspected: https://store-images.s-microsoft.com/image/apps.24845.14086258459920702.3fb25059-75f8-47f4-9e7b-8b52ad5fad8d.953585db-d6d5-4206-844e-7c62edae592f. App listing: https://apps.microsoft.com/detail/9p8sjvzm63sz.
2. Independent macOS Home screenshot: https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/139365/32ece064-3b5a-80d1-6f2d-7160060de07f.png. Article: https://qiita.com/niwasawa/items/f0f8f20a678b18f06f16.

Inspection copies are in the ignored `test-results/ui-reference` directory. They are reference material and are not included as product artwork.

## Local discovery

Repeated Get-StartApps, current-user Get-AppxPackage, uninstall registry checks and top-level Program Files/LocalAppData Programs searches identify EV3 Home 1.4.4, EV3 Education/Lab 1.4.16 and SPIKE 3.6.1. No Classroom installation was identified by those checks. This does not prove it is absent from another user profile, a portable installation, or an unregistered folder.

## Implication for the prototype

The current four-step inline first-program guide is an independent implementation, not a faithful copy of the observed Classroom flow. Matching the reference requires an intermediate Start collection with three activity cards before opening a particular guided editor. No such matching change is claimed by this research note.
