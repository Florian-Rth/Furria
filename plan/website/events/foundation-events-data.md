---
title: Events-Datenfundament
slug: events-data
route: —
type: foundation
status: skeleton
mock: docs/design/events-page/ (EV_EVENTS, evStatus, EvBar, EvTag, date block, EvCountdown)
depends-on: []
adrs: []
---

## What & Why

The shared layer every events page stands on: the seeded event model (Zod schemas, React
Query hooks, a `src/lib/seed/` module shaped exactly like the future public read endpoint),
the derived status/scarcity logic, and the shared UI primitives the mock repeats on every
view (date block, capacity bar, status badge). Planned first so no single page accidentally
owns the area's data shapes — P4.1's five-card-dialects lesson, applied up front. Also
rewires the shipped **Programm-Teaser** onto the same seed, so event data has one source of
truth (the move P6 made for `/club`'s Gruppen).

## Mock inventory (inspiration only)

- `EV_EVENTS` — the event model: date/time fields, Einlass/Ende, type, capacity, free
  count, status (`offen · knapp · ausverkauft · bald`), VVK start date, age hint, teaser
- `evStatus` / `evKind` / `evShort` — status → label/CTA/color derivation, one phrasing for
  all states ("N von 288 frei", color carries urgency)
- `EvBar` (capacity bar), `EvTag` (badge), the boxed date block in `EvRow`, `EvCountdown`
  (seconds only when they mean something)
- One venue for everything (`EV_ORT`), one flat price (`EV_PREIS`) — both unverified

## Scope / Slices

Filled in shaping.

## Decisions

Carried from the absorbed `feature-event-calendar.md` stub (2026-08-12):

- Consumes **published Eckdaten** from the future backend (public read); the website never
  edits events. The home Programm-Teaser is a teaser of this same data.

## Open Questions

- The real event model: which fields are true Eckdaten vs. mock invention (capacity? age
  hints? Einlass/Ende times? one flat price?). What does the club actually know about an
  event at publish time?
- Status derivation: is `bald` a stored state or derived from a VVK window? Is scarcity a
  count or a bucket?
- Session grouping: reuse the Galerie's `sessionAt()` derivation?
- Which primitives are area-local vs. `@furria/ui` candidates (rule of three applies).
- How the existing `PROGRAM_EVENTS` placeholder constant (P2) reconciles with the new seed
  — same occasions, one swap point.

## Done When

Filled in shaping.

## Implementation plan (E-phases)

Filled in shaping.

## References

- [Area plan](master-plan.md) · [`CONTEXT.md`](../../../CONTEXT.md) (Programm, Session)
- P6 seed pattern: [website master plan](../master-plan.md) → P6 cross-cutting
- [Programm-Teaser](../feature-program-teaser.md) (the existing consumer to rewire)
