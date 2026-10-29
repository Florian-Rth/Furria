# Ablauf & Nummern — build contract (2026-10-22)

Replaces S2 *Besetzung* + S5 *Ablauf* of `event-planner-v2.md`. Design direction: canvas
"Programm & Nummern" (round 2, 4-step flow). Florian 2026-10-22: *"Start implementation … in the
design of our app … just the rough workflow … take it only as a base direction. And don't implement
times for now. We have no way / need of tracking times of an act or the event."* Built the
page-rework way: real backend + three lab variants on real data, Florian picks.

## Promotion (2026-10-23, Florian: "Start real implementation of the feature")

Variant B *Eine Liste* becomes the production planner; the lab route and entry are deleted.

- **Route:** `/events/$eventId/ablauf?mode=pick|order|check` (default `pick`); back lands on
  `/events/$eventId?step=runningOrder`. Gate: `events.running_order` or `events.manage`.
- **Feature folder:** `features/running-order/` (api, ops, review, copy as today + the planner's
  components/hooks/pure modules, `liste-*` renamed to `running-order-*`/plain names). No `lab-` left.
- **Primitives:** the lab prefix `KkMode*` goes; each primitive is named for what it is (one subpath
  export each, no barrels).
- **Leitstand step `runningOrder` (*Ablauf*)** — 4th `EventStep`, computed, never ticked off:
  opens T−28, due T−14 (never retroactive: ≥ created + 14 days, ≤ the day before), `waiting`
  before it opens, never `overdue` once the evening is over (like the other pre-event steps).
  **Done** = an Ablauf exists, every Auftritt is placed, 0 Konflikte and it is confirmed and not
  changed since (*Ablauf steht*). Enters the current-step pick like the others.
- **Pane** `runningOrder` on the event page / events hub: checks *Alle Auftritte eingeplant* ·
  *Keine Konflikte* · *Ablauf steht* (from `GET …/running-order`, 404 = no Ablauf yet → quiet
  "noch kein Ablauf"), facts (Auftritte, Konflikte, Hinweise), sticky primary *Ablauf planen* /
  *Ablauf öffnen* → the route. Events grid gains the step badge column.
- Polish carried in: the phone wishes drawer section head never wraps.

## Round 4 rulings (2026-10-23, override everything below)

Florian: *"The goal should not only be to have min 1 act in between two acts from one person. It
should be: maximize the overall clothing change time."* Agreed shape: graded, saturating, per person.
Plus "why does a Konflikt stay" and a person view. No "same costume" marking (owner: not needed).

- **Copy:** the `noChangeover` finding reads **"Keine Umziehzeit"** (not "kein Auftritt dazwischen" /
  "Direkt hintereinander"). Konflikte are red with an octagon glyph, Hinweise gold with a triangle.
- **Change room (`changeoverRoom`)** — a new cost step, never a finding (nothing shown in lists). Per
  person, per pair of consecutive appearances of that person (cast incl. absences as reviewed: an
  absent person counts nowhere), with g = Auftritte in between: g = 2 → 4, g = 3 → 2, g = 4 → 1,
  g ≥ 5 → 0. (g = 0 and g = 1 stay `noChangeover` 1000 / `tightChangeover` 10.)
- **Priority is lexicographic, not a sum:** the cost of an order is the pair
  (primary = all existing steps, secondary = changeoverRoom). A lower primary always wins; the
  secondary only decides among orders of equal primary. Room never sacrifices a wish, a sameKind
  hint or a tight changeover. Canonical tie-break (smallest act-id sequence) comes after both.
