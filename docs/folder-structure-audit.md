# Folder Structure Audit

## Current structure

- `AGENTS.md` and `CLAUDE.md`: root agent guidance for the whole monorepo.
- `.claude/settings.json`: root Claude/plugin settings.
- `apps/mobile`: Expo React Native app.
- `apps/mobile/app`: Expo Router routes.
- `apps/mobile/src`: mobile UI components and theme tokens.
- `apps/mobile/convex`: Convex schema, functions, and generated API types.
- `docs`: setup logs and project decisions.
- `project-requirements`: source product/design requirements.
- `specs`: implementation specs.

## Cleanup performed

- Moved scaffolded AI/agent files from `apps/mobile` to the project root.
- Removed Convex-generated nested AI helper files from `apps/mobile`; keep agent guidance at the root.
- Removed `apps/mobile/package-lock.json`; the root `package-lock.json` owns workspace installs.
- Kept app-specific Expo files in `apps/mobile`.
- Kept local runtime files ignored: `node_modules`, `.expo`, `.convex/local`, `.env.local`, and logs.

## Convex decision

Convex is now configured for the cloud development deployment.

- Team: `dinesh-baghel`
- Project: `little-better`
- Deployment: `dev:fleet-hyena-603`
- Client URL: `https://fleet-hyena-603.convex.cloud`
- Site URL: `https://fleet-hyena-603.convex.site`
- Dashboard: `https://dashboard.convex.dev/t/dinesh-baghel/little-better/fleet-hyena-603`

The app env file is `apps/mobile/.env.local`, which is intentionally ignored because it is local machine configuration.

## Verification after cleanup

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npx convex run health:status`: passed.
