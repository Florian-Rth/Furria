---
status: rulings 2026-10-17 (1, 4/8 agreed; table editor built new; no Tischreservierung); hub structure mock in docs/design/event-planner-v2/
scope: events workbench v2 — the Veranstaltungen overview, per-event page with step tiles and the
  current-step band, Besetzung, Ablauf (act planner), Saal & Tische (table planner), Aufgaben,
  Nachbereitung, one honest "Kommt noch" line. No online purchase.
supersedes: plan/launch.md "absent, never a disabled button" (event page only, as one folded line);
  plan/club-app/floor-plan.md seating-editor cut
shaped_with: Florian (pending); team: IA, act planner, table planner, visual/motion, carnival practice, critic
superseded_in_part: every Kartenanfrage / requests pane / ticket_requests.handle part by plan/club-app/presale-places.md, 2026-10-22
---

# Event planner v2

## The idea in one line

Every event is **a track**: its steps are blocks along it, a time cursor shows how much of the lead
time has run out. The hub row is the track; on the event page the track breaks into the **tile
wall**, and the **band** above it says only what to do next. Learn it once, read it everywhere.
(The metaphor stays visual; copy says *Schritte*.)

## Rulings needed

1. **An event starts in preparation** (*in Vorbereitung*): not on the website until Eckdaten are
   complete and *Veröffentlichen* is held — the existing publish ceremony moves from creation to
   that moment. Changes CONTEXT.md *Event* ("always public" → "public once published"). Without
   it, planning from T−90 or copying last year's evening puts half an event online.
2. **The seating editor comes back, built new from scratch** (floor-plan.md cut reversed; the
   old `fcc-ds-seating` mock is not a base — Florian: "crap and only mock").
3. **No Tischreservierung** (Florian 2026-10-17: no Karten are sold now). The Tischplan holds
   tables, chairs and Bereiche only; names on chairs wait for online sales.
4. **Copy counts *Stühle*, never *Plätze*** — seat allocation stays open. Reservations sit per table
   later; tables keep stable ids.
5. **Steps are computed from data; completion is recorded where it happens.** `EventReadiness` is a
   server projection; the command that makes a step complete writes `EventStepCompletion` (who,
   when) — that feeds "fertig · Bernd, 12.1.", *zurückgefallen* and the hand-over moment. The last
   seen state is stored per account (like `ToDoMark`).
6. **One current step per event, for everyone.** Without the step's key the band says *liegt bei
   Saal & Tische* and adds the viewer's own next step as a second line. The band suggests, it never
   gates — every tile opens in any order.
7. **Due dates are never retroactive**: they count from the event's creation or v2's go-live,
   whichever is later — 11.11 does not open with a red wall.
8. **Two new keys:** `events.running_order` (Sitzungspräsident/Literat: Besetzung, Ablauf, sees
   performer names incl. minors), `events.hall` (Saalchef: Saal & Tische). `events.manage` holds all.
9. **External Redner, Gastvereine and Ehrengäste are never Persons** — names on the Nummer or on
   the club's Gastverein list.
10. **The website gets the order only, never times**, after *Ablauf steht* (CONTEXT.md stands).
11. **New words:** *Nummer* (one act of the Ablauf, "Nr. 9"), *Besetzung* (step: who is booked),
    *Aktive* (persons on stage), *Umziehzeit*, *Umbau*, *Moderationskarten*,
    *Saal*. Not *Beitrag* (= fee), not *Mitwirkende* (= participating groups), never "Hub".
12. **Event kind** (`EventKind`: Sitzung, Kindersitzung, Seniorensitzung, Party) — picks the
    Aufgaben template and the default steps (a Party has no Ablauf; Saal optional).

## Steps

| # | Step | Key | Due | Done when |
|---|---|---|---|---|
| 1 | **Eckdaten** | manage | T−90 | title, kind, date, Einlass, venue, teaser, text, picture — and published |
| 2 | **Karten** | manage | T−60 | price + VVK date; never done while a Kartenanfrage waits > 3 days |
| 3 | **Besetzung** | running_order | T−42 | ≥1 Nummer, none left *angefragt*, every *zugesagt* one has a duration; Gastvereine answered |
| 4 | **Saal & Tische** | hall | T−21 | Saal chosen, ≥1 table row, every Notausgang free, Stühle counted. *Ohne Saalplan* drops it |
| 5 | **Ablauf** | running_order | opens T−28, due T−14 | every zugesagt Nummer placed, Pause placed, 0 hard conflicts, end before planned end, *Ablauf steht* held |
| 6 | **Aufgaben** | manage | per item | every checklist item done |
| 7 | **Nachbereitung** | manage | T+14 | album linked or "kein Album", notes for next year |

