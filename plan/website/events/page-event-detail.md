---
title: Veranstaltungsseite
slug: event-detail
route: /events/$eventSlug (pinned by events-list shaping, 2026-08-13)
type: page
status: shipped
mock: docs/design/events-page/ (fcc-web-events.jsx — EvDetailDesktop / EvDetailMobile)
depends-on: [foundation-events-data]
adrs: []
---

## What & Why

One event's own page: the Eckdaten (date, Einlass, Beginn, venue), what the evening is,
who performs, photos from the same occasion last year, and the ticket status with the CTA
into the purchase flow. The page that turns "I saw a date" into "I'm buying a seat" — and
the share target for a single event.

## Mock inventory (inspiration only)

- Tag row (type · Session · age hint · venue) + big derived stat row (date, Einlass,
  Beginn, Ende, price)
- Ticket panel: price, live capacity bar, state-dependent CTA (Platz wählen / Warteliste
  when ausverkauft / Erinnerung when VVK not open), payment hints, Gruppenbestellung note
- "So war es letztes Jahr" Foto-Theater — an auto-advancing photo stack pulled from the
  Galerie, with pause + dots
- "Wer auftritt" Gruppen chips · Ablauf block (one honest line while unpublished; a
  collapsible timed rundown once it exists; "live" mode teaser for the evening itself)
- Saal info card, "Auch noch in dieser Session" cards, closing band with countdown + CTA

## Decisions

Carried from the events-list shaping (2026-08-13):

- **Route is `/events/$eventSlug`, slug = the seed's event id** (Galerie precedent,
  `prunksitzung-1-2027` — German domain words + year solve the recurring-event
  uniqueness). E2 slice 1 created this route as a `PlaceholderPage`; E3 replaces it.
- **This page's phase retrofits its entry CTAs into `/events`** (area pattern: each page
  owns wiring its own entry links into the list page).

### Shaping session 2026-08-15 — the honesty rule changed

- **The site never goes live half-built.** The user's ruling: the website launches only
  when the platform behind it (purchase flow included) is ready, so pages are **built in
  their planned end state** rather than in a temporary truthful subset. This *revises*
  E2's "no navigation into unbuilt pages" rule for this page: a CTA into a placeholder is
  the same move E2 already made when list rows linked into the detail placeholder.
  **Unchanged:** actions themselves must still fail or disable honestly — no fake cart, no
  fake confirmation, no form that swallows an address, nothing that pretends money moved.
- **The ticket panel ships its full state ladder including the CTA**, pointing at a
  placeholder seat-picker route. The buy verb lives on the decision page; the list page
  stays as shaped (rows → detail).
- **Routes pre-decided by those CTAs:** **`/events/$eventSlug/seats`** (seat picker —
  meaningless without an event, so it nests under one) and **`/events/exchange`**
  (Kartenbörse — its own destination, kept inside the area; static route beats
  `$eventSlug` in TanStack). English per the area's standing rule. Recorded in
  [page-order-flow](page-order-flow.md) and [page-ticket-exchange](page-ticket-exchange.md).
- **`/tickets` is retired in E3.** It was a live `PlaceholderPage` no page plan owned, and
  the site's loudest CTA pointed at it: the masthead chip (labelled **"Tickets"** —
  English, against ADR-0002), the masthead desktop button and the landing hero's primary
  action. All three repoint to **`/events`** and the label becomes **"Karten"** — buying a
  Karte starts by choosing an evening, so the list *is* the ticket entry. Glossary gained
  **Karte**, **Vorverkauf**, **Kartenbörse**.

### The Ablauf on a public page

- **The Ablauf exists late.** The responsible person assembles it roughly **two to three
  weeks before** the evening (user, 2026-08-15), so for most of an event's public life
  there is none. Recorded in `CONTEXT.md`.
- **Consequence for the design: the Ablauf is an addon, never the page's spine.** The page
  must read complete without it; when it exists the section is a modest secondary block,
  and when it doesn't the section is simply **absent** — no empty box, no
  "wird noch bekanntgegeben" promise.
- **Published: the order, never the times.** The sequence is stable enough to print, the
  clock is not — the club shifts acts on the night. The mock's timed rundown, its
  "am Abend selbst wird daraus ein Live-Ablauf" card and the whole live mode are
  **rejected** (design fiction; the live Ablauf is Club-App territory if it ever exists).
