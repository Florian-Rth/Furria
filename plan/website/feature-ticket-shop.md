---
title: Ticket-Shop
slug: ticket-shop
type: capability
status: idea
mock: -
adrs: []
---

## What & Why

The public ticket purchase flow: a visitor buys tickets for a ticketed event and pays online.
The heaviest capability and a primary reason the site exists. **Ledger is the source of truth;
payment is pluggable** — member-facing methods are **Stripe (card) + PayPal**. Sales here feed
the same one payment system as Beitrag/Shop/Getränkekasse.

## Scope / Slices

- Browse ticketed events → select ticket type / quantity.
- Checkout: buyer details, payment (Stripe / PayPal), confirmation + receipt.
- Feeds the backend **Ledger**; respects Kontingent (quota) and VVK-Fenster (sale window).
- Live remaining-ticket count → drives scarcity elsewhere.

## Decisions

- **Ledger is source of truth; payment methods are pluggable** (design §10). No parallel
  payment truth.
- Guest checkout — a public buyer needs no Account.

## Open Questions

- **Seat selection is deferred** — v1 is general-admission / quota-based; a seat map may come
  later (the Club-App Saalplan-Editor is "built generic … reused as the public seat map", but
  it is **out of scope for this website plan for now**).
- Depends on a backend **ticketing domain that is not yet schema'd** (design §7 lists it as an
  extension) — this gates Ticketing (**deferred — needs the Club-App backend**).
- Stripe vs. PayPal integration boundary; where the payment session is created (backend).
- Delivery: e-ticket / QR / email — format and validation at the door.

## Done When

- A guest can buy a ticket for an event, pay via Stripe or PayPal, and receive a confirmation,
  with the sale booked to the Ledger.

## References

- Design README §9 (Vorverkauf/Ticketing), §10 (money model).
- `CONTEXT.md` (Ledger). Depends on backend ticketing work.
