---
title: Kauf & Karte
slug: purchase
route: decided in shaping
type: page
status: skeleton
mock: docs/design/events-page/ (fcc-web-tickets.jsx — EvKarteDesktop / EvKarteMobile, EvTicket)
depends-on: [foundation-events-data, page-seat-picker]
adrs: []
---

## What & Why

From selected seats to a ticket in hand: buyer details, payment, and the confirmation page
with the digitale Karte (QR code, seat list, what-happens-next). **The mock skips the
checkout step entirely** — it jumps from seat selection straight to "BEZAHLT"; the real
flow needs the step the mock omitted. In the frontend-only scope, where this flow honestly
ends (before payment, always) is the central shaping question.

## Mock inventory (inspiration only)

- Confirmation page: "BEZAHLT · MAIL IST UNTERWEGS" hero, Wallet / PDF / calendar actions
- `EvTicket`: the printed-ticket object (FURRIA masthead, Nº, seats, paid line, QR stub,
  "Handy oder Ausdruck — beides geht")
- "Was jetzt passiert" steps (mail with QR, reminder two days before, live Ablauf on the
  evening)
- Return/swap teaser into the Kartenbörse, cross-sell card for the other open evening
- Payment mentions across the mock: Kreditkarte, PayPal, "reservieren und bar im
  Vereinsraum zahlen" (all unverified)

## Scope / Slices

Filled in shaping.

## Decisions

Carried from the absorbed `feature-ticket-shop.md` stub (2026-08-12):

- **Ledger is the source of truth; payment methods are pluggable** — member-facing methods
  are Stripe (card) + PayPal (design §10). No parallel payment truth.
- **Guest checkout** — a public buyer needs no Account.

## Open Questions

- What an honest frontend-only checkout is: stop with a truthful "Vorverkauf läuft noch
  nicht online" state? A reserve-request that fails honestly like the P6 Antrag? Nothing
  that pretends money moved.
- Is "reservieren und bar im Vereinsraum zahlen" real club practice? If so, is a
  reservation (no payment) the one transaction worth a real backend later — recorded in
  the deferred contract?
- Ticket delivery: QR per mail, PDF, Wallet passes — what is promised vs. P6's rule
  against advertising unbuilt software?
- Buyer data: what does the club actually need (name per seat? one buyer?), and what does
  DSGVO say about keeping it?
- Where the digitale Karte lives afterwards: mail-only, or a token-addressed page?

## Done When

Filled in shaping.

## Implementation plan (E-phases)

Filled in shaping.

## References

- [Area plan](master-plan.md) · [Seat picker](page-seat-picker.md) ·
  [Kartenbörse](page-ticket-exchange.md)
- [`CONTEXT.md`](../../../CONTEXT.md) — Ledger ·
  [ADR-0004](../../../docs/adr/0004-website-writes-membership-applications.md) (honest-failure precedent)
