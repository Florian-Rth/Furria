---
status: shaped 2026-09-19 (+ its 2026-09-20 amendment), not yet implemented
phase: CA-P4 — the Verein hub
shaped_with: Florian, grilling session 2026-09-19
binding: docs/adr/0010, docs/adr/0011 (+ its 2026-09-19 amendment), docs/adr/0012,
  CONTEXT.md (Motto, Motto-Bühne, Session-Signet, Ort, Schlüssel, Vorstand,
  Vorstandsfunktion, Vorstandssitz, Porträt, Kalendereintrag, Aushang)
---

# CA-P4 — the Verein hub

The first real hub. CA-P3 shipped the panel kit and the `Session` entity but no endpoint and no
caller; this phase turns `/club` from a list of three links into the club's own place, and adds
the five domains it stands on.

---

## What was ruled on 2026-09-19

The decisions that bind this work. Reasoning lives in `CONTEXT.md`, ADR-0012 and the floor plan.

1. **The Motto-Bühne is code, the Session-Signet is data** — ADR-0012. The opener is a component
   per Session; `Session.ArtworkSvg` is the still mark for every season that is merely named.
2. **The opener's states are date-derived.** Teaser → (Enthüllung) → läuft → Ruhe. In the
   Zwischenzeit it looks **forward** to the coming Session — the one place a surface deliberately
   does not name the Session the date implies.
3. **The Motto is public from the Sommerfest, the art is sealed until 11.11. um 11:11.** The
   Session label may flip at midnight; the Bühne does not.
4. **The stat strip is the Vereinsdaten panel, promoted.** Three stats: Mitglieder, Gruppen, Neue
   diese Session. Ämter, Schlüssel, Jahre-seit-Gründung are all rejected. Jubiläen and Geburtstage
   are out of this phase.
5. **"Läuft gerade" is a state of the Kalender panel, not a component.** The hub never changes
   state; the Notice carries "now", app-wide.
6. **The Notice follows Eigentümer, not Sichtbarkeit.** A club-owned entry lights it for everyone;
   a Gruppe-owned entry only for that Gruppe. Visible ≠ summoned.
