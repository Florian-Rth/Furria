# Events & Tickets — Area Plan

The public **Events area** of the website: the Veranstaltungen list, event detail pages,
the Karten-Bestellflow (Kartenwahl → Deine Daten → Zahlung → digitale Karte) and the
Kartenbörse. Expected to become the most-visited part of the site. This file is the area's
dashboard; it lives under the [website master plan](../master-plan.md), which carries only
a pointer row and one-line phase entries — **detail lives here, in exactly one place**.

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
- **Pages are built in their planned end state** (user ruling, event-detail shaping
  2026-08-15; **generalised repo-wide 2026-08-18**, see CLAUDE.md "Build the End State"):
  the website goes live only when the whole platform behind it is ready, so **never build
  temporary, reduced or interim versions** — a CTA may point at a placeholder route, a
  button may call an endpoint that doesn't exist yet, a component may rely on data that
  can't be fetched yet. Incomplete is fine; interim is not. Two limits survive from the
  earlier honesty rule: **nothing may pretend money moved** (a call to a nonexistent
  endpoint genuinely fails — that is the honest failure), and **no surface may state
  mechanics that are undecided** (copy claims only what shaping confirmed).
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
| 1 | [Events data foundation](foundation-events-data.md) | — | shipped |
| 2 | [Veranstaltungen list](page-event-list.md) | `/events` | shipped |
| 3 | [Event detail](page-event-detail.md) | `/events/$eventSlug` (pinned 2026-08-13) | shipped |
| 4 | [Karten-Bestellflow](page-order-flow.md) | `/events/$eventSlug/order` + `/orders/$orderCode` (pinned 2026-08-18; `…/seats` retired) | shipped |
| 5 | [Kauf & Karte](page-purchase.md) | steps 2–3 inside the Bestellflow + `/orders/$orderCode` | shipped |
| 6 | [Kartenbörse](page-ticket-exchange.md) | `/events/exchange` (placeholder route live) | skeleton |

**Absorbed 2026-08-12:** `feature-event-calendar.md` and `feature-ticket-shop.md` (both
`idea` stubs) — their decisions were carried into the page plans above and the files
deleted. The website master plan's feature index now points here.

## E-phases

Build phases are numbered **E1, E2, …** so they never collide with the website's P-phases.
They are created as pages reach `ready`, logged here in full, and mirrored as one-line
pointers in the website master plan.

### E1 — Events data foundation
**Status:** shipped (built 2026-08-13)
The shared data layer per [foundation-events-data.md](foundation-events-data.md): the
seeded event model (`lib/seed/events.ts` — 7-state `salesStatus` schema + self-consistent
seed builder + six-evening mid-VVK snapshot), the `events` feature scaffold (`api.ts`
hook + German status-label derivations), and the landing Programm-Teaser rewired onto the
seed (Rosenmontagsumzug dropped — Programm is ticketed-only now). Shared UI primitives are
deliberately deferred to page-event-list's phase (pre-rename: "page-program").

### E2 — Veranstaltungen list
**Status:** shipped (built 2026-08-14)
The `/events` page per [page-event-list.md](page-event-list.md), four slices: the
"Programm"-retirement rename sweep (route `/program` → `/events`, nav/teaser/gallery copy,
`/events/$eventSlug` placeholder route) → list + the E1-deferred shared primitives → hero +
trimmed hero card → venue/FAQ/Börse-teaser/filmstrip + assembly. The shaping session
retired the term **Programm** repo-wide (see `CONTEXT.md`); detail-page route pinned as
`/events/$eventSlug`, purchase/Börse CTAs excluded until their pages exist (each page's
phase retrofits its entry links here). As-built notes and recorded deviations live in the
[page plan](page-event-list.md#as-built-e2-2026-08-14); notable side effects: `lib/date.ts`
now parses the seeds' Berlin wall-clock strings host-TZ-independently (display verbatim,
arithmetic via `parseBerlinDateTime`), and `lib/money.ts` + `lib/event-tint.ts` were born
as shared helpers.

