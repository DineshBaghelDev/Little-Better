# Project Agent Notes

This is a Bun-ready monorepo for the Little Better mobile app.

- Mobile app: `apps/mobile`
- Convex backend: `apps/mobile/convex`
- Product requirements and decision logs are local-only. Do not commit `docs/`, `specs/`, `project-requirements/`, or `.claude/`.

## Working Guidelines
- Create a new branch while working and merge it after done.
- Commit each completed logical change.
- Do not commit secrets, deployment URLs, credentials, local logs, APK artifacts, or personal screenshots.

## Expo

Expo has changed. Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before changing Expo-specific behavior.

## Convex

Run Convex commands from `apps/mobile`. Keep deployment details in local environment files only.
