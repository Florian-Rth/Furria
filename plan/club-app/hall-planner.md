---
status: build contract 2026-11-04 (Florian: "Lets build this tool … Build it.")
scope: Saal & Tische — hall builder (per venue, reusable) + table planner (per event) + seating
  settings (table types, chair spacing, aisle) + Leitstand step `hall`
supersedes: event-planner-v2.md "Saal & Tische" section (direction only); its prints, Bereiche,
  photo tracing, Aufbau-Modus progress and copy wording are NOT in this build
---

# Hall planner — build contract

## Owner requirements (2026-11-04, verbatim intent)

- **Two tools.** A *hall builder* (walls, entrance, bars, texts, plain marker lines …) and a
  *table planner*.
- **Table sizes configurable** somewhere. A table has its fixed size; a **slightly tinted area
  around it is the chair area**. A setting **Bequem / Maximal** decides how many chairs fit on a
  side.
- Plan in **single tables or table rows**. Several tables/rows can be **grouped** and moved as a
  whole. Select a table and **count up** → it becomes a row internally and gets longer.
- **Chair areas that interfere**: the user picks the edge whose chairs go (or both edges when even
  closer).
- **Aisle width** (cm between tables incl. their chairs) is a setting; the planner computes the
  current distances and **paints a warning** where a gap is too small.
- **Ruler tool**: distance between two points.
- **See the chairs** — after placing via the tinted area, a view that draws every chair (the
  setting-up view).
- **Every chair and every table/group gets a number and a note** ("who will sit there" — a hint).

## Words (UI copy, German)

