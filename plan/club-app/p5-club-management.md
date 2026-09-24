---
status: implemented 2026-09-20
phase: CA-P5 — Club management
shaped_with: Florian, grilling session 2026-09-20
binding: docs/adr/0010, docs/adr/0011 (+ its 2026-09-19 amendment), docs/adr/0012,
  docs/adr/0013, CONTEXT.md (session record, session logo, venue, key holding, board,
  board office, board seat, calendar entry, role, permission)
supersedes: floor-plan.md's *club management* panel list (invitations and session),
  and p4-club-hub.md's "Creating a group's calendar entry … belongs to the group hub"
---

# CA-P5 — Club management

The club's back office, and the **first admin hub**. CA-P4 shipped a club hub that *reads* six
domains and a calendar that reads a seventh; every one of those tables ships empty by design
(p4 ruling 14, as amended), and no surface in the app can write a single row. Today the club's own
master data gets in by typing SQL. This phase is the surface that ruling deferred to.

It also closes the app's last seam: `manage/persons`, `manage/groups` and `manage/roles` are the
three screens still reached through a flat list in `Mehr`.

---

## What was ruled on 2026-09-20

1. **Read surfaces show what is running; the back office holds the record** —
   [ADR-0013](../../docs/adr/0013-read-surfaces-show-what-is-running-the-back-office-holds-the-record.md).
   The club hub is untouched by this phase and gains no pencils; CA-P4 ruling 13 (one query,
   identical for every viewer) is what pays for that.
2. **The calendar is the one exception** — it is an app, not a read surface, and entries are
   authored there. So there is **no club-appointments panel**, and the group hub gets no create
   button either.
3. **The owner follows the viewer's capability, not the surface.** One `+`, one form: the
   picker offers *FCC* for `calendar.manage_club` plus every group she is group admin of; one
   option is filled in without a picker.
4. **Fold the index, not the screens.** `/manage` becomes the hub; `PersonsPage`, `GroupsPage` and
   `RolesPage` keep their routes and their design untouched. `Mehr → Management` stops listing
   three routes and lists one hub row.
5. **Future admin hubs are not nested under `/manage`.** Finance becomes `/finance`, the drinks
   till `/drinks`. `/manage` is this hub; the others are domains, not management screens.
6. **The hub payload is typed with nullable panels**, `null` meaning *you may not see this*. This
   bends CA-P4 ruling 8 (viewer-variant → server-shaped list) and keeps its intent: the server
   decides the gate, the client never re-derives it. Start's list shape earns itself because its
   items are unbounded; seven named panels are not.
7. **Admin hubs do not elide empty panels.** On a member hub presence is decided by *scope*, so an
   empty panel means "this doesn't concern you". On an admin hub presence is decided by the
   **permission**, which already answered that — so emptiness never hides a panel. Amends the
   floor plan's ruling 6. It matters because every table here ships empty: day one is seven empty
   panels, and that is a working state.
8. **No "Zu erledigen" panel yet.** Nothing in these domains generates a task — no approval, no
   queue, no deadline. The *unbesetzt* counts inside the panels are the honest version. It returns
   when something actually waits (membership applications, expenses).
9. **Setting a board office's implied role is `roles.manage`, not `board.manage`.** Without
   this the hub ships a privilege escalation: create an office, point it at **Admin**, open a seat
   for yourself, and `GrantedKeysAsync` hands you every key — derived, instant, and invisible in
   `RoleHoldings`. A `roles.manage` holder gains nothing new, because she can already grant herself
   anything through the rights matrix.
10. **A session record may be deleted.** Everything else here is a dated period that is ended and
    never deleted; this deliberately is not that. A session record is *evidence*, and evidence
    entered wrongly is corrected by removal. Nothing hangs off it — deleting one returns that
    season to being named by the date.
11. **A venue is archived, never deleted**, and it carries its **address** — read later by the
    event and the public website off this one row. The city field is `Stadt`/`City`, never
    *Ort*. No capacity (that belongs to the event and waits on seat allocation), no
    coordinates, no public flag.
12. **Session logo replaces session signet**, and **session record** is the record of one season.
    *Chronicle* is reserved for a later, richer page that presents them — the record and its
    presentation never share a surface. `CONTEXT.md` carries both; ADR-0012 keeps its filename and
    gains a terminology note.
