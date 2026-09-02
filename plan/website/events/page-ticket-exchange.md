---
title: Kartenbörse
slug: ticket-exchange
route: /events/exchange (pinned by event-detail shaping, 2026-08-15)
type: page
status: shipped (concept)
mock: docs/design/events-page/ (fcc-web-boerse.jsx — EvBoerseDesktop / EvBoerseMobile, EvWaitPanel, EvSwap)
depends-on: [foundation-events-data, page-order-flow]
adrs: []
---

## What & Why

The club's answer to sold-out evenings and empty chairs: return a Karte you can't use, the
Warteliste moves up, the price stays the price — no private resale, no markup. Expected to
become a key feature — **but it highly depends on data structures and club rules that are
created later** (user directive, shaping 2026-09-01). So this page ships as a **concept
page**: a "future view" presenting the ideas as clearly-framed plans in the making, a
starting point the user adjusts later. How the Börse really works is a second, real shaping
round when the club decides. The website is not public — the copy is scaffold-quality
draft, not final prose; the *structure* is what this plan pins.

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

Rulings (adopted-as-ideas / rejected, and why) are recorded in the
[mock README](../../../docs/design/events-page/README.md#rulings--kartenbörse--page-ticket-exchange-shaped-2026-09-01).

## Decisions

Carried from the events-list shaping (2026-08-13):

- **This page owns the Börse mechanics shaping.** The user confirmed the mock's
  return → waitlist → SMS/Vorkaufsrecht flow is *not* settled club intent. → **Resolved
  2026-09-01: the mechanics deliberately stay unshaped.** This session shaped the *concept
  page* only; the mechanics shaping moves to the future round (see Lifecycle below).

Pinned by the event-detail shaping (2026-08-15):

- **Route is `/events/exchange`** — the Börse serves the whole Session, not one evening;
  static sibling inside the area. E3 created it as a `PlaceholderPage`; E3 also wired both
  entry links (the `/events` band's "Zur Kartenbörse →" and the sold-out ticket panel's
  CTA), so **no integration work remains for this page's phase**.
- **Glossary:** `CONTEXT.md` carries **Kartenbörse**, **Karte**, **Vorverkauf** — use
  them, don't redefine them.

Decided in the concept shaping (2026-09-01):

- **The page is a concept page ("future view").** The glossary embargo was amended
  (`CONTEXT.md` → Kartenbörse): this page may present values and mechanics as
  **clearly-framed plans in the making** — visibly labeled as in planning, nothing stated
  as existing, decided or guaranteed. Every other surface stays existence-only.
- **Everything is assumptions** — the user confirmed even the value story (fixed price,
  club-run) is not decided club intent. The only confident statement is *that* a
  Kartenbörse is planned. The page frames values as guiding principles of the planning,
  mechanics as ideas.
- **Zero interaction.** No forms, no disabled buttons, no notify-me — a form would assert
  the mechanic as real (an honest-failing P6-Antrag-style signup was explicitly rejected).
  The only CTA links back to `/events`. No data, no seed, no API, no Zod schema.
- **Idea in/out split** — see the mock README rulings. In (as framed ideas): the core
  loop **with the refund-only-on-actual-resale sharpening** (bis dahin bleibt die Karte
  deine), Warteliste ohne Vorkasse, the principles (Preis bleibt Preis · über den Verein ·
  kein Stuhl bleibt leer), Abend tauschen ("z. B. bis eine Woche vor dem Abend" —
  example-flavored). Out: SMS, the 6-hour Vorkaufsrecht, stats row, returned-seat rows,
  named-tickets/QR enforcement (doubly embargoed via Einlasskontrolle).
- **Open questions become content**: a "Was wir noch klären" section names what's
  undecided (wer zuerst dran ist, wie die Rückgabe genau abläuft, Fristen) instead of
  answering it — that's what makes "in Planung" credible.
- **The band and the sold-out panel stay untouched.** Their claim-free copy is still true
  and matches the page's frame. The E2 obligation ("this page's phase replaces the teaser
  band with the real band") **transfers to the future mechanics shaping round**.
- **No backend contract pinned** — deliberately nothing; recorded in the area plan's
  Deferred section so silence isn't mistaken for oversight. The idea inventory below is
  the input for the future round.
- **No new glossary terms**: Warteliste/Rückgabe stay idea-language on the page —
  canonizing them would canonize undecided mechanics.

### Page structure (pinned 2026-09-01)

Destillat system, existing KK primitives, German copy, copy constants in
`exchange-content.ts` (embargo-/copy-guard-sweepable):

1. **Hero** — eyebrow `KARTENBÖRSE`, H1 in the "Ausverkauft ist nicht das Ende" spirit,
   plus a **visible "in Planung" marker** — the "recognisably future" device (sibling of
   E5's `tone="placeholder"`), seen before any idea is read.
2. **So stellen wir uns das vor** — the core loop as a 3-step strip: Karte zurückgeben →
   jemand anderes kauft sie → Geld zurück, die Warteliste rückt nach. Sub-note: bis dahin
   bleibt die Karte deine — wird sie nicht gekauft, gehst du ganz normal hin.
3. **Was uns dabei wichtig ist** — Preis bleibt Preis (kein Aufpreis, kein Gewinn) · läuft
   über den Verein, nicht privat · kein Stuhl bleibt leer. Guiding principles, not
   promises.
4. **Ideen, über die wir nachdenken** — Warteliste ohne Vorkasse · Abend tauschen
   (z. B. bis eine Woche vor dem Abend).
5. **Was wir noch klären** — wer zuerst dran ist · wie die Rückgabe genau abläuft ·
   Fristen.
6. **Closing** — "Bis dahin läuft der Vorverkauf ganz normal" + link to `/events` (the
   page's only CTA).

## Idea inventory — input for the future mechanics shaping

Not decisions. Logged so the real shaping round starts from them:

- Refund only when the returned Karte is **actually re-bought**; until then it stays the
  returner's (no-risk return). Refund mechanics are Ledger territory.
- Warteliste without prepayment; notification channel realistically **mail** (SMS killed
  by P6 precedent); "who gets first refusal" (Vorkaufsrecht?) wholly open.
- Free evening swap, deadline idea: until ~1 week before the evening.
- Enforcement (named Karten, code invalidation on transfer) blocked on the
  **Einlasskontrolle** decision.
- Inherited obligation: replace the `/events` teaser band with the real band + mechanics
  copy once decided (E2 ruling).

## Done When

- `/events/exchange` renders the concept page in the pinned six-section structure; the
  "in Planung" marker is visible before any idea.
- No interactive element besides the `/events` link; no fake numbers; no data/seed/API
  work.
- Copy lives in `exchange-content.ts`; the embargo/copy-guard sweep covers it (banned
  terms: Zweitmarkt, Resale …; rejected specifics: SMS, Vorkaufsrecht hours).
- Full gates green (typecheck, tests, lint, build); as-built notes recorded here; statuses
  flipped to `shipped (concept)`.

## As-built (E6, 2026-09-01)

Built as planned — one slice, zero interaction, no data/seed/API work. Notes and recorded
deviations:

- **`TicketExchangePage`** (events feature) replaces the `PlaceholderPage`: a plain page
  orchestrator per the E4 precedent, parts under `internal/{ui,layout}`. The six pinned
  sections map to `ExchangeHero` (+ `PlanningMarker`), `ExchangeCoreLoop`,
  `ExchangePrinciples`, `ExchangeIdeas`, `ExchangeOpenQuestions`, `ExchangeClosingBand`.
- **The "in Planung" marker is a dashed outlined chip** beside the hero eyebrow — dashed
  is the "recognisably future" style (sibling of E5's dashed `tone="placeholder"`), and
  the two idea cards carry the same dashed border, so the least-decided content is
  visibly marked twice.
- **Copy-guard restructure** (`src/test/copy-guard.test.ts`): the concept copy may say
  Warteliste/Rückgabe, so `exchange-content` left the strict Karten sweep — the teaser
  band's copy stays under it as a named sub-object, and the whole module is now swept by
  `REJECTED_EXCHANGE_SPECIFICS` (Zweitmarkt/Weiterverkauf/Resale, SMS, Vorkaufsrecht,
  hour-count deadlines, QR, live claims, and standalone "Börse" via lookbehind).
- **The route gained description/OG meta** (the placeholder had a title only) and stays
  indexable — unlike the order routes, nothing here is private.
- The open questions render as a static bordered list — the FAQ look without the
  accordion, because zero interaction includes no expand/collapse.
- Gates green (typecheck, tests, lint, build); the rendered page was verified headless —
  the only interactive element is the closing band's `/events` CTA.

## Lifecycle note

After E6 this page is **`shipped (concept)`** — shipped in its intended *current* end
state. A second, real shaping round (Börse mechanics, club decisions, backend contract)
reopens it later; that round inherits the idea inventory and the teaser-band obligation.

## Implementation plan (E-phases)

### E6 — Kartenbörse (Konzeptseite) — single slice

Deliberately the smallest phase of the area:

1. Replace the `PlaceholderPage` at `/events/exchange` with the concept page per the
   pinned structure — static, zero interaction, existing KK primitives, copy constants in
   `exchange-content.ts`.
2. Tests per `docs/web/TESTING.md` (pure logic only): the meaningful guard is the embargo
   sweep over the page's copy constants.
3. Gates, as-built notes, status flip.

## References

- [Area plan](master-plan.md) · [Purchase](page-purchase.md) ·
  [Karten-Bestellflow](page-order-flow.md) · [Event detail](page-event-detail.md)
- [Mock rulings](../../../docs/design/events-page/README.md#rulings--kartenbörse--page-ticket-exchange-shaped-2026-09-01)
- [`CONTEXT.md`](../../../CONTEXT.md) — Kartenbörse (amended 2026-09-01), Ledger
