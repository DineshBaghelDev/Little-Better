# Calendar Refinements

**Priority: 7.** The screen works but doesn't yet behave as the source of truth for
planned time.

PRD reference: §9.5 (Calendar), §3.2 (navigation), §9.4 (Quick Add constraint).

## What's wrong now

**The week strip is not a week.** `days` is built as seven days *starting from the selected
day*, so the strip slides forward as you navigate rather than anchoring to a week. There is
no way to step backward without opening the date modal — yesterday is unreachable from the
strip.

**The create form dominates the agenda.** A five-field always-open form (title, time,
location, meeting link, notes) sits directly under the day's events. On the captured day the
agenda was two focus-session rows followed by the form, pushing unscheduled tasks off
screen. This duplicates Quick Add, which §9.4 forbids.

**Scheduled tasks have no actions.** Tapping a scheduled task does nothing — no complete, no
reschedule, no details. §3.2 lists the Calendar's primary actions as "create, schedule,
move, inspect day/week", so "move" is currently only possible via the unscheduled list.

**Implicit scheduling.** Unscheduled tasks say "Tap to schedule at 09:00", where 09:00 is
whatever is left in the create form's time field. The user is not choosing that time
deliberately.

**Focus sessions show no time.** Rows read "Focus session / 30 minutes logged" with no
indication of when in the day they occurred, which undercuts the agenda's purpose.

## What it should be

Per §9.5: week strip, selected-day agenda, scheduled tasks, focus blocks, unscheduled tasks.
Tap to inspect; create and reschedule with minimal steps. Dense month grid is not the default.

- Anchor the week strip to a real week with forward and backward navigation.
- Collapse the create form behind a single action, or defer creation to Quick Add.
- Make agenda items tappable for inspect, complete, and reschedule.
- Scheduling an unscheduled task should prompt for a time explicitly.
- Show focus sessions at their actual time on the day.

## Acceptance

- The week strip shows a real week and can move backward and forward.
- The day's agenda is the first thing visible below the strip.
- A scheduled task can be inspected, completed, and moved from this screen.
- Scheduling an unscheduled task involves a deliberate time choice.
