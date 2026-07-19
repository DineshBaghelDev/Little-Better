# Dropdown And Date Fix

- Moved the shared category selector menu to an absolute hovering dropdown so opening it no longer expands expense forms.
- Kept category deletion inside the dropdown's manage mode, away from normal category selection.
- Changed date picker input formatting and parsing to use local calendar dates, avoiding UTC day shifts in the displayed value.
- Verified with `npm run typecheck` and `npm run lint`.
