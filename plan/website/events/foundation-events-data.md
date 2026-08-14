---
title: Events-Datenfundament
slug: events-data
route: —
type: foundation
status: shipped
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

1. **Seed module** — `src/lib/seed/events.ts`: `SalesStatusSchema` (7 public values),
   `EventSchema` (id, title, type, venue, `startsAt`, nullable `doorsOpenAt` /
   `ageHint` / `price` / `capacity` / `presaleStartsAt`, `freeCount` from `onSale` on,
   teaser), a **builder** that derives `salesStatus` from counts + dates so seeds can't
   contradict themselves, and `SEEDED_EVENTS` (six evenings, mid-VVK snapshot, no
   `cancelled`). Tests: builder derivation for all 7 states, schema parse, snapshot rules.
2. **`events` feature scaffold** — `features/events/` with `api.ts`
   (`useEventsQuery` + `eventKeys`, Gruppen pattern) and the pure presentation
   derivations (salesStatus → German label / urgency kind / short label — the `evStatus`
   idea, one phrasing for all states). Tests on the pure functions.
3. **Teaser rewire** — the landing Programm-Teaser consumes the seed through its own thin
   hook; the Rosenmontagsumzug and extra venues drop out; `PROGRAM_EVENTS` is deleted.
   Existing teaser visuals stay.

Deliberately **not** in this foundation: the shared UI primitives (date block, capacity
bar, status badge). They are mandated to live as `events`-feature shared components with
one home, but they are built when the first page consumes them (page-event-list's E-phase,
the pre-rename "page-program") —
the foundation ships no unconsumed UI.

## Decisions

Carried from the absorbed `feature-event-calendar.md` stub (2026-08-12):

- Consumes **published Eckdaten** from the future backend (public read); the website never
  edits events. The home Programm-Teaser is a teaser of this same data.

Shaping session 2026-08-13:

- **The model covers ticketed evenings only.** Programm (website sense) was narrowed in
  `CONTEXT.md`: unticketed happenings (Rosenmontagsumzug) are not part of the Programm and
  not listed on the website. Consequence: the shipped `PROGRAM_EVENTS` teaser constant
  (`landing/program-content.ts`) currently lists a Rosenmontagsumzug at the Dorfplatz and
  two extra venues — the teaser rewire must drop them, not migrate them.
- **One venue, confirmed:** every ticketed evening happens in the **Dorfgemeindehaus
  Großfurra** (mock fact verified by the user). Venue still travels as a per-event field in
  the payload; all seeds share the one value.
- **Capacity and seating plan are per event** — the mock's fixed 288/24×12 is rejected as
  a constant. `capacity` is a per-event field; the hall is set up differently per event,
  so the seat picker must treat the seating plan as event data, never a baked layout
  (detail lives in [page-seat-picker.md](page-seat-picker.md)). A save/load templating
  system for seating plans is a future Club-App idea, noted, not scheduled.
- **Price varies per event** — `price` is a per-event field with genuinely different seed
  values; flat within one event (every seat costs the same that evening). The mock's flat
  12 € and its "für jeden Abend gleich, für jeden Platz gleich" copy are rejected.
- **Progressive publishing:** guaranteed at `announced`: title, type, date, Beginn, venue,
  teaser. Nullable until known: Einlass, age hint, price, capacity, `presaleStartsAt`.
  `freeCount` exists only from `onSale` onward. Announced events render honestly with just
  the core — no price, no counts, no purchase CTA.
- **Seed lineup:** the mock's six event types are the club's real usual season
  (1. + 2. Prunksitzung, Weiberfasching, Jugendfasching, Rentnerfasching, Kinderfasching)
  with the calendar-correct 2026/27 dates; teasers, times, prices, capacities are
  recognisably placeholder until the club supplies real ones.
- **Seeds show a plausible mid-VVK snapshot** (mix of presaleScheduled → soldOut states),
  never `cancelled` — seeds are shipped public content until the backend exists, and the
  site must not assert a cancellation that isn't. The exported seed **builder** covers
  `cancelled` and every other state in tests.
- **Ids/slugs follow the Galerie precedent** — German domain words + year
  (`prunksitzung-1-2027`), matching `prunksitzung-2026` album slugs.
- **Event data is consumed the Gruppen way** — one `src/lib/seed/events.ts` module; each
  feature that needs it wraps it in its own thin `api.ts` React Query hook (membership /
  group-matcher precedent). The landing teaser rewires onto this seed and **drops the
  Rosenmontagsumzug**.
- **One `events` feature** owns all five pages of the area (components, `api.ts`, the
  shared primitives as feature-internal components); routes compose it. No per-page
  features, no domain UI in `src/components/`.
