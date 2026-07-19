# React Version Alignment

Date: 2026-07-19

## Job

Fixed the Expo web runtime error caused by `react` and `react-dom` resolving to different patch versions.

## Decision

Pinned both packages in `apps/mobile/package.json` to `19.2.7`, matching the version already selected by the dependency tree. This avoids duplicate React DOM installs and satisfies React DOM's exact runtime compatibility check.

## Validation

- `npm ls react react-dom --workspace apps/mobile`
- `npm run typecheck`
