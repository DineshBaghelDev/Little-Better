# Spec 07-17 Implementation Log

## 2026-07-20

- Created branch `implement-specs-07-17`.
- Started with spec 07 because Today ranking is the app's core shared flow.
- Moved Today ranking rules into `convex/core.ts` so screens do not rank raw tasks locally.
- Added calendar-day and calendar-week boundaries for Today and focus target progress.
- Added Today budget-overage alert data for spec 08 because it shares the Today payload.
- Added task completion undo mutation and rendered Undo on Today.
- Added task Details and Reschedule actions on ranked Today task cards.
