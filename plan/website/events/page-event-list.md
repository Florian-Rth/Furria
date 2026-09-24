---
title: Event list
slug: event-list
route: /events
type: page
status: shipped
mock: docs/design/events-page/ (fcc-web-events.jsx — EvIndexDesktop / EvIndexMobile)
depends-on: [foundation-events-data]
adrs: []
---

## What & Why

The public event list at `/events` — the page the masthead nav, the landing teaser
("Alle Termine →") and the news band already point at; today it renders `PlaceholderPage`
at `/program`. It lists the session's events with dates, venue and ticket status,
and is the entry point to every other page in this area. Likely the most-visited page of
the site.

> **Renamed from `page-program.md` (2026-08-13):** the shaping session retired the term
> "Programm" entirely — see the terminology decision below and the flagged note in
> [`CONTEXT.md`](../../../CONTEXT.md).

## Mock inventory (inspiration only)

- Hero: eyebrow + H1 + intro, derived stat row (evenings / price / seats / free), "Termine
  abonnieren" CTA
- "Nächster Abend mit Karten" hero card: countdown, live capacity bar, primary CTAs,
  sold-out cross-link to the ticket exchange
- Spielplan list rows: boxed date block · title/meta/teaser · status + CTA per row
- List ↔ two-month mini-calendar toggle
- Venue block (all evenings, one hall) with address/parking/way-home facts (unverified)
- Ticket exchange band, filmstrip rhythm element, FAQ accordion ("Alles, was du wissen
  musst"), calendar-subscribe band (ICS + "Spielplan als PDF")

## Decisions

Carried from the absorbed `feature-event-calendar.md` stub (2026-08-12):

- Consumes published key facts; the website never edits events.

Shaping session 2026-08-13 — all questions resolved with the user:

### Terminology & identity

- **"Programm" is retired everywhere** — the mock's H1 won over the glossary. The
  website's list of ticketed evenings is **Veranstaltungen** (the general term throughout
  the app from now on); the Club-App's per-event running order is the **Ablauf**. Rename
  only, **not** a scope change: the website still lists only the session's ticketed hall
  evenings — the 2026-08-13 narrowing (no Rose Monday parade) stands, and the E1 model is
  untouched. `CONTEXT.md` updated (Event + Running order entries, retirement note).
- **Full rename now, as slice 1** — route `/program` → **`/events`** with no redirect
  (the site is preview-gated; nothing external links in). Nav label → "Veranstaltungen",
  landing teaser heading `DAS PROGRAMM` → `DIE VERANSTALTUNGEN` (plus `programHeading` /
  `program-content.ts` identifiers), gallery link → "Zu den Veranstaltungen →", gated
  tests updated, `feature-program-teaser.md` renamed to `feature-events-teaser.md` with
  links fixed. Historical P-phase logs keep their wording — history is not rewritten.
- **H1 is `VERANSTALTUNGEN`**, eyebrow `TERMINE & KARTEN · SESSION …` with the session
  derived via `sessionAt()` from the seed's earliest event — never hardcoded.
- **The list section header is `ALLE TERMINE`** with the mock's derived date range kept on
  the right. "Spielplan" is rejected as a third synonym; "Termin" stays a copy word only,
  never an entity name.

### Linking into unbuilt pages

- **Placeholder links for event detail only.** Slice 1 creates `/events/$eventSlug`
  rendering `PlaceholderPage`; rows and the hero card's "Zum Abend" link there
  immediately. **Slug = the seed's event id** (gallery precedent, `prunksitzung-1-2027`)
  — this pre-decides page-event-detail's route, recorded there.
- **No purchase or ticket-exchange navigation exists on this page yet.** "Platz wählen" and
  "Warteliste & Börse →" are entries into a purchase funnel that doesn't exist — a buy
  button opening an empty page pretends a shop. **Area pattern:** each later page's
  E-phase retrofits its own entry links into this page (detail replaces the placeholder,
  seat picker brings the buy CTA, the ticket exchange brings its links).

### Sections (v1 = hero · hero card · list · venue · ticket-exchange teaser · filmstrip · FAQ)

- **List only — the List↔Months toggle and `EvMonth` grids are rejected.** ~6 evenings
  don't earn a month grid; the row date blocks carry the dates. A calendar view is
  additive later, if ever.
