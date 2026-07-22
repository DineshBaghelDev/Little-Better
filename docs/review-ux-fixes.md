# App Review & UX Fixes

Date: 2026-07-23. Branch: `review-ux-fixes`.

Reviewed the mobile app across usefulness, ease of use, design, and UX. The core
information architecture (Today ranking, Plan, quick Add, Money, Progress) is sound and
each screen has thoughtful empty states and accessibility roles. Findings and the fixes
applied below.

## Fixed

1. **Background patterns looked crude.** `Screen.tsx` drew the "sprouts / dots / stars"
   patterns as literal text glyphs (`~`, `.`, `*`), which read as stray punctuation.
   Replaced with flat drawn shapes — filled circles for dots, and `leaf` / `sparkles`
   Ionicons with gentle size and rotation variation for sprouts and stars, at low opacity.
   Matches the flat-2D, no-gradient visual-system guidance in spec 10.

2. **Today: the "Task completed / Undo" toast never went away.** `lastCompleted` was only
   cleared by pressing Undo, so the toast lingered indefinitely. Added a 5-second
   auto-dismiss (cleared on unmount).

3. **Today: "1 tasks" pluralization** in the Later-today summary. Now "1 task" / "N tasks".

4. **Calendar: rescheduling defaulted the time picker to 09:00.** Expanding a scheduled
   task to Move now pre-fills the picker with the task's current time.

5. **Removed dead code:** `src/components/ChoiceDropdown.tsx` was imported nowhere.

## Known limitation (follow-up, not fixed here)

- **Color scheme only partially applies.** The 5 appearance schemes (sage/teal/lavender/
  coral/mustard) currently drive the primary buttons, tab bar, and screen surface/pattern,
  but most in-card accents (rank badge, inline links, chips, progress bars, event rails,
  icons) still use the static sage `colors.primary`/`primaryDark`. Making the scheme fully
  consistent needs the resolved appearance threaded through the shared components / a theme
  provider. Left as a dedicated task to avoid layout regressions without a device run.

## Verification

- `tsc --noEmit` — passes.
- `eslint .` — passes.
- Not run on a device/simulator in this pass; changes are visual/state-only and low risk.
