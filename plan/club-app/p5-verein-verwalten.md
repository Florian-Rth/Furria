---
status: implemented 2026-09-20
phase: CA-P5 — Verein verwalten
shaped_with: Florian, grilling session 2026-09-20
binding: docs/adr/0010, docs/adr/0011 (+ its 2026-09-19 amendment), docs/adr/0012,
  docs/adr/0013, CONTEXT.md (Sessionseintrag, Sessionslogo, Ort, Schlüssel, Vorstand,
  Vorstandsfunktion, Vorstandssitz, Kalendereintrag, Rolle, Berechtigung)
supersedes: floor-plan.md's *Verein verwalten* panel list (Einladungen and Session),
  and p4-verein-hub.md's "Creating a Gruppe's Kalendereintrag … belongs to the Gruppe hub"
---

# CA-P5 — Verein verwalten

The club's back office, and the **first admin hub**. CA-P4 shipped a Verein hub that *reads* six
domains and a Kalender that reads a seventh; every one of those tables ships empty by design
(p4 ruling 14, as amended), and no surface in the app can write a single row. Today the club's own
master data gets in by typing SQL. This phase is the surface that ruling deferred to.

It also closes the app's last seam: `manage/persons`, `manage/groups` and `manage/roles` are the
three screens still reached through a flat list in `Mehr`.

---

## What was ruled on 2026-09-20

1. **Read surfaces show what is running; the back office holds the record** —
   [ADR-0013](../../docs/adr/0013-read-surfaces-show-what-is-running-the-back-office-holds-the-record.md).
   The Verein hub is untouched by this phase and gains no pencils; CA-P4 ruling 13 (one query,
   identical for every viewer) is what pays for that.
2. **The Kalender is the one exception** — it is an app, not a read surface, and entries are
   authored there. So there is **no Vereinstermine panel**, and the Gruppe hub gets no create
   button either.
3. **The Eigentümer follows the viewer's capability, not the surface.** One `+`, one form: the
   picker offers *FCC* for `calendar.manage_club` plus every Gruppe she is Gruppen-Admin of; one
   option is filled in without a picker.
4. **Fold the index, not the screens.** `/manage` becomes the hub; `PersonsPage`, `GroupsPage` and
   `RolesPage` keep their routes and their design untouched. `Mehr → Verwaltung` stops listing
   three routes and lists one hub row.
5. **Future admin hubs are not nested under `/manage`.** Finanzen becomes `/finance`,
   Getränkekasse `/drinks`. `/manage` is this hub; the others are domains, not management screens.
6. **The hub payload is typed with nullable panels**, `null` meaning *you may not see this*. This
   bends CA-P4 ruling 8 (viewer-variant → server-shaped list) and keeps its intent: the server
   decides the gate, the client never re-derives it. Start's list shape earns itself because its
   items are unbounded; seven named panels are not.
7. **Admin hubs do not elide empty panels.** On a member hub presence is decided by *scope*, so an
   empty panel means "this doesn't concern you". On an admin hub presence is decided by the
   **Berechtigung**, which already answered that — so emptiness never hides a panel. Amends the
   floor plan's ruling 6. It matters because every table here ships empty: day one is seven empty
   panels, and that is a working state.
8. **No "Zu erledigen" panel yet.** Nothing in these domains generates a task — no approval, no
   queue, no deadline. The *unbesetzt* counts inside the panels are the honest version. It returns
   when something actually waits (Beitrittsanträge, Auslagen).
9. **Setting a Vorstandsfunktion's implied Rolle is `roles.manage`, not `board.manage`.** Without
   this the hub ships a privilege escalation: create a Funktion, point it at **Admin**, open a Sitz
   for yourself, and `GrantedKeysAsync` hands you every key — derived, instant, and invisible in
   `RoleHoldings`. A `roles.manage` holder gains nothing new, because she can already grant herself
   anything through the rights matrix.
10. **A Sessionseintrag may be deleted.** Everything else here is a dated period that is ended and
    never deleted; this deliberately is not that. A Sessionseintrag is *evidence*, and evidence
    entered wrongly is corrected by removal. Nothing hangs off it — deleting one returns that
    season to being named by the date.
