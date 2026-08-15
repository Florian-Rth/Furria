---
title: Platzwahl
slug: seat-picker
route: /events/$eventSlug/seats (pinned by event-detail shaping, 2026-08-15)
type: page
status: skeleton
mock: docs/design/events-page/ (fcc-web-tickets.jsx — EvSaal / EvSeatsDesktop / EvSeatsMobile)
depends-on: [foundation-events-data, page-event-detail]
adrs: []
---

## What & Why

Pick your numbered seat in the Saal before paying — the mock's signature interaction: a
schematic hall plan (stage, table rows in blocks, Theke) where free seats are tappable,
taken seats are muted, and your selection builds a running total. The heaviest UI in the
area, and the piece that makes buying a ticket feel like sitting in the room.

## Mock inventory (inspiration only)

- `EvSaal`: 3 blocks × 8 double-rows × 12 seats (= 288, unverified), stage banner, row
  tabs, Theke/Eingang footer zones
- Legend (frei / belegt / dein Platz / zurückgegeben / Gruppe) · selection cap (10)
- Selection list with location hints ("Nah an der Bühne / Mitte / Nah an der Theke"),
  per-seat remove, sum, CTA to payment
- Hold timer ("Plätze für dich reserviert · 9:41")
- Gold seats: Gruppenbestellung (a Gruppe collecting a row) and Börse returns surfaced
  in-plan; sold-out mode shows only returned seats
- State-dependent H1 ("SETZ DICH, WOHIN DU WILLST." / "DIE LETZTEN N PLÄTZE." / "ZURÜCK IM
  VERKAUF: N PLÄTZE.")

## Scope / Slices

Filled in shaping.

## Decisions

Carried from the foundation shaping (2026-08-13):

- **The seating plan is per-event data, never a baked layout.** Capacity is selectable per
  event and the hall is set up differently each time — the mock's fixed 3×8×12 geometry is
  invention. A save/load template system for seating plans is a future Club-App idea
  (Veranstaltungsplaner side); the public data shape must not contradict it.

Pinned by the event-detail shaping (2026-08-15):

- **Route is `/events/$eventSlug/seats`** — the seat picker is meaningless without an
  event, so it nests under one; English per the area's standing rule. **E3 creates it as a
  `PlaceholderPage`** and the event page's ticket panel links into it for the live-sale
  states; this page's own E-phase replaces the placeholder.
- **E3 already carries the buy CTA** ("Platz wählen →") under the area's revised
  "planned end state" rule — this page inherits an entry point instead of retrofitting one.

## Open Questions

- **Scope reversal to confirm:** the absorbed `feature-ticket-shop.md` stub explicitly
  deferred seat selection ("v1 is general-admission / quota-based"); this area plan brings
  the Saalplan in. Confirm numbered seats are how the club actually sells.
- The real hall layout (rows, blocks, seats per table, Stehplätze) — the mock's geometry is
  invented. Static config or future backend data? (Design §7 note: the Club-App
  Saalplan-Editor is "built generic … reused as the public seat map" — out of scope here,
  but the data shape should not contradict it.)
- What seat availability honestly means with seeded data, and what a hold timer means with
  no backend — is a hold even representable, or does the flow stop earlier?
- Accessibility of a seat grid (keyboard navigation, screen-reader seat naming, touch
  targets at 360px) — the mock's 9px mobile seats are far below touch minimums.
- Gruppenbestellung and in-plan Börse returns: real practice or mock invention?
- Rollstuhlplätze handling (mock: "an Reihe 1, kurz anrufen").

## Done When

Filled in shaping.

## Implementation plan (E-phases)

Filled in shaping.

## References

- [Area plan](master-plan.md) · [Event detail](page-event-detail.md) ·
  [Purchase](page-purchase.md) · [Kartenbörse](page-ticket-exchange.md)
