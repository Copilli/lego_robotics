# 09 — Android connectivity

**Status: UNTESTED.** No Android tablet, EV3 brick, official app package, or device/API test was available.

Investigate supported Android versions, pairing flow, Bluetooth permissions and APIs, the actual EV3 profile, reconnect behavior, and Wi-Fi alternatives on representative tablets. Verify the same real-brick operations planned for iPad rather than inferring support from the existence of Android Bluetooth APIs.

| Candidate | Status |
| --- | --- |
| Browser / Web Bluetooth | UNTESTED |
| Capacitor with native Android plugin | UNTESTED |
| React Native native module | UNTESTED |
| Native Kotlin app | UNTESTED |
| Wi-Fi | UNTESTED |

Retain a common transport interface only after testing that it represents the verified operations and error cases on both mobile platforms.
