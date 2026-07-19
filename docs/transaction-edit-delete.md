# Transaction Edit And Delete

- Reused the Money transaction form for editing pending and confirmed transactions.
- Added transaction delete support through `core.removeTransaction`.
- Let the transaction form surface overflow so the category dropdown is not clipped by the card.
- Verified with `npm run typecheck`, `npm run lint`, and `npx convex dev --once`.
