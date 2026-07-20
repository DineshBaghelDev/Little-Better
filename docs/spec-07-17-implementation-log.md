# Spec 07-17 Implementation Log

## 2026-07-20

- Created branch `implement-specs-07-17`.
- Started with spec 07 because Today ranking is the app's core shared flow.
- Moved Today ranking rules into `convex/core.ts` so screens do not rank raw tasks locally.
- Added calendar-day and calendar-week boundaries for Today and focus target progress.
- Added Today budget-overage alert data for spec 08 because it shares the Today payload.
- Added task completion undo mutation and rendered Undo on Today.
- Added task Details and Reschedule actions on ranked Today task cards.
- Reworked Money so budget remaining is the first card, over-budget state is coral with the overage stated, pending confirmations sit above confirmed history, creation is no longer on the Money tab, and summaries are collapsed into a deeper view.
- Hid category management inside Money's edit dropdown while preserving it in Quick Add.
- Replaced filler weekly insights with a thresholded focus-time detector: five sessions minimum, at least three sessions in the strongest hour, and a two-session gap over the next strongest hour.
- Added persisted Apply, Edit, Dismiss, and Undo for weekly insights. Apply moves the focus category's preferred hour and stores the prior hour for undo after restart.
- Replaced the inline mascot image renderer with a flat React Native mascot component with calm, focus, reflection, completion, and pointing variants.
- Added shared typography tokens, changed the focus timer to a live segmented progress ring, and prevented Progress stat values from wrapping.
- Added persisted reflection skip/snooze state keyed by local date, with one snooze per night and empty Done treated as Skip.
- Added editable Settings for focus category, target type/value, preferred focus hour, reflection hour, and monthly budget.
- Fixed onboarding so the summary rows reflect live form state and bootstrap stores the selected target type.
- Implemented category switching by creating a new active focus category, preserving old category history.
- Reworked Calendar to use an anchored week with back/forward navigation, collapsed creation, tappable scheduled-task actions, explicit unscheduled-task time selection, and focus-session times.
- Added Expo Notifications using SDK 57 docs, a persisted reminders toggle, local scheduling for upcoming tasks/focus/reflection/pending expense/weekly insight, and notification-response deep links via Expo Router.
- Added structured text/voice capture previews for tasks with reminders, pending expenses, manual focus sessions, and bulk move-unfinished actions. Nothing from extracted text saves until Confirm all.
- Added actual speech recognition to Voice capture with editable transcript fallback when permission or device support is unavailable.
- Changed manual Quick Add expenses to save confirmed immediately; extracted expenses remain pending previews.
- Added payment-notification detection with duplicate keys, pending review for successful detections, ignored failed/refunded detections, guessed categories, and visible source/resolution text in Money.
- Added AsyncStorage-backed offline queue for task, manual expense, manual focus, and reflection capture; queued writes replay on app mount and every 15 seconds.
- Added local focus timer persistence so an offline timer survives navigation/restart and appears as Today rank 1 until ended and replayed as a focus session.
