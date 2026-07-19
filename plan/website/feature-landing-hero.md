---
title: Landing-Hero
slug: landing-hero
type: capability
status: idea
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The identity centerpiece of the home page — the first thing a visitor sees and the strongest
expression of the brand. Asymmetric editorial split: eyebrow badge, two-tone headline, intro,
CTAs, a stat row, and the anchor photo.

## Scope / Slices

- Eyebrow badge: `★ SESSION 2026 · 11.11. ERÖFFNUNG`.
- Two-tone headline: line 1 ink **GROSS**, line 2 red **FURRIA!** with the whisper poster
  head-shadow (`3px 3px 0 ink`) — the one allowed hard shadow.
- Intro paragraph (Großbesenstadt / fünfte Jahreszeit copy).
- Two CTAs: primary **Tickets sichern →**, secondary **Programm ansehen**.
- Stat row: `180+ Mitglieder · 12 Garden & Gruppen · 1971 gegründet`.
- Hero photo: subtle tilt, ink keyline, soft shadow, "Seit 1971" tag, floating **11.11 seal**.
- Contained **confetti** (≤13 chips, never over the reading column).

## Decisions

- The two-tone headline + poster head-shadow is the single sanctioned hard-shadow moment.
- Confetti is decorative, deterministic, boxed — never over text.
- Narrenruf headline is **GROSS FURRIA!** (local law).

## Open Questions

- Are the stats (180+, 12) **static** brand copy or **live** from the API? (P5 wires live.)
- Where does "Tickets sichern" link before the shop exists (P6)? Anchor to Programm-Teaser?
- Real hero photo vs. placeholder for launch.

## Done When

- The hero renders desktop (split) + mobile (stacked), light + dark, with headline, CTAs,
  stats, photo + seal, and contained confetti — all from shared tokens.

## References

- Mock: `fcc-ds-landing.jsx` (`BestDesktop` hero grid, `HeroPhoto`, `BestConfetti`).
