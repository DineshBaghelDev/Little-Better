# Settings and Focus Category Switching

**Priority: 6.** A whole surface is missing, and it blocks a v1 acceptance row.

PRD reference: §5 (Focus Category and Session Model), §9.1 (Onboarding), §18.

## What's wrong now

**No settings screen exists.** Focus category, target, preferred focus time, reflection
time, and monthly budget are write-once at onboarding. Nothing in the app can change them
afterward. This kills §5.4 (switching category) outright and fails the §18 checklist row
"Category switch: old history preserved; new insight threshold resets."

It also blocks other specs: spec 9's Apply must mutate a visible, user-editable setting,
and spec 8 needs somewhere to put account and category management.

**Onboarding's summary rows are fake.** `setupRows` is a hardcoded constant displaying
"Study / 3 sessions / 9 AM / 8 PM / 25000". It **never reads from the form below it**.
Change the budget to 5000 and the row still reads 25000; tapping a row only paints it sage.
Two parallel representations of the same settings, one of them lying.

**Only one target type works.** The schema defines all four from §5.2 — sessions per week,
minutes per day, minutes per week, binary days — but `bootstrap` hardcodes
`sessions_per_week` and the Today and Progress UI only handle that one.

## What it should be

### Settings surface

Editable after onboarding: tracked focus category, target type and value, preferred focus
time, reflection time, monthly budget, notification permissions and per-category controls
(§11.2). Applied weekly changes must be visible and undoable here (§8.4, §10).

### Category switching (§5.4)

- Previous category history stays accessible in Progress.
- A new category starts with no inherited assumptions.
- Show "Not enough data yet" until the new category reaches at least five sessions or seven
  tracked days, depending on target type.
- No comparative insight from insufficient data.
- Switching never deletes or merges historical records.

### Target types (§5.2)

Support all four, each with its recorded outcome: sessions per week → completed session
count; minutes per day → accumulated duration; minutes per week → accumulated duration;
binary days → one completion per day. Today's focus card and Progress must read correctly
for each.

Note §5.3: there is no separate habit system. A manual session and a timer session resolve
to the same session history, retaining the capture source. This is already correct in the
schema (`source: "timer" | "manual"`) — keep it that way.

### Onboarding fixes (§9.1)

- Delete `setupRows` or bind it to live form state. One source of truth.
- Restructure as progressive single-column setup, one primary button per screen, with
  suggested-but-editable defaults.
- Add the notification permission step, skippable.
- Exit criteria: the user reaches Today without connecting calendar, health, or
  notification access.

## Acceptance

- Every onboarding setting is editable later.
- Onboarding never displays a value that disagrees with the form.
- Switching category preserves old history and resets the insight eligibility window.
- All four target types work end to end.
- Optional permissions are skippable and the product stays usable without them (§10).