- **Search** stays exact branch and bound, comparing the pair; it needs an admissible lower bound
  for the secondary (per person: r remaining appearances in L remaining slots can't all have g ≥ 5),
  so ties don't explode. Same node budget (< 10 s worst case), `proven` covers both levels.
- **Why a Konflikt stays (`holds`)** — when the cheapest order still has conflicts, the server tries
  single relaxations of the manual decisions and reports each one that lowers the number of
  conflicts of the cheapest order: unpin one pinned line, dissolve one block, treat one Must rule or
  Must act wish as Prefer. Each relaxation is a full (budgeted) re-solve; the total stays under the
  same < 10 s worst case (relaxations share the budget; skipped ones are not reported). If none
  helps → `holdsUnavoidable: true` (the casts alone make it impossible, e.g. one person in too many
  Auftritte). Nothing is applied — the UI offers the relaxation as an action.
- **Person view** (client only): a person's Auftritte in order with the number of Auftritte between
  each pair; 0 = Keine Umziehzeit (Konflikt), 1 = knapp (Hinweis), ≥ 2 fine.

Wire additions to `POST …/suggestion` (everything else unchanged):
```jsonc
steps[].step   += "changeoverRoom"            // before/after = secondary cost
costBefore/costAfter                           // stay primary cost only
roomBefore, roomAfter: int                     // secondary cost before/after
moves[].roomFor: personId[]                    // people whose tightest gap around this line grew (may be [])
holds: [ { kind: "pin"|"block"|"mustRule"|"mustWish",
           lineKey: string|null,               // pin: the pinned line; block: its first line
           blockKey: int|null,
           ruleIndex: int|null,                // mustRule: index in the request body's rules[]
           actWishId: int|null,
           conflictsWithout: int } ]           // conflicts of the cheapest order without it; sorted ascending
holdsUnavoidable: bool                         // conflictsAfter > 0 and no single relaxation helps
```

**Built (2026-10-23, server) — behaviour as implemented, no wire deviation:**
- `changeoverRoom` is the 7th cost step (`steps[]` entry last); `costBefore/After` = primary only,
  `roomBefore/After` = the room step. Room counts only g ≥ 2 pairs, so solving a Konflikt can
  *raise* room (a g = 0 pair costs no room) — compare room only at equal primary.
- Search: the cost is one packed number (primary · 2²⁴ + room), so every comparison (pruning,
  incumbent, pass 2) is lexicographic. Three phases on one node budget: (1) primary-only branch and
  bound (≤ ¾ of the budget) → C*ₚ; (2) lexicographic branch and bound seeded with that order (only
  orders of primary ≤ C*ₚ survive); (3) the canonical walk. `proven` = all three finished.
- Room bound (admissible, valid for every completion whose primary equals the primary bound):
  persons are greedily split into groups that never share a line. Per group, the max of (a) the
  sum of per-person bounds — r remaining Auftritte in L slots leave L − r spare slots to spread over
  the open gaps (the gap to the last placed Auftritt starts at its current length); room is convex
  on g ≥ 2, so spreading evenly is the minimum — and (b) the pooled bound: the group's first and
  last Auftritte sit on distinct lines, so all its gaps together get at most
  k(L−1) − k(k−1)/2 − m(m−1)/2 − R + k spare slots (k persons, m without a placed Auftritt, R
  remaining Auftritte). Gaps the primary bound already pays for (primary bound / 10 tight gaps per
  person resp. per group) are taken out first. Checked against brute force on 650 random evenings.
- Symmetry: interchangeable lines (same present cast and kind, no rule/wish on them, single
  movable units) are placed in act-id order only — exact, since the canonical order has them so.
- `roomFor`: present persons whose smallest gap to their neighbouring Auftritte around the line
  grew; empty for lines that came from the tray.
- `holds`: the relaxed re-solves start from the proposed order (positions = proposal). Order tried:
  pins, blocks, Must rules/wishes; each gets an equal share of the remaining hold budget
  (= ⅙ of the main budget + whatever the main search left), unused nodes carry over, no share →
  skipped. A relaxation is reported when its (possibly unproven) cheapest order has fewer conflicts;
  sorted by `conflictsWithout` (stable within). Must-rule holds carry `ruleIndex` (index in the
  request's `rules[]`; the request has no rule ids — lead decision 2026-10-23), not `ruleId`. `holdsUnavoidable` only when no hold was found
  **and** the main search plus every relaxation were proven — otherwise false (unknown).

## Round 3 rulings (2026-10-22, override everything below)

Florian: *"Don't call it 'Nummer'. In German call it 'Auftritt'."* · *"Remove the break. We don't
have breaks."* · *"The safety limit must be higher. Under 10 seconds runtime would be ok."*

- UI copy says **Auftritt** (plural Auftritte) everywhere the copy said Nummer; position stays
  "Nr. 3". Code names stay `Act`. (Note: *Auftritt* is also the copy of `CalendarEntryKind.Performance`
  in the calendar — owner's call, accepted.)
- Optimiser budget raised so the worst case stays **under 10 s**: 2 400 000 bound evaluations
  (calibrated on this host: 30 lines sorted by group + 8 in tray ≈ 7.7 s; it stays a node count,
  not wall clock).

## Rulings (binding)

- **No EventKind.** Every event *may* have an Ablauf; without one it simply does not exist.
- **No guest clubs, no times.** No start time, durations, Umziehzeit, Umbau, planned end, evening
  band. Distance is counted in **Nummern**, never minutes.
- **Nummer** = the catalogue entry *and* its line in an Ablauf. A Nummer belongs to a group (cast =
  the group's members on the event date ± exceptions) or to no group (an *Ablaufpunkt*: Einmarsch,
  Begrüßung, Ordensverleihung, Tombola, Finale … — cast = its own person list, may be empty).
- **Attendance optional.** Only an `AttendanceResponse` = **No** on the event's calendar entry
  removes a person. Maybe and no answer count as *dabei*. Planning works with zero answers.
- **Fully manual core.** Order, pins and blocks are set by hand; the **Vorschlag** is optional and
  never applied without a tap. Pins and blocks are never broken by the Vorschlag.
- **Backend always re-checks.** Findings are recomputed on every read (cast changes, absences,
  catalogue edits arrive over weeks). Nothing is stored about findings.
- **No Pause / Break.** Every line of an Ablauf is a Nummer; there is no structural line. The
  evening's halves are by index: first half = index < ceil(n/2), second half = the rest.

## Model (server)

| entity | fields |
|---|---|
| `Act` | Id, Name (≤ 80), GroupId?, Kind? (`Dance` `Speech` `Music` `Show` `Point`), ArchivedAt?, CreatedAt, UpdatedAt |
| `ActCastChange` | ActId, PersonId, Change (`Added` / `Removed`) — for a group-less Nummer the `Added` rows *are* the cast |
| `ActWish` | Id, ActId, Kind (act-wish kinds below), Strength (`Must` / `Prefer`) — travels to every Ablauf |
| `RunningOrder` | CalendarEntryId (PK, = event), ConfirmedAt?, CreatedAt, UpdatedAt, concurrency token |
| `RunningOrderLine` | Id, CalendarEntryId, ActId, Position? (null = *noch nicht eingeplant*), IsPinned, BlockKey? (int; same key = one block, must be contiguous), unique (CalendarEntryId, ActId) |
| `RunningOrderRule` | Id, CalendarEntryId, Kind (rule kinds below), Strength, ActId?, OtherActId?, ActKind? |
| `RunningOrderSuspendedWish` | CalendarEntryId, ActWishId — an act wish switched off for this evening |

Picture/icon/tone of a Nummer come from its group (group-less: club icon, neutral tone). Own
picture is a later slice ("kommt noch").

### Wish / rule kinds (no times)

| kind | subject | meaning (positions are indexes of the placed lines, n = placed lines) |
|---|---|---|
| `First` | act | first Nummer of the evening |
| `Last` | act | last Nummer |
| `FirstHalf` / `SecondHalf` | act | index < ceil(n/2) / ≥ ceil(n/2) (odd n: the middle is first half) |
| `Early` / `Late` | act | within the first / last third of placed Nummern (ceil) |
| `Before` / `After` | act + other | anywhere before / after the other |
| `Apart` | act + other | at least one Nummer between them |
| `KindSpread` | actKind | no two Nummern of this kind back to back (evening-wide) |

Act wishes allow `First Last FirstHalf SecondHalf Early Late`.
Pins (`IsPinned`) and blocks (`BlockKey`) are line properties, shown in the UI as wishes
*aus der Reihenfolge*; they are hard by construction and validated on save.

## Checks — `RunningOrderReview` (pure, Core, mirrored in TS for live preview)

Input: placed lines in order, unplaced lines, effective cast per act (persons present / absent),
rules + non-suspended act wishes. Output: findings `{ kind, severity, lineIds[], personIds[],
ruleId?, actWishId? }`, severity `Conflict` (▲ gold-filled) or `Hint` (△ gold-outline).

| kind | severity | when |
|---|---|---|
| `NoChangeover` | Conflict | a present person is in two **adjacent** Nummern — one finding per pair, all persons listed |
| `TightChangeover` | Hint | a present person has exactly **one** Nummer between two of theirs (and is not in it) |
| `MustRuleBroken` | Conflict | a `Must` rule / act wish not met |
| `PreferRuleMissed` | Hint | a `Prefer` rule / act wish not met |
| `SameKindAdjacent` | Hint | two `Speech` Nummern back to back (built in, even without a rule) — suppressed if a `KindSpread` rule for Speech exists (then that rule reports) |
| `NobodyThere` | Conflict | a group Nummer whose whole cast answered No (cast > 0) |
| `Absences` | Hint | a Nummer with ≥ 1 present-cast person missing (answered No) — lists them |
| `Unplaced` | Hint | lines with Position null |

Same input → same findings, same order (by first line position, then kind). Shared test table:
both C# and TS engines get the same named cases.

## Vorschlag — server only

`POST …/running-order/suggestion` with the current *unsaved* state → the cheapest complete order
(one tap plans the whole evening) + per moved line a reason. Nothing is saved.

**Cost pipeline** — ordered steps, each a pure class with a weight and two operations: the cost of a
complete order (counted from the review's findings, so the reviewer stays the single truth) and the
cost added when the next line is appended (a valid lower bound: costs never decrease as the order
grows). Steps: `noChangeover` (1000), `tightChangeover` (10), `mustRules` (MustRuleBroken incl.
Kind-spread, 1000), `preferRules` (PreferRuleMissed, 10), `sameKind` (10),
`unplaced` (10 — every Nummer is planned in, so it only counts in the *before* cost). Nothing
rewards staying close to the manual order (owner ruling 2026-10-22: "just the best one" — fixed
manual decisions are made via pins, blocks and wishes). Absences/NobodyThere are order-independent
and not part of the pipeline. Position-dependent rules are decided as soon as their facts are known
(n is fixed since all Nummern are placed).

**Canonical tie-break** — among the cheapest orders the proposal is the one whose sequence of act
ids is lexicographically smallest. The same lines, pins, blocks, rules, wishes and casts therefore
always yield the same proposal, however the lines had been dragged.

**Search** — exact depth-first branch and bound over units (a block = one unit in its own order; a
single unpinned line; tray Nummern). Pinned runs stay at their index; a unit only goes where it
fits between anchors. The incumbent is seeded with the current order plus each tray Nummer inserted
at its cheapest slot — only a starting bound. Pass 1 (children cheapest-bound first, prune when
partial cost + lower bound ≥ incumbent) proves the cheapest cost C*. Pass 2 walks units in act-id
order, prunes every bound > C* and stops at the first complete order: the canonical cheapest.
Lower bounds: Must/Prefer rules already certain to break, plus the larger of (a) per person the
changeover shortfall — r remaining Nummern in L remaining slots (the last placed line or the one
before it counted as an extra appearance) need 3r−2 slots; each missing slot costs a tight
changeover (10), or two missing slots a conflict (1000) once every gap is tight — and (b) the
path-cover bound over the remaining lines that can follow each other without a shared person:
every line with fewer than two such neighbours leaves open path ends, ⌈ends/2⌉ − 1 conflicts at
least. Plus the secondary `changeoverRoom` bound and the phases described in Round 4 (*Built*).
A deterministic node budget (2 400 000 bound evaluations for the proposal, plus ⅙ of it reserved
for `holds`) stops huge inputs: then the best order found is returned with `proven: false`.
Measured on this host 2026-10-23 (with room + holds, wall clock of the whole call): 12 lines
(8 sorted by group + 4 tray) proven in 6 ms; the messy 12-line evening 2 ms; the realistic
25-line evening proven in ≈ 60 ms; adversarial 25 lines (17 sorted by group + 8 tray) 30 ms,
30 lines (22 + 8) ≈ 0.8 s, 38 lines (30 + 8) ≈ 0.1 s — all proven. Dense random casts (each of 9
people in ~ a third of all Auftritte): 12 lines proven in 60 ms; 16–30 lines run out of budget in
≈ 4 s with the conflicts as low as before; with pins + Must rules ≈ 5.6 s. Evenings that keep
conflicts behind pins/blocks/Must rules (realistic 25 / adversarial 30 with 2 pinned conflicting
lines, a block, 2 Must rules and a Must wish; overloaded 30) are the worst case: 6.8–8.0 s
including the hold re-solves (6–7 holds found). Dev events 16/17 (12 lines): 70 ms / 40 ms, proven.
Reasons are discriminants, never German: `{ lineKey, from|null, to, resolved: [finding kinds +
lineKeys] }`; `from: null` = came from *noch nicht eingeplant*. Moves are every line whose index changes
(a diff for the UI, not a cost); pinned lines never appear. If nothing improves: no moves.
Infeasible Must sets are reported as the remaining Conflicts.

## API (callers: the lab variants, later the production screen)

Permission: new key `events.running_order` (*Ablauf planen*) **or** `events.manage`.

| endpoint | purpose |
|---|---|
| `GET /api/acts` | catalogue: acts (incl. archived flag) with group ref (name, tone, icon, picture), kind, cast persons today (portrait refs) + changes, act wishes |
| `POST /api/acts` · `PUT /api/acts/{id}` | name, groupId?, kind?, addedPersonIds[], removedPersonIds[], wishes[{kind,strength}] |
| `PUT /api/acts/{id}/archived` | archive / restore `{ archived }` |
| `GET /api/events/{id}/running-order` | 404 when none; else lines (act ref + cast on the event date with `absent` flag per person), rules, act wishes (with `suspended`), findings, confirmedAt, changedSinceConfirmed, version |
| `PUT /api/events/{id}/running-order` | create or replace whole state `{ version?, lines[{ actId, position?, pinned, blockKey? }], rules[], suspendedActWishIds[] }` → same body as GET; 409 on stale version; validates contiguity of blocks, unique acts, positions 0..n-1 dense |
| `DELETE /api/events/{id}/running-order` | remove the Ablauf |
| `POST /api/events/{id}/running-order/suggestion` | state as in PUT → cheapest order + `moves[{ lineKey, from\|null, to, resolved[] }]`, cost steps, `proven` (see Wire shapes) |
| `PUT /api/events/{id}/running-order/confirmation` | `{ confirmed }` — allowed with Conflicts (UI warns); any later PUT makes `changedSinceConfirmed` true |
| `GET /api/running-orders` | events that have an Ablauf `{ eventId, title, startsAt, actIds[] }` — "Wie <Veranstaltung>" in step 1 |

## Client

- `features/running-order/`: `schemas.ts`, `requests.ts`, `api.ts` (React Query), pure
  `running-order-review.ts` (TS mirror of the checks), `running-order-ops.ts` (move unit to
  index with pins anchored, pin/unpin, form/dissolve block, place/unplace),
  `running-order-copy.ts` (German copy per finding/rule kind), tests for the pure modules.
- Lab variants: `features/lab-ablauf-<slug>/`, routes `/lab/ablauf-<slug>/$eventId`, listed in the
  lab hub section *Entwürfe*.

## Later slices (not in this build)

Leitstand step *Ablauf* · participating groups write-through · member Start card *Du stehst im
Ablauf* + Dabei/Nicht dabei · group hub *Unsere Nummern* (group admins edit their Nummern) ·
website + print after *Ablauf steht* · own Nummer picture.

## Wire shapes (camelCase JSON, enums as camelCase strings — both sides code against this)

```jsonc
// shared
ActRef      { actId, name, kind: "dance"|"speech"|"music"|"show"|"point"|null,
              group: { groupId, name, tone|null, icon|null, picture: Picture|null } | null }
CastPerson  { personId, firstName, lastName, portrait: Picture|null, absent: bool }   // absent only in running-order
Rule        { ruleId, kind, strength: "must"|"prefer", actId|null, otherActId|null, actKind|null }
ActWish     { actWishId, actId, kind, strength }
Finding     { kind, severity: "conflict"|"hint", lineIds[], personIds[], ruleId|null, actWishId|null }

// GET /api/acts → ActsResponse
{ acts: [ ActRef & { archived, cast: CastPerson[] (absent=false), added: PersonRef[], removed: PersonRef[], wishes: ActWish[] } ] }

// POST /api/acts, PUT /api/acts/{id}  body
{ name, groupId|null, kind|null, addedPersonIds[], removedPersonIds[], wishes: [{ kind, strength }] }
// → { actId }  (POST) / 204 (PUT)

// GET /api/events/{id}/running-order → RunningOrderResponse
{ eventId, version, confirmedAt|null, changedSinceConfirmed,
  lines: [ { lineId, act: ActRef & { cast: CastPerson[] }, position|null, pinned, blockKey|null } ],
  rules: Rule[], actWishes: (ActWish & { suspended })[], findings: Finding[] }

// PUT /api/events/{id}/running-order  body  (no lineId; the server keeps line ids by actId)
{ version|null, lines: [ { actId, position|null, pinned, blockKey|null } ],
  rules: [ { kind, strength, actId|null, otherActId|null, actKind|null } ], suspendedActWishIds[] }
// → RunningOrderResponse

// POST /api/events/{id}/running-order/suggestion  body = PUT body (version ignored)
// lines are identified by lineKey = "act:<actId>"
{ order: lineKey[] /* all Nummern, in proposed order */,
  moves: [ { lineKey, from: int|null /* null = was unplaced */, to, resolved: [ { kind, lineKeys[] } ] } ],
  conflictsBefore, hintsBefore, conflictsAfter, hintsAfter,
  costBefore, costAfter, proven: bool /* false = node budget hit, best found */,
  roomBefore, roomAfter,
  steps: [ { step: "noChangeover"|"tightChangeover"|"mustRules"|"preferRules"|"sameKind"|"unplaced"|"changeoverRoom", before, after } ],
  holds: [ { kind: "pin"|"block"|"mustRule"|"mustWish", lineKey|null, blockKey|null, ruleIndex|null, actWishId|null, conflictsWithout } ],
  holdsUnavoidable: bool }   // moves[] also carry roomFor: personId[] — see Round 4

// PUT …/confirmation { confirmed } → RunningOrderResponse
// GET /api/running-orders → { runningOrders: [ { eventId, title, startsAt, actIds[] } ] }
```
