---
title: Veranstaltungsseite
slug: event-detail
route: decided in shaping (child of /program)
type: page
status: skeleton
mock: docs/design/events-page/ (fcc-web-events.jsx — EvDetailDesktop / EvDetailMobile)
depends-on: [foundation-events-data]
adrs: []
---

## What & Why

One event's own page: the Eckdaten (date, Einlass, Beginn, venue), what the evening is,
who performs, photos from the same occasion last year, and the ticket status with the CTA
into the purchase flow. The page that turns "I saw a date" into "I'm buying a seat" — and
the share target for a single event.

## Mock inventory (inspiration only)

- Tag row (type · Session · age hint · venue) + big derived stat row (date, Einlass,
  Beginn, Ende, price)
- Ticket panel: price, live capacity bar, state-dependent CTA (Platz wählen / Warteliste
  when ausverkauft / Erinnerung when VVK not open), payment hints, Gruppenbestellung note
- "So war es letztes Jahr" Foto-Theater — an auto-advancing photo stack pulled from the
  Galerie, with pause + dots
- "Wer auftritt" Gruppen chips · Ablauf block (one honest line while unpublished; a
  collapsible timed rundown once it exists; "live" mode teaser for the evening itself)
- Saal info card, "Auch noch in dieser Session" cards, closing band with countdown + CTA

## Scope / Slices

Filled in shaping.

## Decisions

None yet — filled in shaping.

## Open Questions

- Route + slug scheme: events recur every Session ("Prunksitzung" ×2 per year) — the
  Galerie solved uniqueness by deriving the Session; same trick here?
- Which fields are published Eckdaten vs. invention (Ablauf with computed times? age
  recommendations? Einlass?).
- The **Ablauf/live running order is Club-App territory** (glossary: Programm, Club-App
  sense) — how much of it can this page honestly promise in a frontend-only build?
- Photos "automatically from the Galerie": features never import each other — composition
  happens in the route, or the link lives in shared `lib`. Also: does a matching Album
  even exist per event type?
- Waitlist panel on sold-out events: this page or the Kartenbörse's component? (Owner:
  [page-ticket-exchange](page-ticket-exchange.md).)
- "Gruppenbestellung" (a Gruppe collecting a row): real club practice or mock invention?

## Done When

Filled in shaping.

## Implementation plan (E-phases)

Filled in shaping.

## References

- [Area plan](master-plan.md) · [Foundation](foundation-events-data.md) ·
  [Programm](page-program.md)
- [Galerie](../feature-gallery.md) — Session derivation + photo source precedent