- **Acts are free-text names.** Gruppen *and* guests appear (Gastvereine, external Redner),
  so acts travel as names, not Gruppe ids. A Gruppe reference is reserved in the contract;
  nothing links in E3 — a lineup that links half its entries reads broken.
- The word **Programm** never appears; the section header is **"WER AUFTRITT"**.

### Model additions

- **`performers`** — the Ablauf's public face: an ordered list of act names, nullable until
  the Ablauf is assembled. Progressive publishing, same rule as everything else.
- **`description`** — an optional longer per-event text (plain paragraphs). Without it, an
  evening with no Ablauf yet and no matching Album (e.g. `weiberfasching-2027`) would be
  tags, one teaser sentence and a panel. Absent → the identity block falls back to the
  teaser and the page still reads complete.
- **`eventType` on Album** (Galerie seed) — the explicit key for the photo match below.

### Photos from last year

- **Matched by event *type*, never by event id.** The glossary is explicit that an Album is
  not bound to a Veranstaltung (an Album may cover an unticketed occasion), and matching by
  title string is guesswork — so Album carries an optional `eventType` and the page shows
  the newest Album with that type.
- **A static preview (3–4 photos) linking into the Album** — the mock's auto-advancing
  Foto-Theater is **rejected**: motion for its own sake, duplicating the viewing experience
  the Galerie already owns. Section is absent when nothing matches (3 of the 6 seed
  evenings today).
- **Composition happens in the route** — features never import each other.

### Sections (v1)

Back link · identity block (tags · H1 · teaser/description · derived stat row) · ticket
panel · "Wer auftritt" (when present) · Album preview (when matched) · Saal · "Auch noch in
dieser Session" · closing band.

- **The Saal block is E2's `VenueBlock`, promoted to a feature-shared component** and
  rendered on both pages — one home for the placeholder Saal facts, never two copies. The
  address matters more on the page you land on from a share link than in the list. The
  mock's "24 TISCHREIHEN, 288 STÜHLE" card stays **dead** (fixed geometry contradicts
  per-event capacity).
- **"Auch noch in dieser Session":** three other upcoming evenings as compact cards with
  their honest status short label. Free cross-navigation from data already loaded.
- **Closing band with adaptive countdown + the state CTA** — the site-wide closing-band
  idiom E2 shipped, repeating the decision after a long scroll.
- **Mobile sticky CTA bar** (user decision over the recommendation to defer): a bottom bar
  on small screens carrying price + the state CTA. Renders **only** when the state is
  actionable, respects safe areas, never covers content.

### Ticket panel — the seven-state ladder

| `salesStatus` | Panel |
|---|---|
| `announced` | "Vorverkauf wird noch angekündigt", price if known, no countdown, no CTA |
| `presaleScheduled` | countdown to `presaleStartsAt` + "Vorverkauf startet am …", no CTA |
| `onSale` | price · capacity bar · **"Platz wählen →"** → `/events/$eventSlug/seats` |
| `almostSoldOut` | as `onSale` + the urgency treatment (FAST WEG) |
| `soldOut` | "Ausverkauft" + one claim-free sentence + **"Zur Kartenbörse →"** → `/events/exchange` |
| `salesClosed` | "Vorverkauf beendet", no CTA — no Abendkasse claim (unknown) |
| `cancelled` | "Abgesagt": no capacity bar, no countdown, no CTA (tests only, never seeded) |

- **No VVK reminder capture.** An email field that stores nothing is exactly the dishonest
  action the standing rule bans — and unlike the buy CTA there is no page to link to; the
  *action* would be the fake. Recorded below as an unscheduled idea.
- The mock's payment hints ("Kreditkarte, PayPal — oder bar im Vereinsraum"), the
  **Gruppenbestellung** note ("X sammelt für Reihe 4") and the **LIVE-KARTENSTAND** label
  are all **rejected**: unconfirmed practice, and no freshness claims on seeded data (E2
  precedent).
- The mock's **"Ende, etwa"** stat stays dropped (E1: the club promises no end time).

### Consistency knock-on

- **The `/events` Börse band gains its link** ("Zur Kartenbörse →", still zero mechanics
  claims). Otherwise the site holds two truths about whether the Börse is reachable.
  `page-ticket-exchange`'s phase still replaces the band's copy with the real one.

### Architecture