7. **A Kalendereintrag carries three independent axes** — Eigentümer, Sichtbarkeit
   (`Gruppe`/`Verein`/`Öffentlich`, default `Verein` for a Gruppe's Training) and **Ort**.
8. **Ort is a club-managed list, and the Schlüssel hang off it.** One concept serves the calendar's
   collision check and the key-holder tiles.
9. **A Schlüssel is a dated holding, not an inventory.** No numbered copies, no counting.
10. **The Vorstand is recorded, and implies Rollen** — ADR-0011's amendment. No auto-assignment.
11. **One Porträt per Person**, rectangular, shown in the round where a list needs an avatar.
    Public display is **her own switch, off by default**; a Vorstandssitz never flips it.
12. **The Aushang is Titel, Text, Autor, Datum, Gültig bis — and nothing else.** No reactions, no
    Kenntnisnahme, no Kategorie, no Anheften, no Anhang.
13. **The hub is one query and identical for every viewer.** Anything per-viewer — the
    `lastSeenAushangAt` the "neu" marker needs — rides on the session/me payload instead.
14. **Member writes ship with their slice; master-data administration waits for
    *Verein verwalten*.** Until then the tables stay empty. **Amended 2026-09-20: nothing is
    seeded from code — no migration `InsertData`, no `HasData`, no seeder class.** A migration
    creates schema and nothing else. Test data comes from the test builders; the dev database is
    filled by hand; the club's own master data waits for its *verwalten* surface. A reference
    table that starts empty is **correct**: the panel that reads it elides, and that elision is
    the shipped empty state, not a gap.
15. **Only English identifiers.** German belongs in UI copy, never in a type, field or symbol.

---

## The hub

| | Block | Content |
|---|---|---|
| — | **Motto-Bühne** | the opener — `KkScreen kind="overview"` header |
| — | **Vereinsdaten** | stat strip: Mitglieder · Gruppen · Neue diese Session |
| 1 | **Aushang** | the newest 2, rendered in full; rest behind *Alle Aushänge* |
| 2 | **Kalender** | the next 3 club-owned entries; a running one sorts first, in its running state |
| 3 | **Wer macht was** | the Vorstand band with Porträts, plus *Alle Rollen* |
| 4 | **Schlüssel** | one tile per Ort, each an avatar stack of its holders |
| — | **Mitglieder · Gruppen** | two rows into the existing list pages |

Panels elide when empty (settled 2026-09-18), so the hub gains a panel per slice and never looks
half-built. The stat strip elides a single stat that would read `0`.

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
| **D1** | The hub, the Motto-Bühne, the stat strip, the bottom rows | server + club-app | — |
| **D2** | Aushang, with posting | server + club-app | D1 |
| **D3** | Ort → Schlüssel | server + club-app | D1 |
| **D4** | Vorstand · Vorstandsfunktion · Vorstandssitz · Porträt | server + club-app | D1 |
| **D5** | Kalendereintrag, the panel, and `/kalender` | server + club-app | D1, D3 |

D2, D3 and D4 are independent of one another. D5 needs D3's `Ort`.

---

### D1 — the hub, the Bühne, the strip

**Goal.** `/club` becomes a hub with an opener that is worth opening.

**Server**
- `FurriaPermissions` — add `ClubRead = "club.read"`. ADR-0011 named it; nothing defines it yet.
- Resolve it from a running Mitgliedschaft (ADR-0011's implied source) — the first implied key in
  the codebase, so this is where that half of the resolver gets built and tested.
- `GET /club/hub` → `ClubHubSummary`, gated on `club.read`. This slice's payload:
  `session { startYear, label, number?, motto?, signetSvg? }` for the **relevant** Session —
  the coming one in the Zwischenzeit, the current one otherwise — plus
  `stats { memberCount, groupCount, joinedThisSessionCount }`.
- The `session` table ships **empty** and the migration writes no row into it. The Session
  records the club knows — `2026/27` with its Motto **"FURRIA — Der Mittelpunkt des Universums"**
  among them — are entered through *Verein verwalten*, and by hand until it exists. With no
  record the opener names the season from the date and says nothing further, which is the
  fresh-install shape and is pinned by a test.

**Club-app**
- `features/club` — the hub screen, replacing `ClubPage`'s title + links.
- `KkMottoStage` in `@furria/ui`: takes a Motto, a Session label and a state, renders the shell of
  the opener (type, seal, countdown, progress) and slots the season's scene. **The scene itself is
  a club-app component** — `features/club/stages/Stage202627.tsx` — registered by start year.
- The four states, from `lib/club.ts` date arithmetic: **Teaser** (seal + Motto as type +
  countdown to 11.11. 11:11), **Läuft** (scene live, progress through the Session), **Ruhe**
  (scene calm, countdown to the next 11.11.), and **no scene registered** → Motto as type alone.
- `prefers-reduced-motion`: the scene renders, the motion does not.
- Stat strip via `KkStatRow`; the two bottom rows via `KkHubRow` (the existing `ClubLinks`, cut to
  Mitglieder and Gruppen).
- The hub skeleton ruled in CA-P3 and deferred: opener instantly, three generic placeholders.

**Done when** both gates are green and `pnpm shot /club` shows the teaser, light and dark.

---

### D2 — Aushang

**Goal.** The club can put something on the board.

**Server**
- `Announcement` — `Title`, `Body`, `AuthorPersonId`, `PublishedAt`, `ValidUntil?`, `ITimestamped`.
- `Account.LastSeenAnnouncementAt` — one nullable column. No join table.
- `FurriaPermissions.AnnouncementsPost = "announcements.post"`.
- `GET /club/hub` gains `announcements` — the newest 2 that have not expired, plus `totalCount`.
- `GET /announcements` (list, `club.read`), `POST` / `PUT` / `DELETE /announcements`
  (`announcements.post`; editing and deleting also allowed to the author).
- The session/me payload gains `lastSeenAnnouncementAt`; a `PUT` marks it.

**Club-app**
- The Aushang panel: newest 2 in full, author with Porträt placeholder and Funktion, *Alle
  Aushänge* into a list page.
- A panel action to post, gated on `announcements.post` — a sheet with Titel, Text, Gültig bis.
- The "neu" marker compares `publishedAt` against the session payload's `lastSeenAnnouncementAt`.

**Done when** both gates are green and `pnpm shot /club` shows two Aushänge.

---

### D3 — Ort, then Schlüssel

**Goal.** "Wen frage ich, um aufzuschließen" — answered in one look.

**Server**
- `Venue` — `Name`, `SortOrder`, `ITimestamped`. The table ships **empty**; Sporthalle,
  Vereinsraum and Lager are entered through *Verein verwalten*, and by hand until it exists.
- `KeyHolding` — `PersonId`, `VenueId`, `DatePeriod`, `ITimestamped`. Several per Person and Venue;
  ended, never deleted. **No copy number, no count.**
- `GET /club/hub` gains `venues[] { id, name, holders[] { personId, displayName, portraitUrl? } }`
  — the *running* holdings only.
- Integration tests per `docs/server/TESTING.md`, including the overlapping-period case.

**Club-app**
- The Schlüssel panel: one tile per Ort with a `KkAvatarStack`. Tapping opens a sheet with the
  holders, *Inhaber seit*, and the route to their Kontaktdaten.

**Done when** both gates are green and `pnpm shot /club` shows three tiles.

---

### D4 — the Vorstand and the Porträt

**Goal.** The band — and the permission derivation behind it.

**Server**
- `BoardOffice` — `Name`, `SortOrder`, `ImpliedRoleId?`, `ITimestamped`. The table ships
  **empty**. The club's offices — Präsident · Vizepräsident · Geschäftsführung · Schriftführung ·
  Finanzen · Kinderpräsident, in that sort order (confirmed 2026-09-20) — are entered through
  *Verein verwalten*, and by hand until it exists; the integration tests arrange them through the
  builder.
- `BoardSeat` — `PersonId`, `BoardOfficeId`, `DatePeriod`, `ITimestamped`.
- The board's own `ImpliedRoleId?` — a single-row club setting, or a nullable column on the one
  place club-wide settings land. **Decide when the file is opened; do not invent a settings table
  for one field.**
- `PermissionAuthorizer` — a fourth source, per ADR-0011's amendment: a running `BoardSeat`
  contributes the board's implied Rolle and its office's implied Rolle. **Nothing is written.**
  Tests: seat opens → keys appear; seat closes → keys vanish; no `RoleHolding` row in either case.
- `Person.PortraitUrl?` and `Person.PortraitIsPublic` (default `false`). **No upload, no media
  store** — the columns exist, nothing fills them yet.
- `GET /club/hub` gains `board[] { personId, displayName, officeName, portraitUrl?, sortOrder }`.

**Club-app**
- The *Wer macht was* panel: the band (rectangular Porträts, `KkPhotoPlaceholder` until the media
  store), then *Alle Rollen* into a sheet listing Rollen with their running Inhaber.

**Done when** both gates are green and the derivation tests pass.

---

### D5 — the Kalendereintrag and the Kalender

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
- `GET /calendar` — filterable by scope and Gruppe, honouring Sichtbarkeit.
- `POST /calendar/{id}/response` — the member write.

**Club-app**
- The Kalender panel: 3 rows, date · Titel · Ort; a running entry first, in its running state.
- `/kalender` — **list view by default**; a month-grid view with a dot per day that filters the
  list beneath it. Never entries inside a phone-width cell.
- `KkFilterChips` for scope; the page defaults to club + the viewer's Gruppen.
- Zu-/Absage inline on an entry that asks for one.

**Done when** both gates are green and `pnpm shot /kalender` shows both views.

---

## Deliberately not in this phase

- **The Enthüllung route.** The full-screen reveal at 11.11. 11:11 is shaped (a `kind: 'fullscreen'`
  route, `localStorage` per device, reduced motion gets the reveal without the particles) and
  **shelved**. The Bühne's four states do not depend on it.
- ***Verein verwalten*** — every master-data write. Session, Ort, Schlüssel, Vorstandsfunktion,
  Vorstandssitz and club-wide Kalendereinträge have **no surface at all** until it exists, and
  none of them is seeded from code (ruling 14, amended 2026-09-20): their tables ship empty, and
  what the club needs before the surface lands is typed into the database by hand. It is a hub of
  its own and wants its own shaping.
- **Creating a Gruppe's Kalendereintrag.** Gruppen-Admin is a scoped right, so it belongs to the
  Gruppe hub, not here.
- **The media store** — upload, GDPR erasure, deployment target. D4 ships the columns and the
  placeholder; the store is its own phase, and its plan starts from those three questions.
- **The collision *warning*.** D5 ships the query and its test; the warning appears where entries
  are created.
- **Jubiläen, Geburtstage**, and anything derived from a Geburtsdatum. Showing every member's
  birthday to every member is a Kontaktdaten-shaped question that deserves its own decision.
- **Pinning and search.** ADR-0010's destination set and the global search are later areas.

---

## Open — needs Florian

- **Is 1971 the founding year?** Carried from CA-P3. Blocks nothing here — the stat strip
  deliberately has no "Jahre" stat because of it.
- **Who holds a child's Account.** The Kindergarde is 6–11. D5 ships Zu-/Absage, which is the
  surface that makes this sharp: if parents hold the login, the responder is not the dancer.
- **Non-member Gruppen people still have no word.** Affects roster copy, not this hub.
