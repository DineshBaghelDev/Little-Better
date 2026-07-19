# Text and Voice Capture

**Priority: 9.** Present as a menu row, absent as a feature.

PRD reference: §12 (Text and Voice Capture), §3.3, §9.4.

## Current state

Quick Add lists a "Voice" row described as "Type the captured words". Selecting it shows a
plain text input, and saving calls `addTask({ title: text })` — the raw sentence becomes a
task title. There is no speech input, no extraction, and no confirmation preview. The "Note"
row has the same shape, saving text as a task.

So "Spent Rs 450 on groceries" becomes a task named "Spent Rs 450 on groceries".

## What it should be

### Role (§12.1)

Voice and natural-language text are **secondary** capture methods for compound actions. They
do not replace faster one-tap interactions, and Quick Add must not duplicate one-tap actions
already on Today cards (§9.4).

### Target cases (§12.2)

- "Add gym tomorrow at 7 PM and remind me 30 minutes before."
- "Spent Rs 450 on groceries."
- "Move unfinished tasks to tomorrow except the assignment."
- "I studied algorithms for 90 minutes."

Note these span multiple entity types — task with reminder, expense, bulk reschedule, focus
session — so extraction must produce typed structured rows, not one blob.

### Confirmation behaviour (§12.3) — non-negotiable

- Extracted actions appear as **editable structured rows**.
- **Nothing inferred is saved before confirmation.** This is a core product principle
  (§1.3, "Automation with confirmation") and a §18 acceptance row.
- Ambiguous dates, amounts, or categories are visibly flagged.
- The user may confirm all, edit individually, or discard.
- Extracted expenses enter as **pending preview** and do not affect totals until confirmed
  (§6.2).

## Acceptance

- A compound sentence produces multiple typed, editable rows.
- Nothing is written until the user confirms.
- Ambiguous fields are visibly flagged before save.
- Voice-extracted expenses land in pending, not confirmed.
- Quick Add reaches this in two taps maximum before input (§3.3).