13. **The session logo is an uploaded `.svg`, read client-side into text.** No media store, no
    upload endpoint, no GDPR question — the file is never a file on our side. Cost, accepted: SVG
    only. A photo of a session medal waits for the media-store phase.

---

## The hub

`/manage`, gated on holding **at least one** of its seven keys.

| Panel | Permission | Summary | Way in |
|---|---|---|---|
| Persons & Memberships | `persons.manage` | `184 Personen · 132 Mitglieder` | `/manage/persons` |
| Groups | `groups.manage` | `9 Gruppen · 1 archiviert` | `/manage/groups` |
| Roles & Permissions | `roles.manage` | `7 Rollen · 2 unbesetzt` | `/manage/roles` |
| Session records | `club.manage` | `Session 2025/26 · 41 Einträge` | `/manage/sessions` |
| Venues | `club.manage` | `3 Orte` | `/manage/venues` |
| Key holdings | `key_holdings.manage` | `12 Schlüssel bei 8 Personen` | `/manage/keys` |
| Board | `board.manage` | `5 Sitze · 1 Funktion unbesetzt` | `/manage/board` |

The **unbesetzt** counts are the only thing in this data that is quietly wrong — a role nobody
holds, an office with no sitting person — and they cost nothing to surface.

Copy stays client-side. The server sends ids and numbers, never German (`b6dc06a`).

---

## Permissions

Four new keys, all grantable through the rights matrix, all added to `FurriaPermissions.All`.

| Key | Covers |
|---|---|
| `club.manage` | Session records and venues — the club's own structural facts, rarely edited, same hand |
| `key_holdings.manage` | Key holdings. Its own key so the caretaker who hands out a storeroom key cannot rename the sports hall |
| `board.manage` | Board offices and board seats — **not** the implied role (ruling 9) |
| `calendar.manage_club` | club-owned calendar entries. Named `_club` so it never reads as "may manage the calendar", which a group admin also does within her scope |

**`CanSearchPersonsAsync` must learn all four.** It answers yes today only for `persons.manage`,
`groups.manage`, `roles.manage` or being a group admin — so a caretaker holding only
`key_holdings.manage` opens the person picker and gets nothing back. Found while shaping; it is a
lockout, not a nicety.

---

## The slices

Seven slices, each complete and shippable, each shipping a panel **with** its screen so no dead
route ever exists. **Gates run once, at the end of a slice** — never between its steps.

```bash
cd web    && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd server && dotnet csharpier format . && dotnet build && dotnet test
```

| # | Slice | Stacks | Depends on |
|---|---|---|---|
| **E0** | Renames only — no behaviour | server + web | — |
| **E1** | The hub, and the three panels that move in | server + club-app | E0 |
| **E2** | Session records | server + club-app | E1 |
| **E3** | Venues | server + club-app | E1 |
| **E4** | Key holdings | server + club-app | E3 |
| **E5** | Board | server + club-app | E1 |
| **E6** | The calendar gets its `+` | server + club-app | E3 |

E2, E3 and E5 are independent of one another and can run in parallel worktrees once E1 lands.
E4 and E6 both need E3's venue.

---

### E0 — the renames

**Goal.** Spend the rename now, while exactly one surface reads each name.

- `Session.SignetSvg` → `Session.LogoSvg` (migration), and everything that reads it:
  `ClubHubSession`, `ClubSessionDto`, `ClubService`, `SessionExpectations.ToHaveSignet`
  (→ `ToHaveLogo`, which `docs/server/TESTING.md` names and must follow).
- Web: `signetSvg` → `logoSvg` in `features/club/schemas.ts`, `signetSourceOf` → `logoSourceOf`,
  `KkMottoStageSignet` → `KkMottoStageLogo`, and the `KkMottoStage` prop.
- `KeyHandoverDialog` → `PermissionHandoverDialog` in `manage-roles`, with its label constants.
  `CONTEXT.md` forbids key and permission sharing a word; the entity `KeyHolding` is the
  correct one, this dialog is the violator, and renaming it frees `key_holdings.manage` and
  `/manage/keys` to mean metal.
- ADR-0012 gains a dated terminology note; its filename and decision text stay.

**Done when** both gates are green under the existing tests. No test is added — nothing changes
behaviour.

---

### E1 — the hub, and the three panels that move in

**Goal.** `/manage` exists and `Mehr` names it once.

