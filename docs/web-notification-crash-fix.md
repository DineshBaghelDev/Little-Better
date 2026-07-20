# Web notification crash fix

Date: 2026-07-20

## Issue

Expo web crashed during startup because `expo-notifications` exposed the JS API but did not provide the native-backed `ExpoNotifications.getLastNotificationResponse` method on web.

## Change

- Guarded local notification handler setup, response observation, and scheduling behind `Platform.OS !== "web"`.
- Kept notification behavior unchanged on native platforms.
- Removed web deprecation warnings for the mascot `pointerEvents` prop and dropdown `shadow*` styles.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npx expo export --platform web`
