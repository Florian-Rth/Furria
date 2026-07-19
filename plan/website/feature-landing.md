---
title: Landing
slug: landing
type: capability
status: idea
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The home page (`/`) — the club's front door and the most important page on the site. It is a
**composition** of independently-planned blocks in a deliberate order; this file owns the page
itself (route, block order, responsive desktop/mobile layout, page-level meta), while each
block is planned in its own feature file.

## Scope / Slices

Block order (top → bottom), from the "Destillat" mock:

1. Masthead nav — [Site-Shell](feature-site-shell.md)
2. [Landing-Hero](feature-landing-hero.md) — asymmetric editorial hero
3. [Ticker](feature-ticker.md)
4. [Programm-Teaser](feature-program-teaser.md) — "DAS PROGRAMM"
5. [Mitmachen-Band](feature-mitmachen-band.md) — recruit CTA
6. Footer — [Site-Shell](feature-site-shell.md)

## Decisions

- The landing is a **thin composition**; all real substance lives in the block features.
- Desktop = asymmetric split hero; mobile = stacked (per mock's `BestDesktop` / `BestMobile`).

## Open Questions

- Final block order and whether any block is added/removed for v1.
- Does the landing need any block not in the mock (e.g. news teaser, gallery strip)?

## Done When

- `/` renders all blocks in order, responsive, light + dark, using only shared tokens.

## References

- Mock: `fcc-ds-landing.jsx` (`BestV`, `BestDesktop`, `BestMobile`).