**Current step** = first of: a *zurückgefallen* step → an *überfällig* one (earliest due) → the open
step with the nearest due whose window is open → after T: Nachbereitung. All done: *Alles bereit ·
noch 12 Tage*.

**Kommt noch** — one folded line under the wall, no dates: *Werbung · Dienstplan · Einlass ·
Live-Regie*. It opens a sheet, one plain line each, plus what it will use that is already collected
(e.g. Werbung: "Story, Beitrag, WhatsApp-Status und Plakat aus Bild und Eckdaten — Bild ✓ · Preis ✓").
No hatched tiles, no disabled fields, nothing in the progress count.

## Veranstaltungen `/events`

> Superseded 2026-10-19 by the Leitstand (see *S1 — Routes* below); the track/matrix/band/wall
> description stays as the original direction only.

- **Fact line** (KkReadout, KkFlapCount): "5 geplant · 2 hinterher · nächste in 24 Tagen ·
  31 Kartenanfragen · 148 Karten". Tap → sheet with **Auftritte je Gruppe** (KkRankBars) and the
  count of Aktive this season.
- **Zu erledigen** — one line per overdue/due step across events; the same items reach Start.
- **Track rows** — phone: day anchor · title · days left (Anton) / the track / "Als Nächstes: Ablauf ·
  3 von 7". Desktop: a **step × event matrix** with sticky step headers; each block carries its
  micro fact (`312 Stühle`, `11 von 13 zugesagt`, `2 Konflikte`). Across = one evening; down =
  "who still lacks a table plan". In preparation = dashed track, not on the website.
- Past folded; cancelled tracks struck through. No sold amounts anywhere.

## Event page `/events/$eventId`

> Superseded 2026-10-19 by the Leitstand event page (see *S1 — Routes* below).

