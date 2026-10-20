# Club-app calendar rework

Status: built and promoted to `/calendar` (2026-10-20). Lab variant A picked by Florian, refined
after his review, old month board + list view removed.

## Page system

- `/calendar` — root page (`KkScreen kind="list"`, section calendar, title header "Kalender" +
  lead, handover `AREA_HANDOVERS.calendar`). Search params: `day` (land on a day), `entry`
  (open an entry's detail), `owed` (only entries with a missing answer). `scope`, `view`, `month`
  are gone.
- `/calendar/new?day=` and `/calendar/$calendarEntryId` — the existing editors; saving lands back
  on `/calendar?day=<start day>` and marks the saved entry.
- Inbound: Start entry sheet "Im Kalender" → `/calendar?day=<day>`; club hub "Zum Kalender" → `/calendar`.

## Phone

- One sticky card: head row (month + KW, or "Heute" to jump back) and one tool group — gold
  owed chip (bell + count), days|hours segmented control, prev/next pair, expand. All tools share
  height, radius, icon size and hairline.
- Week strip ↔ month ↔ hours are the same card: the week row is one row of the month grid; expanding
  grows the card and slides the other weeks in with one easing, collapsing folds back into the
  chosen week. Hours mode cross-fades the lanes inside the same card while its height morphs.
- Agenda below: weeks are `KkPanelSection`s ("Diese Woche", "Nächste Woche", "KW n" + date range),
  day sub-heads stick under the card, one line per entry with time column, kind glyph, venue and
  groups; owed entries carry the compact ✓ ? ✕ control on their own row.
- Every entry opens a detail drawer (picture, facts, answer, edit/event links).

## Desktop (≥ lg)

Three columns: mini month (+ owed chip) | hours lanes + agenda | detail pane.

## Rulings

- No scope filter (Alle/Verein/Gruppe) — the agenda shows everything the member may see.
- The owed count is a gold chip that filters to "Zusage fehlt"; readable without colour.
- No "Demnächst" rail.
- Detail for every entry, not just events.
- Primitives: `KkCalendarStrip`, `KkCalendarMonth`, `KkCalendarAgenda`, `KkCalendarHours`,
  `KkCalendarDetail`, `KkCalendarDesk`, `KkEntryKindGlyph` (token groups `calendarStrip`,
  `calendarHours`). `KkMonthBoard` is deleted.
