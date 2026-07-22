# Larger Mascot Placements & New Poses

Date: 2026-07-23. Branch: `mascot-placements` (merged to `main`).

The Sprout spritesheet has 12 poses (calm, excited/sparkle, reading, proud/blush,
watering, confetti-jump, laptop, relaxed, sleeping-Zzz, wallet, checklist, good-night).
They were mostly shown small. Enlarged the hero placements and used more of the pose
range, including two new placements.

## Changes

- **Onboarding**: 156 → 184, pose calm → **watering** (matches spec §14.3).
- **Settings**: new hero card at the top (previously no mascot) — **relaxed** pose, 120,
  themed surface, with a "One thing at a time" line.
- **Today** empty state: restructured from a cramped row into a centered hero —
  **celebrating** (confetti) pose at 148 with new copy.
- **Money** empty: 72 → 124 (watering).
- **Calendar** empty: 88 → 136 (planning/checklist), centered with padding.
- **Progress**: insight **proud** 92 → 124; dismissed **relaxed** 72 → 104; no-data
  **working** (laptop) 72 → 112; empty-insight card now centers its mascot.
- **Focus**: reading pose 96 → 128.
- **Reflection**: good-night pose 132 → 160.
- **Quick add**: excited/sparkle 64 → 84.

All poses render on transparent backgrounds and scale from the 512px sprite frames, so
larger sizes stay crisp. Verified on web; `tsc` and `eslint` pass.
