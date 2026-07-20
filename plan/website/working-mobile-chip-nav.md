# Working doc — Mobile chip-row nav (replaces the drawer)

> Throwaway implementation doc for one change; delete after merge.
> Decisions grilled 2026-07-20. Spec lives here, durable intent in
> [feature-site-shell.md](feature-site-shell.md).

## What changes

The mobile drawer nav is deleted. In its place: the top-left menu button opens an
**inline chip row under the masthead** with the nav links as chips.

## Decisions (grilled)

- **Mobile bar slims down:** `menu button — FURRIA — theme toggle`. The Tickets
  pill leaves the bar (too big, bloats the appbar); the theme toggle takes its slot.
- **Tickets becomes an emphasized chip** in the row: filled red (accent), all other
  link chips outlined. It goes **first** so the one revenue link is never hidden
  behind the overflow.
- **Inline, closes on navigation:** the row pushes page content down (no overlay,
  no scrim). Menu button morphs hamburger → X (`aria-expanded`); tapping a chip
  navigates and closes; X closes. No outside-tap dismissal.
- **Overflow = horizontal scroll + gradient fade:** chips scroll with momentum,
  scrollbar hidden. Edges fade (~40px), shown **only on the side that has hidden
  content**. No backdrop-filter (banned on scrolling surfaces for mobile jank —
  same reasoning as the dialog). *As built:* overlay gradients (page background →
  transparent) with an animated `opacity`, not a `mask-image` — mask gradients
  don't transition, which made the fade pop in jumpily; the overlay reads
  identically on the flat chrome background and animates in and out.
- **Appear animation:** height via MUI `Collapse` (~250ms) + inner content
  `blur(8px) → 0`, `translateY(-10px) → 0`, `opacity 0 → 1`, ease-out. Gated behind
  `prefers-reduced-motion: no-preference` (reduced motion: instant). *As built:*
  close is the Collapse height reverse only — the row unmounts on exit, and a
  reverse blur is invisible inside the 250ms clip; dropped as not worth the
  complexity.
- **Active chip** = current route, red accent (like the drawer's active state).
- Desktop masthead is untouched.

## Structure (three layers, named by role)

```
Masthead.tsx                       menuOpen state; composes bar + chip nav
internal/
  MastheadMobileBar.tsx            right slot: ThemeModeToggle (Tickets pill out)
  MastheadChipNav.tsx              mobile-only; Collapse + animation shell
  ChipNavScroller.tsx              layout: scroll container + conditional fade masks
  NavChip.tsx                      ui: outlined link chip (active state)
  TicketsChip.tsx                  ui: filled red /tickets chip
  use-overflow-edges.ts            logic: which edges hide content (scroll/resize);
                                   pure computeOverflowEdges() extracted for tests
```

Deleted: `MastheadDrawer.tsx` (CloseIcon stays — the X state of the menu button).

## Tests

- Masthead: row hidden initially; button opens it (chips + `aria-expanded`); chip
  click navigates and closes; Tickets chip links to `/tickets`.
- `computeOverflowEdges` pure-function cases (no overflow / left / right / both).
- Existing drawer tests removed.

## Docs

- `feature-site-shell.md`: mobile-nav decision updated (drawer → chip row, toggle
  placement, Tickets chip). No CONTEXT.md terms touched (pure UI); no ADR
  (easily reversible).
