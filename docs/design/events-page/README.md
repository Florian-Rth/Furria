# Handoff: FURRIA — Termine & Karten (öffentliche Website)

Design direction for the public **Events area** (Programm, event detail, Platzwahl,
Kauf/Karte, Kartenbörse). This bundle arrived **without a README** — this file was written
by the team when the bundle was moved into the repo (2026-08-12), *before* any shaping
session had ruled on it.

> **Read `docs/design/README.md` → "READ FIRST" first.** It governs every mock in this
> repo: the design *language* (tokens, Anton/Archivo, radius 14, soft elevation) is
> binding; layouts, flows, features and copy are **inspiration, not spec**, and improving
> them is actively wanted.

## What the mock contains

Open `preview.html` in a browser (needs internet for CDN React + Google Fonts). It renders
`EventsPage({ mode, device, view, id })` with five views, faked with `useState` because the
prototype has no router: `index` (Spielplan, plus a `kalender` toggle), `detail`, `seats`
(Platzwahl/Saalplan), `karte` (paid confirmation + digital ticket), `boerse` (Kartenbörse).

| File | Content |
|---|---|
| `src/fcc-web-events.jsx` | Data + building blocks, Spielplan (list + two months), event detail |
| `src/fcc-web-tickets.jsx` | Saalplan/Platzwahl, digitale Karte, all mobile views, mock router |
| `src/fcc-web-boerse.jsx` | Kartenbörse page + the pieces wiring it into the other views |
| `src/fcc-theme.jsx`, `fcc-logos.jsx` | Shared brand layer |
| `src/fcc-shared.jsx` | Mock-only phone frame / canvas chrome — **do not port** |

## How this bundle is processed

The area is planned in [`plan/website/events/`](../../../plan/website/events/master-plan.md)
— one plan file per page, each shaped in its own grilling session. **Rulings (Adopted /
Rejected / Added by us) are recorded here, per page, during those sessions** — the
[join-page README](../join-page/README.md) is the model. Nothing in this bundle is adopted
by default.

## Rulings — Events data foundation (shaped 2026-08-13)

**Adopted**

- **One venue for everything** — confirmed real: every ticketed evening is in the
  Dorfgemeindehaus Großfurra (`EV_ORT` verified, exception to the invented-facts list).
- **The six event types** (1. + 2. Prunksitzung, Weiberfasching, Jugendfasching,
  Rentnerfasching, Kinderfasching) with their calendar-correct 2026/27 dates — the club's
  real usual season. Teasers/times/prices stay placeholder.
- **`evStatus`'s one-phrasing idea** — one label formula for all states ("N von M frei"),
  color carries the urgency.
- **Eckdaten fields**: Einlass + Beginn, age hint (as free text), teaser sentence + event
  type.

**Rejected**

- **The four-state stored `status`** (`offen · knapp · ausverkauft · bald`, stored
  redundantly next to `frei`/`kap`/`vvk`) — replaced by a backend-owned 7-state
  `salesStatus` lifecycle enum (adds `salesClosed`, `cancelled`, splits `bald` into
  `announced`/`presaleScheduled`); a seed builder derives it from counts so seed data can
  never contradict itself.
- **Flat 12 € price** (`EV_PREIS`) and the "für jeden Abend gleich, für jeden Platz
  gleich" copy — price varies per event (flat within one evening).
- **Fixed 288-seat capacity** (`kap: 288`) — capacity and the seating plan are per event;
  the hall is set up differently each time.
- **The rough end time** ("Ende ca. 2:00") — the club doesn't promise an end publicly;
  field dropped.

**Added by us**

- **Progressive publishing** — events go public at `announced` with only the core known;
  Einlass, age hint, price, capacity, VVK start may arrive later (nullable).
- **Programm narrowed to ticketed evenings only** (`CONTEXT.md`, 2026-08-13) — unticketed
  happenings (Rosenmontagsumzug) leave the website's Programm entirely.

## Rulings — Veranstaltungen list / `page-event-list` (shaped 2026-08-13)

**Adopted**

- **The H1 "VERANSTALTUNGEN"** — and it won bigger than the mock asked: the user retired
  "Programm" repo-wide; **Veranstaltungen** is now the general term (glossary updated,
  Club-App running order → **Ablauf**).
