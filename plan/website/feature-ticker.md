---
title: Ticker
slug: ticker
type: foundation
status: idea
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

## Open Questions

- Is the content static brand copy, or ever data-driven (e.g. next event, scarcity)?
- Where else besides the landing does it appear, if anywhere?

## Done When

- A red/gold marquee scrolls seamlessly, honours reduced-motion, uses only shared tokens.

## References

- Mock: `fcc-ds-landing.jsx` (`LTicker`). Design README §5 (signature gestures → Ticker).
