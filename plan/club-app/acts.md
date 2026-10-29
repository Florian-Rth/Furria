# Auftritte — the catalogue screen (2026-10-23)

Florian: *"Is it also already possible to manage the acts? … For a group / besides groups"* →
*"Be creative. You are responsible for this. Build it. … Visual highlight. Professional UI/UX."*
Lead decisions below are binding for the build. Domain: see `running-order.md` (Model, Act wishes);
UI copy says **Auftritt**, never Nummer; no times; Ablaufpunkt = an Auftritt without a group.

## Who

- **Planners** (`events.running_order` or `events.manage`): every Auftritt, create / edit / archive.
- **Group admins** (active admin of the group): only their group's Auftritte — create (group fixed),
  edit, archive. Never group-less Auftritte, never another group's.
- Everyone else: no access (404/403 as the existing group-admin endpoints do).

## Routes

- `/acts` — *Auftritte* (planners). Reached from: the events hub header (icon action "Auftritte"),
  the planner's Wählen mode (quiet link "Auftritte verwalten" + "Neuer Auftritt"), the More menu.
- `/groups/$groupId/acts` — *Unsere Auftritte* (that group's admins and planners), same screen
  scoped to one group. Reached from the group hub / administration where the group's admin tools live.
- `?act=<id>` opens the editor pane (wide: side pane; phone: bottom drawer), `?act=new` creates;
  `?filter=` keeps the filter. Reload/back/deep link safe.

## Screen (pro hub — work first, dense)

- **Head strip:** counts that are the filters: *Alle · Tänze · Reden · Musik · Shows ·
  Ablaufpunkte · Archiv* (zero counts quiet), search field. Primary action *Neuer Auftritt*.
- **List grouped by group** (group head: group picture/icon + tone + name + count; Ablaufpunkte
  last). One row per Auftritt, one fact line: kind glyph · name · **face stack** of the cast
  (portraits, +n) with "14 dabei" · wish chips (Muss red-outlined / Möglichst gold-dashed as in the
  planner) · **"in 2 Abläufen"** (from `GET /api/running-orders` actIds, upcoming evenings only;
  quiet when none) · overlap badge (see highlight).
- Archived Auftritte only under the *Archiv* filter, with *Wiederherstellen*.

## Visual highlight — *Gemeinsame Leute*

What makes Umziehzeit hard is people standing in several Auftritte. The screen shows it:
- Every row carries a small **overlap gauge**: how many of its people also stand in other
  Auftritte (e.g. ring segment + "5 auch woanders").
- In the editor pane, a section *Gemeinsame Leute*: the other Auftritte sharing people, sorted by
  count, each with the shared faces — tapping a face highlights that person's Auftritte across
  the list (all rows they stand in light up, others dim), so a planner sees at a glance who
  carries the evening. Motion only explains the change (rows light up / dim, faces flip).
- Pure client computation from `GET /api/acts` casts. No invented numbers.

## Editor pane (create / edit)

- Header: group picture/club icon, name (inline editable), kind as icon choice chips.
- *Gruppe*: picker (planners) — none = Ablaufpunkt; fixed for group admins.
- **Besetzung** (the core): for a group Auftritt the group's current members as a portrait grid;
  tap toggles *dabei* ↔ *nicht dabei* (a removed exception — portrait greys + strike, flip
  motion); *+ Gast* adds a person who is not in the group (person search) with a *Gast* badge.
  Live line: "14 dabei · 2 nicht dabei · 1 Gast". For an Ablaufpunkt: just the person list +
  *+ Person* (may be empty).
- **Wünsche**: the act wishes (first/last/firstHalf/secondHalf/early/late × Muss/Möglichst) as
  chips + add, same vocabulary as the planner.
- *Gemeinsame Leute* (above).
- Sticky primary *Speichern* (disabled until valid/dirty); quiet links *Archivieren*.
- Errors: validation inline, 409/403 as the app does elsewhere.

## Backend changes

- Group-admin scope on `GET /api/acts` (group admins get their groups' Auftritte only; planners
  all), `POST /api/acts` (group admin: `groupId` must be a group they administer), `PUT
  /api/acts/{id}` and `PUT /api/acts/{id}/archived` (group admin: only acts of their groups; may
  not move an act to another group or to none). Endpoint tests for each scope rule.
- Whatever the editor needs that doesn't exist yet (group members for the portrait grid, person
  search for guests) — reuse existing endpoints first; add only with a caller.