- **The hero card** ("Nächster Abend mit Karten"), trimmed: countdown, capacity bar,
  "N von M frei", FAST-WEG tag, "Zum Abend" CTA.
- **The row anatomy** (boxed date block · title/meta/teaser · status column) and the
  hero's **stat-row idea**, recomputed honestly (Abende · "ab X €" · Karten noch frei).
- **The list section** with derived date range — retitled `ALLE TERMINE`.
- **Venue block structure** and the **FAQ accordion** — with only confirmed content:
  Kostüm as mocked; Essen & Trinken confirmed (**nur Bargeld**); Kinder & Jugend ages are
  wrong → recognisable placeholders; unverified venue facts → recognisable placeholders.
- **The filmstrip** as decorative rhythm (placeholder imagery, reduced-motion aware).
- **Börse band placement** — but only as a concept teaser, see Rejected.
- **The split-hero hierarchy** (identity left, card right, list below) and `EvCountdown`'s
  adaptive granularity (seconds only when they mean something) — second grilling round.

**Rejected**

- **The Liste ↔ Monate toggle and `EvMonth`** — ~6 evenings don't earn a month grid.
- **Every freshness/live claim**: "LIVE-KARTENSTAND · VOR 4 MIN AKTUALISIERT", "der
  Kartenstand hier kommt live aus dem Vorverkauf" — nothing is live on seeded data.
- **"12 € jede Karte" and "288 Plätze pro Abend" stats** — contradict the per-event model.
- **"DER SPIELPLAN"** (and "Spielplan als PDF") — a third synonym for the same list.
- **The Börse band's mechanics** — return flow, SMS/6h-Vorkaufsrecht, "7 auf der
  Warteliste": the user confirmed the mechanics are undecided; the band ships as a
  zero-claims concept teaser until `page-ticket-exchange` shapes them.
- **The contact line "Ruf an: 0170 55 44 21"** — banned (invented person / private
  mobile, P5/P6 precedent); likewise the soldOut rows' fake "3 Plätze in der Börse".
- **Venue fact rows as mocked** — the user confirmed **none** are correct (address,
  parking, shuttle, accessibility); the Saal seat-count row (fixed capacity) and the
  Shuttle row (nonexistent service) are dropped outright.
- **FAQ items**: flat price, "Saal öffnet 60 Minuten vor Beginn" (contradicts per-event
  Einlass), online payment, QR-per-Mail — purchase fiction until a purchase flow exists.
- **"Termine abonnieren" / ICS band** — *deferred*, not killed: a static `.ics` would
  export placeholder times into real calendars; unlocks with club-confirmed Eckdaten.

**Added by us**

- **The retrofit-links pattern**: `/events` ships navigation only into pages that exist
  (detail placeholder at `/events/$eventSlug`); every later page's phase wires its own
  entry links into the list. No purchase/Börse CTAs until those pages are real.
- **Honest FAQ price item** — "Was eine Karte kostet" answered from the model: differs
  per evening, shown on each Termin.
