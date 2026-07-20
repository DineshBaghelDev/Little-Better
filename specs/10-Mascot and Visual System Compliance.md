# Mascot and Visual System Compliance

**Priority: 4.** Contained, mostly mechanical, and visible on every screen.

PRD reference: §13 (Visual Design System), §14 (Mascot System), §15 (Accessibility).

Character reference (authoritative for form):
`project-requirements/Little_Better_Product_Design_Markdown/little_better_md_media/media/image6.png`

## The mascot is Sprout

Our mascot is a **flat 2D** character named **Sprout**. The product name remains Little
Better — Sprout is the character, not the app (§14.3 note).

Voice line from the character sheet: *"one thing at a time, every day."*

The reference sheet defines Sprout completely — view angles, expressions, actions, avatar
badges, and the illustration style rules. Treat it as the source of truth for how Sprout
looks. Style rules stated on the sheet itself:

- consistent flat 2D style
- minimal details, clean shapes
- calm, friendly, encouraging

This matches §14.2's non-negotiable anatomy: one rounded sage body, exactly two small stub
arms and two small feet when visible, two leaves on one short sprout stem, two dot eyes, one
small curved mouth. No nose, no fingers, no extra or duplicated limbs, no realistic anatomy.
Solid flat fills — **no volumetric shading, plush texture, realistic light, or 3D rendering**.

## What's wrong with the current asset

`apps/mobile/assets/mascot.png` does not match the reference. It is a soft-body render with
volumetric shading and a cast shadow, and it is cropped as the **app-icon tile** — cream
rounded square included. Because it carries its own cream background baked in, it renders as
a cream square floating on coloured ground on Focus (lavender) and Reflection.

It is also 1.26 MB, a single static image used at every size from 52px to 156px, and reused
for every context regardless of what the screen means.

So: right character, wrong rendering style, wrong crop, wrong file. It needs replacing with a
generated set built from the reference sheet.

## Asset generation — note for Codex

**Codex will generate these assets directly.** Do not source them externally and do not reuse
the existing `mascot.png`. Generate from the character sheet at the path above, matching its
flat 2D style exactly.

### Inventory

Everything below appears on the reference sheet. Generate what the app actually uses first;
the rest can follow.

| Group | Items |
|---|---|
| View angles | front, 3/4, side, back |
| Expressions | happy, excited, focused, thinking, proud |
| Actions | watering, celebrating, working, relaxed, sleepy |
| Avatar badges | new day, great job!, keep going!, good night |
| App icon | Sprout on the warm cream rounded-square tile |

### Screen mapping (§14.3)

| Context | Asset | Scale |
|---|---|---|
| Onboarding | watering | Medium |
| Empty state | relaxed or a context-specific prop | Small to medium |
| Focus session | focused, eyes closed, calm | Small |
| Task completion | happy, closed eyes, tiny upward motion | Very small |
| Reflection | happy / warm neutral smile | Medium |
| Weekly insight | thinking or proud, pointing at a simple visual | Small to medium |
| Good night / reflection done | sleepy, or the "good night" badge | Small |

### Output rules

- **Transparent background.** The cream tile belongs only to the app icon, never to inline
  mascot art. This is the specific defect in the current asset.
- SVG preferred. If raster, ship a correctly sized transparent PNG set (1x/2x/3x) per usage
  size — not one large image scaled down.
- Flat fills only. No gradients anywhere in core UI or mascot artwork (§13.1).
- Keep anatomy identical across every asset. §14.1 requires Sprout to stay visually
  consistent across every screen and asset — the sheet's four view angles are the guide.
- Budget: the whole set should weigh well under the current single 1.26 MB file.
- Every illustration must support meaning or state. No decorative mascots filling space
  (§13.1, §4.4).

### Motion (§14.4)

- Idle: subtle breathing or blink loop.
- Completion: small upward movement and return. No exaggerated bounce.
- Focus: minimal breathing, eyes closed.
- Transitions: soft slide and fade.
- Respect reduced-motion settings and provide static alternatives.

## Palette conflict to resolve first

The character sheet carries its own palette, and **five tokens disagree with PRD §13.2**:

| Token | Sheet | PRD §13.2 | Match |
|---|---|---|---|
| Sage green | `#6DB88A` | `#6D8B6A` | ✗ |
| Lavender | `#CDB7F6` | `#CDB7F6` | ✓ |
| Coral | `#FF8F7A` | `#FF8F7A` | ✓ |
| Mustard | `#FFC857` | `#F4C85B` | ✗ |
| Warm cream | `#FAF8F2` | `#FAF8F2` | ✓ |
| Text primary | `#2B2B2B` | `#2F3A33` | ✗ |
| Text muted | `#6B6B6B` | `#6B6B6B` | ✓ |
| Border | `#ECE9E2` | `#E8E2D7` | ✗ |
| Soft teal | `#7CC5C4` | not in PRD | ✗ |

`theme.ts` currently follows PRD §13.2. **Recommendation: keep PRD §13.2 authoritative** — it
is the stated source of truth, the app already implements it, and §13.1 caps accents at two
per screen, which the extra teal would push against. Use the sheet for Sprout's *form* and
generate the art in the §13.2 sage.

Flag this if you disagree — it should be decided once, before assets are generated, because
regenerating art after a palette change is wasteful.

## Palette discipline in the app

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
default. The reference sheet's lettering confirms the rounded-sans direction.

## Components on the reference sheet

The sheet also specifies components we can align to, worth checking against what we built:

- Buttons: primary (filled sage pill), secondary (outlined), tertiary (text only). We
  currently have primary and secondary; no tertiary.
- Cards: icon, title, meta line, chevron — close to what we have.
- Chips/pills: today, upcoming, completed (with check).
- **Progress ring** with a percentage in the centre. See Other fixes below.
- Toggles, checks, and a bordered input field with a trailing icon.
- Bottom navigation: `today · calendar · + · money · progress`. **Our tab is labelled
  "Plan", not "calendar".** Pick one and make it consistent.
- Icon set: task, focus, expense, note, calendar, progress, settings, voice — note
  **settings**, which we have no screen for (see spec 12).

## Other fixes

- **Focus progress ring is fake.** It is a static 8px border. The timer counts down but the
  ring never moves. §9.3 specifies a progress ring, and the sheet shows exactly the intended
  treatment (arc plus centred percentage).
- **Progress stat tile wraps.** "Rs 12,023" breaks across two lines in a fixed-width tile.
- Remove the unused `SESSION_SECONDS` in `core.ts`; the 30-minute session length is
  hardcoded separately in `focus.tsx`. Make it one source of truth, driven by the target.

## Accessibility (§15)

Verify rather than assume: WCAG AA contrast, status never conveyed by colour alone,
44x44 minimum targets, system text scaling without clipping or card overlap, screen-reader
labels for timers/progress/transaction status, mascot excluded from screen-reader noise,
reduced motion supported.

Note the sage/cream and mustard/cream combinations need checking against AA — the current
"Rs 12,146 confirmed expenses this month" line in `primaryDark` on `sageSurface` is the kind
of pairing that tends to fail.

## Acceptance

- Sprout is flat 2D, transparent-background, and consistent in anatomy across every asset.
- The cream tile appears only on the app icon.
- Each context uses its mapped expression rather than one reused image.
- The palette conflict is resolved and recorded before assets are generated.
- No screen shows more than two accent colours.
- Coral appears only on warnings and pending confirmations.
- Type tokens live in `theme.ts` and every screen uses them.
- The focus ring reflects elapsed time.
- Total mascot asset weight is well under the current 1.26 MB.
