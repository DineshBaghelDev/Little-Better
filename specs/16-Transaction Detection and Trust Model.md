# Transaction Detection and Trust Model

**Priority: 10.** The trust model's data structure exists; the automation that makes it
meaningful does not.

PRD reference: §6.2 (transaction trust model), §10 (edge cases), §18.

## Current state

The schema supports `status: pending | confirmed | ignored`, and pending transactions
correctly stay out of totals — `money.spent` sums confirmed only, and Today surfaces pending
items for one-tap confirmation. **That part is right and should be preserved.**

What's missing is detection. Nothing ever *creates* a pending transaction automatically. A
transaction is only pending if the user manually selects "Pending" in a form, which is not a
real workflow. So the trust model is currently theatre.

## What it should be (§6.2)

| Source | Initial state | Affects totals? | Required action |
|---|---|---|---|
| UPI / payment notification | Pending | No | Confirm, edit, or ignore |
| Manual entry | Confirmed | Yes | None |
| Voice / text extraction | Pending preview | No | Confirm or edit before save |
| Imported verified integration | Confirmed or review, per source contract | Only when verified | Resolve only if flagged |

Implement notification-based detection for UPI and payment messages, creating pending
transactions with merchant, amount, and a guessed category.

## Edge cases (§10) — these are the hard part

- **Duplicate UPI notifications.** Group likely duplicates and require **one** confirmation,
  not one per notification.
- **Failed or refunded payment detected.** Must not count as confirmed spending. Show a
  resolution state where necessary.
- **Permission denied.** Explain the lost convenience, keep manual entry fully working, and
  leave the product usable.

## Related requirements

- Confirming a correct expense is **one tap** (§3.3, §17.1).
- Editing category or amount happens in a compact sheet (§9.6).
- Pending confirmations sit above transaction history (§6.3).
- Money appears on Today only when something must be resolved (§6.1).
- Transaction details stay off the lock screen by default (§11.2) — see spec 14.

## Acceptance

- A detected payment creates a pending transaction that does not move totals.
- Duplicate notifications for one payment require a single confirmation.
- A refund or failed payment never counts as confirmed spending.
- Confirming a correct detection takes one tap.
- With permission denied, manual money tracking is unaffected.
- Users trust totals because pending is visibly separated (§17.2).
