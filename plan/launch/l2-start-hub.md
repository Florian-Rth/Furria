---
status: built 2026-10-02 on worktree/clear-meadow-33ea — waits for Florian's review of the lead rulings below
phase: L2 — CA-P9 Start hub (plan/launch.md)
shaped_with: Florian handed the whole design to the lead on 2026-10-02 ("I leave it totally with you");
  shaped by a specialist pitch → distill → critique run, built in slices
binding: CONTEXT.md (Start, Her occasions, New on her record, Active in the club, To-do, Calendar
  entry, Key holding, Announcement), ADR-0007, ADR-0010, ADR-0016
---

# L2 — Start hub: "Die Anzeigetafel"

Start is the club's departure board, set for one person. A split-flap headline says where her
season stands in her own terms; below it, one column of panels — one per kind — each holding one
fact line per item. Detail goes into sheets. Which panels exist, their order and their caps follow
the viewer and the moment; nothing is ever shown as zero, teased or stubbed.

---

## What Florian asked for, and how it is answered

| His words | Answer |
|---|---|
| "a nice animated greeting at the top" | The **Fallblatt** greeting: an Anton h1 that flips in like a departure board and settles into two lines that carry a fact — „40 Tage bis zu deiner 13. Session, Lena." |
| "only something that is important for him right now" | Every item exists through a relationship or a permission key, and ends by itself. |
| "based on their permissions, roles, groups" | Her dates follow *concerns / runs / expected*; club work follows the exact key; DU follows her own record. |
| "a finance person must not see that someone ordered clothing" | ZU ERLEDIGEN is gated per kind on the server, counts only, never names. |
| "such a breeze … people don't have to look at other hubs" | Dates, owed answers, new Aushänge, her new responsibilities and the club's waiting work on one screen. |
| (earlier today) dense, by kind, never mixed, no air | One panel per kind, 44 px lines on a 56 px spine, no head counts, no hero, no min-heights. |

---

## Lead rulings (Florian to confirm)

1. **Visibility** — a *Group*-visible entry is visible to its participating groups' running
   members and admins too; archived groups confer nothing. Fixes members who were owed a response
   on an entry they got a 404 for.
2. **Answering** — whoever sees an entry on one of her surfaces may answer it (CONTEXT's sentence
   made precise). A group member without club membership can now answer her group's entries.
3. **Pause** — a club-owned entry does not concern a member paused for that session.
4. **Active in the club** — affiliated ∪ group-admin tenure ∪ board seat; decides Start's inactive
   state and keys to take back, never permissions.
5. **Her dates** — concerns ∪ runs (group admin of owner/participating group) ∪ **expected**
   (club-owned entry her member group participates in). Never owed for running or expected.
6. **To-do contract moves from L3 into L2**, with six kinds (CONTEXT "To-do").

---

## What was built

### Greeting (`@furria/ui` `KkGreeting`, `features/start/greeting/*`)
- Act ladder `greetingActAt` (pure): 11.11 countdown from 11:00 (live m:ss) → „Gross - Furria!" at
  11:11:00 with one burst per session → birthday → round join anniversary → Weiberfastnacht,
  Rosenmontag, Fastnachtsdienstag (Kehraus), Aschermittwoch → welcome on the day she redeemed →
  daily season clause (days to 11.11 between sessions, „Tag n deiner o. Session" in session, the
  count to Weiberfastnacht in the last eleven days).
- Play by device memory (`greetingPlayOf`): full board on first open, only changed cells on a new
  day, a nod on a re-open, still under reduced motion. Budget ≤ 1.5 s, ≤ 4 cells turning at once.
- The h1 holds the final text from the first frame, so the confetti handover flies the right
  string; the flight copy is clamped to one line.

### Body (`@furria/ui` `KkDensePanel`, `KkAnswerChoice`; `features/start/components/*`)
- **KALENDER** — her dates: stamp spine (LÄUFT with progress rule, IN h:mm, HEUTE, MORGEN, weekday,
  date), facets (bis …, als Trainerin, mit Gruppe, venue with key icon when she holds one), group
  tick. Owed: a dashed gold ring that unfolds into Zusage · Vielleicht · Absage in place.
- **AUSHÄNGE** — announcements new to her, author face; opening the sheet moves her last-seen mark.
- **DU** — new role, board seat, group-admin tenure, group membership, key; contact change by
  someone else; membership ending or paused; round join anniversary.
- **GRUPPEN** — her groups' jubilees in the session's opening fortnight.
- **ZU ERLEDIGEN** — club material (outlined), count cells landing on the work.
- Sheets via `?sheet=`: entry, calendar, announcements, role/office, panel lines.
- Frozen visit, quiet memory, refetch at `reshapeAt`, minute clock, skeleton after 300 ms.

### Server
- `GET /api/start` (in-handler gate) → `StartService` sources + pure `StartComposer` (bands Live ·
  Today · Soon · Work · New · Later, caps, ShownCount, ReshapeAt). One request, ~15 small queries.
- `CalendarTies` (concerns / runs / expected / sees), unified `VisibleTo`, answer gate on sight.
- `ToDoService.ForAsync(accountId)` — the to-do contract (L3's management panel and L4 plug in).
- `/auth/me`: `appSince`, `membership.relevantSession {startYear, ordinal}`; last-seen PUT takes a
  monotonic, capped `seenUpTo`.
- Landing surfaces: `?access=birth-date-unknown`, `holderIsActiveInClub` on key holdings,
  `/manage?changed=access`.

### Tooling
- `web/tools/screenshot`: `seed-start.ts` (personas Lena, Frank, Sabine, Kevin, Gerd, Jana),
  `--reduced-motion`, `--text-scale`, `--filmstrip`.

---

## Accepted risks

- Backfilled since dates would read as "new" — L9 enters true since dates.
- No changed/cancelled marker on an entry: the calendar hard-deletes and `UpdatedAt` is noisy.
- The running-entry Notice is not built; a running entry is a state of its Start line.

## After launch, as new kinds (no layout change)

KALENDER facets „Ablauf: Punkt 7 von 13", „4 Karten"; DU fee, drinks balance, wardrobe order and
return, expense; ZU ERLEDIGEN `ApplicationWaiting` (L4), expenses, fees, drinks payments, stock,
event facts, presale orders; new panels for polls, photos, presale, pins.
