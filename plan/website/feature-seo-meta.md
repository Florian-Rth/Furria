---
title: SEO & Meta
slug: seo-meta
type: foundation
status: idea
mock: -
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

A public marketing site must be discoverable and shareable. This covers the document head:
per-page title/description, canonical URLs, Open Graph / Twitter cards (so a shared event or
news link renders a rich preview), favicon/app icons, and sitemap/robots. Ties into the
event planner's "auto-generate shareable material" ambition on the public side.

## Scope / Slices

- Base document head + favicon/app icons + sensible defaults (P0).
- Per-page title/description/canonical.
- Open Graph / social-share cards, especially for events and news detail.
- Sitemap + robots.

## Decisions

- German content; brand-true share imagery.

## Decisions

- **Static-first, no SSR** ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md)):
  prerender stable routes for crawlable HTML; inject OG/`<title>` meta for bot user-agents on
  dynamic detail pages (event, news) via edge middleware or a .NET meta endpoint — social
  scrapers don't run JS, so this is how share previews work.

## Open Questions

- Concrete meta-injection mechanism: edge middleware vs. a `<meta>`-serving endpoint on the API.
- Are per-event OG images generated (matching the planner's Werbung feature) or static?

## Done When

- Every page has a correct title/description; shared links render a branded preview.
- Search engines can crawl the public routes.

## References

- Design README §9 (Veranstaltungsplaner → Werbung: auto-generated shareable material).
