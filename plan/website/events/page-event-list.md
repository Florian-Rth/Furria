---
title: Veranstaltungen
slug: event-list
route: /events
type: page
status: ready
mock: docs/design/events-page/ (fcc-web-events.jsx — EvIndexDesktop / EvIndexMobile)
depends-on: [foundation-events-data]
adrs: []
---

## What & Why

The public event list at `/events` — the page the masthead nav, the landing teaser
("Alle Termine →") and the news band already point at; today it renders `PlaceholderPage`
at `/program`. It lists the Session's Veranstaltungen with dates, venue and ticket status,
and is the entry point to every other page in this area. Likely the most-visited page of
the site.

> **Renamed from `page-program.md` (2026-08-13):** the shaping session retired the term
> "Programm" entirely — see the terminology decision below and the flagged note in
> [`CONTEXT.md`](../../../CONTEXT.md).

## Mock inventory (inspiration only)

- Hero: eyebrow + H1 + intro, derived stat row (Abende / price / seats / free), "Termine
  abonnieren" CTA
- "Nächster Abend mit Karten" hero card: countdown, live capacity bar, primary CTAs,
  sold-out cross-link to the Kartenbörse
- Spielplan list rows: boxed date block · title/meta/teaser · status + CTA per row
- List ↔ two-month mini-calendar toggle
- Venue block (all evenings, one hall) with address/parking/Heimweg facts (unverified)
- Kartenbörse band, filmstrip rhythm element, FAQ accordion ("Alles, was du wissen
  musst"), calendar-subscribe band (ICS + "Spielplan als PDF")

## Decisions

Carried from the absorbed `feature-event-calendar.md` stub (2026-08-12):

- Consumes published Eckdaten; the website never edits events.

Shaping session 2026-08-13 — all questions resolved with the user:

### Terminology & identity

- **"Programm" is retired everywhere** — the mock's H1 won over the glossary. The
  website's list of ticketed evenings is **Veranstaltungen** (the general term throughout
  the app from now on); the Club-App's per-event running order is the **Ablauf**. Rename
  only, **not** a scope change: the website still lists only the Session's ticketed hall
  evenings — the 2026-08-13 narrowing (no Rosenmontagsumzug) stands, and the E1 model is
  untouched. `CONTEXT.md` updated (Veranstaltung + Ablauf entries, retirement note).
- **Full rename now, as slice 1** — route `/program` → **`/events`** with no redirect
  (the site is preview-gated; nothing external links in). Nav label → "Veranstaltungen",
  landing teaser heading `DAS PROGRAMM` → `DIE VERANSTALTUNGEN` (plus `programHeading` /
  `program-content.ts` identifiers), gallery link → "Zu den Veranstaltungen →", gated
  tests updated, `feature-program-teaser.md` renamed to `feature-events-teaser.md` with
  links fixed. Historical P-phase logs keep their wording — history is not rewritten.
- **H1 is `VERANSTALTUNGEN`**, eyebrow `TERMINE & KARTEN · SESSION …` with the Session
  derived via `sessionAt()` from the seed's earliest event — never hardcoded.
- **The list section header is `ALLE TERMINE`** with the mock's derived date range kept on
  the right. "Spielplan" is rejected as a third synonym; "Termin" stays a copy word only,
  never an entity name.

### Linking into unbuilt pages

- **Placeholder links for event detail only.** Slice 1 creates `/events/$eventSlug`
  rendering `PlaceholderPage`; rows and the hero card's "Zum Abend" link there
  immediately. **Slug = the seed's event id** (Galerie precedent, `prunksitzung-1-2027`)
  — this pre-decides page-event-detail's route, recorded there.
- **No purchase or Börse navigation exists on this page yet.** "Platz wählen" and
  "Warteliste & Börse →" are entries into a purchase funnel that doesn't exist — a buy
  button opening an empty page pretends a shop. **Area pattern:** each later page's
  E-phase retrofits its own entry links into this page (detail replaces the placeholder,
  seat picker brings the buy CTA, the Kartenbörse brings its links).

### Sections (v1 = hero · hero card · list · venue · Börse teaser · filmstrip · FAQ)

- **List only — the Liste↔Monate toggle and `EvMonth` grids are rejected.** ~6 evenings
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
  ("wird ergänzt"-style, never invented-but-official-looking). The Saal seat-count row is
  dropped (fixed count contradicts per-event capacity); the Heimweg/Shuttle row is dropped
  (a nonexistent service is fiction, not a missing fact).
