---
title: Programm
slug: program
route: /program
type: page
status: skeleton
mock: docs/design/events-page/ (fcc-web-events.jsx — EvIndexDesktop / EvIndexMobile)
depends-on: [foundation-events-data]
adrs: []
---

## What & Why

The public event list at `/program` — the page the masthead nav ("Programm"), the landing
Programm-Teaser ("Alle Termine →") and the news band already point at; today it renders
`PlaceholderPage`. It lists the Session's public events with dates, venue and ticket
status, and is the entry point to every other page in this area. Likely the most-visited
page of the site.

## Mock inventory (inspiration only)

- Hero: eyebrow + H1 + intro, derived stat row (Abende / price / seats / free), "Termine
  abonnieren" CTA
- "Nächster Abend mit Karten" hero card: countdown, live capacity bar, primary CTAs,
  sold-out cross-link to the Kartenbörse
- Spielplan list rows: boxed date block · title/meta/teaser · status + CTA per row
- List ↔ two-month mini-calendar toggle
- Venue block (all evenings, one hall) with address/parking/Heimweg facts (unverified)
- Kartenbörse band, filmstrip rhythm element, FAQ accordion ("Alles, was du wissen
  musst"), calendar-subscribe band (ICS + "Spielplan als PDF")

## Scope / Slices

Filled in shaping.

## Decisions

Carried from the absorbed `feature-event-calendar.md` stub (2026-08-12):

- Consumes published Eckdaten; the website never edits events.

## Open Questions

- List vs. calendar for v1 (carried from the stub) — the mock ships both behind a toggle;
  is a mini-calendar worth it for ~6 events a Session?
- Are past events / an archive shown? (carried)
- Does every event get a detail page, or only ticketed ones?
- Page heading language: the nav says **Programm** (glossary, website sense), the mock's
  H1 says "VERANSTALTUNGEN" — resolve in shaping, in `CONTEXT.md` if a term crystallises.
- Which of the mock's FAQ/venue facts are true (payment methods, Barrierefreiheit, price,
  parking, shuttle)?
- Calendar subscription: a static `.ics` file is buildable without a backend — worth it?
- What the hero card's "live" Kartenstand honestly is while data is seeded.

## Done When

Filled in shaping.

## Implementation plan (E-phases)

Filled in shaping.

## References

- [Area plan](master-plan.md) · [Foundation](foundation-events-data.md)
- [Programm-Teaser](../feature-program-teaser.md) — the shipped teaser of this page's data
- Design README §9 (Veranstaltungsplaner → Eckdaten published; scarcity feeds public site)