**Server**
- `FurriaPermissions` — add `ClubManage`, `KeyHoldingsManage`, `BoardManage`, `CalendarManageClub`,
  all four into `All`.
- `CanSearchPersonsAsync` — add the four.
- `GET manage/hub` → `GetManageHubResponse` with seven nullable panel DTOs. Authorized on
  *any* of the seven keys, not one — a new requirement shape alongside `RequirePermission`.
- `ManagementService.HubAsync` counts only the panels the viewer may see. Panels whose screens do
  not exist yet (E2–E5) are simply absent from this slice's response.

**Club-app**
- `features/manage-hub` — the hub screen, `KkScreen kind="overview"`, `KkPanelStack` of
  `KkPanelSection` + `KkPanel` with `KkHubRow`s, matching the club hub's language.
- `MANAGE_SECTIONS` collapses to one `AppSection` pointing at `/manage`, shown when the viewer
  holds any of the seven keys. `toPermittedSections` takes a key **list** per section, or the hub
  row carries its own predicate — the existing single-`permissionKey` shape cannot express "any of".
- `/manage/persons`, `/manage/groups`, `/manage/roles` keep their routes, screens and design.
  Their `KkScreenOrigin` becomes the hub, so back goes to `/manage` rather than `Mehr`.

**Done when** both gates are green and the hub's integration tests pin: each key shows exactly its
panel, no key gives 403, and the counts are right.

---

### E2 — Session records

**Goal.** The club writes down what it knows about a season, and the motto stage gets a motto.

**Server**
- `GET manage/sessions` → all entries, newest first. `POST`, `PUT`, `DELETE manage/sessions/{id}`.
  All gated on `club.manage`.
- `StartYear` is unique — a second entry for one season is a `Conflict()`.
- `LogoSvg` goes through the waiting `SvgSanitizer.TrySanitize`; a parse failure is
  `Validation()`. It is already fully tested and unused.
- Nothing is inferred from a neighbouring entry, and no endpoint computes a Nº.

**Club-app**
- `/manage/sessions` — a list, newest first, each row `2025/26 · Nº 53 · „…"`, with the season
  today falls into marked. Missing parts read as missing, never guessed: the chronicle is
  permanently incomplete and the screen must make that look normal.
- Create = pick a start year. Future years are allowed and needed — the motto is proclaimed at the
  summer event, months before the season, and the stage's teaser reads it.
- The Logo field takes a dropped `.svg`, reads it client-side into a string, and previews it
  through the very same `logoSourceOf` the motto stage uses.

---

### E3 — Venues

**Goal.** The club's places become a record the calendar, the key holdings and later the public
website all read off one row.

**Server**
- `Venue` gains `Street`, `Zip`, `City`, `Hint` and `ArchivedOn` (migration).
- `GET manage/venues`, `POST`, `PUT`, `ArchiveVenue`, `RestoreVenue` — `club.manage`.
- An archived venue leaves the calendar's picker and the club hub's tiles, and keeps its history.

**Club-app**
- `/manage/venues` — list plus a form sheet. Archived below, restorable, in the language
  `manage-groups` already uses for archived groups.

---

### E4 — Key holdings

**Goal.** Answer *whom do I ask to unlock* and *whom do we need to take one back from*.

**Server**
- `GET manage/keys` → per venue, running holders and ended ones. `POST manage/keys` (person + `SinceOn`),
  `EndKeyHolding` (`UntilOn`) — `key_holdings.manage`.
- A holding for an archived venue cannot be opened.

**Club-app**
- `/manage/keys` — grouped by venue, running above ended. Two acts, *ausgeben* and *zurücknehmen*,
  reusing the group hub's `PersonPicker`.
- Ended holdings stay visible. That is the whole second question, and it is ADR-0013 earning its
  keep: the club hub shows who can unlock, this shows who ever could.

---

### E5 — Board

**Goal.** Record an election without granting rights by hand.

**Server**
- `GET manage/board`, `POST`/`PUT`/`ArchiveBoardOffice`, `POST`/`EndBoardSeat` — `board.manage`.
- **`PutBoardOfficeImpliedRole` is gated on `roles.manage`** (ruling 9), and is its own endpoint
  precisely so the gate is impossible to miss.
- Several seats may share an office (two assessors, two vice presidents).
- An office with a running seat cannot be archived — end the seat first. Archiving it silently
  would revoke implied keys with no trace of why.
