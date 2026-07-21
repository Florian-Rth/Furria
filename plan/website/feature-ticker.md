---
title: Ticker
slug: ticker
type: foundation
status: ready
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The signature **flat red bar** marquee: Anton text, gold `✶` separators, horizontal scroll,
**no skew** (the calm "Destillat" treatment). A recognisable brand gesture. Built reusable as
its own foundation because it is chrome that can appear on more than the landing page.

## Scope / Slices

- Reusable marquee component: red bar, Anton text, gold star separators, seamless loop.
- Configurable content (default: "GROSS FURRIA ✶ GROSSBESENSTADT ✶ SESSION 2026 ✶").
- Respects reduced-motion.

## Decisions

- **Flat, un-skewed** red/gold (supersedes the old skewed `KKTicker`).
- Uses shared tokens (`red`, `gold`, `onRed`, Anton).
- **Lives in `@furria/ui` as `KkTicker`** — a pure, **content-agnostic** marquee (README §5 lists
  the Ticker alongside the seal/broom/confetti signature gestures; it is token-pure with no app
  coupling, so it belongs with the other shared gestures rather than in website chrome). The
  consumer passes the content; no website copy is baked into the shared component.
- **Content is static in P1**, passed by the website and built from `lib/club.ts`:
  `GROSS FURRIA ✶ GROSSBESENSTADT ✶ SESSION {currentSession.yearsLabel} ✶` (session label derived,
  never hardcoded).
- **Mounted landing-only in P1** — under the hero. Reusable, but no speculative placements (YAGNI).
- **Build sequence:** delivered in P1 slice 5 — see the Implementation plan in [Landing](feature-landing.md).

## Open Questions

- **Data-driven content** (next event / live ticket scarcity) — deferred to P5, when the event
  and scarcity feeds exist; the `content` prop is the seam.
- Additional placements beyond the landing — none planned; add a consumer when a page needs it.

## Done When

- A red/gold marquee scrolls seamlessly, honours reduced-motion, uses only shared tokens.

## References

- Mock: `fcc-ds-landing.jsx` (`LTicker`). Design README §5 (signature gestures → Ticker).