### E3 — Veranstaltungsseite
**Status:** shipped (built 2026-08-15)
The `/events/$eventSlug` page per [page-event-detail.md](page-event-detail.md), four
slices: model + entry sweep → identity + ticket panel → secondary blocks → closing +
assembly. The shaping session changed the area's honesty rule (pages are built in their
planned end state — see Standing rules), retired the orphan **`/tickets`** placeholder
that carried the site's loudest CTA (masthead chip "Tickets" → **"Karten"** → `/events`),
pinned the seat-picker and Kartenbörse routes, and established that the **Ablauf is
assembled only 2–3 weeks before an evening** and is published **order-only, never timed**
(`CONTEXT.md`). Model grows by `performers` + `description`; Album gains `eventType` so
"So war es letztes Jahr" matches by type instead of guessing. As-built notes and recorded
deviations live in the [page plan](page-event-detail.md#as-built-e3-2026-08-15); the loudest
one: the masthead now carries **one** Veranstaltungen entry (promoted out of `navItems` into
the CTA), not a "Karten" chip beside a "Veranstaltungen" link.

### E4 — Karten-Bestellflow (shell)
**Status:** shipped (built 2026-08-18)
The order flow per [page-order-flow.md](page-order-flow.md), three slices: routes + Karten
rename sweep + entry links → flow shell (stepper, persistent bottom CTA bar, step 2/3
placeholders, `/orders/demo` chain) → step-1 Kartenwahl frame (state guard, H1 ladder,
stat line, recognisable placeholder core, tests). The shaping session merged the seats +
checkout pages into one continuous flow at `/events/$eventSlug/order` (`?step`), retired
`…/seats`, pinned `/orders/$orderCode` as an unguessable capability URL, converted the
step's surface to Karten language (Platzwahl → Kartenwahl, "Platz wählen →" → "Karten
wählen →"), extended **Account** to public self-registration (`CONTEXT.md`), and flagged
**Sitzplatzvergabe** as the blocked club decision that keeps step 1's core a placeholder.
As-built notes and recorded deviations live in the
[page plan](page-order-flow.md#as-built-e4-2026-08-18); the ones that travel: the flow is a plain
page orchestrator (no compound kit, no context) inside the **events** feature; blocked states hide
the stepper *and* the bottom bar so no CTA promises a purchase that cannot happen; `EventStickyBar`
was promoted to the shared **`StickyActionBar`**; `?step=1` is never written to the URL and back is
history-first (`useCanGoBack`); and an honesty test over the flow's copy constants makes the Karten
language non-regressable.

### E5 — Kauf & Karte
**Status:** shipped (built 2026-08-20)
Steps 2–3 of the Bestellflow plus the confirmation page per
[page-purchase.md](page-purchase.md), four slices: Bestellung model + seed + order query hook +
`noindex` → step 2 "Deine Daten" (final RHF + Zod buyer form) → step 3 "Zahlung"
(Bestellübersicht + Widerruf notice + placeholder payment region) → the confirmation page at
`/orders/$orderCode`. The shaping session made **Stripe the single provider, embedded on our
page** (so §312j is the website's duty), pinned `POST /api/orders` + `GET /api/orders/$orderCode`,
and flagged **Einlasskontrolle** as the second blocked club decision (`CONTEXT.md`) — it embargoes
the Karte's whole face, so the confirmation shows the Bestellung without any code. As-built notes
and recorded deviations live in the [page plan](page-purchase.md#as-built-e5-2026-08-20); the ones
that travel: **step 3's CTA is now disabled and the E4 walk into `/orders/demo` ends there**
(a real form's terminal action may not hand the reader a stranger's BEZAHLT page — this reverses
an explicit E4 instruction); the **§312j information set is deliberately incomplete** (no
Gesamtpreis while Sitzplatzvergabe blocks the count, so "Zahlungspflichtig bestellen" stays
test-guarded against shipping); **three** placeholder regions ship, not two; `OrderPanel`'s
`tone="placeholder"` makes "recognisably placeholder" a named token; a fourth step-3 face
(missing buyer) keeps `?step=3` deep links honest without a redirect; and `src/test/embargo.ts`
is now shared honesty infrastructure swept over copy constants, rendered pages and the seed prose.

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

Pinned by shaping sessions:

- **Event `salesStatus` enum** (foundation shaping, 2026-08-13): the public read endpoint
  publishes a backend-owned lifecycle enum — `announced` · `presaleScheduled` · `onSale` ·
  `almostSoldOut` · `soldOut` · `salesClosed` · `cancelled` — plus `capacity`/`freeCount`.
  The backend owns the `almostSoldOut` threshold and keeps enum and counts consistent.
  `NotPublished` never leaves the backend. Details in
  [foundation-events-data.md](foundation-events-data.md).
- **The public read endpoint serves the current Session only** (events-list shaping,
  2026-08-13): no past events, no history — past occasions are the Galerie's territory.
- **The Ablauf's public face** (event-detail shaping, 2026-08-15): the public read endpoint
  carries **`performers`** — an ordered list of act *names* (Gruppen and guests mixed),
  nullable until the Ablauf is assembled ~2–3 weeks before the evening. **Order only, never
  times.** A per-act Gruppe reference is reserved for later; nothing links today.
- **`description`** (event-detail shaping, 2026-08-15): an optional longer per-event text
  alongside the one-sentence teaser, progressive publishing like every other soft field.
- **Album ↔ event linking is by *type*, never by event id** (event-detail shaping,
  2026-08-15): an Album covers an occasion, not necessarily a Veranstaltung (glossary), so
  the Album payload carries an optional `eventType` matching the event model's `type`.
- **`orderCode` is a capability URL token** (order-flow shaping, 2026-08-18): the backend
  generates an unguessable random token (≥128 bit entropy) per Bestellung; the confirmation
  mail links `/orders/$orderCode` — access by knowledge of the link, equivalent in trust to
  the mail itself. Never a guessable/sequential number.
- **Public self-registered Accounts** (order-flow shaping, 2026-08-18): buyers may
  optionally self-register a real Account (creates a Person with no Mitgliedschaft) to keep
  mail, Kartenübersicht, history and payment methods; buying never requires one. Member
  onboarding stays invite-only. Duplicate-Person merge is flagged open in `CONTEXT.md`.
- **Sitzplatzvergabe is an undecided club decision** (order-flow shaping, 2026-08-18):
  numbered seats vs. general admission is blocked on the club; whatever it becomes, seat
  data is per-event (E1 ruling). The order flow ships a placeholder core until then.
- **Stripe is the single payment provider for Karten sales, embedded** (purchase shaping,
  2026-08-19): this *amends* the carried "Stripe (card) + PayPal" line — PayPal and every
  other method are club-enabled **Stripe** methods, never a hand-maintained list. Payment
  renders via the embedded Payment Element on our page (user decision over hosted
  Checkout), so **§312j BGB (Button-Lösung) is the website's duty**: "Zahlungspflichtig
  bestellen" + summary + total on the final step. Scope is Karten only; other money flows
  stay open. Ledger remains the source of truth; Stripe settles ledger entries.
- **`POST /api/orders`** (purchase shaping, 2026-08-19): creates the Bestellung **and** the
  Stripe PaymentIntent from `{ event, selection, buyer { firstName, lastName, email } }`
  (the selection shape is blocked on Sitzplatzvergabe); returns
  `{ orderCode, clientSecret }`. ADR-0004 pattern: the row is the truth, the confirmation
  mail (carrying the `/orders/$orderCode` link) is the notification. One buyer per
  Bestellung — no phone, no address, no per-Karte names.
  **E5 shipped no Zod schema for this request** (2026-08-20): the seed is the executable
  contract for the GET only, because the POST is inseparable from the `clientSecret` and the
  embedded Payment Element — deferred with the payment region, not overlooked.
- **`GET /api/orders/$orderCode`** (purchase shaping, 2026-08-19; payload amended by the E5
  as-built, 2026-08-20): the Bestellung payload — `orderCode`, event identity (**`id`** — the
  cross-sell excludes the ordered evening by it — plus title, date, venue), Karten count + unit
  price + total, buyer name + email, and **`paymentStatus: paid | processing`** (embedded Stripe pays asynchronously
  for some methods). A failed or abandoned payment never yields a mail or a retrievable
  Bestellung. No reminder mail is promised anywhere.
- **Karten-AGB are an open club/legal fact** (purchase shaping, 2026-08-19): no AGB exist,
  so the checkout ships no consent checkbox; writing them (plus an `/agb` page) is a
  **blocker for real online sales**. The Widerruf-exemption notice (§312g Abs. 2 Nr. 9
  BGB) is frontend-shipped already.
- **Einlasskontrolle is undecided** (purchase shaping, 2026-08-19 — `CONTEXT.md`): the
  digitale Karte's face (QR per Karte, PDF, Wallet, name list) is blocked with it; the
  confirmation shows the Bestellung without codes until the club decides.
- **Capacity, seating plan and price are per event** (foundation shaping, 2026-08-13):
  the hall is set up differently per event; price is flat within one event but differs
  between events. Seating-plan templates (save/load) are a future Club-App idea.

## References

- Mock bundle: [`docs/design/events-page/`](../../../docs/design/events-page/README.md)
- [`CONTEXT.md`](../../../CONTEXT.md) — Veranstaltung, Ablauf, Session, Ledger
- Website master plan: [scope banner](../master-plan.md#overview) ·
  [Deferred — Club-App-dependent](../master-plan.md#club-app-dependent)
- Seed pattern precedent: website master plan → P6 cross-cutting notes ·
  [ADR-0003](../../../docs/adr/0003-website-rendering-strategy.md)