- Route `routes/_site/_gated/events_.$eventSlug.tsx` gets a **loader** resolving the event
  from the seed (`notFound()` on an unknown slug — Album route precedent), a head built
  from `loaderData` (title, description, canonical, og) and **per-event schema.org/Event
  JSON-LD with `offers`** (price + availability derived from `salesStatus`). Same ungating
  guard as E2: placeholder Eckdaten must never reach rich results — the gate holds until
  the club confirms them.
- One `EventDetailPage` in `features/events/components/` (NewsListPage/EventListPage
  precedent) assembling internal ui/layout pieces; `EventTicketPanel` is its own tested
  component with the ladder as a discriminated union in pure `ticket-panel-display.ts`
  (the `next-event-display.ts` idiom). Shared primitives (`EventDateBlock`, `CapacityBar`,
  `SalesStatusBadge`, now `VenueBlock`) are reused, not re-cut.
- Copy in `*-content.ts` modules; logic in pure tested functions; countdown reuses
  `countdown.ts` + `use-countdown`.

## Awaiting facts (non-blocking — placeholders until the club supplies them)

- Real venue facts (Adresse, Parken, Barrierefreiheit) — inherited from E2's placeholders.
- Real per-event `description` and `performers` text; seeds ship recognisable placeholders.
- Whether Karten are also sold at an Abendkasse — until answered, `salesClosed` says nothing.

## Ideas parked (not scheduled)

- **VVK-Erinnerung** — notify people when a Vorverkauf opens. Needs a backend (email
  capture, consent, sending) and a decision that the club wants to send mail at all.
- **Ablauf act → Gruppe deep links** once acts carry an optional Gruppe reference.
- **Live-Ablauf on the evening itself** — only if the Club-App ever publishes one.

## Open Questions

None — all resolved 2026-08-15 (see Decisions).

## Done When

- `/events/$eventSlug` renders the real page for every seeded event; an unknown slug is a
  proper 404, not an empty page.
- All seven `salesStatus` faces of the ticket panel are tested (`cancelled` in tests only);
  every CTA leads somewhere that exists (placeholder or real), and no action fakes a
  transaction.
- The page reads complete for an evening with **no** `performers`, **no** `description` and
  **no** matching Album — tested with exactly that seed.
- `performers` / `description` / Album `eventType` are Zod-parsed parts of the seed; the
  photo match is a tested pure function.
- `/tickets` is gone: no route, no link, no "Tickets" label anywhere in `web/`.
- `VenueBlock` has one home and both pages consume it.
- Per-event JSON-LD with `offers` validates; head comes from `loaderData`.
- Full gates pass: typecheck, tests, lint, build.

## Implementation plan (E-phases)

- **E3 — Veranstaltungsseite** (this file, four slices, one phase; per-slice reviews and
  full gates as in E1/E2):
  1. **Model + entry sweep** — `performers` + `description` on the event seed (placeholder
     values), `eventType` on Album; `/tickets` retired (masthead chip + desktop button +
     landing hero → `/events`, label "Karten"); `/events/$eventSlug/seats` and
     `/events/exchange` placeholder routes; the `/events` Börse band linked.
  2. **Identity + ticket panel** — real route (loader, `notFound`, head, per-event JSON-LD
     with offers), back link, tag row, H1, teaser/description, derived stat row;
     `EventTicketPanel` with the full seven-state ladder and the mobile sticky CTA bar.
  3. **Secondary blocks** — "WER AUFTRITT" (order only, present-only), Album preview
     matched by `eventType`, `VenueBlock` promoted to feature-shared and rendered on both
     pages.
  4. **Closing + assembly** — "Auch noch in dieser Session", closing band with countdown,
     `EventDetailPage` assembly, page tests, full gates.

## As-built (E3, 2026-08-15)

Built as the four planned slices; final gates green (typecheck, **841 tests** — 14 ui + 827
website —, lint, build). Followed the plan closely; the decisions and deviations worth
carrying forward:

- **The masthead carries one Veranstaltungen entry, not two** (user ruling during the build).
  The plan said the chip, the desktop button and the hero CTA all repoint to `/events` with
  the label **"Karten"** — which would have put a "Karten" chip next to a "Veranstaltungen"
  chip in the same mobile nav, both leading to the same page. The user's call: *"there are no
  separate Karten and Veranstaltungen pages"*. So **`/events` left `navItems`** and became the
  prominent entry instead: `EventsChip` (primary-coloured, first in the mobile chip row) and
  the desktop contained button, both labelled **Veranstaltungen** from the shared
  `eventsNavLabel`. `TicketsChip` was renamed `EventsChip` (the file, not the concept — code
  stays English).
