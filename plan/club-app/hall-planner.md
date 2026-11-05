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

---

## Round 2 — owner findings 2026-11-05 (override everything above where they differ)

Florian tested on the dev server. Findings + his answers:

1. **Bug — stale hall after re-entry.** Edit hall → leave → enter again shows the old hall (only a
   second re-entry is fresh). Same risk for the table plan. Fix: every successful autosave writes
   the saved document + new version into the React Query cache (`setQueryData`) for the detail
   query, and the detail query refetches on mount (`refetchOnMount: 'always'`); the editor still
   seeds once per mount.
2. **Area side lengths.** While drawing and when selected, an area shows the length of every edge
   on the edge (cm < 1 m, else m with two decimals), not only the diagonal/size chip.
3. **Merge areas.** Two or more selected areas that overlap (or touch) → *Zusammenfügen* →
   one area whose outline is their union. Area gains `shape`: `"rect"` (x, y, widthCm,
   heightCm, rotation — as today) or `"polygon"` (`points: Point[]`, 3..200, x/y/width/height/
   rotation null). Kind + label come from the first selected area. Polygon areas: move, rotate,
   vertex drag, delete, duplicate; edge lengths shown. Union via the `polygon-clipping` npm
   package (catalog dependency). Non-overlapping selection → action disabled with reason.
   Server validates both shapes (polygon: ≥3 points, ≤200, coordinate limits).
4. **"Für X Personen".** New planner tool: enter the needed chairs, pick the table type and
   **Reihe** (one row, fewest tables with ≥ X chairs) or **Block** (parallel rows, *Tische pro
   Reihe* adjustable, rows spaced so chair zones keep exactly the Mindestgang; the rows form one
   Tischgruppe). Live preview "4 Tische · 24 Stühle"; tap/click places it (ghost follows the
   pointer on desktop; on touch it appears at the view centre and is draggable). Uses the plan's
   current Bestuhlung.
5. **Clashing chairs are left out automatically** (owner pick). A chair whose cell (spacing ×
   chairDepth, outward) overlaps a table body, another chair cell, a blocker or an exit
   keep-clear zone is *left out*: drawn faded, not counted. Chair vs chair between two rows:
   the chair of the row that comes later in the document is left out (deterministic, the one just
   placed/moved yields). Tapping a faded chair → *Zurückstellen* (override `kept: true`), which
   then shows as a red Überschneidung. Manual removal stays (`removed: true`). Override shape:
   `{ rowId, side, index, number, note, removed, kept }`. The chair zone is drawn as the union of
   the kept chairs' cells (gaps where chairs are left out). The side-removal actions on findings
   go; findings now speak per chair. Engstelle (gold) stays: gap between a kept chair cell and
   anything in `[0, Mindestgang)`.
6. **Grouping = one table block** (owner pick). Rows in a Tischgruppe act as one big table:
   chair slots stay per row side (keys stable: rowId + side + index, slots evenly along the full
   side as before), and **every slot whose cell is covered by another table of the same group (or
   lies within 10 cm of it) is dropped** — inner edges get no chairs, the outer edge keeps them
   (blocks, L, T, U). Grouping no longer requires alignment; the group still moves/rotates as one.
7. **Tables snap together.** Moving/placing a row near another row's table body (≤ 12 screen px
   or ≤ 30 cm) snaps it flush (edge to edge, parallel edges, ends aligned when within threshold)
   and never leaves table bodies overlapping: a drop that would overlap resolves to the nearest
   flush position. Alt bypasses the magnetic snap; overlap resolution always applies.
8. **Counts.** Chair counts now depend on the hall geometry (auto left-out), so the **client sends
   `tables` and `chairs` with every plan save**; the server stores them as facts of the saved
   version (validates `tables` = Σ row counts, `chairs` ≥ 0) and the Leitstand reads them. The C#
   chair maths (`TableChairs`) and the parity file are deleted.
9. **Touch first on tablet and below** — one designed system (owner pick), below.

