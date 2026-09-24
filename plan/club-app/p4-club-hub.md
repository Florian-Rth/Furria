---
status: shaped 2026-09-19 (+ its 2026-09-20 amendment); D1–D5 landed on
  `feat/club-app-verein-hub` (D1 `5206fcb`…`4813168`, de-seeded; D2–D5 in wave 2)
phase: CA-P4 — the club hub
shaped_with: Florian, grilling session 2026-09-19
binding: docs/adr/0010, docs/adr/0011 (+ its 2026-09-19 amendment), docs/adr/0012,
  CONTEXT.md (Motto, Motto stage, session logo, Venue, key holding, Board,
  Board office, Board seat, Portrait, Calendar entry, Announcement)
---

# CA-P4 — the club hub

The first real hub. CA-P3 shipped the panel kit and the `Session` entity but no endpoint and no
caller; this phase turns `/club` from a list of three links into the club's own place, and adds
the five domains it stands on.

---

## What was ruled on 2026-09-19

The decisions that bind this work. Reasoning lives in `CONTEXT.md`, ADR-0012 and the floor plan.

1. **The motto stage is code, the session logo is data** — ADR-0012. The opener is a component
   per Session; `Session.ArtworkSvg` is the still mark for every season that is merely named.
2. **The opener's states are date-derived.** Teaser → (Reveal) → Running → Resting. In the
   interim it looks **forward** to the coming Session — the one place a surface deliberately
   does not name the Session the date implies.
3. **The Motto is public from the summer event, the art is sealed until 11 November at 11:11.**
   The Session label may flip at midnight; the stage does not.
4. **The stat strip is the club data panel, promoted.** Three stats: members, groups, new
   this session. Board offices, key holdings, years-since-founding are all rejected. Anniversaries
   and birthdays are out of this phase.
5. **"Happening now" is a state of the calendar panel, not a component.** The hub never changes
   state; the Notice carries "now", app-wide.
6. **The Notice follows owner, not visibility.** A club-owned entry lights it for everyone;
   a group-owned entry only for that group. Visible ≠ summoned.
