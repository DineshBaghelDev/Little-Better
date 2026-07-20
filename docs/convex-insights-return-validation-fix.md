# Convex insights return validation fix

Date: 2026-07-20

## Issue

`core:insights` returned a raw `weeklyInsights` document as `currentInsight`, but the query's return validator expects a smaller preview object.

## Change

- Added a small mapper for persisted weekly insights.
- Returned the mapped preview for `currentInsight`, preserving computed insight behavior.

## Verification

- `npm run typecheck`
- `npm run lint`
- `CONVEX_AGENT_MODE=anonymous npx convex dev --once`