- **FAQ ships with what is true today:** **Kostüm** ("gern, kein Muss" — confirmed as
  mocked) · **Essen & Trinken** (confirmed: the club sells Bier/Wein/Sekt/Softdrinks/
  Bratwurst, **nur Bargeld**) · **Kinder & Jugend** (question stays, the mock's ages are
  wrong — recognisably-placeholder ages, consistent with the seed's placeholder
  `ageHint`s) · **added by us: "Was eine Karte kostet"** answered honestly from the model
  (differs per evening, shown on each Termin). The online-payment, QR-per-Mail and
  Einlass-60-Minuten items are dead (purchase fiction / contradicts per-event Einlass).
- **Börse band ships as a concept teaser with zero mechanics claims** — "Ausverkauft ist
  nicht das Ende" plus one sentence that a Kartenbörse is planned for sold-out evenings.
  The user confirmed the mechanics are genuinely undecided ("must be well planned by us")
  — return-flow, waitlist, SMS/6h-Vorkaufsrecht and the "7 auf der Warteliste" count all
  stay out. **page-ticket-exchange owns the mechanics shaping** and its phase replaces
  this teaser with the real band + link.
- **Filmstrip adopted** as the page's decorative rhythm element, placeholder imagery
  (KKPlh precedent); must respect reduced motion.
- **Calendar-subscribe surface deferred until the Eckdaten are club-confirmed real** — no
  "Termine abonnieren" CTA, no ICS band, no PDF in v1. A static hosted `.ics` is
  technically honest, but it would export **placeholder times into real calendars**,
  where nothing marks them placeholder anymore. Unlock condition: real, club-supplied
  dates/times.
- **No archive.** The list shows the current Session's upcoming evenings only; past
  occasions live in the Galerie. Pinned in the area's deferred-backend contract: the
  public read endpoint returns the current Session only — history never crosses the API.

## Awaiting facts (non-blocking — placeholders until the club supplies them)

- Venue: real Adresse, Parken, Barrierefreiheit for the Dorfgemeindehaus Großfurra.
- FAQ: real age rules per event type; further answers (Einlass policy, payment, "Karte
  verlegt?") only become possible with a purchase flow.
- Real Eckdaten (dates/times) unlock the deferred calendar-subscribe surface.

## Open Questions

None — all resolved 2026-08-13 (see Decisions). Facts still owed by the club are listed
under "Awaiting facts" and block nothing.

## Done When

- `git grep -i programm` over `web/` finds no code identifier, route or visible copy —
  only historical plan logs and the glossary retirement note remain repo-wide.
- `/events` renders hero, hero card, list, venue block, Börse teaser, filmstrip and FAQ
  from `useEventsQuery`; every stated fact is derived from the seed, user-confirmed, or
  recognisably placeholder.
- Rows and hero card navigate **only** to `/events/$eventSlug` (PlaceholderPage); no
  purchase or Börse navigation exists anywhere on the page.
- The shared primitives (date block, capacity bar, status badge) live in
  `features/events` with tests; all 7 `salesStatus` states render correctly in a row
  (`cancelled` exercised in tests only).
- Full gates pass: typecheck, tests, lint, build.

## Implementation plan (E-phases)

- **E2 — Veranstaltungen list** (this file, four slices, one phase; per-slice reviews and
  full gates as in E1/P0–P6):
  1. **Rename sweep** — `/program` → `/events`, `/events/$eventSlug` placeholder route,
     nav/teaser/gallery copy + identifiers, tests, `feature-program-teaser.md` →
     `feature-events-teaser.md`.
  2. **List + primitives** — date block, capacity bar, status badge born in
     `features/events`; the row; `ALLE TERMINE` header with derived date range; rows link
     to detail placeholders. All 7 states tested.
  3. **Hero + hero card** — eyebrow (derived Session), H1, derived intro, three honest
     stats; the trimmed card with countdown.
  4. **Lower bands + assembly** — venue block, FAQ, Börse concept teaser, filmstrip, page
     assembly, page tests, full gates.

## References

- [Area plan](master-plan.md) · [Foundation](foundation-events-data.md)
- [Programm-Teaser](../feature-program-teaser.md) — the shipped teaser of this page's
  data (renamed in slice 1)
- Design README §9 (Veranstaltungsplaner → Eckdaten published; scarcity feeds public site)
- Mock rulings: [`docs/design/events-page/README.md`](../../../docs/design/events-page/README.md)
