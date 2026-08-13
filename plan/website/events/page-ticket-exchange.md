---
title: Kartenbörse
slug: ticket-exchange
route: decided in shaping
type: page
status: skeleton
mock: docs/design/events-page/ (fcc-web-boerse.jsx — EvBoerseDesktop / EvBoerseMobile, EvWaitPanel, EvSwap)
depends-on: [foundation-events-data, page-seat-picker]
adrs: []
---

## What & Why

The club's answer to sold-out evenings and empty chairs: return a ticket you can't use, the
Warteliste moves up, the price stays the price — no private resale, no markup. The mock's
best *idea* in the whole bundle: it turns "ausverkauft" from a dead end into a queue, and
it fits a village hall where the doorman knows who sits where. Also the most
backend-dependent page of the area — nearly everything it promises (returns, refunds,
Vorkaufsrecht windows, notifications) is a server-side process.

## Mock inventory (inspiration only)

- Returned-seat rows: seat + location hint, when returned, state (Vorkaufsrecht läuft ·
  öffentlich, sofort sicherbar) with claim CTA
- `EvWaitPanel`: join the Warteliste, position, "chance" meter, no prepayment
- `EvSwap`: Zurückgeben / Abend tauschen tabs (return by ticket number, free one-time swap
  to another evening)
- Stats row (returns this Session, free now, waitlist length, "0 € Aufpreis, immer")
- "Warum nicht privat verkaufen" panel: named tickets, old QR invalidated on transfer
- 4-step how-it-works · integration points elsewhere: Börse band on `/events`, waitlist
  panel on sold-out detail pages, freed (gold) seats in the Saalplan
- Mock flows that P6 precedent flags: SMS notifications with 6-hour Vorkaufsrecht — an
  unbuilt flow like the one P6 cut from the Antrag

## Scope / Slices

Filled in shaping.

## Decisions

Carried from the events-list shaping (2026-08-13):

- **This page owns the Börse mechanics shaping.** The user confirmed the mock's
  return → waitlist → SMS/Vorkaufsrecht flow is *not* settled club intent — "how the
  Börse works must be well planned by us". Until then, `/events` ships only a concept
  teaser band ("Ausverkauft ist nicht das Ende" + one sentence, zero mechanics claims);
  **this page's E-phase replaces that teaser with the real band + link** once the
  mechanics are decided here.

## Open Questions

- What this page honestly is in a frontend-only build: an informational "so wird es
  laufen" page? A waitlist signup that fails honestly like the P6 Antrag? The returns
  list cannot be real without a backend.
- Is the Börse model (return → waitlist with Vorkaufsrecht → public) the club's actual
  intent, or design fiction to confirm? Same for the free evening swap and named tickets.
- Notification channel: the mock promises SMS — P6 killed a promised SMS flow; mail is
  the only channel the club plausibly has.
- Terminology: **Kartenbörse**, **Warteliste**, Rückgabe — glossary candidates for
  `CONTEXT.md` once shaped (avoid: Zweitmarkt, resale).
- Refund mechanics ("Geld zurück, sobald der Platz weg ist") are Ledger territory — the
  deferred contract must capture them even though the page ships without.

## Done When

Filled in shaping.

## Implementation plan (E-phases)

Filled in shaping.

## References

- [Area plan](master-plan.md) · [Purchase](page-purchase.md) ·
  [Seat picker](page-seat-picker.md) · [Event detail](page-event-detail.md)
- [`CONTEXT.md`](../../../CONTEXT.md) — Ledger
