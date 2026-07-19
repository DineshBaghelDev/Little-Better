# Reflection Lifecycle

**Priority: 5.** Small, self-contained, and currently violates an explicit edge-case rule.

PRD reference: §7 (Evening Reflection), §9.7, §10 (edge cases).

## What's wrong now

**Skip does not skip.** `reflectionDue` is derived purely from
`hour >= reflectionHour && no reflection recorded today`. "Skip for now" only calls
`router.back()`, so the prompt is still sitting on Today when the user returns. §10 is
explicit: "User dismisses reflection → do not repeatedly nag that night. Offer the next
scheduled reflection normally."

**Snooze does not exist.** §7.2 lists three actions — Done, Skip for now, Snooze. Only two
are implemented.

**Empty reflections save.** Pressing Done with zero descriptors selected and no note writes
an empty reflection row, which then counts as "reflected today" and pollutes the reflection
summary in Progress.

## What it should be

- Persist a per-night dismissal state so Skip suppresses the prompt until the next
  scheduled reflection.
- Implement Snooze with a defined interval, re-surfacing once that night at most.
- Require at least one descriptor or note text before Done saves; otherwise treat Done as
  Skip.
- Keep the reflection **above** the ranked list, not inside the priority system (§4.2, §7.2).
- Reflection must be time-triggered and reachable, not buried in settings or Quick Add (§9.7).

## Data rules (§7.3)

These are constraints on downstream work, worth stating here so they aren't lost:

- Free text is preserved verbatim; derived tags never replace the original text.
- No insight may imply causality from a few reflections.
- Sensitive reflection text is never shown in notifications or on the lock screen
  (§11.2, §15).

## Acceptance

- Skipping a reflection stops the prompt for that night.
- Snooze exists and re-surfaces at most once.
- Done with nothing entered does not create a record.
- Completion takes under 20 seconds (§17.1).
