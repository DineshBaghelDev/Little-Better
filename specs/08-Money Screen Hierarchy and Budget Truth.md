# Money Screen Hierarchy and Budget Truth

**Priority: 2.** The screen currently inverts the PRD's hierarchy and renders overspending
as success.

PRD reference: §6 (Money Experience), §1.5 (boundaries), §9.4 (Quick Add constraint), §9.6.

## What's wrong now

**Net worth leads the screen.** A 34px "Net worth Rs 88,831" is the hero card. §6.3 makes
*budget remaining* the one primary card, and §1.5 explicitly excludes accounting features
from v1. Budget remaining is demoted to a small secondary row.

**Overspend reads as a completed goal.** With Rs 12,146 spent against a Rs 5,000 budget the
card shows "Rs 0 of Rs 5,000", a **full sage-green progress bar**, and "Rs 12,146 confirmed
expenses this month" in primary green. `remaining` clamps at `Math.max(0, ...)` and progress
clamps at 100, so a 143% overage is invisible. Sage is the success/calm token; coral is the
designated colour for exceeded thresholds.

**The tab is an admin console.** A permanently expanded add-transaction form, account CRUD,
category CRUD, and analytics bars all sit inline. The add-transaction form duplicates Quick
Add, which §9.4 forbids ("do not duplicate one-tap actions already present"). Actual content
— pending confirmations, recent transactions — is pushed well below the fold.

## What it should be

Per §6.3, in order:

1. Budget remaining card — current month amount and progress, primary and alone at the top.
2. Pending confirmations, when present, above transaction history.
3. Recent confirmed transactions.
4. Category summary and monthly trend in a **deeper view**, not inline on the main tab.

Changes:
- Demote or remove net worth. If accounts stay, they belong in the deeper view.
- When spend exceeds budget: show the actual overage ("Rs 7,146 over"), switch the bar and
  copy to coral, and surface the exceeded threshold on Today (§6.1 — Money appears on Today
  only when something must be resolved, and this qualifies).
- Move transaction creation out of the tab and into Quick Add. Keep confirm-in-one-tap and
  the compact edit sheet (§9.6).
- Move account and category management into a settings or deeper view (see spec 12).
- Keep language neutral and specific per §16 — "Confirm Rs 240 at Sharma Cafe", never
  cheerful or alarming financial copy.

## Acceptance

- Budget remaining is the first and largest element on the tab.
- Being over budget is visually and textually unmistakable, in coral, with the overage stated.
- An exceeded budget raises a resolvable item on Today.
- No transaction creation form on the Money tab.
- Pending sits above confirmed history.
- No investment, debt, tax, or accounting surface in v1.