- `BoardOffice.SortOrder` already exists and `RunningBoardSeats` already projects it; the band's
  order stays on the office, so it survives every election.

**Club-app**
- `/manage/board` — offices in band order, each with its running and ended seats.
- The implied-role field renders **read-only** without `roles.manage`: she sees that president
  implies *Vereinsleitung*, she just cannot change it.

---

### E6 — the calendar gets its `+`

**Goal.** The calendar behaves like a calendar app.

**Server**
- `POST`, `PUT`, `DELETE calendar/entries/{id}`. Authorization is per **owner**:
  `calendar.manage_club` for `OwnerGroupId == null`, `CanAdministerGroupAsync` for a group's.
- Editing an entry is gated on its *current* owner; moving an entry between owners requires the
  right for both.
- The venue collision check D5 already queries becomes a **warning** in the response, never a
  rejection — two entries at one venue at one time is a fact the club resolves, not an error.

**Club-app**
- A `+` on `/calendar`, shown when the viewer can act as at least one owner.
- The form: title, description, owner, kind, venue, start/end, visibility
  (default `Club` for a group's training), attendance response on or off.
- The owner picker is built from `GET my-groups` (which already returns `IsAdmin`) plus
  `calendar.manage_club` off the session payload. No new endpoint.
- The collision warning renders inline in the form, naming the entry it clashes with.

---

## Deliberately not in this phase

- **Invitations.** The floor plan lists it as a panel; nothing exists server-side, and it pulls in
  the open *guest registration & duplicates* question. It belongs to account onboarding's own phase.
- **The media store.** E2 takes an `.svg` as text and nothing else. Portrait uploads stay on D4's
  placeholder until upload, GDPR erasure and hosting are shaped together.
- **The chronicle page.** A later, richer presentation of session records — a season's story, not
  its record.
- **Rebuilding `manage/persons|groups|roles`.** Ruling 4: the index folds, the screens do not.
- **The other four admin hubs.** Finance, the drinks till, wardrobe and events each need a
  domain that does not exist yet.
- **Capacity, coordinates, a public flag on a venue** — ruling 11.
- **Pinning and global search.** Still later areas.

---

## Open — needs Florian

- **Is 1971 the founding year?** Carried from CA-P3 and CA-P4. Blocks nothing here.
- **Who holds a child's account.** Sharpened again by E6: if parents hold the login, the responder
  to an attendance response is not the dancer.
- **Non-member group people still have no word.** Affects roster copy, not this phase.
- **Who may grant `roles.manage`.** Ruled in passing on 2026-09-20 that it sits with the Admin by
  default and the club may later hand it to the managing director — a configuration question, not
  a code one, but worth naming before the club composes its first roles.

---

## What was built — 2026-09-20

The phase is shipped. `/manage` stands, the four new permissions are grantable through the
rights matrix, and every table CA-P4 left empty by design can now be written from the app instead
of from psql. What follows is where the build knowingly left the shape above, and why.

**Two waves on one branch, not seven shippable slices.** E0–E6 were never released one at a time.
The platform ships as a whole (CLAUDE.md: build the end state), so nothing was gained by making
each slice independently releasable, and a slice boundary that buys nothing costs a migration.
The renames, the hub and the venue's address landed together; the four screens and the calendar's
`+` landed together. The consequence worth writing down: **all of the phase's schema changes sit
in one migration, `ClubManagement`** — `session.signet_svg` renamed to `logo_svg`, `venue` gaining
`street`, `zip`, `city`, `hint` and `archived_on`, and `board_office` gaining `archived_on` —
instead of E0 and E3 each adding one. The columns therefore exist a wave before the screens that
write them, which is harmless and was the point.

**The hub shipped with all seven panels at once.** E1 was shaped to carry three panels and let
E2–E5 add the rest. Since every screen lands in the same branch, a response that deliberately
omits four panels would have been a fiction from the day it was written. `ManagementService.HubAsync`
counts all seven from the start.

**The hub is not the flat seven-row table drawn above.** It is three named banks of tiles —
*Wer dazugehört* (Persons & Memberships, Groups), *Wer darf was* (Roles & Permissions, Board)
and *Was der Verein führt* (Session records, Venues, Key holdings). **Board moved beside Roles &
Permissions** because a board seat implies a role; filing it under what the club *führt* would have
hidden the one panel that hands out rights. Gold is reserved for **unbesetzt** and appears nowhere
else on the screen, so the eye finds the quietly-wrong thing without reading. An empty panel is
rendered as a dashed reserved silhouette — ruling 7 said emptiness never hides a panel, and this is
what that looks like — and its foot names **what comes next** rather than what is missing:
*Die erste Person*, *Der erste Schlüssel*. Day one reads as a club that has not started yet, not as
a club that is broken.

**Six keys open the hub, not seven.** The table above lists seven panels but only six distinct
permissions — `club.manage` carries both session records and venues. `calendar.manage_club` is
the seventh new key and gates nothing on this hub, because the calendar is not one of its panels
(ruling 2). `RequireAnyPermission` on `GET manage/hub` therefore names six.

**Seating a person into a board office that implies a role demands `roles.manage` as well as
`board.manage`.** Found by the review pass, after the shaping. Ruling 9 closed the escalation at
`PutBoardOfficeImpliedRole` — but `PostBoardSeat` was the same door left open: seating yourself
into an *existing* office that already implies **Admin** grants exactly the keys ruling 9 was
written to protect. `BoardSeatingExtensions.MaySeatIntoOfficeAsync` asks for `roles.manage` only
when the office actually implies a role, so a `board.manage` holder can still record an election
into an assessor's seat that implies nothing.

**A collision warning is filtered by the reader's visibility.** `FindVenueCollisionsAsync` runs
the same `VisibleTo` predicate the calendar itself runs, so a warning never names an entry
internal to a group the author may not read. The warning is still never a rejection (E6), it is
simply quieter for some authors than for others.

**The calendar got its own venue selection.** E6 first took its venues from `club/hub`, which is
gated on `club.read` and therefore on a *running membership* — so a group admin whose only tie is
an open group membership may own a calendar entry and would have opened the picker empty, and
every author paid for a whole hub payload to fill one select. `GET venues` closes it:
affiliation-gated, current venues only, `venueId` and `name` and nothing else. It is deliberately
*not* a second `manage/venues` — an address has no business in a picker.

**A board office is restorable, like a group, a venue and a role.** It first shipped
archive-only, which was never decided — it was simply not built — and it made a typo in
*Beisitzer* permanent. `RestoreBoardOffice` closes the asymmetry, and the implied role survives
the round trip, so archiving revokes the derived permissions and restoring gives them back.
`ArchiveBoardOffice` still refuses while a seat is running, as shaped.

**Form failures moved out of `manage-groups`.** Four new form screens landed at once, so
`manage-groups/form-failures.ts` was lifted into `lib/api/api-failures.ts` as `toFormFailures`
rather than copied five times. No behaviour changed.

### What this did to the open questions

- **Who holds a child's account** — sharpened, as E6 predicted. The attendance response is now
  *authored*: whoever creates an entry decides whether it asks for one, so the question of who
  answers it has a surface that can ask it wrongly.
- **Who may grant `roles.manage`** — sharpened. It now guards two doors, not one: the rights matrix
  and seating a person into an office that implies a role. Handing it to the managing director is a
  larger decision than it was on the morning of the shaping.
- **The founding year** and **the word for non-member group people** are untouched by this phase
  and stay open exactly as written.

~~**The four new permissions are held by nobody on the day this deploys.**~~ — **resolved
2026-09-23 by the revision of Decision W.** `BootstrapAdminSeeder` now reconciles the Admin role
on every start: `club.manage`, `key_holdings.manage`, `board.manage` and `calendar.manage_club`
land on it at the first restart after deployment, pinned by
`Should_GrantTheMissingPermission_When_TheAdminRoleLacksOne`. Nobody has to open
`/manage/roles` first.

**Three defects only a phone found.** All gates were green and every one of these was invisible to
them: the board's *Archivieren* and its „Erst den Sitz beenden" ran off the card at 390px; the
key-holdings header pushed *Ausgeben* past the right edge for every venue whose name is longer than
*Lager*, so on a phone no key could be handed out for the sports hall or the clubroom; and a venue
with no address printed a lone comma — the one thing the session-records screen was built to
never do. The first two wrap now, the third says
„Noch ohne Anschrift — trag sie nach, sonst findet niemand hin." `KkPanelHeader` learned to wrap,
which is what carries the key-holdings fix without a feature reaching into the kit's internals.
The lesson is not about these three: **a screen in this app is not finished when its gates pass,
it is finished when somebody has looked at it at 390px in both light and dark colour schemes.**
