---
title: Mitmachen-Band
slug: mitmachen-band
type: capability
status: idea
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The recruit CTA band near the foot of the home page: a bold red block ("WERD TEIL DER GARDE")
inviting visitors to join. It is the home page's entry point into the
[Mitglied werden](feature-membership-funnel.md) funnel — the club's growth hook.

## Scope / Slices

- Red band, calm treatment (rounded, faint broom watermark, soft white pill button).
- Copy: "MITMACHEN · SAISON OFFEN" / "WERD TEIL DER GARDE" / Gruppen list / "Mitglied werden →".
- Desktop (`MitmachenBand`) + mobile (`MitmachenMobile`) variants.
- CTA links into the membership funnel (wired in P8).

## Decisions

- The red block is a sanctioned bold accent moment (red = action).
- Reuses the shared `MitmachenBand` identity already in the mock/brand.

## Open Questions

- Before the funnel exists (P8), does the CTA link to a contact route or scroll anchor?
- Is the Gruppen list static copy or pulled from the same source as
  [Verein](feature-about-verein.md)'s Gruppen showcase?

## Done When

- The band renders desktop + mobile with correct copy and a working CTA target.

## References

- Mock: `fcc-ds-landing.jsx` (`MitmachenBand`, `MitmachenMobile`).