11. **An Ort is archived, never deleted**, and it carries its **address** — read later by the
    Veranstaltung and the public website off this one row. The city field is `Stadt`/`City`, never
    *Ort*. No Kapazität (that belongs to the Veranstaltung and waits on `Sitzplatzvergabe`), no
    Koordinaten, no public flag.
12. **Sessionslogo replaces Session-Signet**, and **Sessionseintrag** is the record of one season.
    *Chronik* is reserved for a later, richer page that presents them — the record and its
    presentation never share a surface. `CONTEXT.md` carries both; ADR-0012 keeps its filename and
    gains a terminology note.
13. **The Sessionslogo is an uploaded `.svg`, read client-side into text.** No media store, no
    upload endpoint, no GDPR question — the file is never a file on our side. Cost, accepted: SVG
    only. A photo of an Orden waits for the media-store phase.

---

## The hub

`/manage`, gated on holding **at least one** of its seven keys.

| Panel | Berechtigung | Summary | Way in |
|---|---|---|---|
| Personen & Mitgliedschaften | `persons.manage` | `184 Personen · 132 Mitglieder` | `/manage/persons` |
| Gruppen | `groups.manage` | `9 Gruppen · 1 archiviert` | `/manage/groups` |
| Rollen & Rechte | `roles.manage` | `7 Rollen · 2 unbesetzt` | `/manage/roles` |
| Sessionseinträge | `club.manage` | `Session 2025/26 · 41 Einträge` | `/manage/sessions` |
| Orte | `club.manage` | `3 Orte` | `/manage/venues` |
| Schlüssel | `key_holdings.manage` | `12 Schlüssel bei 8 Personen` | `/manage/keys` |
| Vorstand | `board.manage` | `5 Sitze · 1 Funktion unbesetzt` | `/manage/board` |

The **unbesetzt** counts are the only thing in this data that is quietly wrong — a Rolle nobody
holds, a Funktion with no sitting Person — and they cost nothing to surface.

Copy stays client-side. The server sends ids and numbers, never German (`b6dc06a`).

---

## Berechtigungen

Four new keys, all grantable through the rights matrix, all added to `FurriaPermissions.All`.

| Key | Covers |
|---|---|
| `club.manage` | Sessionseinträge and Orte — the club's own structural facts, rarely edited, same hand |
| `key_holdings.manage` | Schlüssel. Its own key so the caretaker who hands out a Lagerschlüssel cannot rename the Sporthalle |
| `board.manage` | Vorstandsfunktionen and Vorstandssitze — **not** the implied Rolle (ruling 9) |
| `calendar.manage_club` | club-owned Kalendereinträge. Named `_club` so it never reads as "may manage the calendar", which a Gruppen-Admin also does within her scope |

**`CanSearchPersonsAsync` must learn all four.** It answers yes today only for `persons.manage`,
`groups.manage`, `roles.manage` or being a Gruppen-Admin — so a caretaker holding only
`key_holdings.manage` opens the Person picker and gets nothing back. Found while shaping; it is a
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
| **E2** | Sessionseinträge | server + club-app | E1 |
| **E3** | Orte | server + club-app | E1 |
| **E4** | Schlüssel | server + club-app | E3 |
| **E5** | Vorstand | server + club-app | E1 |
| **E6** | The Kalender gets its `+` | server + club-app | E3 |

E2, E3 and E5 are independent of one another and can run in parallel worktrees once E1 lands.
E4 and E6 both need E3's Ort.

---

### E0 — the renames

**Goal.** Spend the rename now, while exactly one surface reads each name.

- `Session.SignetSvg` → `Session.LogoSvg` (migration), and everything that reads it:
  `ClubHubSession`, `ClubSessionDto`, `ClubService`, `SessionExpectations.ToHaveSignet`
  (→ `ToHaveLogo`, which `docs/server/TESTING.md` names and must follow).
- Web: `signetSvg` → `logoSvg` in `features/club/schemas.ts`, `signetSourceOf` → `logoSourceOf`,
  `KkMottoStageSignet` → `KkMottoStageLogo`, and the `KkMottoStage` prop.
- `KeyHandoverDialog` → `PermissionHandoverDialog` in `manage-roles`, with its label constants.
  `CONTEXT.md` forbids Schlüssel and Berechtigung sharing a word; the entity `KeyHolding` is the
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
  `KkPanelSection` + `KkPanel` with `KkHubRow`s, matching the Verein hub's language.
