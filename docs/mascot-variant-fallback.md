# Mascot variant fallback

- Fixed a runtime crash when `Mascot` receives an unknown or stale variant string.
- Kept the fix in the shared mascot renderer so every caller falls back to the calm Sprout frame.
