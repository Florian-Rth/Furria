---
title: Mitmachen-Band
slug: mitmachen-band
type: capability
status: shipped
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The recruit CTA band near the foot of the home page: a bold red block ("WERD TEIL DER GARDE")
inviting visitors to join. It is the home page's entry point into the
[Mitglied werden](feature-membership-funnel.md) funnel — the club's growth hook.

## Scope / Slices

- Red band, calm treatment (rounded, faint broom watermark, soft white pill button).
- Final copy (below) + CTA "Mitglied werden →" → `/join`.
- One **responsive** component (desktop row / mobile stack), not two.

## Decisions

- **Single responsive component** (`MitmachenBand`), not a desktop/mobile pair: the two layouts
  differ only by reflow — row with the button on the right at `md`+, stacked (button below the
  text) at `xs` — handled with responsive `sx`. The broom watermark position and font sizes
  shift by breakpoint. One source of copy, no forked duplication. (Contrast with the event card,
  which is two components because photo-vs-no-photo is a structural difference.)
- **The mock's mobile variant (`MitmachenMobile`) is broken** — it is *not* the target. Do a
  clean responsive reflow: contained watermark, button full-width or cleanly below the text, no
  overflow.
- The red block is a **sanctioned bold accent moment** (red = action). White text on the red
  surface is fine (red is the background, not body text); the CTA is a white pill with red text.
- **CTA target `/join`** (the existing gated placeholder route; nav already points there). No
  scroll anchor, no new contact route — when the funnel gets real content, zero rewiring.
- **Gruppen list is static copy** (this build has no backend). Embedded in the body sentence,
  not a live list. The club's **actual Gruppen** are **Tanzgarde, Männerballett, Elferrat,
  Büttenrede** — **not** Spielmannszug (a mock error). "Büttenrede" is the carnival-speech
  discipline (from the Bütt).
- **Ownership / location:** `features/landing/components/MitmachenBand/`; composed by
  `LandingPage` below the Programm-Teaser, inside the gutter container. Watermark uses the shared
  `KkBroomMark` primitive.
- **Final copy (static-final):**
  - Kicker: **MITMACHEN · DAS GANZE JAHR**
  - Headline: **WERD TEIL DER GARDE**
  - Body: *Ob Tanzgarde, Männerballett, Elferrat oder Büttenrede — beim FCC ist immer etwas los.
    Schau vorbei, lern uns kennen und feier die fünfte Jahreszeit mit uns.*
  - CTA: **Mitglied werden →**
  - Copy was reworked from the designer's filler (which used a meaningless "SAISON OFFEN"
    kicker); the kicker now states the real hook — you can join year-round.

## Open Questions

- None. (Both prior open questions resolved: CTA → `/join`; Gruppen list → static copy.)

## Done When

- The band renders as one responsive component (desktop row / clean mobile stack) with the
  final copy, the broom watermark, and a working "Mitglied werden →" CTA to `/join`, light + dark,
  tokens-only.

## Implementation plan (phases)

Vertical slice; leaves the app building and working. **Frontend only.** **Backend: none.**

1. **Responsive recruit band, end-to-end.** `MitmachenBand` — red surface, `KkBroomMark`
   watermark, kicker + Anton headline + body (final copy), white pill CTA → `/join`; responsive
   reflow (row + right-aligned button at `md`+, clean stack at `xs`); mounted in `LandingPage`
   below the Programm-Teaser, inside the gutter container.
   *Delivers (FE):* the recruit band live at `/`, both breakpoints, light + dark.
   *Verify:* component test asserts copy, CTA target `/join`, watermark present, and the reflow
   at `xs` vs `md`; `LandingPage` test includes the band; both themes; `pnpm build`/`typecheck`
   pass.

## References

- Mock: `fcc-ds-landing.jsx` (`MitmachenBand` desktop; `MitmachenMobile` — broken, not the target).
- `CONTEXT.md` (Gruppe). Funnel destination: [Mitglied werden](feature-membership-funnel.md).
