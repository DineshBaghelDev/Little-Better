# Weekly Insight System

**Priority: 3.** §8.1 calls this "the primary differentiator". It is currently a template
string that fires on a row count and applies nothing.

PRD reference: §8 (Weekly Insight System), §16 (tone), §18 (acceptance checklist).

## What's wrong now

`core.ts` generates an insight whenever `sessions.length >= 5`:

> **"Study has enough recent history to tune next week."**
> *6 sessions and 64 minutes recorded in this range.*
> → "Keep one Study block on your strongest available day."

The observation is not an observation, the evidence restates the same number, and the
action is not specific. This is exactly the filler §8.2 forbids ("display 'Not enough data
yet' rather than filler advice") and the invented motivational insight §16 lists under
Avoid. **No pattern detection exists anywhere in the codebase.**

**Apply changes nothing.** `setInsightStatus` patches a status field, and for computed
insights only sets local `useState` — lost on remount. §8.4 requires the applied change to
alter a real, visible, reversible setting. The §18 checklist row "Applied change: visible
and undoable" currently fails.

## What it should be

### Detection

Find one reliable pattern from confirmed transactions and completed/recorded sessions
(§8.2). Candidate patterns, in the PRD's preference order — task/focus first, money only as
a tiebreaker (§6.4):

- Completion rate by time of day for the tracked category.
- Completion rate by weekday.
- Tasks repeatedly postponed.
- Focus blocks that succeed at one time and fail at another.
- Budget threshold pressure (money, only when nothing above qualifies).

Rules:
- Require a minimum data threshold per pattern. Below it, show "Not enough data yet" **with
  the exact requirement** (§10), not a generic message.
- Do not generate anything when evidence is weak or contradictory.
- No inferred "usual focus time" claim in the first week (§11.2, §18).

### Anatomy

Every insight must carry all four parts from §8.3:

| Part | Example |
|---|---|
| Observation | You complete more study sessions after 7 PM. |
| Evidence | 4 of 5 evening sessions completed versus 1 of 4 afternoon sessions. |
| Suggested action | Move the weekday study reminder to 7:30 PM. |
| Controls | Apply, Edit, Dismiss |

Note **Edit** is currently missing entirely — only Apply and Dismiss are rendered.

### Apply

Applying must mutate a real setting from the §8.4 allowed list: move a reminder or
recurring focus block, adjust a target within reasonable bounds, split a postponed task,
schedule a focus block at a better time, or adjust a budget threshold with explicit
approval. The change must then be visible in Progress and in the relevant setting, with
Undo available (§10: "Recommendation applied accidentally → applied change is visible with
Undo in Progress and relevant setting").

## Acceptance

- No insight is shown unless a real pattern clears its threshold.
- Every insight states observation, evidence, and a specific action.
- Apply / Edit / Dismiss are all present and tracked separately (§17.1).
- Applying changes a setting the user can see and undo; the undo survives app restart.
- "Not enough data yet" states the exact requirement.
- A user can restate the suggestion in their own words (§17.2).