7. **A calendar entry carries three independent axes** — owner, visibility
   (`Group`/`Club`/`Public`, default `Club` for a group's training) and **venue**.
8. **Venue is a club-managed list, and key holdings hang off it.** One concept serves the calendar's
   collision check and the key-holder tiles.
9. **A key holding is a dated holding, not an inventory.** No numbered copies, no counting.
10. **The board is recorded, and implies roles** — ADR-0011's amendment. No auto-assignment.
11. **One portrait per person**, rectangular, shown in the round where a list needs an avatar.
    Public display is **her own switch, off by default**; a board seat never flips it.
12. **The announcement is title, body, author, date, valid until — and nothing else.** No reactions,
    no read receipt, no category, no pinning, no attachment.
13. **The hub is one query and identical for every viewer.** Anything per-viewer — the
    `lastSeenAnnouncementAt` the "new" marker needs — rides on the session/me payload instead.
14. **Member writes ship with their slice; master-data administration waits for
    *club management*.** Until then the tables stay empty. **Amended 2026-09-20: nothing is
    seeded from code — no migration `InsertData`, no `HasData`, no seeder class.** A migration
    creates schema and nothing else. Test data comes from the test builders; the dev database is
    filled by hand; the club's own master data waits for its *management* surface. A reference
    table that starts empty is **correct**: the panel that reads it elides, and that elision is
    the shipped empty state, not a gap.
    **The one carve-out, named so the rule can be read literally everywhere else:
    `BootstrapAdminSeeder`.** It is pre-existing recovery *access*, not master data — an
    `IHostedService` that, only when `Auth:BootstrapAdmin` carries an e-mail and a password,
    writes the recovery person, her account and the Admin role, and re-opens a role holding
    when nobody holds that role any more. It writes no club data, it predates this phase, and
    CA-P4 does not touch it. Nothing else in the repo may seed.
15. **Only English identifiers.** German belongs in UI copy, never in a type, field or symbol.

---

## The hub

| | Block | Content |
|---|---|---|
| — | **Motto stage** | the opener — `KkScreen kind="overview"` header |
| — | **Club data** | stat strip: members · groups · new this session |
| 1 | **Announcement** | the newest 2, rendered in full; rest behind *All announcements* |
| 2 | **Calendar** | the next 3 club-owned entries; a running one sorts first, in its running state |
| 3 | **Who does what** | the board band with portraits, plus *All roles* |
| 4 | **Key holdings** | one tile per venue, each an avatar stack of its holders |
| — | **Members · Groups** | two rows into the existing list pages |

Panels elide when empty (settled 2026-09-18), so the hub gains a panel per slice and never looks
half-built. The stat strip elides a single stat that would read `0`.

One named exception, decided while D2 was built: the **announcement panel stands, with its empty
state, for a viewer holding `announcements.post`** — a poster looking at a fresh board needs the
*write announcement* affordance, and there is nowhere else to offer it. For every other viewer it
elides like its siblings.

---

## The slices

Five slices, run **one at a time**, each complete and shippable. **Gates run once, at the end of a
slice** — never between its steps.

```bash
cd web    && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd server && dotnet csharpier format . && dotnet build && dotnet test
```

| # | Slice | Stacks | Depends on |
|---|---|---|---|
| **D1** | The hub, the motto stage, the stat strip, the bottom rows | server + club-app | — |
| **D2** | Announcement, with posting | server + club-app | D1 |
| **D3** | Venue → key holding | server + club-app | D1 |
| **D4** | Board · Board office · Board seat · Portrait | server + club-app | D1 |
| **D5** | Calendar entry, the panel, and `/calendar` | server + club-app | D1, D3 |

D2, D3 and D4 are independent of one another. D5 needs D3's venue.

---

### D1 — the hub, the stage, the strip

**Goal.** `/club` becomes a hub with an opener that is worth opening.

**Server**
- `FurriaPermissions` — add `ClubRead = "club.read"`. ADR-0011 named it; nothing defines it yet.
- Resolve it from a running membership (ADR-0011's implied source) — the first implied key in
  the codebase, so this is where that half of the resolver gets built and tested.
- `GET /club/hub` → `ClubHubSummary`, gated on `club.read`. This slice's payload:
  `session { startYear, label, number?, motto?, signetSvg? }` for the **relevant** Session —
  the coming one in the interim, the current one otherwise — plus
  `stats { memberCount, groupCount, joinedThisSessionCount }`.
- The `session` table ships **empty** and the migration writes no row into it. The Session
  records the club knows — `2026/27` with its Motto **"FURRIA — Der Mittelpunkt des Universums"**
  among them — are entered through *club management*, and by hand until it exists. With no
  record the opener names the season from the date and says nothing further, which is the
  fresh-install shape and is pinned by a test.

**Club-app**
- `features/club` — the hub screen, replacing `ClubPage`'s title + links.
- `KkMottoStage` in `@furria/ui`: takes a Motto, a Session label and a state, renders the shell of
  the opener (type, seal, countdown, progress) and slots the season's scene. **The scene itself is
  a club-app component** — `features/club/stages/Stage202627.tsx` — registered by start year.
- The four states, from `lib/club.ts` date arithmetic: **Teaser** (seal + Motto as type +
  countdown to 11 November, 11:11), **Running** (scene live, progress through the Session), **Resting**
  (scene calm, countdown to the next 11 November), and **no scene registered** → Motto as type alone.
- `prefers-reduced-motion`: the scene renders, the motion does not.
- Stat strip via `KkStatRow`; the two bottom rows via `KkHubRow` (the existing `ClubLinks`, cut to
  members and groups).
- The hub skeleton ruled in CA-P3 and deferred: opener instantly, three generic placeholders.

**Done when** both gates are green and D1's integration tests pass. A fresh database holds no
Session, so the opener resolves to **Resting**, not the teaser, and `pnpm shot /club` proves nothing
until a Session is typed into the dev database by hand — an optional check afterwards, never the
criterion (ruling 14 as amended).

---

### D2 — Announcement

**Goal.** The club can put something on the board.

**Server**
- `Announcement` — `Title`, `Body`, `AuthorPersonId`, `PublishedAt`, `ValidUntil?`, `ITimestamped`.
- `Account.LastSeenAnnouncementAt` — one nullable column. No join table.
- `FurriaPermissions.AnnouncementsPost = "announcements.post"`.
- `GET /club/hub` gains `announcements` — the newest 2 that have not expired, plus `totalCount`.
- `GET /announcements` (list, `club.read`), `POST /announcements`, `PUT /announcements/{id}`,
  `POST /announcements/{id}/withdraw` (`announcements.post`; changing and withdrawing also
  allowed to the author). Withdrawing is a named act, not a bare `DELETE`.
- The session/me payload gains `lastSeenAnnouncementAt`; a `PUT` marks it.

**Club-app**
- The announcement panel: newest 2 in full, author with portrait placeholder and function, *All
  announcements* into a list page.
- A panel action to post, gated on `announcements.post` — a sheet with title, body, valid until.
- The "new" marker compares `publishedAt` against the session payload's `lastSeenAnnouncementAt`.

**Done when** both gates are green and `pnpm shot /club` shows two announcements.

---

### D3 — Venue, then key holding

**Goal.** "Who do I ask to unlock" — answered in one look.

**Server**
- `Venue` — `Name`, `SortOrder`, `ITimestamped`. The table ships **empty**; the sports hall,
  clubroom and storeroom are entered through *club management*, and by hand until it exists.
- `KeyHolding` — `PersonId`, `VenueId`, `DatePeriod`, `ITimestamped`. Several per Person and Venue;
  ended, never deleted. **No copy number, no count.**
- `GET /club/hub` gains `venues[] { id, name, holders[] { personId, displayName, portraitUrl? } }`
  — the *running* holdings only.
- Integration tests per `docs/server/TESTING.md`, including the overlapping-period case.

**Club-app**
- The key holdings panel: one tile per venue with a `KkAvatarStack`. Tapping opens a sheet with the
  holders, *holder since*, and the route to their contact details.

**Done when** both gates are green and D3's integration tests pass. A fresh database holds no
venue, so `venues[]` is empty and the key holdings panel elides; `pnpm shot /club` shows tiles only
after the venues are typed into the dev database by hand — an optional check afterwards, never the
criterion (ruling 14 as amended).

---

### D4 — the board and the portrait

**Goal.** The band — and the permission derivation behind it.

**Server**
- `BoardOffice` — `Name`, `SortOrder`, `ImpliedRoleId?`, `ITimestamped`. The table ships
  **empty**. The club's offices — president · vice president · managing director · secretary ·
  finance · children's president, in that sort order (confirmed 2026-09-20) — are entered through
  *club management*, and by hand until it exists; the integration tests arrange them through the
  builder.
- `BoardSeat` — `PersonId`, `BoardOfficeId`, `DatePeriod`, `ITimestamped`.
- The board's own `ImpliedRoleId?` — a single-row club setting, or a nullable column on the one
  place club-wide settings land. **Decide when the file is opened; do not invent a settings table
  for one field.** *Deferred 2026-09-20:* the file was opened and there is no place for it —
  nothing club-wide and settings-shaped exists to hang it on, and the one field does not justify
  inventing one. **So this implied role is not added.** It waits for *club management*, which
  is the surface that would set it anyway. D4 ships `BoardOffice.ImpliedRoleId?` alone; until the
  *management* surface exists, a function that should carry keys names its role, by hand, like
  everything else in this table.
- `PermissionAuthorizer` — a fourth source, per ADR-0011's amendment: a running `BoardSeat`
  contributes its board office's implied role. **Nothing is written.** What shipped is
  exactly that: `BoardOffice.ImpliedRoleId?` is the resolver's one new source. There is no
  board-wide marker anywhere in the tree, and it stays cut until *club management*.
  Tests: seat opens → keys appear; seat closes → keys vanish; no `RoleHolding` row in either case.
- `Person.PortraitUrl?` and `Person.PortraitIsPublic` (default `false`). **No upload, no media
  store** — the columns exist, nothing fills them yet.
- `GET /club/hub` gains `board[] { personId, displayName, officeName, portraitUrl?, sortOrder }`.

**Club-app**
- The *Who does what* panel: the band (rectangular portraits, `KkPhotoPlaceholder` until the media
  store), then *All roles* into a sheet listing roles with their running holders.

**Done when** both gates are green and the derivation tests pass.

---

### D5 — the calendar entry and the calendar

**Goal.** One calendar, three axes, two views.

**Server**
- `CalendarEntry` — `Title`, `StartsAt`, `EndsAt?`, `Kind`, `VenueId?`, `OwnerGroupId?`
  (`null` = the club owns it), `Visibility` (`Group` / `Club` / `Public`), `AsksForResponse`,
  `Description?`, `ITimestamped`.
- `AttendanceResponse` — `CalendarEntryId`, `PersonId`, `Answer`, `ITimestamped`. Unique per pair.
- The collision query: entries sharing a `VenueId` and an overlapping time window. Built here as a
  query and a test; the *warning* surfaces where entries are created, which is a later phase.
- `GET /club/hub` gains `calendar[]` — the next 3 **club-owned** entries, plus one running entry
  first if there is one.
- `GET /calendar` — filterable by scope and group, honouring visibility.
- `POST /calendar/{id}/response` — the member write.

**Club-app**
- The calendar panel: 3 rows, date · title · venue; a running entry first, in its running state.
- `/calendar` — **list view by default**; a month-grid view with a dot per day that filters the
  list beneath it. Never entries inside a phone-width cell.
- `KkFilterChips` for scope; the page defaults to club + the viewer's groups.
- Attendance response inline on an entry that asks for one.

**Done when** both gates are green and D5's integration tests pass. `calendar_entry` starts
empty, so `pnpm shot /calendar` shows both views only after entries are typed into the dev
database by hand — an optional check afterwards, never the criterion (ruling 14 as amended).

---

## Deliberately not in this phase

- **The reveal route.** The full-screen reveal at 11 November, 11:11 is shaped (a
  `kind: 'fullscreen'` route, `localStorage` per device, reduced motion gets the reveal without the
  particles) and **shelved**. The stage's four states do not depend on it.
- ***Club management*** — every master-data write. Session, venue, key holding, board office,
  board seat and club-wide calendar entries have **no surface at all** until it exists, and
  none of them is seeded from code (ruling 14, amended 2026-09-20): their tables ship empty, and
  what the club needs before the surface lands is typed into the database by hand. It is a hub of
  its own and wants its own shaping.
- **Creating a group's calendar entry.** Group admin is a scoped right, so it belongs to the
  group hub, not here.
- **The media store** — upload, GDPR erasure, deployment target. D4 ships the columns and the
  placeholder; the store is its own phase, and its plan starts from those three questions.
- **The collision *warning*.** D5 ships the query and its test; the warning appears where entries
  are created.
- **Anniversaries, birthdays**, and anything derived from a date of birth. Showing every member's
  birthday to every member is a contact-details-shaped question that deserves its own decision.
- **Pinning and search.** ADR-0010's destination set and the global search are later areas.

---

## Open — needs Florian

- **Is 1971 the founding year?** Carried from CA-P3. Blocks nothing here — the stat strip
  deliberately has no "years" stat because of it.
- **Who holds a child's account.** The children's guard is 6–11. D5 ships attendance response,
  which is the surface that makes this sharp: if parents hold the login, the responder is not the
  dancer.
- **Non-member group people still have no word.** Affects roster copy, not this hub.
