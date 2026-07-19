# Offline Capture and Sync

**Priority: 11.** Deferred, but listed in the PRD's edge cases and worth tracking.

PRD reference: §10 (Offline use), §1.3 (minimal input).

## Current state

Every screen reads and writes through Convex with no local persistence and no write queue.
With no connection, queries return `undefined`, screens render their zero states, and
mutations fail silently — `completeTask`, `addTask`, `addExpense`, and the focus timer
mutations all return `null` regardless of outcome, so nothing surfaces the failure to the
user.

The focus timer is the sharpest case: `startFocus`, `setFocusPaused`, and `endFocus` all
round-trip to the server, so a session started offline is simply lost. §9.3 requires the
timer to persist across app navigation, and a dropped connection should not end a session.

## What it should be (§10)

> Offline use: allow task, timer, manual expense, and reflection capture; synchronize later.

- Local persistence for the four capture paths: tasks, focus timer, manual expenses,
  reflections.
- A write queue that replays on reconnect.
- The active timer must survive offline periods and app restarts, and continue to own rank 1
  on Today (§4.2, §18).
- Surface sync state honestly without alarming the user — §16 tone rules apply.
- Conflict handling on replay: define what happens when the same task is completed on two
  devices, or when a queued expense arrives after the month has rolled over.

## Acceptance

- A task, timer, manual expense, and reflection can all be captured with no connection.
- Queued writes reach the server on reconnect without user intervention.
- A focus session started offline is not lost.
- No mutation fails silently.