- **No archive** — current Session only, pinned into the deferred-backend contract.
- **Second round (product):** the hero card's four-face state ladder (incl. a
  VVK-start countdown for `presaleScheduled`), a designed end-of-season empty state,
  quiet per-type tint accents on the date block (mock's monochrome rows rejected),
  anchor deep links per row, a derived proximity badge ("Diesen Samstag"), and
  schema.org/Event JSON-LD (guarded by an "Eckdaten real?" ungating check).

## Rulings — Veranstaltungsseite / `page-event-detail` (shaped 2026-08-15)

**Adopted**

- **The whole page skeleton**: back link · tag row (Typ · Session · Altershinweis · Ort) ·
  H1 · derived stat row · ticket panel in the right rail · "Auch noch in dieser Session"
  cards · closing band with countdown and the state CTA.
- **The ticket panel's state-dependent CTA** — and further than the mock: E3 ships the real
  "Platz wählen →" / "Zur Kartenbörse →" links into placeholder routes, because the site
  goes live only when the platform behind it is ready ("planned end state" ruling).
- **"So war es letztes Jahr"** as an idea — see Rejected for the mechanics.
- **A mobile sticky CTA bar** (mock's mobile shell idea; user overruled the recommendation
  to defer it).

**Rejected**

- **The timed Ablauf, the "Reihenfolge kommt später" copy and the "AM ABEND SELBST /
  WELCHE NUMMER GERADE LÄUFT" live card** — the club assembles the Ablauf only 2–3 weeks
  out and shifts acts on the night; a public clock is a promise the evening breaks, and a
  live Ablauf is Club-App fiction here. Only the **order** is published.
- **The auto-advancing Foto-Theater** (pause + dots) — motion for its own sake that
  duplicates the Galerie's own viewer; replaced by a static 3–4 photo preview linking into
  the Album.
- **"SO SITZT DER SAAL — 24 TISCHREIHEN, 288 STÜHLE"** — fixed geometry again contradicts
  per-event capacity (E1 ruling); the shared placeholder venue block is used instead.
- **"LIVE-KARTENSTAND"** (E2 precedent), the payment hints ("Kreditkarte, PayPal — oder bar
  im Vereinsraum") and the **Gruppenbestellung** note ("X sammelt für Reihe 4") — all
  unconfirmed practice or freshness claims on seeded data.
- **The `EvWaitPanel` waitlist and the VVK-"Erinnerung" subscribe** — actions that would
  store nothing; the Börse mechanics stay embargoed until `page-ticket-exchange`.
- **"Ende, etwa"** — still dropped (E1).

**Added by us**

- **`performers`** (ordered act names, Gruppen *and* guests, nullable) and an optional
  per-event **`description`**, so a page without an Ablauf or an Album still reads complete.
- **Album ↔ event matched by `eventType`**, never by id — an Album covers an occasion, not
  a Veranstaltung (glossary).
- **`/tickets` retired**: the orphan placeholder behind the masthead chip, the desktop button
  and the landing hero CTA now points at `/events` (ADR-0002 kills the English "Tickets"
  label). Built differently than shaped: the masthead ended up with **one** entry labelled
  **Veranstaltungen** — promoted out of the nav list into the CTA — rather than a "Karten"
  chip beside a "Veranstaltungen" link; the landing hero dropped its second CTA and keeps
  **"Karten sichern →"**.
- **Routes pinned** for the two unbuilt pages: `/events/$eventSlug/seats`, `/events/exchange`.
- **Glossary grew**: Karte · Vorverkauf · Kartenbörse, plus the Ablauf's late, order-only
  public face.

## Rulings — Karten-Bestellflow / `page-order-flow` (shaped 2026-08-18)

The session that was meant to shape the Platzwahl discovered its core is an **undecided
club fact** (numbered seats vs. general admission — `CONTEXT.md` → Sitzplatzvergabe) and
merged the mock's page-per-view purchase (seats → jump to "karte") into **one continuous
Bestellflow** at `/events/$eventSlug/order`.

**Adopted**

- **The step-page concept**: event-context header (back link, kicker, state H1, capacity
  bar) around the choice — Karten-ified: "DIE LETZTEN N KARTEN.", never "PLÄTZE".
- **The selection→payment sequence** — upgraded beyond the mock: a guided wizard with a
  persistent bottom CTA bar, instead of separate pages (the mock's seats page even skips
  checkout entirely).
- **The `EvPick` sum idea** (n × Preis = Summe) — as the future bottom-bar content, once a
  selection mechanism exists.

**Embargoed until the Sitzplatzvergabe decision** (not rejected — undecidable today)

- `EvSaal` itself: the seat grid, legend, sold-out returns-only mode
- Selection cap (10), the hold timer, Lage-Hinweise ("Nah an der Bühne")
- Gruppenbestellung gold seats and in-plan Börse returns (doubly embargoed — Börse
  mechanics are page 6's)

**Rejected**

- **"LIVE-KARTENSTAND"** — third time (E2/E3 precedent); nothing is live on seeds.
- **"12 € pro Platz · Kinder gleich · 62 Stehplätze"** — flat price died in E1; Stehplätze
  and Kinder-pricing are invented facts.
- **The hall-truth copy** ("Das ist der echte Saal: 24 Biertisch-Reihen…") and the fixed
  3×8×12 geometry — contradicts per-event capacity (E1).
- **Rollstuhl "kurz anrufen" link** — unverified practice and there is no publishable
  number (P5/P6 precedent).
- **Platz language for the entitlement** ("Platzwahl", "SETZ DICH, WOHIN DU WILLST.") — the
  glossary sells **Karten**; Platz is the seat. Step is **KARTENWAHL**, entry CTA "Karten
  wählen →".
- **Payment hints** ("Kreditkarte · PayPal · bar im Vereinsraum") — still unconfirmed
  practice (E3 precedent).
- **9px mobile seat targets** — rejected regardless of the seat-model outcome.

**Added by us**

- **The recognisable placeholder core** for step 1 — states *that* the mechanics are
  undecided, claims nothing about *how*.
- **State guard in the frame**: every `salesStatus` lands honestly (VVK-Termin, "Zur
  Kartenbörse →", cancelled notice) — the mock only knows onSale/knapp/ausverkauft.
- **`/orders/$orderCode` capability URL** for the confirmation/digitale Karte —
  unguessable token, mail-linkable, guest-checkout-safe.
- **Optional self-registered buyer Accounts** (Person without Mitgliedschaft; duplicates
  flagged open) — the mock has no identity at all.
- **Direct flow entry from the list** in purchasable states, alongside the detail panel.

## Rulings — Kauf & Karte / `page-purchase` (shaped 2026-08-19)

The session re-litigated every prior decision touching the purchase (user instruction:
question everything). Guest checkout, the `/orders/$orderCode` capability URL and the
single-flow route were challenged and **upheld**; the payment model changed.

**Adopted**

- **The confirmation-page concept** ("BEZAHLT" hero → order → what's next → onward
  teasers) — as four blocks: state hero, Bestellung summary, cross-sell to another
  purchasable evening, Kartenbörse existence teaser.
- **The cross-sell card** — honest and seed-derivable.
- **The Börse return/swap teaser** — reduced to *that it exists* (glossary rule: its
  mechanics are undecided).

**Embargoed until the Einlasskontrolle decision** (new flagged ambiguity, `CONTEXT.md`)

- The whole `EvTicket` QR face: QR stub, "Handy oder Ausdruck — beides geht", scanning
  at the door. Not rejected — the door practice is simply undecided.
- PDF download and calendar actions (delivery artifacts of the same undecided practice).

**Rejected**

- **"MAIL IST UNTERWEGS" as the mock means it** is kept, but the mock's *mail contents*
  (QR attached) are not promised — the mail carries the `/orders/$orderCode` link.
- **Wallet passes** — unbuilt software, P6 rule against advertising it.
- **Reminder mail two days before** — unverified club practice, unbuilt.
- **Live Ablauf on the evening** — event-app territory, unbuilt.
- **The skipped checkout** — the mock jumps seats → "BEZAHLT"; the real flow gets the
  step the mock omitted (step 2 buyer form, step 3 Bestellübersicht + Zahlung).
- **"Kreditkarte · PayPal · bar im Vereinsraum"** — resolved, not confirmed: **Stripe is
  the single provider** (embedded Payment Element); methods are Stripe config, never a
  hand-maintained list; bar reservation is not practice.

**Added by us**

- **The buyer form the mock never drew**: one buyer per Bestellung — Vorname, Nachname,
  E-Mail, nothing else.
- **§312j/§312g legal framing**: "Zahlungspflichtig bestellen" wording (final form) and
  the Widerruf-exemption notice; no AGB checkbox while no Karten-AGB exist.
- **`paymentStatus: paid | processing`** — the "Zahlung in Bearbeitung" face for
  async Stripe methods; no failed face (failure produces no mail).
- **A seeded, visibly fake demo Bestellung** at `/orders/demo`; unknown codes fail
  honestly. `robots: noindex` on flow + confirmation.

## Rulings — Kartenbörse / `page-ticket-exchange` (shaped 2026-09-01)

The session confirmed the Börse mechanics **cannot** be decided yet — they depend on data
structures and club rules that come later. The page ships as a **concept page** ("future
view"): a starting point presenting ideas, not a working Börse. The glossary embargo was
amended for exactly this: the Kartenbörse page may present values and mechanics as
**clearly-framed plans in the making**; every other surface still states only that it
exists. **Even the mock's value story is assumptions, not club intent** — the user
confirmed nothing is decided, so the page frames everything as in planning; the only
confident statement is *that* a Kartenbörse is planned.

**Adopted — as clearly-framed ideas, never as claims**

- **The core loop** (Karte zurückgeben → jemand anderes kauft sie → Geld zurück, die
  Warteliste rückt nach) — the page's centerpiece idea, sharpened by the user: **the
  refund happens only when the Karte is actually re-bought; until then it stays yours**
  (no risk — if nobody takes it, you go as planned).
- **The Warteliste idea** — join for a sold-out evening, no prepayment. As idea only; the
  mock's position/"chance" meter UI is rejected below.
- **The "warum nicht privat" value story** — Preis bleibt Preis (kein Aufpreis), läuft
  über den Verein — reduced to *guiding principles of the planning*, explicitly not club
  decisions.
- **Abend tauschen** (`EvSwap`'s free-swap idea) — as a secondary "wir denken auch über …
  nach" idea with an example-flavored deadline ("z. B. bis eine Woche vor dem Abend",
  user's tweak), not as the mock's functional tabs.
- **The how-it-works step strip** — as the 3-step presentation of the core loop.

**Rejected**

- **The stats row** (returns this Session, free now, waitlist length) — fake live numbers,
  fourth LIVE-claim precedent (E2/E3/E4).
- **The returned-seat rows with claim CTAs** (`EvBoerseDesktop`/`EvBoerseMobile` lists)
  — functional UI pretending live data; a concept page has none.
- **`EvWaitPanel` as a real signup** (form, position, chance meter) — a form *asserts the
  mechanic as real*; the page ships **zero interaction** (the only CTA links to
  `/events`). Even an honest-failing P6-Antrag-style form was rejected for this reason.
- **SMS notifications + the 6-hour Vorkaufsrecht window** — P6 killed a promised SMS flow
  once already; this specificity reads like spec. The page stays channel- and
  deadline-silent; "wer zuerst dran ist" is *named as an open question*, not answered.
- **Named tickets / QR invalidated on transfer** — enforcement mechanics, doubly embargoed
  (Börse mechanics + the undecided Einlasskontrolle). The intent ("über den Verein") is
  stated without the mechanism.

**Added by us**

- **The concept-page frame**: a visible "in Planung" marker in the hero — the
  "recognisably future" device (E5's `tone="placeholder"` made "recognisably placeholder"
  a token; this is its sibling), seen before any idea is read.
- **A "Was wir noch klären" section** — the open questions stated honestly (wer zuerst
  dran ist, wie die Rückgabe genau abläuft, Fristen), which makes "in Planung" credible
  instead of evasive.
- **The glossary amendment** (`CONTEXT.md` → Kartenbörse): values are as undecided as
  mechanics; the page may present both as clearly-framed plans.
- **No backend contract pinned** — deliberately nothing: no API, no seed, no Zod schema.
  The idea inventory lives in the page plan for the future real shaping round, which also
  inherits the E2 replace-the-teaser-band obligation.

## ⚠️ Known invented facts (unverified until a shaping session confirms them)

- **288 seats** in 24 table rows × 12, 62 Stehplätze, the whole hall geometry
- **12 € flat price** for every seat and every evening
- **Six events** with concrete 2027 dates, times (19:11 …), age hints and teasers
- **"Präsidentin Marlies Hoffmann"** and the private mobile **0170 55 44 21** — a plausible
  named person in an Amt with a private number, banned twice over (P5 invented-people rule,
  P6 private-mobile rule)
- **SMS notifications** with a 6-hour Vorkaufsrecht, live-updating lists, a live Ablauf on
  the evening, Wallet passes, a Shuttle nach Sondershausen, Gruppenbestellungen
- The Börse mechanics as a whole (return → waitlist → public, free swap, named tickets,
  QR invalidation) are **design fiction to confirm**, not documented club practice