- **Rows are model-determined:** boxed date block · title + age-hint tag · Einlass/Beginn
  meta (nulls per progressive publishing) · teaser · capacity bar + the shipped E1 label
  derivations. The mock's "Dauer/Ende" is a dropped field; the soldOut row shows **no**
  fake "3 Plätze in der Börse" count; the "Ruf an: 0170 55 44 21" contact line is banned
  (P5/P6 invented-people / private-mobile precedent).
- **Hero card adopted, trimmed:** countdown to Beginn, capacity bar with the standard
  "N von M frei" phrasing, FAST-WEG tag (honestly derived from `almostSoldOut`), "Zum
  Abend" CTA. The **"LIVE-KARTENSTAND · VOR 4 MIN AKTUALISIERT" line is rejected** — no
  freshness claims on seeded data; one may return only when a real backend feeds it.
  Selection rule: earliest `onSale`/`almostSoldOut` evening, else earliest upcoming.
- **Hero stats recomputed honestly — three derived stats:** evening count · "ab X €"
  (minimum of the *known* prices; progressive publishing leaves some null) · "Karten noch
  frei" (sum of existing `freeCount`s). The mock's "12 € jede Karte" and "288 Plätze pro
  Abend" contradict the shipped per-event model and are rejected. The intro sentence is
  derived (count, venue, date span) with **no live claim and no numbered-seat claim**.
- **Venue block ships full structure, placeholder facts.** Confirmed true: the name
  (Dorfgemeindehaus Großfurra) and "alle Abende, ein Saal". The user confirmed **none** of
  the mock's facts (address, parking, shuttle, accessibility) are correct — Adresse /
  Parken / Barrierefreiheit rows ship with recognisably-placeholder values
  ("wird ergänzt"-style, never invented-but-official-looking). The hall seat-count row is
  dropped (fixed count contradicts per-event capacity); the way-home/shuttle row is dropped
  (a nonexistent service is fiction, not a missing fact).
- **FAQ ships with what is true today:** **Kostüm** ("gern, kein Muss" — confirmed as
  mocked) · **Essen & Trinken** (confirmed: the club sells Bier/Wein/Sekt/Softdrinks/
  Bratwurst, **nur Bargeld**) · **Kinder & Jugend** (question stays, the mock's ages are
  wrong — recognisably-placeholder ages, consistent with the seed's placeholder
  `ageHint`s) · **added by us: "Was eine Karte kostet"** answered honestly from the model
  (differs per evening, shown on each event). The online-payment, QR-per-Mail and
  Einlass-60-minute items are dead (purchase fiction / contradicts per-event Einlass).
