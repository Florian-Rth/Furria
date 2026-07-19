---
title: Veranstaltungskalender
slug: event-calendar
type: capability
status: idea
mock: docs/design/fcc-ds-events.jsx
adrs: []
---

## What & Why

The public event listing: all upcoming (and past) events with an **event detail** page. The
club's calendar is the spine of the public site — it feeds the home Programm-Teaser, drives
ticket sales, and advertises the season. Events originate in the Club-App's
**Veranstaltungsplaner**, whose **Eckdaten** (name/date/location/motto) are "published
immediately so the public site can advertise."

## Scope / Slices

- Event list / calendar view (upcoming, optionally past).
- Event detail page: Eckdaten (name, date, venue, motto), description, ticket CTA.
- Live ticket **scarcity** surfaced ("nur noch X") where tickets exist.
- Optional filtering (by season/year/type) — later.

## Decisions

- Consumes **published Eckdaten** from the backend (public read); the website never edits
  events.
- The home [Programm-Teaser](feature-program-teaser.md) is a teaser of this same data.

## Open Questions

- List vs. true calendar-grid presentation for v1.
- Which fields are public on the detail page; how tickets link to
  [Ticket-Shop](feature-ticket-shop.md).
- Are past events / an archive shown?

## Done When

- Visitors browse upcoming events and open a detail page with correct Eckdaten + ticket CTA.

## References

- Design README §9 (Veranstaltungsplaner → Eckdaten published; scarcity feeds public site).
- Mock: `fcc-ds-events.jsx` (planner side — design direction only).
