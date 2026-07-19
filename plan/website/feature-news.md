---
title: Aktuelles
slug: news
type: capability
status: idea
mock: -
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

Club news / announcements ("Aktuelles"): a list of posts and a detail page. Keeps the public
site alive between events and gives the club a channel for updates (season kickoff, results,
notices) that also feed social sharing.

## Scope / Slices

- News list (newest first) with teaser cards.
- News detail page (title, date, body, image).
- Shareable (Open Graph) via [SEO & Meta](feature-seo-meta.md).

## Decisions

- Public, read-only on the website.
- News detail is a share-critical **dynamic** page: its OG/`<title>` meta is injected for bot
  user-agents per the static-first strategy
  ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md)) — see
  [SEO & Meta](feature-seo-meta.md).

## Open Questions

- **Content ownership:** where are posts authored — a Club-App admin surface, a headless CMS,
  or markdown in the repo? (Cross-cutting; may warrant an ADR.)
- Categories/tags needed, or a flat list?
- Rich text / images — what does the body format support?

## Done When

- Visitors read a list of posts and open a full post; shared links render a rich preview.

## References

- Design README §1 (public website: news/gallery).