- `MANAGE_SECTIONS` collapses to one `AppSection` pointing at `/manage`, shown when the viewer
  holds any of the seven keys. `toPermittedSections` takes a key **list** per section, or the hub
  row carries its own predicate — the existing single-`permissionKey` shape cannot express "any of".
- `/manage/persons`, `/manage/groups`, `/manage/roles` keep their routes, screens and design.
  Their `KkScreenOrigin` becomes the hub, so back goes to `/manage` rather than `Mehr`.

**Done when** both gates are green and the hub's integration tests pin: each key shows exactly its
panel, no key gives 403, and the counts are right.

---

### E2 — Sessionseinträge

**Goal.** The club writes down what it knows about a season, and the Motto-Bühne gets a Motto.

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
- Create = pick a start year. Future years are allowed and needed — the Motto is proclaimed at the
  Sommerfest, months before the season, and the Bühne's teaser reads it.
- The Logo field takes a dropped `.svg`, reads it client-side into a string, and previews it
  through the very same `logoSourceOf` the Bühne uses.

---

### E3 — Orte

**Goal.** The club's places become a record the Kalender, the Schlüssel and later the public
website all read off one row.

**Server**
- `Venue` gains `Street`, `Zip`, `City`, `Hint` and `ArchivedOn` (migration).
- `GET manage/venues`, `POST`, `PUT`, `ArchiveVenue`, `RestoreVenue` — `club.manage`.
- An archived Ort leaves the Kalender's picker and the Verein hub's tiles, and keeps its history.

**Club-app**
- `/manage/venues` — list plus a form sheet. Archived below, restorable, in the language
  `manage-groups` already uses for archived Gruppen.

---

### E4 — Schlüssel

**Goal.** Answer *wen frage ich zum Aufschließen* and *wem müssen wir einen abnehmen*.

**Server**
- `GET manage/keys` → per Ort, running holders and ended ones. `POST manage/keys` (Person + `SinceOn`),
  `EndKeyHolding` (`UntilOn`) — `key_holdings.manage`.
- A holding for an archived Ort cannot be opened.

**Club-app**
- `/manage/keys` — grouped by Ort, running above ended. Two acts, *ausgeben* and *zurücknehmen*,
  reusing the Gruppe hub's `PersonPicker`.
- Ended holdings stay visible. That is the whole second question, and it is ADR-0013 earning its
  keep: the Verein hub shows who can unlock, this shows who ever could.

---

### E5 — Vorstand

**Goal.** Record an election without granting rights by hand.

**Server**
- `GET manage/board`, `POST`/`PUT`/`ArchiveBoardOffice`, `POST`/`EndBoardSeat` — `board.manage`.
- **`PutBoardOfficeImpliedRole` is gated on `roles.manage`** (ruling 9), and is its own endpoint
  precisely so the gate is impossible to miss.
- Several Sitze may share a Funktion (two Beisitzer, two Vizepräsidenten).
- A Funktion with a running Sitz cannot be archived — end the Sitz first. Archiving it silently
  would revoke implied keys with no trace of why.
- `BoardOffice.SortOrder` already exists and `RunningBoardSeats` already projects it; the band's
  order stays on the Funktion, so it survives every election.

**Club-app**
- `/manage/board` — Funktionen in band order, each with its running and ended Sitze.
- The implied-Rolle field renders **read-only** without `roles.manage`: she sees that Präsident
  implies *Vereinsleitung*, she just cannot change it.

---

### E6 — the Kalender gets its `+`

**Goal.** The Kalender behaves like a calendar app.

**Server**
- `POST`, `PUT`, `DELETE calendar/entries/{id}`. Authorization is per **Eigentümer**:
  `calendar.manage_club` for `OwnerGroupId == null`, `CanAdministerGroupAsync` for a Gruppe's.
- Editing an entry is gated on its *current* Eigentümer; moving an entry between Eigentümer
  requires the right for both.
- The Ort collision check D5 already queries becomes a **warning** in the response, never a
  rejection — two entries at one Ort at one time is a fact the club resolves, not an error.

