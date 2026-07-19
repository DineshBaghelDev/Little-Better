# Mascot and Visual System Compliance

**Priority: 4.** Contained, mostly mechanical, and visible on every screen.

PRD reference: §13 (Visual Design System), §14 (Mascot System), §15 (Accessibility).

## Mascot

`assets/mascot.png` is a 3D-rendered plush character with soft-body shading and a cast
shadow, cropped as the **app-icon tile** — cream rounded square included. §14.2 lists as
non-negotiable: "Solid flat fills, **no volumetric shading, plush texture, realistic light,
or 3D rendering**."

Because it carries its own cream background, it renders as a cream square floating on
coloured ground on Focus (lavender) and Reflection. It is also 1.26 MB, used inline at 52px.

Required:
- Redraw as flat 2D per §14.2 anatomy: one rounded sage body, exactly two stub arms and two
  feet when visible, two leaves on one short sprout stem, two dot eyes, one curved mouth.
  No nose, no fingers, no duplicated limbs, no shading.
- Transparent background, delivered as SVG or a correctly sized transparent PNG set.
- Per-context expressions per §14.3: onboarding (helpful, watering), empty state (calm),
  focus (closed eyes, calm breathing), task completion (closed happy eyes, tiny upward
  motion), reflection (warm neutral smile), weekly insight (pointing). One static image is
  currently reused everywhere.
- Motion per §14.4: idle breathing/blink, small completion movement, soft transitions.
  Respect reduced-motion with static alternatives.

## Palette discipline

§13.1 caps visible accents at two per screen, excluding neutrals.

- **Today** shows coral + sage + lavender. Worse, ordinary task cards are painted
  `coralSurface` — coral is reserved for warnings and pending confirmation (§13.2), so every
  routine task reads as an alert. Give normal tasks a neutral surface and reserve coral for
  overdue and pending items.
- **Reflection** shows all four accents at once (sage, lavender, mustard, coral). Reduce to
  a mustard/neutral scheme per §13.2's "reflection or note accents".

## Typography tokens

§13.3 requires fixed type tokens, not per-screen sizes. `theme.ts` exports colours, spacing,
and radii but **no typography**. Sizes 11/12/13/14/15/16/18/20/22/24/26/30/34/44 currently
appear ad hoc across files.

Add and adopt the §13.3 tokens: Display 28-32, Screen title 24, Card title 16-18, Body
14-16, Secondary 12-13, Micro 11. One rounded sans family throughout (SF Pro Rounded on
iOS, Nunito Sans or metrically compatible elsewhere) — the app currently inherits system
default.

## Other fixes

- **Focus progress ring is fake.** It is a static 8px border. The timer counts down but the
  ring never moves. §9.3 specifies a progress ring.
- **Progress stat tile wraps.** "Rs 12,023" breaks across two lines in a fixed-width tile.
- Remove the unused `SESSION_SECONDS` in `core.ts`; the 30-minute session length is
  hardcoded separately in `focus.tsx`. Make it one source of truth, driven by the target.

## Accessibility (§15)

Verify rather than assume: WCAG AA contrast, status never conveyed by colour alone,
44x44 minimum targets, system text scaling without clipping or card overlap, screen-reader
labels for timers/progress/transaction status, mascot excluded from screen-reader noise,
reduced motion supported.

## Acceptance

- Mascot is flat 2D, transparent, and expression-appropriate per screen.
- No screen shows more than two accent colours.
- Coral appears only on warnings and pending confirmations.
- Type tokens live in `theme.ts` and every screen uses them.
- The focus ring reflects elapsed time.