**R1 note for R2 (agent F → G, 2026-11-05):** areas are now a union on `shape`
(`RectAreaElement` | `PolygonAreaElement`, `hall-plan/schemas.ts`). Code that reads `area.x/y/
widthCm/heightCm/rotation` must narrow on `shape` — or better use `areaOutlineOf(area)` (world
polygon) and `areaLabelPointOf(area)` from `hall-plan/area-shape.ts`. Blockers: `{ kind:
'polygon', points: areaOutlineOf(area) }`. Rendering: `KkFloorPlan.AreaOutline` (`points`,
`labelAt`, `kind`, `label`) draws both shapes. Union lib is `polyclip-ts` (not
`polygon-clipping`: its types don't match its ESM default export). Edge lengths: a rect area shows
its width and depth once (two edges), a merged outline every edge. Merging needs ≥ 2 areas whose
union is one outline (holes are filled); otherwise *Zusammenfügen* stays disabled with a note.
Hall + plan detail queries use `gcTime: 0` + `refetchOnMount: 'always'` and wait for in-flight
saves of the same key before fetching; saves also write the result into the cache.

### Touch control system (tablet and below)

*Touch mode* = `(pointer: coarse)` **or** viewport < 1024 px. Mouse desktops keep today's layout.

- **Layout:** full-bleed canvas. Slim top bar: close, title, undo, redo, live facts (Tische ·
  Stühle / Saalgröße), findings chip. **Bottom dock** (≥ 48 px targets, thumb zone): the tools;
  planner dock = *Auswahl* · **＋ Hinzufügen** (sheet: Tisch · Tischreihe · Für X Personen,
  table-type chips inside) · *Messen* · *Planen/Aufbau*; builder dock = *Auswahl* · ＋ (sheet:
  Wand · Tür · Fläche · Säule · Linie · Text) · *Messen*. The active placing tool shows as a chip
  above the dock with *Fertig*.
- **Gestures:** one finger on empty floor = pan; two fingers = pinch-zoom/pan (never edits);
  **tap** = select (tap empty = deselect); **drag on a selected element** = move it; drag on an
  unselected element = pan (no accidental moves); **long-press** (400 ms, vibrate if available) on
  an element = add/remove it to/from the selection; long-press on empty floor = start a marquee;
  **double-tap** = zoom to the element/fit.
- **Selection action bar:** a floating pill anchored above the selection (below it when near the
  top), never under the finger. Row: − · count · + · ⟲15° · ⟳15° · Duplizieren · Löschen · ⋯.
  Multi: Gruppieren/Lösen (areas: Zusammenfügen) · drehen · Duplizieren · Löschen · ⋯. Chair
  (Aufbau): Nummer · Notiz · Entfernen/Zurückstellen. Builder element: drehen · Duplizieren ·
  Löschen · ⋯. *⋯* opens the inspector as a bottom sheet (side sheet ≥ 900 px wide); opening it
  pans the view so the selection stays visible above the sheet.
- **Rotate:** a 44 px rotate knob below the selection, drag to rotate (15° steps).
- **Placing:** tap places at the tap point, the new thing is selected with its action bar so it
  can be dragged on. *Tischreihe*: drag draws it (as today). Wand/Linie: tap points; live length
  on the running segment; chips *Fertig · Letzten Punkt weg · Abbrechen*.
- **Precision:** vertex/endpoint handles are 44 px targets; while dragging a handle the point is
  drawn **offset 48 px above the finger** with a small loupe ring so the finger never hides it.
- **Hit tolerance:** 22 px in touch mode (Biertische are thin on a phone).
- **Never:** hover-only affordances, keyboard-only actions, page scroll, double-tap zoom of the
  browser (touch-action: none on the canvas).

### Round 2 slices

| S | Slice | Who |
|---|---|---|
| R1 | Bug 1 · area side lengths · area merge (client + server) · counts from client (server) | agent F |
| R2 | Chair model: group = block, auto left-out + Zurückstellen, per-chair findings, flush snapping, *Für X Personen*, counts sent | agent G |
| R3 | Touch control system for both editors | agent H (after R1+R2) |
| R4 | Browser check desktop + tablet 820×1180 + phone 390, light/dark | lead |
