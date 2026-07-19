# Cloud Convex Setup

## What changed

Configured Little Better to use a Convex cloud development deployment.

- Team: `dinesh-baghel`
- Project: `little-better`
- Deployment: `dev:fleet-hyena-603`
- Client URL: `https://fleet-hyena-603.convex.cloud`
- Site URL: `https://fleet-hyena-603.convex.site`
- Dashboard: `https://dashboard.convex.dev/t/dinesh-baghel/little-better/fleet-hyena-603`

## Commands run

- `npx convex login status`
- `npx convex dev --configure existing --team dinesh-baghel --project little-better --dev-deployment cloud --once`
- `npx convex run health:status`
- `npm run typecheck`
- `npm run lint`

## Verification

- Convex cloud push succeeded.
- `health:status` returned `{ ok: true, message: "Connected to Little Better backend." }`.
- TypeScript passed.
- ESLint passed.

## Notes

- `apps/mobile/.env.local` now points to cloud Convex and remains ignored.
- `apps/mobile/.convex/local` remains ignored local runtime state from the earlier local setup.
- Convex generated nested AI helper files under `apps/mobile`; `AGENTS.md`, `CLAUDE.md`, `.agents`, `.claude`, `skills-lock.json`, and `convex/_generated/ai` were removed from the app so repo-level agent guidance stays at the project root.
