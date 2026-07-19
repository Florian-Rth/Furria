---
title: Site-Shell
slug: site-shell
type: foundation
status: idea
mock: docs/design/fcc-ds-landing.jsx
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

The persistent chrome and layout every page renders inside: the newspaper **masthead nav**
(meta strip → `nav-links —— FURRIA —— flanks` with Login + red **Tickets** pill), the
**footer** (broom lockup, social, Impressum/Datenschutz), light/dark theming, the page layout
grid, and client-side routing. This is the frame all capabilities hang in — built first so
everything else has a home.

## Scope / Slices

- Masthead nav (desktop) + mobile bar (hamburger, centered FURRIA wordmark, Tickets pill).
- Footer (desktop `KKFooter` + mobile variant).
- Light/dark theme provider + toggle, driven by the shared theme.
- Layout shell (max-width reading column, section rhythm) + routing skeleton.
- `@furria/ui` integration: consume tokens/primitives, no local re-definition.

## Decisions

- Consumes the **ONE** shared theme from `@furria/ui` (Corporate Identity) — no website-only
  colors/fonts/radii/shadows. Base radius 14 (design README supersedes the old "cards 18px").
- Ticker is **not** part of the shell — it is its own foundation ([Ticker](feature-ticker.md)).
- Routes are English, labels German.

## Open Questions

- Rendering is **decided**: static-first SPA + prerender, no SSR
  ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md)). Remaining: the concrete
  prerender mechanism (React Router v7 framework-mode vs. `vite-react-ssg`) + routing lib —
  a build-time detail for this phase.
- Does dark mode follow OS preference, a manual toggle, or both?
- Nav information architecture — final top-level routes (Programm, Verein, Aktuelles,
  Galerie, Mitglied werden, Tickets).

## Done When

- Any page renders inside a branded masthead + footer, in light and dark.
- The app builds and deploys as an empty shell.
- No hard-coded design values — everything comes from `@furria/ui`.

## References

- Mock: `fcc-ds-landing.jsx` (`KKMastheadBar`, `KKFooter`, `BestMobileBar`, `FooterMobile`).
- Design README §5 (design system), §12 (conventions).
