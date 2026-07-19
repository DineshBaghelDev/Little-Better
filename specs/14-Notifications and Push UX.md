# Notifications and Push UX

**Priority: 8.** Entirely unbuilt — `expo-notifications` is not even a dependency.

PRD reference: §11 (Notifications and Push UX), §3.3, §15.

## Current state

No notification code, no permission request, no scheduling, no deep links. Onboarding
mentions notification permissions in §9.1 but the step does not exist (see spec 12).

## Types to implement (§11.1)

| Type | Trigger | Primary action |
|---|---|---|
| Upcoming task | Configured lead time | Open exact task card |
| Focus reminder | User-selected time or applied weekly change | Start session |
| Reflection | Configured evening time | Open reflection |
| Pending expense | Detected transaction requiring confirmation | Confirm or edit |
| Weekly insight | Weekly review ready | Open insight card |

## Rules (§11.2)

- Do not infer a "usual focus time" in the first week.
- Every notification deep-links to the relevant action, **never a generic home screen**
  (§3.3).
- Avoid multiple simultaneous reminders; combine when possible.
- Never expose reflection text or sensitive transaction details on the lock screen by
  default (§7.3, §15).
- Provide clear per-category notification controls in settings (see spec 12).

## Permission handling (§10)

When permission is denied: explain the lost convenience, provide a manual fallback, and keep
the product fully usable. The §9.1 exit criteria require reaching Today without granting
notification access at all.

## Interaction with other specs

- The focus reminder time is a setting the weekly insight is allowed to change (§8.4), so
  this depends on spec 12's settings surface and feeds spec 9's Apply.
- The pending expense notification depends on spec 16's detection work.

## Acceptance

- Each notification type fires on its trigger and deep-links to the exact action.
- No reflection text or transaction detail appears on a lock screen by default.
- Per-category controls exist and are honoured.
- Denying permission degrades gracefully with a manual fallback.
- No inferred focus-time claim before enough data (§18).
