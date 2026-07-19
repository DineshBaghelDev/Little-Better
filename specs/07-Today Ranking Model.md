# Today Ranking Model

**Priority: 1 (highest).** This is the product's core promise and it is currently a stub.

PRD reference: §4 (Today Ranking Model), §3.3 (click minimization), §9.2 (Today), §17.2.

## What's wrong now

`core.ts` builds `plannedTasks` as every planned task, `.take(20)`, sorted by
`(a.scheduledAt ?? now) - (b.scheduledAt ?? now)`. There is **no filter to today**.
`today.tsx` then slices the first 2-3 and paints a rank number on them.

Observed on device: the three ranked cards were "we / 10:00", "e / 9:00", "sd / 9:00".
Ascending sort means "we" is from an *earlier date* — Today is showing tasks from other
days, labeled with clock time only and no date. A task scheduled three weeks out can hold
rank 1. Unscheduled tasks get `?? now`, injecting them into the middle of the ordering.

The focus target card renders unconditionally and showed **"6 of 3 sessions this week"**.
`focusSessionsThisWeek` is a rolling 7-day count, not a calendar week, and there is no
"target met" state.

## What it should be

Implement the §4.2 priority order in the `today` query, returning ranked items with an
explicit reason, not a raw task list:

| Rank | Item | Rule |
|---|---|---|
| 1 | Active timer | Pinned until paused or stopped; new tasks never displace it |
| 2 | Overdue task | Most urgent unresolved obligation; the rest go to Later today |
| 3 | Task starting within 60 minutes | |
| 4 | Accepted weekly action due now | |
| 5 | Tracked focus target not yet completed | Only when no higher item displaces it |
| 6 | Next scheduled task | |

Rules:
- Show at most three expanded cards, remainder under the collapsed "Later today" row.
- Each card carries a short reason label ("Overdue", "Starts in 40 min", "Next up") so
  the user understands rank without an explanation screen (§17.2).
- Evening reflection is **not ranked** — it sits above the ranked list when due (§4.2).
- Drop the focus card entirely when the target is met or not contextually due (§4.4:
  "do not manufacture a prompt"). Fix the week window to a real week boundary.
- Empty states per §4.4: no tasks → one calm empty state plus a single "Add your first
  task"; all complete → small mascot celebration and the next meaningful event. Do not
  fill space with motivational filler.

## Also in scope

- **Undo on completion.** §4.3 and §3.3 require an Undo toast, not a confirm modal.
  Completing a task should gently scale down and fade, then offer Undo.
- **Secondary card actions.** Task cards need Reschedule and Details (§4.3). Currently
  the only action is the one-tap complete.
- Task cards should show a date when the task is not today, or better, not appear at all.

## Acceptance

- Today never shows a task scheduled for another day in an expanded rank slot.
- Ranks follow §4.2 and each card states why it is there.
- Active timer holds rank 1 across navigation.
- Focus card is absent when the target is met.
- Completing a task offers Undo.
- At most three expanded cards; the rest collapse under Later today.
