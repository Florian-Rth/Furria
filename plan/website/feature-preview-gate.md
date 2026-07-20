---
title: Preview-Gate
slug: preview-gate
type: foundation
status: shipped
mock: -
adrs: []
---

## What & Why

The pre-launch access gate and the tester **portal**. Before public launch the site is hidden behind
a password unlock; testers who unlock reach a portal (`DevHomePage`) that launches into the three
apps. The gate is the **launch switch** — flipping it off reveals the marketing site, already built
at its final URLs. Already partly in code (`preview-access`, `dev-home`).

## Scope / Slices

- Password unlock dialog → `POST /api/preview/unlock`; grant persisted (session).
- Coming-soon teaser for ungated visitors (`LandingPage` teaser today).
- Tester portal at `/apps` (`DevHomePage`): cards for Website / Club-App / Event-App as launch
  links — Website live (→ `/`), the other two disabled ("Geplant") until those deployments exist.

## Decisions

- **Three zones** (see [Site-Shell](feature-site-shell.md)):
  - **Always-public legal** — `/imprint`, `/privacy` bypass the gate (legally required reachable).
  - **Gated marketing** — `/` and the real pages; ungated `/` shows the coming-soon teaser.
  - **Gated portal** — `/apps`, granted-only; gate-unlock redirects here.
- **Portal moves to `/apps`; the real site owns `/`** — built at final URLs so launch is just
  flipping the gate, no re-pathing.
- `DevHomePage` **stays** as the portal; its app cards become launch links (Website live, others
  disabled).
- Everything but the legal pages sits behind the gate until launch.

## Open Questions

- Launch mechanism: how the gate is flipped off (build flag, backend toggle, env).
- Does the teaser persist as a post-launch fallback, or is it retired?

## Done When

- Ungated visitors see the teaser (+ reachable legal pages); testers unlock into `/apps` and can
  reach the real site behind the gate.
- Legal pages are reachable without unlocking.

## References

- Code: `features/preview-access`, `features/dev-home`, `features/landing` (teaser).
