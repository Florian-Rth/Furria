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
- Coming-soon teaser for ungated visitors (the gate's face — **owned here** since P1, moved out
  of `features/landing`; see Decisions).
- ~~Tester portal at `/apps` (`DevHomePage`)~~ — **removed 2026-07-20**, see Decisions.

## Decisions

- **Portal removed (2026-07-20, post-P0):** the `/apps` tester portal shipped in P0 and was
  dropped right after — with the site living at its final URLs behind the gate, a separate
  launcher added nothing. Unlock now simply reveals the gated site at `/`; the `dev-home`
  feature was deleted. Two zones remain: always-public legal, gated marketing.
- **Teaser owned by the gate (P1):** the coming-soon teaser moved from `features/landing` into
  `features/preview-access` — it is the gate's ungated face, not the real front door. This freed
  `features/landing` for the real home page (see [Landing](feature-landing.md)). `/` still branches
  inline: ungated → teaser, granted → the real landing in `SiteChrome`.
- **`/` moved under the `_site` layout (2026-07-23, post-P2 bugfix):** `/` was originally a standalone
  route rendering its own `SiteChrome`, which double-mounted the chrome and remounted the whole
  masthead/footer whenever the user crossed between `/` and any inner page. `/` is now the `_site`
  index (`routes/_site/index.tsx`) so a single `SiteChrome` persists across the landing and all inner
  pages. The gate branching is unchanged in spirit; the teaser stays chrome-less because the `_site`
  layout renders a bare `Outlet` only for the ungated home (`!granted && pathname === '/'`) and
  `SiteChrome` for everything else. See [Landing](feature-landing.md) `/`-routing decision.
- **Three zones** (see [Site-Shell](feature-site-shell.md)) — *portal zone since removed, see above*:
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

- Code: `features/preview-access` (unlock + teaser), `features/dev-home` (deleted).
