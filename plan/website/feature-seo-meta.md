---
title: SEO & Meta
slug: seo-meta
type: foundation
status: ready
mock: -
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

A public marketing site must be discoverable and shareable. This covers the document head: per-page
title/description, canonical URLs, Open Graph / Twitter cards (so a shared event or news link renders
a rich preview), favicon/app icons, and sitemap/robots. Ties into the event planner's "auto-generate
shareable material" ambition on the public side.

## Scope / Slices

- P0: base document head + defaults + favicon/app icons + `robots.txt`.
- Per-page title/description/canonical (with each page).
- Open Graph / social-share cards, especially for events and news detail.
- Sitemap (once real public routes exist).

## Decisions

- German content; brand-true share imagery.
- **Head management via TanStack Router's built-in `head` API** (`head: () => ({ meta, links })` on
  routes + `<HeadContent/>` in `__root`) — no `react-helmet`. Forward-compatible: works SPA-injected
  now, prerendered later.
- **Static-first, no SSR** ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md)): prerender
  stable routes for crawlable HTML; inject OG/`<title>` meta for bot user-agents on dynamic detail
  pages (event, news) — social scrapers don't run JS, so this is how share previews work.

**P0 base:**

- Root-route defaults: title template `%s · FURRIA`, default description, `lang="de"` (already set),
  `theme-color`, OG/Twitter defaults (`og:locale de_DE`, default share image, card type).
- Favicon/app-icon `<link>`s wired; a placeholder mark is acceptable — real broom/FURRIA icons are a
  tracked **asset task**, not a P0 blocker.
- **`robots.txt` disallows indexing while gated** (only the teaser is public pre-launch); flip to
  allow at launch. **Sitemap deferred** — no real public routes to list yet.

**Deferred:**

- **Prerender mechanism → around content-completion / launch** (P4): nothing to prerender while the
  site is gated. The `head` API is prerender-ready; the concrete SSG choice is its own spike.
- **Bot OG-meta injection mechanism** (edge middleware vs. a `<meta>`-serving endpoint on the API) →
  when the first dynamic detail page ships (news P4 / event P5).
- Per-event OG images generated (matching the planner's Werbung feature) vs. static.

## Done When

- Every page has a correct title/description; shared links render a branded preview.
- Search engines can crawl the public routes (post-launch).

## References

- Design README §9 (Veranstaltungsplaner → Werbung: auto-generated shareable material).