- **Session is derived, never stored** — reuse `sessionAt()` from `lib/club.ts` (the
  Album precedent) wherever a page needs an event's Session. No `@furria/ui` promotion:
  the area is website-only, so the rule of three cannot trigger yet.
- **Eckdaten verified per field:** Einlass + Beginn times, an age hint and a teaser
  sentence + event type are real published Eckdaten. The mock's rough end time
  ("ca. 2:00") is **dropped** — the club doesn't promise an end publicly.
- **Age hint is a free-text German field** (optional). Display copy only — some hints are
  recommendations, some hard rules; nothing filters or computes with it.
- **Motto is per Session, not per event** — no motto field on the event model. The master
  plan's Eckdaten list ("name/date/location/motto") reads motto as Session-level.
- **Sales status is a backend-owned lifecycle enum** (`salesStatus`), not derived in the
  frontend and not the mock's four ad-hoc states. Public values: `announced` (published,
  no VVK date yet) · `presaleScheduled` · `onSale` · `almostSoldOut` · `soldOut` ·
  `salesClosed` (VVK over, event still upcoming) · `cancelled`. `NotPublished` exists only
  inside the backend and is **not** part of the public schema. The backend owns the
  `almostSoldOut` threshold; `capacity`/`freeCount` travel alongside for the
  "N von M frei" phrasing. **The seed module derives the enum from the counts via a
  builder**, so seeds can never be self-contradictory (the mock stored status redundantly
  and could lie).

## Open Questions

All resolved in the 2026-08-13 shaping session — see Decisions. Two implementation
details are left to the build, flagged here so they're chosen consciously: the price
unit (euro cents vs decimal euros — check what the Ledger design assumes) and the exact
`almostSoldOut` threshold used by the seed builder (the backend will own the real one).

## Done When

- The Zod-parsed seed is the **single source of event data**; `PROGRAM_EVENTS` is gone
  and the home teaser renders ticketed evenings from the seed (no Umzug).
- The seed builder derives `salesStatus`; a hand-written status field cannot disagree
  with counts anywhere.
- All 7 public states have tested German label derivations; `cancelled` is exercised in
  tests only, never seeded.
- Full gates pass: typecheck, tests, lint, build.

## Implementation plan (E-phases)

- **E1 — Events data foundation** (this file, all three slices): seed module → feature
  scaffold → teaser rewire. One phase; per-slice reviews and full gates as in P0–P6.

## As built (E1, 2026-08-13)

All three slices shipped as planned. The two flagged implementation details were resolved:

- **Price travels as `priceCents` (integer euro cents).** The Ledger design docs pin no
  unit; cents match the Stripe/PayPal settle paths and avoid float math in JS. The field
  name carries the unit.
- **Seed-builder `almostSoldOut` threshold:** `freeCount ≤ ceil(10 % of capacity)` —
  a placeholder constant inside the builder; the backend will own the real rule.

Deviations and decisions made during the build, none silent:

- **`salesClosed` derives from a builder-only `presaleEndsAt` fact** that is not part of
  the public `EventSchema` (the pinned contract stays enum + `capacity`/`freeCount`), so
  every non-cancelled state derives from counts + dates. `cancelled` has its own
  `buildCancelledEvent` and appears in tests only.
- **Snapshot moment** is an exported `SEED_SNAPSHOT_AT` (2026-12-01 12:00); the seed mix
  is 2× presaleScheduled (Rentner-, Kinderfasching), 2× onSale, 1× almostSoldOut,
  1× soldOut. Rentnerfasching exercises progressive publishing (null Einlass, age hint,
  price, capacity).
- **Teaser rewire:** landing owns `useLandingEventsQuery` (own key, Gruppen pattern) plus
  a thin `useTeaserEvents` hook that selects the three earliest evenings and **excludes
  `cancelled`** — the teaser renders no status, so a cancelled evening would otherwise
  look bookable. Loading/error deliberately collapse to an empty teaser (decorative
  section, seed resolves instantly) — thinner than membership's source-union pattern.
- **`formatNumericDate` was added to `lib/date.ts`** (review finding): the status-label
  derivations reuse the shared German date formatters instead of hand-splitting strings.
- Full gates pass; the only failing suite is the pre-existing ApplyPage flake
  (5 s timeouts under load, fails on a clean tree too — unrelated to E1).

## References

- [Area plan](master-plan.md) · [`CONTEXT.md`](../../../CONTEXT.md) (Programm, Session)
- P6 seed pattern: [website master plan](../master-plan.md) → P6 cross-cutting
- [Programm-Teaser](../feature-events-teaser.md) (the existing consumer to rewire)
