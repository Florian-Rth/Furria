---
title: Bildergalerie
slug: gallery
type: capability
status: idea
mock: -
adrs: []
---

## What & Why

Public photo gallery of events — the club's celebratory face. Lets visitors relive events and
gives prospective members a feel for the atmosphere. Related to (but distinct from) the
Club-App's member gallery, which is consent-gated for uploads.

## Scope / Slices

- Gallery overview (by event / album).
- Photo grid + lightbox viewing.
- Public, view-only (no public upload).

## Decisions

- Website gallery is **view-only**; uploads happen in the Club-App (consent-gated there).
- Only photos cleared for public display appear (photo-consent respected).

## Open Questions

- **Photo-consent boundary:** which photos are public vs. members-only — how is that flagged?
- Album model: grouped by event, by season, or flat?
- Performance/storage: image sizes, lazy loading, CDN.

## Done When

- Visitors browse public event photos in albums with a lightbox, consent respected.

## References

- Design README §9 (Bildergalerie — gated by photo-consent). `CONTEXT.md` (photo-consent).