- Slim header: date, venue, sales chip, days left.
- **The band**: step name (Anton) + number, ≤2 "what's missing" lines from the projection ("4 Gruppen
  ohne Platz · Jana tanzt in Nr. 4 und 5, 6 Min zum Umziehen"), one red pill *Weiter mit Ablauf*,
  chip "+2 offen". Last year's note pinned when copied. No track here.
- **Tile wall** (2 cols phone, auto-fit desktop, hairline grid) = the track, unfolded: number, title,
  state glyph, due, one fact line, state bar. States: fertig (who, when) · jetzt · offen · wartet
  auf … · zurückgefallen. Tiles without the viewer's key show their fact but do not open.
- **Motion (full, every visit):** the hub row's track morphs into the wall (`layoutId`), blocks
  switch on left to right, the band's step number flaps up from 1 to the current step, the pill gets
  one red sweep. **Completing a step:** tile fills ink, *Erledigt* stamp, one confetti burst, the
  band hinges over like split-flap to the next step. Last step: gold sweep + confetti rain.

## Besetzung — who is on stage (months ahead)

- **Nummer** kinds: Gruppe · Büttenrede · Gastverein · Redner/Künstler (extern) · Musik · fixed items
  (Einmarsch, Begrüßung, Ordensverleihung, Tombola, Pause, Finale, Ausmarsch).
- *angefragt → zugesagt / abgesagt*. Own groups: the **group admin confirms in the group hub**
  ("Wir sind dabei · 12 Aktive · Musik geliefert"). **Zugesagt writes the group onto the calendar
  entry's participating groups** (abgesagt removes it; groups entered by hand stay) — so group
  hubs, *her dates* and responses know weeks ahead.
- **Aktive** of a group's Nummer = memberships on the date, ± persons ("tanzt diesmal nicht").
- **Gastvereine** — the club's list across seasons; per event *eingeladen → zugesagt/abgesagt*, head
  count, *tritt auf* (→ Nummer) and/or a Bereich in the Tischplan.
- Fields: duration, Umziehzeit, Umbau, stage needs (Bütt, Mikros, Nebel, dunkel), music, costume
  note, wishes (Eröffnung, Finale, vor/nach der Pause, früh/spät, **fertig bis 21:30**).

## Ablauf — the act planner (3 weeks ahead)

- Teil 1 · Pause · Teil 2 (· Teil 3). Times computed: start + durations + Umbau, shown "ca.".
- **Phone:** one line per Nummer — tone edge · Nr. (Anton) · ca. 20:12 · title · 6 Min ·
  "14 Min zum Umziehen" only when tight (gold) or short (red). Main action *Verschieben…*: pick a
  target, each position shows its result ("hier: 24 Min zum Umziehen"); drag is secondary.
- **Desktop:** list + sticky summary (Nummern · Dauer · Ende ca. · kürzeste Umziehzeit · Konflikte)
  + the **evening band**: Nummern as widths over a clock, Pause in ink, a thin energy outline; long
  stretches without a highlight notched gold. Drag in list or band, in sync.
- **Showpiece:** on every change the time column ripples down the rest of the evening in split-flap
  digits.
- **Checks** (pure, in C#, the web reads the result): a person in two Nummern with less Umziehzeit
  than needed (also Elferrat members who perform — Männerballett often is the Elferrat); *fertig
  bis* missed; guest arrives too late; over planned end. Gentle: same kind back to back, two quiet
  ones in a row.
- **Reihenfolge vorschlagen** — deterministic: wishes and fixed items hold, then the largest
  smallest Umziehzeit, spread kinds, keep the arc, **move as few as possible**. Shown as a diff,
  one reason per moved Nummer ("weg von Funkengarde: 6 → 24 Min"); take all, take one, discard. If
  impossible, it names the clash.
- **Person thread:** tap a person → her Nummern light up, gaps in minutes.
- **Ablauf steht** (hold): freezes a version, publishes the order (*Wer auftritt* on the event page
  of the website), group hubs show *Euer Auftritt · Nr. 9 · ca. 20:40 · Stand 14.1.*, each
  performer's Start shows hers. Later edits: "geändert seit Bestätigung" until held again.
- **Print:** Moderationskarten (A6 per Nummer: Ansage by the group admin, who's next, Umbau),
  Laufzettel per multi-Nummer performer, backstage sheet by time.
- Live-Regie later moves a pointer through this list (stable ids, planned offsets, performers, music).

## Saal & Tische — the table planner

- **Saal** (per venue, reusable, 0..n: "Turnhalle ganz / halb"): outline in cm, fixed elements
  (Bühne, Bar, Eingang, Notausgang with keep-clear, Säule, Technik, Garderobe), aisle widths.
- **Tischplan** (per event, a copy of the Saal): **table rows** are the one object (a single table is
  a row of one): position, rotation (15°), count, size (80×80 / 120×80 / rund), chairs per side,
  head chairs. Chairs computed; overrides only (removed chair, wheelchair space). Tables have stable
  ids and running numbers (*Nummern neu vergeben*). **Bereiche**: Elferrat, Presse, Ehrengäste,
  Gruppe (tone + coin, from Besetzung), Rollstuhl, Gesperrt.
- **Desktop draws** — SVG in cm, magnetic guides with distances, row tool (drag a line → "8 Tische ·
  32 Stühle"), block tool (drag a rectangle → parallel rows), duplicate, rotate, nudge, undo,
  autosave with version check. **Phone looks up and assigns** — pinch/pan, tap a table → who sits
  here, search "Müller" pulses table 14.
- **Stühle panel:** the count in flap digits on every change; frei · reserviert (Elferrat 12 ·
  Presse 4 · Gastvereine 48) · Rollstuhl · Kartenanfragen offen · Hinweise.
- **Hinweise**: exit free ≥ 120 cm, aisles, long rows without a cross aisle — hatched on the plan;
  widths per Saal; the print says it certifies nothing.
- **Print:** Saalplan für den Einlass, Tischkarten, Aufbauplan
  ("42 Tische, 336 Stühle").
- *Plan übernehmen von …* — past events at the same Saal.

## Aufgaben and Nachbereitung

- **Checklists per event kind**, kept by the club: "8 Wochen vorher: Sanitätsdienst anfragen" (GEMA,
  Saalmiete, Orden, Gestattung, Presse …), assigned to a **role**, not a person; due items become
  Start to-dos (`ToDoKind` *Aufgabe fällig*).
- **Nachbereitung:** one tap creates the album tied to the event, one tap starts a news post tied to
  event and album; notes for next year.
- **Wie Prunksitzung 2026:** *Neue Veranstaltung* copies kind, venue, Tischplan, Nummern (as
  angefragt), Aufgaben, deadlines — in preparation — and pins last year's notes in the band.

## Data (sketch)

`Event` + `Kind`, `PublishedAt?`, `HasHallPlan`, `CopiedFromEventId?`, `RunningOrderConfirmedAt?` ·
`EventStepDeadline` (overrides) · `EventStepCompletion` (step, by, at) · `EventStepSeen` (account) ·
`Act`, `ActPerformerAdjustment`, `RunningOrderBlock` · `GuestClub`, `EventGuestClub` · `HallLayout`
(venue, geometry JSON) · `EventArrangement` (geometry JSON + version; tables with stable ids) ·
`EventTaskTemplate`,
`EventTask` · `EventReview`. Elferrat = the group of kind Organisation, derived. Computations
(readiness, times, checks, chairs, hints) are pure and tested.

## Order of work — the season decides

| S | Slice | Needed by |
|---|---|---|
| S0 | **Lab prototype** of overview + event page + band + wall (`/lab/event-plan`, seeded) → verdict | now |
| S1 | Backbone: preparation state, `EventReadiness`, steps, deadlines, keys, kind; overview, event page, band, wall; Eckdaten + Karten move in; `KkTrackPanel`, `KkStepBand`, `KkStepWall` | 11.11 |
| S2 | Besetzung: Nummern, Gastvereine, group-hub confirmation, participating groups | 11.11 (booking runs now) |
| S3 | Aufgaben + Nachbereitung + copy from event | 11.11 (Orden, Sanitätsdienst lead times run now) |
| S4 | Saal & Tische: Saal editor, Tischplan, prints — designed next | — |
| S5 | Ablauf: planner, checks, suggestion, publish, website *Wer auftritt*, group hub/Start, prints — designed next | — |

L8 (website launch) and L9 (rollout) stay on the 11.11 path and come before S2/S3 if the days run
short. Each slice lands whole.

## Later ideas (not in v2)

Aufbau-Modus (setup on the phone, rows go green live) · Sicht zur Bühne · durations that learn
(rehearsal stopwatch, live actuals) · plan time-lapse · Ehrengäste and Ordensliste per event.

---

## S1 — build contract (2026-10-17)

Florian 2026-10-17: "Start implementation of the event hub v2 … show no information that is useless
or we don't have currently." So S1 ships **only the steps whose data exists today**; every later
slice adds its step to the same machinery. No placeholder facts, no who/when (not recorded), no
*zurückgefallen* (no completion memory yet), no Auftritte je Gruppe, no Aktive.

### Steps in S1

| key | copy | done when | due | window |
|---|---|---|---|---|
| `details` | Eckdaten | title, date, venue, teaser (required anyway) + **Einlass, Beschreibung, Bild** set **and published** | T−90 | always |
| `tickets` | Karten | price **and** VVK date set, and no open Kartenanfrage waiting > 3 days | T−60 | always |
| `review` | Nachbereitung | an album tied to the event's calendar entry is published | T+14 | opens the day after the event |

- **Due never retroactive:** due = max(T − offset, created day + 14 days); a pre-event step's due
  is capped at the day before the event.
- **State** per step: `done` · `overdue` (today > due, not done) · `open` (window open, not done) ·
  `waiting` (window not open yet). `current` is **one step per event**: the earliest-due overdue
  step, else the open step with the nearest due, else none (all done → *Alles bereit*).
- Cancelled events: no current step; struck through in the list. Over events: details/tickets never
  overdue.
- "Kommt noch" line: Besetzung · Saal & Tische · Ablauf · Aufgaben · Werbung · Live-Regie — a sheet
  with one plain line each, no dates.

### In preparation (ruling 1)

- `Event.PublishedAt` (nullable). Migration: existing events published at their `CreatedAt`.
- `POST events` creates **unpublished**; the hold-to-publish + ceremony moves from creation to
  `PUT events/{id}/published` (409 unless every other `details` criterion holds, not cancelled, not
  over, not already published). No unpublish (no caller).
- Unpublished events are absent from: public events API, website, ticket requests (submission 404/
  409 like a hidden event), the members' calendar, Start, entry sheets, news/album tie candidates
  that are public-facing. They show only in the events workbench.

### Wire additions (`GET events`, `GET events/{id}`)

```
publishedAt: string | null
createdAt: string
priceCents: number | null            (summary gains it)
doorsOpenAt: "HH:mm" | null          (summary gains it)
detailsMissing: ('doorsOpenAt' | 'description' | 'picture' | 'published')[]
ticketRequests: { open: number, cards: number, oldestRequestedAt: string | null }
review: { publishedAlbums: number, publishedNews: number }
steps: [{ step: 'details'|'tickets'|'review', state: 'done'|'overdue'|'open'|'waiting',
          dueOn: 'YYYY-MM-DD', opensOn: 'YYYY-MM-DD' | null }]
currentStep: 'details'|'tickets'|'review' | null
```

### Routes (club app) — the Leitstand (promoted from the lab 2026-10-19)

The hub and event page are the approved Leitstand: every event × step is one **state badge**
(done · current · overdue · open · waiting · off), tapping one opens that step as a **pane** — a
side pane on wide desktop, a bottom drawer elsewhere — with the step's icon tabs on top, the step's
checks/facts in the body and one **sticky primary action** at the foot (plus quiet links).
Steps (panes): `website` · `details` · `tickets` · `requests` · `review`.

- `/events?event=<id>&step=<step>&filter=<filter>` — Veranstaltungen (`events.manage`):
  **health strip** (progress ring "Schritte erledigt" + legend: überfällig · jetzt dran · offen ·
  warten) with **filters** (Alle · Überfällig · Bald fällig · Nicht online · Anfragen · Vergangen);
  the **event × step grid** on desktop (Tag · Abend · next due chip · days-left fuse · one badge per
  step) / **event cards** on phone. `event` + `step` open that pane (reload/back/deep link safe);
  `filter` keeps the chosen filter. Without `events.manage` but with `ticket_requests.handle` the
  screen shows the cross-event Kartenanfragen panel (+ its to-do) instead.
- `/events/$eventId?step=<step>` — event page: record head (cover, eyebrow, title, state pills,
  progress ring), fact strip, step list (+ *Kommt noch* sheet) and the step pane (wide: always
  shown, defaulting to the most pressing step; elsewhere: drawer when `step` is set).
- `/events/$eventId/manage` — *Bild, Absage, Löschen*: picture desk with crop, cancel, delete;
  reached from the Eckdaten pane (quiet link, *Bild setzen* action, picture check fix).
- `/events/$eventId/edit` — unchanged editor; saving lands on `/events/$eventId?step=details`.
- `/events/new` — unchanged.
- Re-pointed: Start to-do *Kartenanfragen offen* → `/events?filter=requests`; entry-sheet
  *Bearbeiten* → `/events/$eventId`. The old `/events/$eventId/details|tickets|review` are gone.

### `@furria/ui` primitives (Leitstand)

`KkStateBadge`, `KkStatePill` (+ `KkStateGlyph`, `KkStateMark`; type `KkStepState`),
`KkProgressRing`, `KkHealthStrip`, `KkStateGrid`, `KkStateCard`, `KkMasterDetail`, `KkStepPane`
(`.Head/.Tabs/.Tab/.Body/.Foot`), `KkBottomDrawer`, `KkRecordHead`, `KkFactStrip`, `KkStepList`,
`KkCheckLine`, `KkDueChip`, `KkCountdownFuse`, `KkCoverThumb`. The S1 track/wall/band primitives
(`KkStepTrack`, `KkStepWall`, `KkStepBand`, `KkTrackRow`, `KkStepMatrix`, `KkDayCount`,
`KkLaterLine`) and the per-device completion memory are deleted.
