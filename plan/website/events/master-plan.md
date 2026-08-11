# Events & Tickets — Area Plan

The public **Events area** of the website: the Programm (event list), event detail pages,
the ticket purchase flow (seat picker → checkout → digitale Karte) and the Kartenbörse.
Expected to become the most-visited part of the site. This file is the area's dashboard;
it lives under the [website master plan](../master-plan.md), which carries only a pointer
row and one-line phase entries — **detail lives here, in exactly one place**.

---

## How this plan works — READ FIRST

Rules for any agent or human touching this area. They encode the decisions of the
2026-08-12 structure grilling; follow them without being re-told, and do not re-litigate
them silently.

### Files & roles

- **This file** — area dashboard: page index, build order, E-phase log, area-wide
  decisions, deferred-backend contract list.
- **Page plans** (`page-*.md`, `foundation-*.md`) — the single home for one page: its
  intent, decisions, open questions, slices and implementation phases. One file per page.
- **Glossary** terms live in [`CONTEXT.md`](../../../CONTEXT.md) **only** — this plan uses
  them, never redefines them. Cross-cutting, hard-to-reverse decisions become ADRs in
  `docs/adr/` and are linked, never restated.
- **Mock rulings** (adopted / rejected, and why) are recorded in the
  [mock README](../../../docs/design/events-page/README.md) during shaping — the join-page
  README is the model.

### Lifecycle — every page, no exceptions

Frontmatter `status`: `skeleton → shaping → ready → building → shipped`.

1. **skeleton** — what the setup session created: rough intent plus open questions.
   **No implementation may ever start from a skeleton.**
2. **shaping** — a dedicated grilling session (`grill-with-docs`) with the user works out
   the page's features, decisions and E-phases. This is where mock rulings land in the
   mock README, resolved terms land in `CONTEXT.md`, and the page's future API contract is
   pinned under [Deferred — backend](#deferred--backend).
3. **ready** — the user approved the plan; phases are defined.
4. **building** — one E-phase at a time, per-slice reviews and full gates (typecheck,
   tests, lint, build) exactly as in website P0–P6. As-built notes land in the page plan;
   the index row here updates.
5. **shipped** — done; deviations from the plan are recorded, never silent.

### Standing rules (binding)

- **Scope: frontend-only with seeds.** No backend work is scheduled for this area
  (structure grilling, 2026-08-12). Every page builds **as if it already fetched** — the
  P6 pattern: Zod schemas + React Query hooks in the feature's `api.ts`, the `queryFn`
  resolving from deletable `src/lib/seed/` modules shaped exactly like the future payload.
  Transactional actions (pay, return, waitlist) must **fail or disable honestly** —
  nothing fake, nothing that pretends money moved. What "honest" means per page is a core
  shaping question.
- **The mocks are inspiration, not spec.** The design README's "READ FIRST" governs; the
  shipped Destillat design system always wins (hard offset-shadows are rejected — sixth
  phase running). Layouts, flows, features and copy may and should be improved; deviations
  are explained, not silent.
- **Mock facts are unverified until the user confirms them.** The mock invents capacity
  (288 seats, 24 rows), a flat 12 € price, six event types with 2027 dates, a named
  Präsidentin with a private mobile number (banned — P5/P6 precedent), SMS flows and a
  shuttle. Every fact a page states must be confirmed in its shaping session; placeholder
  content must be recognisably placeholder.
- **English identifiers, German copy.** Routes, slugs, IDs, props **and plan file names**
  are English; visible text is German. (The Kartenbörse page file is
  `page-ticket-exchange.md`, not "boerse".)
- **Build order** below is the default; deviating is fine, silently deviating is not.

---

## Page index & build order

| # | Plan | Route | Status |
|---|---|---|---|
| 1 | [Events data foundation](foundation-events-data.md) | — | skeleton |
| 2 | [Programm](page-program.md) | `/program` | skeleton |
| 3 | [Event detail](page-event-detail.md) | decided in shaping | skeleton |
| 4 | [Seat picker](page-seat-picker.md) | decided in shaping | skeleton |
| 5 | [Purchase](page-purchase.md) | decided in shaping | skeleton |
| 6 | [Kartenbörse](page-ticket-exchange.md) | decided in shaping | skeleton |

**Absorbed 2026-08-12:** `feature-event-calendar.md` and `feature-ticket-shop.md` (both
`idea` stubs) — their decisions were carried into the page plans above and the files
deleted. The website master plan's feature index now points here.

## E-phases

Build phases are numbered **E1, E2, …** so they never collide with the website's P-phases.
They are created as pages reach `ready`, logged here in full, and mirrored as one-line
pointers in the website master plan. None exist yet.

## Deferred — backend

The backend for this area is **not scheduled**. Each shaping session records the API
contract its seeds pin here, so the eventual backend work has one list to satisfy — the
executable version will be the Zod schemas in `web/apps/website/src/lib/seed/`.

Carried from the absorbed stubs:

- Events **Eckdaten** (name/date/location/motto) originate in the Club-App's
  Veranstaltungsplaner and are published to a public read endpoint; the website never
  edits events.
- **Ledger is the source of truth** for ticket money; payment providers (Stripe, PayPal,
  bar) are pluggable ways to settle ledger entries, never a parallel truth (design §10).
- **Guest checkout** — a public buyer needs no Account.
- Sales respect **Kontingent** (quota) and the VVK-Fenster (sale window).
- The backend ticketing domain is **not yet schema'd** (design §7 lists it as an
  extension).

## References

- Mock bundle: [`docs/design/events-page/`](../../../docs/design/events-page/README.md)
- [`CONTEXT.md`](../../../CONTEXT.md) — Programm (website sense), Session, Ledger
- Website master plan: [scope banner](../master-plan.md#overview) ·
  [Deferred — Club-App-dependent](../master-plan.md#club-app-dependent)
- Seed pattern precedent: website master plan → P6 cross-cutting notes ·
  [ADR-0003](../../../docs/adr/0003-website-rendering-strategy.md)
