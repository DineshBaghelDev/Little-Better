# Expo Application Resolver Fix

## 2026-07-20

- Investigated Metro error: `Unable to resolve "./Application.types" from expo-application/build/Application.js`.
- Verified `expo-application@57.0.2` includes `build/Application.types.js`.
- `npx expo export --platform android` bundled successfully after dependency cleanup.
- Root cause was a workspace React mismatch: Expo SDK 57 expects React/React DOM `19.2.3`, while the hoisted root install had `19.2.7`.
- Pinned React and React DOM to `19.2.3` in the mobile app and root workspace, with root `overrides` to keep Metro resolving one SDK-compatible copy.
