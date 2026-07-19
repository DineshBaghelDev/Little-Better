# Little Better Initial Setup

## Tech requirements

- Mobile: React Native with Expo prebuild support.
- Routing: Expo Router.
- Backend: Convex under `apps/mobile/convex`.
- Package management: Bun-ready workspace scripts; npm used locally because Bun is not installed on this machine.
- Environment: `EXPO_PUBLIC_CONVEX_URL` in `apps/mobile/.env`.
- Design baseline: product palette from the design document, calm card shell, bottom tabs for Today, Calendar, Add, Money, and Progress.

## Architecture decisions

- Monorepo root owns workspace scripts.
- The mobile app lives in `apps/mobile`.
- Convex lives inside the mobile workspace so generated Convex types can be imported by the app without a shared package.
- Agent and AI guidance lives at the project root: `AGENTS.md`, `CLAUDE.md`, and `.claude/settings.json`.
- No `ios/` or `android/` folders were generated; Expo prebuild remains available when native projects are needed.
- No auth, push notification implementation, native integrations, or detailed feature logic were added during setup.
- Convex was first configured locally, then switched to the cloud development deployment after login.

## Commands used

- `npx create-expo-app@latest apps/mobile --template blank-typescript --yes`
- `npm install --save expo-router convex react-native-safe-area-context react-native-screens react-native-gesture-handler @expo/vector-icons`
- `npm install --save-dev eslint prettier`
- `npm install react-dom@19.2.3 react-native-gesture-handler@~2.32.0 react-native-safe-area-context@~5.7.0 react-native-screens@4.25.2 --save --legacy-peer-deps`
- `npx expo install react-native-web -- --legacy-peer-deps`
- `npm install --workspace apps/mobile expo-linking --save --legacy-peer-deps`
- `CONVEX_AGENT_MODE=anonymous npx convex dev --once`
- `npx convex whoami` was attempted to check cloud login state, but this Convex CLI version does not provide that command.
- `npx convex login status`
- `npx convex dev --configure existing --team dinesh-baghel --project little-better --dev-deployment cloud --once`
- `npx convex run health:status`

## Follow-up cleanup

- Moved scaffolded `AGENTS.md`, `CLAUDE.md`, and Claude settings from `apps/mobile` to the project root.
- Removed the app-local `package-lock.json`; the root lockfile owns workspace installs.
- Kept `apps/mobile/.convex/local` and `.env.local` ignored because they are local runtime/deployment state.

## Cloud Convex deployment

- Team: `dinesh-baghel`
- Project: `little-better`
- Deployment: `dev:fleet-hyena-603`
- Client URL: `https://fleet-hyena-603.convex.cloud`
- Site URL: `https://fleet-hyena-603.convex.site`
- Dashboard: `https://dashboard.convex.dev/t/dinesh-baghel/little-better/fleet-hyena-603`

## Known next steps

- Install Bun locally, then run `bun install`.
- Run `npx convex dev` from `apps/mobile` to create the Convex deployment and `.env`.
- Run `bun dev:mobile` from the repo root to launch Expo.
- Replace setup placeholder cards with the feature specs for Today ranking, focus sessions, money confirmations, reflection, and weekly insights.
