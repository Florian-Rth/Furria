---
title: Programm-Teaser
slug: program-teaser
type: capability
status: idea
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The home page's "DAS PROGRAMM" section: a short teaser of upcoming events (3 cards) with an
"Alle Termine →" link into the full [Veranstaltungskalender](feature-event-calendar.md). It is
the marketing bridge that turns the home page into a reason to buy tickets — and later carries
**live ticket-scarcity** as a scarcity/marketing signal.

## Scope / Slices

- Section header (Anton "DAS PROGRAMM") + "Alle Termine →" link.
- 3 upcoming event cards (date block, title, venue/time, tint) — desktop grid / mobile rows.
- Placeholder data first (P2), then wired to the live API (P5).
- Scarcity badge on cards ("nur noch X Tickets") once event/ticket data exists.

## Decisions

- Reads the same event data as the full calendar — a **teaser view**, not a separate source.
- Card visuals from the mock (`LProgramCard` desktop / `LEventCard` mobile).
- P2 uses **static placeholder content**, not a mock API — event data shapes are undefined until
  P5 and will change (see [API-Client](feature-api-client.md)). Wiring to the live API is P5.

## Open Questions

- How are the 3 events chosen — next 3 by date, or curated/featured?
- Scarcity: exact threshold + copy for the "nur noch X" badge.
- What shows when there are no upcoming events (empty state)?

## Done When

- The home page shows upcoming events (placeholder → live) with a link to the full calendar.

## References

- Mock: `fcc-ds-landing.jsx` (`LProgramCard`, `LEventCard`, "DAS PROGRAMM").
- Design README §9 (Vorverkauf → "live remaining-ticket scarcity feeds the public site").
