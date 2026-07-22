# Theming Pass, Form Restructure & Visual Audit

Date: 2026-07-23. Branch: `theming-and-forms` (merged to `main`).

Ran a full visual audit on Expo web (Chromium via Playwright, 390×844) and reworked
theming, forms, and shared primitives based on what the screenshots showed.

## Visual audit method

Started `expo start --web` and drove a headless Chromium to screenshot every screen
(Today, Plan, Money, Progress, Settings, Onboarding, Quick add + Expense, Focus,
Reflection). The active scheme in the dev data was **mustard**, which exposed the
theming defect immediately.

## Theming — now consistent

Before, only buttons, the tab bar, and the screen surface followed the selected color
scheme; card accents (rank badge reasons, links, chips, progress bars, event rails,
selected states, dropdown icons, focus ring) stayed sage green regardless. Under any
non-sage scheme the UI looked incoherent.

- Added `useAppearance()` in `ui.tsx` (wraps `settingsView` + `resolveAppearance`).
- Threaded the resolved accent through: Today (reason/link/round-action/icons),
  Money (progress bar, save), Progress (chips, money bars), Calendar (day pill, event
  rail, add-task, clock picker), Settings (goal cards, appearance pills, toggle,
  active), Quick add (chips, voice button, links), Onboarding, Reflection (selection),
  Focus (timer ring), and the shared `DatePickerField` / `CategoryDropdown`.
- Verified reactive: switching Settings → Lavender re-themes Today live end to end.

## Forms — restructured

The raw input stacks were the main complaint.

- **`HourField`** (new): tappable "5:00 PM" trigger opening a 12-hour grid, replacing
  the "type 17 for 5 PM" numeric inputs in Settings and Onboarding. Reflection field is
  constrained to 5 PM–11 PM to match the server clamp.
- **Onboarding**: rebuilt as labelled questions ("What do you want to focus on?", "How
  do you want to measure it?", "Weekly goal" with a unit suffix). Removed the
  non-interactive "preview" list that looked tappable but did nothing.
- **Amounts**: ₹ prefix / unit suffix on budget & goal fields; currency switched from
  "Rs" to ₹ across Today, Money, Progress.

## Removed / consolidated

- Four duplicated local `Chip` components → one themed `Chip` in `ui.tsx`.
- The misleading onboarding preview list.
- (Earlier pass) unused `ChoiceDropdown`.

## Functionality verified (on web)

- Add task via Quick add persists (appears in Plan / Today).
- Hour picker opens, selects, updates the trigger.
- Settings save persists (scheme change survives reload).
- Task completion works.
- No more react-native-web "nested button" warning (HourField modal restructured to a
  backdrop Pressable + sibling sheet View).
- `tsc --noEmit` and `eslint .` both pass.

## Not changed (minor, deferred)

- TransactionRow edit icon and Quick-add type-list icons keep the green accent
  (reads as semantic on their coloured tiles).
- Today "Reschedule" still moves to tomorrow 9 AM without an explicit toast.