- **The landing hero lost its second CTA** (user ruling): repointing the primary made both
  hero buttons lead to `/events`, so the hero now ships a single **"Karten sichern →"**.
- **A masthead defect the longer label exposed:** at 900–1199px the ornamented desktop bar
  (nav · rule · NUMBER 55 · FURRIA · SESSION · rule · toggle · CTA) no longer fits, and the
  CTA was clipped at the viewport edge. The two **decorative meta labels and their rules are
  now hidden below `lg`**; the full bar returns at 1200+. Verified at 940/1024/1200/1440.
- **`description` ships as a paragraph array**, not a single string — the news `body`
  precedent, and the plan's own "plain paragraphs" wording. `deriveEventIntroParagraphs`
  falls back to `[teaser]`, so the identity block always reads.
- **Album `eventType` is a typed optional field, not Zod-parsed.** The Done-When asked for it,
  but the Galerie's content is a compile-time TS constant with no schema anywhere (P5/ADR-0003
  — it must stay synchronous and prerenderable). Adding Zod there would have been ceremony for
  a value TypeScript already checks. The **event** seed fields (`performers`, `description`)
  *are* Zod-parsed, and the matcher is a tested pure function.
- **Seed coverage is deliberately uneven** so every face has a real seed: Prunksitzungen carry
  `performers` + `description` + a matching Album; Rentnerfasching has a lineup but no Album;
  Kinderfasching an Album but no lineup; Jugendfasching a description only; and
  **Weiberfasching stays bare** — no lineup, no description, no Album — which is the
  "page still reads complete" case the plan demanded.
- **`performers` are the club's real Gruppen only.** No guest acts were invented: an invented
  Gastverein name would be a plausible-sounding lie (the P5 photo-credit / P6 Jeck-Check rule).
  A seed test asserts no act name contains a digit — the order-only rule, enforced.
- **The ladder lives in `ticket-panel-display.ts`** as `deriveTicketPanelFace` (six faces —
  `onSale` carries `scarce` instead of splitting `almostSoldOut` off), plus
  `deriveTicketPanelCta` and `deriveTicketPanelNote`. All seven `salesStatus` values are
  tested there, `cancelled` included; the panel itself is presentational and untested per the
  repo's no-UI-tests rule. The panel reuses `CapacityBar`, `deriveSalesStatusLabel` and the
  `FAST WEG` chip rather than re-cutting them.
- **`SectionActionLink` and `BandCta` now accept a plain `string` `to`** (`LinkProps['to'] |
  string`), because both are now used with derived hrefs (`buildAlbumHref`,
  `buildSeatPickerHref`). Same trade-off P4 recorded for `buildPostHref`: TanStack's typed
  `to` union cannot express a runtime-built path, and `params` serialisation is worse.
- **The Album preview lives in the Galerie feature** (`AlbumPreview`), not in events — it
  renders Album photos, and features never import each other. The route composes it into
  `EventDetailPage`'s `albumPreview` slot. Preview tiles all use the landscape frame
  (`albumPreviewOrientation`) so the strip has one height.
- **The H1 needed its own clamp.** The theme's `h1` (`clamp(3.75rem, 8vw, 6.5rem)`) is sized
  for full-width heroes; in the 7/12 identity column "RENTNERFASCHING" overflowed into the
  ticket panel at 1024px. The headline now uses `clamp(2.75rem, 6vw, 4.75rem)`.
  ⚠️ **`/events`'s own hero (E2) has the same defect** at that width and was left alone.
- **Visual verification actually happened this time** (the debt P5/P6 recorded): headless
  Chromium at 360/390/940/1024/1200/1280/1440, light **and** dark, across the onSale, sold-out,
  presale and bare-seed faces. Fixed from what it showed: the two layout defects above and the
  closing band's headline, which was the only band headline on the site not uppercase.

## References

- [Area plan](master-plan.md) · [Foundation](foundation-events-data.md) ·
  [Veranstaltungen list](page-event-list.md)
- [Galerie](../feature-gallery.md) — Session derivation + photo source precedent
- [`CONTEXT.md`](../../../CONTEXT.md) — Veranstaltung, **Ablauf** (late, order-only),
  **Karte**, **Vorverkauf**, **Kartenbörse**
- Mock rulings: [`docs/design/events-page/README.md`](../../../docs/design/events-page/README.md)
