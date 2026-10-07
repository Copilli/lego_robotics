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

The prototype now routes Home's Iniciar button to an intermediate activity collection, followed by the existing guided editor. It presents one app and one learning library. Home/Lab names are provenance metadata, not separate app sections. The collection uses the five currently implemented EV3 practices and a four-step beginner guide; it does not claim to reproduce all native Classroom activities or its three-card collection exactly.

## Additional Home/Lab/SPIKE visual checks

Downloaded and visually inspected the following screenshots on the same date:

- Home lobby: robot gallery, Quick Start/News/More Robots and resources including Getting Started, Software Overview, Content Editor and help. Screenshot: https://windows-cdn.softpedia.com/screenshots/LEGO-MINDSTORMS-EV3_1.jpg. Source page: https://www.softpedia.com/get/Programming/Other-Programming-Files/LEGO-MINDSTORMS-EV3.shtml.
- Education/Lab lobby: Start Here, New Project, Tutorials (Robot Educator), Building Instructions, with Prepare/Try/Use/Next Steps inside Start Here. Screenshot: https://ulusgizem.wordpress.com/wp-content/uploads/2019/10/lego-start-here-prepare.png. Source page: https://ulusgizem.wordpress.com/haftalar/3-basit-bir-robot-yapimi/lego-mindstorms-ev3-kurulum-ve-programlamaya-giris/.
- SPIKE Essential Start: side navigation Home/Start/Units/Build/My Projects and five numbered component/coding tutorial cards. Official LEGO image: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2129995f980293f6/624aaee887d5917f654aafb1/SPIKE_App_-_Essential_-_Tutorial_Activities.png. Official reference: https://education.lego.com/en-us/teacher-resources/lego-education-spike-essential/start-here/lego-education-spike-essential-start-here-play-student/.

These checks establish visible interface organization, not identical application internals, transport or content compatibility. SPIKE supplies the requested modern visual reference for the unified EV3 experience. Its screenshot does not prove the installed Windows version has an identical screen. Home/Lab screenshots were viewed online, not captured from a running local installation.