**Club-app**
- A `+` on `/calendar`, shown when the viewer can own at least one Eigentümer.
- The form: Titel, Beschreibung, Eigentümer, Kind, Ort, Start/Ende, Sichtbarkeit
  (default `Verein` for a Gruppe's Training), Zu-/Absage on or off.
- The Eigentümer picker is built from `GET my-groups` (which already returns `IsAdmin`) plus
  `calendar.manage_club` off the session payload. No new endpoint.
- The collision warning renders inline in the form, naming the entry it clashes with.

---

## Deliberately not in this phase

- **Einladungen.** The floor plan lists it as a panel; nothing exists server-side, and it pulls in
  the open *Gast-Registrierung & Dubletten* question. It belongs to account onboarding's own phase.
- **The media store.** E2 takes an `.svg` as text and nothing else. Porträt uploads stay on D4's
  placeholder until upload, GDPR erasure and hosting are shaped together.
- **The Chronik page.** A later, richer presentation of Sessionseinträge — a season's story, not
  its record.
- **Rebuilding `manage/persons|groups|roles`.** Ruling 4: the index folds, the screens do not.
- **The other four admin hubs.** Finanzen, Getränkekasse, Kleidung and Veranstaltungen each need a
  domain that does not exist yet.
- **Kapazität, Koordinaten, a public flag on an Ort** — ruling 11.
- **Pinning and global search.** Still later areas.

---

## Open — needs Florian

- **Is 1971 the founding year?** Carried from CA-P3 and CA-P4. Blocks nothing here.
- **Who holds a child's Account.** Sharpened again by E6: if parents hold the login, the responder
  to a Zu-/Absage is not the dancer.
- **Non-member Gruppen people still have no word.** Affects roster copy, not this phase.
- **Who may grant `roles.manage`.** Ruled in passing on 2026-09-20 that it sits with the Admin by
  default and the club may later hand it to the Geschäftsführer — a configuration question, not a
  code one, but worth naming before the club composes its first Rollen.

---

## What was built — 2026-09-20

The phase is shipped. `/manage` stands, the four new Berechtigungen are grantable through the
rights matrix, and every table CA-P4 left empty by design can now be written from the app instead
of from psql. What follows is where the build knowingly left the shape above, and why.

**Two waves on one branch, not seven shippable slices.** E0–E6 were never released one at a time.
The platform ships as a whole (CLAUDE.md: build the end state), so nothing was gained by making
each slice independently releasable, and a slice boundary that buys nothing costs a migration.
The renames, the hub and the Ort's address landed together; the four screens and the Kalender's
`+` landed together. The consequence worth writing down: **all of the phase's schema changes sit
in one migration, `VereinVerwalten`** — `session.signet_svg` renamed to `logo_svg`, `venue` gaining
`street`, `zip`, `city`, `hint` and `archived_on`, and `board_office` gaining `archived_on` —
instead of E0 and E3 each adding one. The columns therefore exist a wave before the screens that
write them, which is harmless and was the point.

**The hub shipped with all seven panels at once.** E1 was shaped to carry three panels and let
E2–E5 add the rest. Since every screen lands in the same branch, a response that deliberately
omits four panels would have been a fiction from the day it was written. `ManagementService.HubAsync`
counts all seven from the start.

**The hub is not the flat seven-row table drawn above.** It is three named banks of tiles —
*Wer dazugehört* (Personen & Mitgliedschaften, Gruppen), *Wer darf was* (Rollen & Rechte, Vorstand)
and *Was der Verein führt* (Sessionseinträge, Orte, Schlüssel). **Vorstand moved beside Rollen &
Rechte** because a Vorstandssitz implies a Rolle; filing it under what the club *führt* would have
hidden the one panel that hands out rights. Gold is reserved for **unbesetzt** and appears nowhere
else on the screen, so the eye finds the quietly-wrong thing without reading. An empty panel is
rendered as a dashed reserved silhouette — ruling 7 said emptiness never hides a panel, and this is
what that looks like — and its foot names **what comes next** rather than what is missing:
*Die erste Person*, *Der erste Schlüssel*. Day one reads as a club that has not started yet, not as
a club that is broken.

**Six keys open the hub, not seven.** The table above lists seven panels but only six distinct
Berechtigungen — `club.manage` carries both Sessionseinträge and Orte. `calendar.manage_club` is
the seventh new key and gates nothing on this hub, because the Kalender is not one of its panels
(ruling 2). `RequireAnyPermission` on `GET manage/hub` therefore names six.

**Seating a Person into a Vorstandsfunktion that implies a Rolle demands `roles.manage` as well as
`board.manage`.** Found by the review pass, after the shaping. Ruling 9 closed the escalation at
`PutBoardOfficeImpliedRole` — but `PostBoardSeat` was the same door left open: seating yourself
into an *existing* Funktion that already implies **Admin** grants exactly the keys ruling 9 was
written to protect. `BoardSeatingExtensions.MaySeatIntoOfficeAsync` asks for `roles.manage` only
when the Funktion actually implies a Rolle, so a `board.manage` holder can still record an election
into a Beisitz that implies nothing.

**A Kollisionswarnung is filtered by the reader's Sichtbarkeit.** `FindVenueCollisionsAsync` runs
the same `VisibleTo` predicate the Kalender itself runs, so a warning never names a gruppeninterner
Eintrag the author may not read. The warning is still never a rejection (E6), it is simply quieter
for some authors than for others.

**The Kalender got its own Ort-Auswahl.** E6 first took its Orte from `club/hub`, which is gated
on `club.read` and therefore on a *running Mitgliedschaft* — so a Gruppen-Admin whose only tie is
an open Zugehörigkeit may own a Kalendereintrag and would have opened the picker empty, and every
author paid for a whole Hub-Payload to fill one Select. `GET venues` closes it: affiliation-gated,
laufende Orte only, `venueId` and `name` and nothing else. It is deliberately *not* a second
`manage/venues` — an Anschrift has no business in a picker.

**A Vorstandsfunktion is restorable, like a Gruppe, ein Ort und eine Rolle.** It first shipped
archive-only, which was never decided — it was simply not built — and it made a typo in
*Beisitzer* permanent. `RestoreBoardOffice` closes the asymmetry, and the implied Rolle survives
the round trip, so archiving revokes the derived Berechtigungen and restoring gives them back.
`ArchiveBoardOffice` still refuses while a Sitz is running, as shaped.

**Form-Fehler moved out of `manage-groups`.** Four new form screens landed at once, so
`manage-groups/form-failures.ts` was lifted into `lib/api/api-failures.ts` as `toFormFailures`
rather than copied five times. No behaviour changed.

### What this did to the open questions

- **Who holds a child's Account** — sharpened, as E6 predicted. The Zu-/Absage is now *authored*:
  whoever creates an entry decides whether it asks for one, so the question of who answers it has a
  surface that can ask it wrongly.
- **Who may grant `roles.manage`** — sharpened. It now guards two doors, not one: the rights matrix
  and seating a Person into a Funktion that implies a Rolle. Handing it to the Geschäftsführer is a
  larger decision than it was on the morning of the shaping.
- **The founding year** and **the word for non-member Gruppen people** are untouched by this phase
  and stay open exactly as written.

**The four new Berechtigungen are held by nobody on the day this deploys.** `BootstrapAdminSeeder`
grants `FurriaPermissions.All` only when it *creates* the Admin Rolle; against a database that
already has one it never re-grants a key, which is Decision W and is pinned by
`Should_LeaveTheKeysAlone_When_TheClubRemovedOneFromTheAdminRolle`. That is right — the club owns
its Rollen and the seeder must not silently restore a Berechtigung the club removed on purpose —
but it means the back office ships with four invisible panels until somebody opens
`/manage/roles` and grants `club.manage`, `key_holdings.manage`, `board.manage` and
`calendar.manage_club`. No lockout: the hub opens on any of its six keys, and the Admin already
holds `roles.manage`. Worth saying out loud in the release note, because an operator who does not
know this will read an empty hub as a broken one.

**Three defects only a phone found.** All gates were green and every one of these was invisible to
them: the Vorstand's *Archivieren* and its „Erst den Sitz beenden" ran off the card at 390px; the
Schlüssel-Kopfzeile pushed *Ausgeben* past the right edge for every Ort whose name is longer than
*Lager*, so on a phone no key could be handed out for the Sporthalle or den Vereinsraum; and an Ort
with no Anschrift printed a lone comma — the one thing the Sessionseinträge screen was built to
never do. The first two wrap now, the third says
„Noch ohne Anschrift — trag sie nach, sonst findet niemand hin." `KkPanelHeader` learned to wrap,
which is what carries the Schlüssel fix without a feature reaching into the kit's internals.
The lesson is not about these three: **a screen in this app is not finished when its gates pass,
it is finished when somebody has looked at it at 390px in both Farbschemata.**