| Concept | UI | Code |
|---|---|---|
| hall (one drawn room of a venue; a venue has 0..n: "Turnhalle ganz / halb") | **Saal** | `Hall` |
| hall builder | **Saal zeichnen** (screen title: the hall's name) | `hall-builder` |
| table plan (one per event, on one hall) | **Tischplan** | `TablePlan` |
| table type (club catalogue) | **Tischart** | `TableType` |
| one table | **Tisch** | — |
| row of n tables of one type (a single table is a row of one) | **Tischreihe** | `TableRow` |
| several rows moved together | **Tischgruppe** | `TableGroup` |
| chair area around a table | **Stuhlbereich** | `chair zone` |
| seating mode | **Bestuhlung: Bequem / Maximal** | `Seating.Comfortable/Maximum` |
| aisle / minimum aisle | **Gang / Mindestgang** | `aisleWidthCm` |
| too-small gap / overlap | **Engstelle** (gold) / **Überschneidung** (red) | `ClearanceFinding` |
| ruler | **Messen** | — |
| planning view / chair view | **Planen** / **Aufbau** | `PlanView` |
| settings | **Tische & Stühle** | `SeatingStandard` |

Always *Stühle*, never *Plätze* (v2 ruling 4). Step copy: **Saal & Tische**.

## Rulings (decided here, senior-dev calls — record changes in this file)

1. **A hall belongs to a venue** and is reused by every event there. A table plan **references**
   the hall (not a copy): improving the drawing improves every plan on it. A hall used by a plan
   cannot be deleted (409).
2. **Geometry in centimetres**, origin top-left, x right, y down, rotation in degrees clockwise.
   Both documents are **jsonb** with an integer `version` for optimistic concurrency (PUT with the
   read version → 409 `versionConflict` on mismatch; the client reloads and tells the user).
   Element ids are client-made strings (`w12`, `r3`; counter, never `crypto.randomUUID`).
3. **Autosave**: every edit is applied locally (undo/redo stack), saved debounced (~800 ms); no
   save button. Unload while dirty flushes.
4. **Rows are the atom.** A row = `count` tables of one type laid end to end along the row's
   length axis. Single table = row with count 1. *Count up/down* edits `count`. A **group** is a
   set of rows sharing `groupId`; clicking a grouped row selects the group, a second click
   (or double click) the row inside. Group moves/rotates/duplicates/deletes as one.
5. **Sides.** A rectangular row has four sides: `front` (local −y), `back` (local +y), `start`
   (local −x end), `end` (local +x end). Each side has a chairs on/off flag. Ends carry chairs only
   if the table type allows (`seatsAtEnds`). Round rows ignore side flags.
6. **Chair math (identical in C# and TS, parity-tested on the same fixtures)**:
   - `spacing` = `comfortableChairSpacingCm` or `maximumChairSpacingCm` by the row's effective
     seating (`row.seating ?? plan.seating`).
   - rect long side length `L = count × type.lengthCm`; chairs per long side `floor(L / spacing)`.
   - rect end length `type.widthCm`; chairs per end `floor(widthCm / spacing)` when enabled and
     `seatsAtEnds`.
   - round table diameter `d = type.lengthCm`; chairs per table `floor(π × (d + chairDepthCm) /
     spacing)`; a round row places tables at pitch `d + 2 × chairDepthCm` (zones touch).
   - chairs sit evenly: side of length `S` with `n` chairs → centres at `(i + 0.5) × S / n`.
   - chair key `{ side, index }` (round: side `around`, index across the whole row,
     table-major). A chair override `removed: true` subtracts it. Overrides whose index no longer
     exists are ignored (kept in the document, dropped on the next renumbering).
7. **Chair zone** = `chairDepthCm` band on each enabled side (round: annulus to `d/2 +
   chairDepthCm`), drawn tinted in *Planen*; individual chairs drawn in *Aufbau*.
8. **Clearance (client only, pure, tested)** — shapes: table bodies, chair zones, hall blockers
   (walls with thickness, areas, pillars, emergency-exit keep-clear zones = door width ×
   `exitClearanceCm` on both sides of the door).
   - **Überschneidung (red)**: chair zone ∩ anything else (other chair zone, other table body,
     blocker); table body ∩ table body / blocker; any footprint ∩ exit keep-clear zone. The
     finding offers the sides involved: *Stühle an dieser Seite entfernen* (one tap per side, or
     both).
   - **Engstelle (gold)**: gap between a chair zone and anything else (incl. walls) in
     `(0, aisleWidthCm)`. Table body ↔ table body gaps never warn (pushing tables together is
     normal); a body touching a wall never warns.
   - Painted on the plan: a measure line between the nearest points with the distance ("85 cm");
     listed in a findings list, tap → pan/zoom there and select.
9. **Ruler**: two taps/clicks (or drag), snaps to element corners/edges/grid; shows `cm` (< 1 m)
   or `m` with two decimals; transient (Esc / tool change clears). Available in both tools.
10. **Snapping**: 10 cm grid; rotation in 15° steps (Shift/Alt = free); magnetic alignment to other
    rows' edges and centres within 8 screen px, shown as guide lines; walls snap to 0/45/90°.
11. **Numbers and notes**: rows, groups and chairs each hold `number` (≤ 8 chars, free text) and
    `note` (≤ 500). *Nummern vergeben* numbers rows 1..n in reading order (top→bottom, left→right
    by centre) and chairs per row clockwise from front-start; it overwrites numbers (undoable).
    A note shows as a small mark on the table/chair; the inspector edits it.
12. **Seating standard** is club-wide (`events.hall`): `comfortableChairSpacingCm` 60,
    `maximumChairSpacingCm` 45, `chairDepthCm` 50, `aisleWidthCm` 120, `exitClearanceCm` 120.
    The plan picks *Bequem/Maximal* (default Bequem); a row may override it.
13. **Table types** (club catalogue, `events.hall`): name, shape `rectangle|round`, `lengthCm`,
    `widthCm` (round: ignored, diameter = length), `seatsAtEnds` (rect only), sort order,
    archived. Seeded in the migration: *Biertisch* 220×50 (no ends), *Tisch* 120×80 (ends),
    *Rund* Ø160. A type used by a plan is archived, never deleted; archived types still resolve.
14. **Permission** `events.hall` (*Saal & Tische*); `events.manage` holds it too. Gates the hall
    builder, the planner, settings and their endpoints.
15. **Leitstand step `hall` (*Saal & Tische*)** — `EventStep.Hall = 5`: always open, due T−21
    (never retroactive: counted from the later of creation and the step's arrival 2026-11-04), done = the event has a table plan with ≥ 1 table. *Kein
    Tischplan nötig* (`Event.WithoutTablePlan`) drops the step from the event's steps (the client
    renders the badge `off`). Remove *Saal & Tische* from *Kommt noch*.
16. **Not in this build** (later, ask first): prints, Bereiche/areas on the plan, photo tracing,
    Aufbau progress ticking, furniture stock, reservations/names on chairs.

## Hall document

```jsonc
HallDocument { elements: HallElement[] }          // ≤ 2000 elements, |coords| ≤ 100000
HallElement =
  | { id, kind: "wall",   points: Point[] (≥2, ≤200), thicknessCm }           // polyline
  | { id, kind: "door",   from: Point, to: Point, door: "entrance"|"emergencyExit"|"door" }
  | { id, kind: "area",   area: "stage"|"bar"|"technics"|"wardrobe"|"toilets"|"kitchen"|"other",
        x, y, widthCm, heightCm, rotation, label: string|null }               // x,y = centre
  | { id, kind: "pillar", x, y, widthCm, heightCm, round: bool }
  | { id, kind: "line",   points: Point[] (≥2), label: string|null }          // marker, dashed, never blocks
  | { id, kind: "text",   x, y, text (1..120), size: "small"|"medium"|"large", rotation }
Point { x, y }
```

Blockers for clearance: wall, area, pillar, emergency-exit keep-clear. Lines/texts/doors other
than exits never block.

### Hall builder tools
*Auswahl* (select, marquee, move, rotate handle, resize handles for area/pillar, vertex drag for
wall/line/door) · *Wand* (click points, double-click/Enter ends, Esc cancels) · *Tür* (drag along a
line; kind in inspector, default *Eingang*) · *Fläche* (drag a rectangle; kind picker) · *Säule*
(click) · *Linie* · *Text* (click → type) · *Messen*. Inspector: kind, label/text, size fields in
cm (editable), thickness, rotation, duplicate, delete. Undo/redo (Ctrl+Z / Ctrl+Shift+Z), Delete,
arrow nudge (1 cm, Shift 10 cm), Esc, Ctrl+D duplicate, space-drag / middle-drag pan, wheel/pinch
zoom, *Einpassen* (fit to content).

## Table plan document

```jsonc
TablePlanDocument {
  seating: "comfortable"|"maximum",
  rows: TableRow[],                               // ≤ 1000
  groups: { id, number: string|null, note: string|null }[]
}
TableRow {
  id, tableTypeId, count (1..50), x, y (centre), rotation (0..359),
  seating: "comfortable"|"maximum"|null, groupId: string|null,
  sides: { front: bool, back: bool, start: bool, end: bool },
  number: string|null, note: string|null,
  chairs: { side: "front"|"back"|"start"|"end"|"around", index, number: string|null,
            note: string|null, removed: bool }[]  // overrides only
}
```

### Table planner tools
*Auswahl* · *Tisch* (pick a type in the palette, click to place one) · *Reihe* (drag a line → live
"8 Tische · 64 Stühle", release places the row) · *Messen*. Inspector (row/group/chair): type,
count stepper (+/−, keys `+`/`-`), seating override, side toggles (four chips around a mini
table), rotate ±15°, number, note, group/ungroup, duplicate, delete. Multi-select (Shift-click,
marquee) → *Gruppieren*. Top strip: **Tische · Stühle** (live, flap digits on change) ·
*Bestuhlung* switch · findings count (*2 Überschneidungen · 3 Engstellen*, opens list) · view
*Planen / Aufbau* · *Nummern vergeben* · *Tische & Stühle* settings sheet. Hall drawn
underneath, locked, muted. Header link *Saal bearbeiten* → builder.

Creating: the planner without a plan shows the start choice — hall picker (halls of the event's
venue first, then all) or *Saal zeichnen* (creates a hall at the event's venue, opens the builder,
returns), and *Übernehmen von …* (past plans; copies hall + document).

## Wire (camelCase JSON, enums as camelCase strings)

| Method · path | Body → Response |
|---|---|
| `GET /api/seating` | → `{ standard: SeatingStandard, tableTypes: TableType[] }` (incl. archived, flagged) |
| `PUT /api/seating/standard` | `SeatingStandard` → 204 |
| `POST /api/seating/table-types` | `{ name, shape, lengthCm, widthCm, seatsAtEnds }` → `{ tableTypeId }` |
| `PUT /api/seating/table-types/{id}` | same body → 204 |
| `DELETE /api/seating/table-types/{id}` | → 204 (archives when used, deletes otherwise) |
| `GET /api/halls` | → `{ halls: [{ hallId, venueId, venueName, name, updatedAt }] }` |
| `POST /api/halls` | `{ venueId, name }` → `{ hallId }` |
| `GET /api/halls/{id}` | → `{ hallId, venueId, venueName, name, document, version }` |
| `PUT /api/halls/{id}` | `{ name, document, version }` → `{ version }` · 409 on stale version |
| `DELETE /api/halls/{id}` | → 204 · 409 when a plan uses it |
| `GET /api/table-plans` | → `{ plans: [{ eventId, title, startsAt, hallId, hallName, tables }] }` (copy source picker) |
| `GET /api/events/{id}/table-plan` | → `{ eventId, hallId, document, version, hall: HallDetails }` · 404 none |
| `POST /api/events/{id}/table-plan` | `{ hallId, copyFromEventId: number|null }` → 201 · 409 exists |
| `PUT /api/events/{id}/table-plan` | `{ hallId, document, version }` → `{ version }` · 409 stale |
| `PUT /api/events/{id}/table-plan-need` | `{ needed: bool }` → 204 |

`SeatingStandard { comfortableChairSpacingCm, maximumChairSpacingCm, chairDepthCm, aisleWidthCm,
exitClearanceCm }` (each 10..500, maximum ≤ comfortable). `TableType { tableTypeId, name, shape,
lengthCm (30..1000), widthCm (30..500), seatsAtEnds, archived }`. Document validation: shape
limits above, unknown `tableTypeId` → 400, string limits (number 8, note 500, label 60, text 120).

Events wire: `steps[].step` gains `"hall"`; `GET events` / `GET events/{id}` gain
`tablePlan: { tables, chairs } | null` and `withoutTablePlan: bool`. Chairs computed in Core
(ruling 6) at read.

## Club app

- `features/hall-plan/` — shared pure modules (+ tests): `plan-geometry.ts` (vectors, oriented
  rects, segment/rect/circle distances and overlaps), `table-layout.ts` (row footprint, chair
  zones, chair positions + keys, counts — ruling 6), `plan-clearance.ts` (ruling 8),
  `plan-snap.ts` (grid, angle, alignment guides), `plan-history.ts` (undo/redo stack),
  `hall-ops.ts`, `table-plan-ops.ts` (add/move/rotate/count/group/ungroup/sides/duplicate/delete/
  numbering), `plan-ids.ts`, `schemas.ts` (Zod for both documents + seating), `requests.ts`,
  `api.ts`.
- `features/hall-builder/` — screen, tools, inspector, hooks. Route `/halls/$hallId`.
- `features/table-planner/` — screen, tools, inspector, start choice, settings sheet. Route
  `/events/$eventId/table-plan`; back → `/events/$eventId?step=hall`.
- Leitstand: step `hall` badge column + pane (checks *Saal gewählt* · *Tische gestellt*; facts
  Tische · Stühle; primary *Tischplan anlegen / öffnen*; quiet link *Kein Tischplan nötig* /
  *Doch einen Tischplan*). Venue detail page: panel *Säle* (list, *Saal zeichnen*) for holders of
  `events.hall`.
- Role editor: label for `events.hall`.
- Desktop: canvas + left tool rail + right inspector. Phone (390 px): full canvas, bottom tool
  bar, inspector in `KkBottomDrawer`; all tools work with touch (pointer events; pinch zoom,
  two-finger pan). Fixed viewport, no page scroll on the editor screens.

## `@furria/ui` — `KkFloorPlan` kit (ADR-0007: all SVG pixels live here)

Presentational, cm in, theme tokens only, light + dark:
`KkFloorPlan` root (SVG viewport: pan/zoom/pinch/wheel, grid that thins with zoom, exposes
pointer events in cm via callback, `fitTo(bounds)`), parts `.Wall`, `.Door` (opening + swing;
exit in signal green? → use theme success token), `.Area` (tinted per kind + label), `.Pillar`,
`.MarkLine` (dashed), `.Label`, `.Table` (rect/round body, number), `.ChairZone` (tinted band),
`.Chair`, `.NoteMark`, `.Finding` (gap/overlap marker + distance chip; red/gold by severity),
`.Measure` (ruler line + chip), `.Selection` (frame + rotate/resize handles), `.Guide`,
`.Marquee`, `.Ghost` (placement preview). Chrome: `KkPlanToolRail` (icon tool buttons,
vertical/horizontal), `KkPlanStatusStrip` (counts + chips), reuse `KkBottomDrawer`, form kit for
the inspector.

## Slices

| S | Slice | Who |
|---|---|---|
| S1 | Backend: entities, migration (+ seed types, permission), Core chair math, endpoints, step `hall`, events wire, tests | agent A |
| S2 | `@furria/ui` `KkFloorPlan` kit + tool rail + status strip | agent B |
| S3 | `features/hall-plan` pure modules + Zod schemas + requests/api, tests | agent C |
| S4 | Hall builder screen + venue *Säle* panel | agent D (after S2+S3) |
| S5 | Table planner + settings sheet + Leitstand step/pane + role label | agent E (after S1–S3) |
| S6 | Browser check desktop + 390 px, light/dark, fixes; docs (CONTEXT.md words) | lead |

## S1 backend — as built (2026-11-04)

- `POST /api/events/{id}/table-plan` answers **201 with an empty body**; the new plan starts at
  `version` 1 (read it with `GET …/table-plan`). `POST /api/halls` and `POST
  /api/seating/table-types` answer 200 with `{ hallId }` / `{ tableTypeId }` (project convention).
- Refusals the service decides (unknown/archived venue, unknown hall, unknown `tableTypeId`, copy
  source without a plan) are **422**; shape errors from validators are **400**. A stale `version`,
  a duplicate hall name at a venue, an existing plan and deleting a used hall are **409** with the
  standard `{ errors: { conflict: [message] } }` body (no separate `versionConflict` code).
- `steps[]` lists `hall` **last** (after `runningOrder`); it is absent when `withoutTablePlan`.
- Hall elements come back with every field present (`null` where the kind has none).
- C# enum for the seating mode is `SeatingMode` (wire unchanged: `comfortable|maximum`).