- **Ticket exchange band ships as a concept teaser with zero mechanics claims** —
  "Ausverkauft ist nicht das Ende" plus one sentence that a ticket exchange is planned for
  sold-out evenings. The user confirmed the mechanics are genuinely undecided ("must be
  well planned by us") — return-flow, waitlist, SMS/6h right-of-first-refusal and the
  "7 auf der Warteliste" count all stay out. **page-ticket-exchange owns the mechanics
  shaping** and its phase replaces this teaser with the real band + link.
- **Filmstrip adopted** as the page's decorative rhythm element, placeholder imagery
  (KKPlh precedent); must respect reduced motion.
- **Calendar-subscribe surface deferred until the key facts are club-confirmed real** — no
  "Termine abonnieren" CTA, no ICS band, no PDF in v1. A static hosted `.ics` is
  technically honest, but it would export **placeholder times into real calendars**,
  where nothing marks them placeholder anymore. Unlock condition: real, club-supplied
  dates/times.
- **No archive.** The list shows the current session's upcoming evenings only; past
  occasions live in the gallery. Pinned in the area's deferred-backend contract: the
  public read endpoint returns the current session only — history never crosses the API.

### Product & architecture (second grilling, 2026-08-13)

- **Hierarchy: the mock's split hero.** Identity (eyebrow · H1 · intro · stats) left, the
  card right, list directly below. Mobile: intro → card → list.
- **The hero card is a four-face ladder,** truthful under every seed mix:
  `onSale`/`almostSoldOut` → kicker "NÄCHSTER ABEND MIT KARTEN", countdown to Beginn,
  capacity bar; **`presaleScheduled` → kicker "VORVERKAUF STARTET", countdown to
  `presaleStartsAt`**, no bar; `announced` → "Vorverkauf wird noch angekündigt", no
  countdown; only `soldOut`/`salesClosed` left → earliest upcoming evening with its honest
  status label (ticket-exchange cross-link arrives with page #6). Countdown granularity
  adapts — seconds only when they mean something (mock idea adopted).
- **Designed "end of season" empty state.** No upcoming events means the session is over:
  hero keeps the identity, card + stats hide, the list area becomes a farewell moment
  ("die Session ist gefeiert") pointing to the gallery (relive it) and news (where
  the next season shows up first). Tested with an empty seed array. No loading/error
  theater — site-wide precedent, seeds resolve instantly.
- **Quiet type tints.** The boxed date block carries a per-event-type tint accent; status
  color stays exclusively on the status column (urgency never competes with identity).
  The tint derivation becomes a **type-based shared helper in `lib/`** (landing can't
  import the events feature); the teaser's index-based `resolveEventTint` rewires onto it.
- **Anchor deep links:** each row gets `id` = event slug; `/events#weiberfasching-2027`
  scrolls to and briefly highlights the row — news posts can link a specific evening.
- **Proximity badge:** rows within 7 days show a derived "Diesen Samstag" / "Heute" —
  honest urgency the status enum can't express.
- **JSON-LD (schema.org/Event) ships in E2** — user decision over the defer
  recommendation. Guard: the **ungating checklist must include "key facts confirmed
  real"** so placeholder times never reach search-engine rich results (the preview gate
  keeps crawlers out until then).
- **Audience filter chips rejected** — overkill for six rows on one screen.
- **Architecture:** the route renders one **`EventListPage`** (NewsListPage precedent;
  route owns title/description/JSON-LD head). Three tested main components —
  `EventListPage` (assembly, full-bleed layout), `NextEventCard` (the four faces),
  `EventList` (rows, anchors, badges, end-of-season face). Feature-shared primitives per
  the E1 mandate: `EventDateBlock`, `CapacityBar`, `SalesStatusBadge` (detail page reuses
  them). Hero, venue band, ticket-exchange teaser, filmstrip and FAQ stay internal to the
  page. Logic lives in pure tested functions (next-event selection, stats, proximity,
  countdown formatting) plus one `use-countdown` hook for the tick.

## Awaiting facts (non-blocking — placeholders until the club supplies them)

- Venue: real Adresse, Parken, Barrierefreiheit for the Dorfgemeindehaus Großfurra.
- FAQ: real age rules per event type; further answers (Einlass policy, payment, "Karte
  verlegt?") only become possible with a purchase flow.
- Real key facts (dates/times) unlock the deferred calendar-subscribe surface.

## Open Questions

None — all resolved 2026-08-13 (see Decisions). Facts still owed by the club are listed
under "Awaiting facts" and block nothing.

## Done When

- `git grep -i programm` over `web/` finds no code identifier, route or visible copy —
  only historical plan logs and the glossary retirement note remain repo-wide.
- `/events` renders hero, hero card, list, venue block, ticket-exchange teaser, filmstrip
  and FAQ from `useEventsQuery`; every stated fact is derived from the seed,
  user-confirmed, or recognisably placeholder.
- Rows and hero card navigate **only** to `/events/$eventSlug` (PlaceholderPage); no
  purchase or ticket-exchange navigation exists anywhere on the page.
- The shared primitives (date block, capacity bar, status badge) live in
  `features/events` with tests; all 7 `salesStatus` states render correctly in a row
  (`cancelled` exercised in tests only).
- `NextEventCard`'s four faces each have a test; the empty seed array renders the
  end-of-season state; row anchors scroll-and-highlight; the route emits schema.org/Event
  JSON-LD.
- Full gates pass: typecheck, tests, lint, build.

## Implementation plan (E-phases)

- **E2 — Event list** (this file, four slices, one phase; per-slice reviews and
  full gates as in E1/P0–P6):
  1. **Rename sweep** — `/program` → `/events`, `/events/$eventSlug` placeholder route,
     nav/teaser/gallery copy + identifiers, tests, `feature-program-teaser.md` →
     `feature-events-teaser.md`.
  2. **List + primitives** — date block, capacity bar, status badge born in
     `features/events`; the row with quiet type tints (shared type-based tint helper in
     `lib/`, teaser rewired), anchor deep links, proximity badge; `ALLE TERMINE` header
     with derived date range; rows link to detail placeholders; end-of-season empty
     state. All 7 states tested.
  3. **Hero + hero card** — eyebrow (derived session), H1, derived intro, three honest
     stats; `NextEventCard` with the four-face ladder and adaptive countdown.
  4. **Lower bands + assembly** — venue block, FAQ, ticket-exchange concept teaser,
     filmstrip, `EventListPage` assembly, route head with JSON-LD, page tests, full gates.

## As-built (E2, 2026-08-14)

Built in the four planned slices, each with its own review pass and full gates
(typecheck · tests · lint · build); 803 website tests green at ship.

### Where things live

- **Shared primitives** — `features/events/components/{EventDateBlock,CapacityBar,SalesStatusBadge}.tsx`,
  each with a test. The date block takes `startsAt` + `tint` and formats through `lib/date`.
- **List** — `features/events/components/EventList/` (main + `internal/{layout,ui,logic}`):
  rows as `CardActionArea` links (NewsRow idiom), `use-anchor-highlight` hook (TanStack
  `location.hash` → scroll + timed highlight, reduced-motion aware), end-of-season farewell
  (`EventEndOfSeason`, links to gallery + news posts).
- **Hero card** — `features/events/components/NextEventCard/` with one internal ui file per
  face; face selection is a discriminated union in `next-event-display.ts`.
- **Page** — `features/events/components/EventListPage/` assembles hero (KkHeroSection,
  card as Aside), list, filmstrip, venue, FAQ inside `PageLayout.Body` and the
  ticket-exchange band as the closing full-bleed band. Route
  `routes/_site/_gated/events.tsx` wires `useEventsQuery` and emits schema.org/Event
  JSON-LD (offset-stamped datetimes) from its head; `RouteHead` gained an optional
  `scripts` field.
- **Pure logic** — `event-display.ts` (href, ordering, proximity, times label),
  `hero-display.ts` (eyebrow/intro/stats), `next-event-display.ts`, `countdown.ts`,
  `events-json-ld.ts`; copy in `list-content.ts`, `next-event-content.ts`,
  `venue-content.ts`, `faq-content.ts`, `exchange-content.ts`.
- **New shared libs** — `lib/event-tint.ts` (type-based tint: Prunksitzung red,
  Weiberfasching gold, Jugendfasching blue, Kinderfasching green, fallback ink; the landing
  teaser rewired onto it), `lib/money.ts` (`formatEuros`).

### Recorded deviations & side effects

- **Section order deviates from the shaped list** (`… venue · ticket-exchange teaser ·
  filmstrip · FAQ`): shipped as list → **filmstrip** (rhythm break) → venue → FAQ →
  **ticket-exchange band last**, matching the site-wide closing-band idiom (News/Gallery
  end on a full-bleed band). The section set itself is exactly as shaped.
- **Timezone correctness (slice-2/3 review finding):** all `lib/date` formatters previously
  re-interpreted the seeds' naive Berlin wall-clock strings in the host timezone. They now
  render wall-clock verbatim (parse as UTC, format in UTC), and *arithmetic* (countdown,
  upcoming filter, session derivation, proximity days) goes through the DST-aware
  `parseBerlinDateTime` / `berlinDayNumber`. JSON-LD datetimes carry explicit `+01:00`/`+02:00`
  offsets via `formatBerlinIsoWithOffset`.
- **Landing teaser** `deriveEventDisplay` no longer hand-splits date strings — it composes
  `lib/date` formatters (per the shared-formatter rule); its tint switched from index-based
  to type-based, so both Prunksitzungen now share the red tint by design.
- **Honesty guards from reviews:** proximity badge suppressed for `cancelled`; capacity bar
  renders only for live-sale states (`onSale`/`almostSoldOut`); row `aria-label` carries
  title · date · status so assistive tech hears the decision-critical info.
- **Countdown ticks adaptively** (60 s, dropping to 1 s inside the last hour — seconds are
  also only *displayed* under an hour).
- The route head builds JSON-LD from `SEEDED_EVENTS` directly (head runs outside React and
  cannot use the query hook). **When the real API replaces the seeds, the head must move to
  a loader-shared data source** — noted here so the backend swap doesn't leave stale seed
  JSON-LD behind.
- Known repo-wide pattern gap left untouched (out of scope): `JoinFaqItem` has the same
  dangling `aria-controls` the review found here; the events FAQ fixed it locally
  (`AccordionDetails` gets `id` + `role="region"`).
- `renderWithRouter` (test helper) gained an optional `initialPath` for hash-anchor tests.

## References

- [Area plan](master-plan.md) · [Events data foundation](foundation-events-data.md)
- [Events teaser](../feature-events-teaser.md) — the shipped teaser of this page's
  data (renamed in slice 1)
- Design README §9 (event planner → key facts published; scarcity feeds public site)
- Mock rulings: [`docs/design/events-page/README.md`](../../../docs/design/events-page/README.md)
