---
status: implemented 2026-09-21
phase: CA-P6 — Gruppen
shaped_with: Florian, grilling session 2026-09-21
binding: docs/adr/0010, docs/adr/0013 (+ ADR-0014's exception), docs/adr/0014, docs/adr/0015,
  CONTEXT.md (Gruppe, Gruppenart, Zugehörigkeit, Gruppen-Admin, Kalendereintrag, Account)
supersedes: floor-plan.md's "Gruppen — the list page reworked, the Gruppe hub taking its dates
  from the calendar", which assumed the existing Group model
---

# CA-P6 — Gruppen

The last **member** hub before Start, and the app's last open seam. One concept has three
surfaces today — `/groups` (read-only list and detail), `/my-groups/$groupId` (the same layout
plus write dialogs, reachable from no navigation at all) and `/manage/groups` — and the split
between the first two is purely about who is allowed in.

Underneath them sits a `Group` of three fields: `Name`, `Description`, `IsRecruiting`. That is an
address-book entry, not a Gruppe. This phase rebuilds the model first and the surfaces on top of
it.

---

## What was ruled on 2026-09-21

1. **The Gruppe hub writes its own record** —
   [ADR-0014](../../docs/adr/0014-the-gruppe-hub-writes-its-own-record.md). The dividing line is
   **scope, not surface**: the Gruppe's own record lives in its hub including the ended half, and
   `/manage/groups` owns *which Gruppen exist*. ADR-0013 gets a second, narrower exception, bought
   by the fact that the Gruppe hub was never the one-query, identical-for-everyone surface the rule
   was written to protect.
2. **The Gruppenbild is deferred to a media phase**, and so is the per-Gruppe file drive that would
   have carried a Gruppe's music files. CA-P6 designs the picture's place and renders a colour
   field there; it **adds no column** for it. A nullable reference to a store that does not exist
   gets the wrong shape early, and the media phase introduces the asset and the reference together.
3. **Gruppenart is club-composed data**, one per Gruppe, the same shape as Vorstandsfunktion —
   named, archivable, restorable, archive refused while in use. `CONTEXT.md` carries the term.
4. **No Altersgruppe.** Its only real job was the scheduling constraint that CA-P6 cut with the
   Auftrittsprofil; the Gruppe's name and Beschreibung already say it, and the field would lie
   about a 43-year-old Trainerin of the Kindergarde.
5. **The MVP has no child Accounts.** Nobody under the club's age of consent gets a login and no
   Account is held on another Person's behalf. This resolves the floor plan's open question 1.
   The consequence to carry: a Gruppe whose dancers cannot log in is reached through its
   Gruppen-Admin, so no surface may assume the dancer is the one reading it.
6. **One Gruppe hub, and nothing is denied.** `/groups/$groupId` is the only detail route;
   `HubDenied` goes. What varies is the **panel set**, by relationship, not the door. A carnival
   club is not secretive about who dances in the Garde — it is printed in the programme — and
   `IsRecruiting` is pointless if only the people already inside can look.
7. **The Trainingsrhythmus is a generator, not a recurrence rule.** A club training skips
   Christmas, skips a let hall and moves the week before a Sitzung: the exceptions are the normal
   case, and a rule with fifteen exception records is a worse artifact than twenty rows. Every
   `CalendarEntry` the generator makes is an ordinary one, with nothing that knows it was born in a
   batch.
8. **The Gruppenfarbe comes from its own non-semantic palette.** `KkTone`'s six values all carry
   meaning — green = ok/paid, gold = warning, red = danger/action, blue = info — so a calendar
   tinted from them says "paid" on every Perlen row. `groupTone` sits beside it and never mixes.
9. **No Gruppe-Aushänge.** `CONTEXT.md`'s line that an announcement for one Gruppe belongs in that
   Gruppe's hub stays a promissory note, and is marked as deferred rather than left reading as
   built.
10. **Mitwirkende Gruppen is a second axis on the Kalendereintrag** —
    [ADR-0015](../../docs/adr/0015-a-kalendereintrag-carries-mitwirkende-gruppen.md). Without it the
    Prunksitzung — club-owned, danced by the Garde — is missing from the Garde's own hub.
11. **The Gründungsjahr is a year, not a date**, and the app derives the **Jubiläum** from it at
    every fifth year. Nobody remembers the day the Biergarde formed, and a club that celebrates a
    13th anniversary celebrates nothing.
12. **No new bottom-navigation destination.** Ruled by Florian: the destination set is personal
    configuration, and **the common case is a member in exactly one Gruppe**, who will pin *that
    Gruppe* rather than a list of all of them. `/groups` stays reachable from the Verein hub as it
    is today; the hub needs a stable identity so pinning can reach it later.
13. **Gruppenarten live inside `/manage/groups`**, as `/manage/board` holds Vorstandsfunktionen
    above Vorstandssitze — one key, one route, two related records. An eighth manage-hub panel
    would be the first to share a Berechtigung with another and would blur CA-P5 ruling 7.
14. **The Gruppenart is nullable.** Every existing Gruppe has none the day this deploys, and the
    club fills its own master data; a migration that invents a value for eight Gruppen is exactly
    the seeding the project forbids.
15. **The people panel labels nobody.** Whether someone pays club dues is a fact about the Person,
    not about the Gruppe. Tapping a row opens the existing peek sheet, which already states the
    Mitgliedschaft — `MEMBERSHIP_STATE_LABELS.none` is already the copy **`kein Mitglied`**. So the
    phase is not blocked on the club's open question about what to *call* such a person, and no
    term is invented.
16. **`IsRecruiting` is the Gruppen-Admin's switch**, on the hub — it follows ruling 1.

---

## The Gruppe

| | |
|---|---|
| **Name**, **Beschreibung** | unchanged |
| **Gruppenart** | nullable reference to club-composed data |
| **Gründungsjahr** | nullable `int`; the Jubiläum is derived, never stored |
| **Gruppenfarbe** | one `groupTone` value; duplicates allowed, warned about in the picker |
| **Sucht Mitglieder** | unchanged `IsRecruiting`, now edited on the hub |
| **Trainingsrhythmus** | a *list* of slots — a Garde trains twice a week |
| *Gruppenbild* | **not a column in this phase** — the layout reserves its place, the media phase adds the reference |

A **Trainingsrhythmus-Slot** is `(Wochentag, Uhrzeit, Dauer, Ort)`. It is a **stated habit, not a
live rule**: changing it does nothing to entries already generated. The hub and the website's
recruiting answer read it ("Wir trainieren dienstags 19:30 in der Sporthalle"); the Termine panel
reads reality. The two are allowed to disagree, and neither is derived from the other.

---

## The hub

`/groups/$groupId`, open to any affiliated viewer. `/my-groups/*` and today's `GroupPage` both fold
into it.

| | any affiliated viewer | in the Gruppe | Gruppen-Admin |
|---|---|---|---|
| Identity — Name, Beschreibung, Gruppenart, Gründungsjahr, Gruppenfarbe, Jubiläum, sucht Mitglieder | ✓ | ✓ | ✓ |
| Wer macht was — Gruppen-Admins and their Funktion | ✓ | ✓ | ✓ |
| Wer dabei ist — names and portraits | ✓ | ✓ | ✓ |
| Termine, with Zu-/Absage | — | ✓ | ✓ |
| The ended half — past Zugehörigkeiten, past Gruppen-Admins | — | — | ✓ |
| Writes — identity, Zugehörigkeiten, Gruppen-Admins, Trainingsrhythmus | — | — | ✓ |

**The opener** carries the Gruppe's colour as a field where the Gruppenbild will go, the Name over
it in Anton, and **one per-viewer line**: „Du tanzt hier seit 2019" / „Du leitest diese Gruppe" /
„Du bist nicht dabei". That line is the only thing on the hub that varies for a reason other than
permission, and it belongs at the top.

**Wer dabei ist** shows everyone inline as a portrait grid, four across on a phone — a Gruppe is
eight to fifteen people and hiding them behind a tap would be worse. A row opens `MemberPeekSheet`,
reused unchanged.

**Contact details stay off the hub.** Name and portrait only; anything reachable stays on the
Person surface behind the rule that surface already applies.

---

## The list

`/groups`, unchanged route, rebuilt.

- **The card's face is the Gruppenfarbe**, with the Name set over it. It reads as deliberate rather
  than as a missing image, and when the media phase lands the photo drops into exactly that region
  without moving the layout. Under it: Gruppenart, who runs it, an avatar stack, and the recruiting
  chip when the Gruppe is open.
- **Meine Gruppen first, then the rest, flat.** One list, one section break — which is what retires
  `/my-groups`: the distinction that justifies a whole route today becomes an ordering decision. A
  member in no Gruppe sees one plain list and no empty heading.
- **No Gruppenart grouping.** With eight Gruppen it is more structure than content; grouping by
  Art is the public website's job, where there is no "mine" to sort by.
- **Archived Gruppen do not appear.** They are a record, and `/manage/groups` already lists and
  restores them. Accepted cost: a member who danced in Die Wirbelwinde until 2018 cannot browse to
  it from here. Her own Zugehörigkeit still shows on her Person page.

---

## Berechtigungen

**No new keys.** `FurriaPermissions` stays at ten.

- Gruppenart is `groups.manage`, like everything else on `/manage/groups`.
- Every Gruppe-scoped write goes through `PermissionAuthorizer.CanAdministerGroupAsync`, which
  already exists and already backs `PostGroupAdmin`. Gruppen-Admin stays what `CONTEXT.md` says it
  is: not a Rolle, not a key, a Gruppe-scoped resource.
- Generating Trainings is **strictly the Gruppe's own act**. `calendar.manage_club` does not reach
  it — the club does not schedule the Garde's training.

---

## The slices

**G0 — `groupTone` in `@furria/ui`.** The palette: eight to ten hues, a light and a dark value
each, named so nothing can pass a status tone where an identity tone belongs. Contrast-checked
against `bg` and `panel` in both schemes. Pure, and it unblocks G4, G5 and G7.

**G1 — Gruppenart.** Entity, endpoints, archive refused while a Gruppe uses it, restore. The
section in `/manage/groups`, mirroring `BoardOfficeSection`.

**G2 — the Gruppe grows up.** `FoundedYear`, the `groupTone` value, the Trainingsrhythmus slots.
The Jubiläum derivation as a pure function with its own test.

**G3 — one Gruppe hub.** `/groups/$groupId` replaces `GroupPage` and `HubPage`; `GetGroupById` and
`GetMyGroupById` become one endpoint whose payload varies by relationship. The opener, the panels,
the identity writes, and the Zugehörigkeit and Gruppen-Admin writes the hub already had. `/my-groups/*`
and `HubDenied` go.

**G4 — the Gruppen list.** Colour-field cards, Meine Gruppen first, archived excluded.

**G5 — Mitwirkende Gruppen.** The join table, the multi-select on the Kalendereintrag form, and
the dates panel filtering on `Eigentümer OR mitwirkend`.

**G6 — the Trainingsrhythmus and its generator.** A sheet opened from the Termine panel: pick an
end date, then a preview listing every date it would create —

- `✓` will be created
- `⚠` the Ort is already taken that evening (CA-P4's collision check, reused)
- `–` a Training for this Gruppe already exists then, so re-running is safe

— every row untickable. That preview is the feature: it is where Christmas and the school holidays
get handled without modelling a holiday calendar, and it is what makes a bulk write trustworthy.
The default end date is `ClubSession.ClosingOf(RelevantYearOf(today))`, which already does the
right thing in July: it generates into the **coming** Session, not the one that just ended.
Editable, because a Gruppe that trains through the summer exists.

**G7 — the Kalender takes the Gruppenfarbe.** An edge, not a fill; never the only carrier of
meaning.

---

## Deliberately not in this phase

- **The media store**, the Gruppenbild's bytes, and the per-Gruppe file drive. Their own phase,
  with structure and permissions shaped properly — including whether an off-the-shelf system
  carries it. That phase also unblocks the Porträts the Verein hub's Vorstand band already wants.
- **Gruppe-Aushänge** (ruling 9).
- **The Auftrittsprofil** — Dauer, Bühnenbedarf, Umbauzeit, Technik — and the **Repertoire**. Cut
  by Florian; both may return with Veranstaltungen, and ADR-0015 is the hook they will need.
- **Altersgruppe** (ruling 4).
- **A bottom-navigation destination** (ruling 12).
- **Child Accounts** (ruling 5).

---

## Open

- **The word for a Person in a Gruppe without Mitgliedschaft** stays open, and ruling 15 means
  nothing in this phase waits on it. The club-side insurance question `CONTEXT.md` carries with it
  is untouched.
- **Photo consent** travels with the media phase, not this one.
- **The club's own Gründungsjahr** — 1971, per the handoff — still has no home in the model.
  `Session` carries Motto, Nummer und Logo; nothing carries the Verein. Out of scope here, and it
  wants a small slice of its own before the website reads it from data rather than a constant.

---

## What was built — 2026-09-21

The phase is shipped, in six commits on `feat/club-app-p6-gruppen`. **Every slice G0–G7 landed**:
the `groupTone` palette in `@furria/ui`, the Gruppenart, the Gruppe's Steckbrief, the merged hub,
the rebuilt Gruppen list, Mitwirkende Gruppen, the Trainingsrhythmus with its generator, and the
Gruppenfarbe on the Kalender. What follows is where the build had to rule on something this file
left open, and where it knowingly left the shape above.

### Cut back — 2026-09-22

The Gruppenverwaltung shipped with an expanding override panel per Gruppe. It was deleted: it
duplicated the Gruppe hub, which a `groups.manage` holder already administers in full. See the
amendment to [ADR-0014](../../docs/adr/0014-the-gruppe-hub-writes-its-own-record.md). With it went
`GET manage/groups/{id}`, the Beschreibung and *sucht Verstärkung* fields on the club's own write
(ruling 16 put both on the hub), the permanent footnote, and the „Alles gepflegt." all-clear that
was computed from two checks. The register gained an *„ohne Personen"* facet — a Gruppe nobody is
in is the archive candidate the page never named.

### Four rulings the plan did not make

**`Group.Tone` is nullable, and the web derives the fallback.** Ruling 14 forbids a migration that
invents a Gruppenart for the eight Gruppen that already exist, and the same argument covers the
colour: a non-null column with a database default would paint all eight identically and store a
lie. So the column is `GroupTone?`, and `toGroupTone(groupId, tone)` in
`features/groups/group-identity.ts` picks a stable palette entry from the id until a Gruppen-Admin
chooses one. The Gruppe always has a colour on screen; the database only holds one once somebody
meant it. Pinned by `group-identity.test.ts`.

**The Termine panel got its own endpoint, `GET groups/{groupId}/calendar`.** Widening
`CalendarScope.Group` on `GET calendar` would have silently changed the Kalender's own Gruppe
filter for every caller, and ADR-0015 only ever speaks about *the Gruppe hub's dates panel*. The
new endpoint filters `Eigentümer = diese Gruppe OR mitwirkend = diese Gruppe` and reuses the
Kalender's existing `VisibleTo` predicate unchanged.

**`VisibleTo` is deliberately untouched.** ADR-0015's „Mitwirken grants nothing" is read to include
*read* access: standing on another Gruppe's stage does not open that Gruppe's gruppeninterne
Einträge. The motivating case — the club-owned Prunksitzung — is `Visibility.Club` and already
passes for everyone, so nothing was owed and nothing was widened.

**The admins panel keeps „Gruppen-Admins".** The hub table above titles it *Wer macht was*; that is
already the Verein hub's Vorstand panel, and two panels sharing one name inside one app is worse
than a small deviation from the shape. `lib/group-sections.ts` keeps `admins: 'Gruppen-Admins'`.
For the same reason the recruiting chip keeps the shipped *sucht Verstärkung* rather than the
table's *Sucht Mitglieder* — the public website already carries that string.

### The trap the phase turned on

**A Gruppen-Admin is not affiliated.** `AffiliationQuery` counts Mitgliedschaften, Zugehörigkeiten
and Rollen — never a `group_admin` row. So the Trainerin of the Kindergarde who dances in nothing
administers a Gruppe she is not affiliated with, and today she reaches it only through
`/my-groups/{id}`, which has no affiliation gate. Merging the three surfaces into one hub behind
`Definition.RequireAffiliation()` would have taken the hub away from exactly the person who writes
its record.

`AffiliationQuery` was **not** widened — that would have silently changed `/members`, `/groups`,
`/calendar` and `GetMe.isAffiliated`. Instead `GET groups/{groupId}` carries **no metadata gate**
and asks in-handler: `IsAffiliatedAsync ∨ CanAdministerGroupAsync`, **403 before 404** (the
opposite of what `GetMyGroupById` did, chosen deliberately and pinned). On the web the hub route
moved out from under `_affiliated` — `routes/_app/groups_.$groupId.tsx` — while `/groups`, the
list, stays inside it. That preserves exactly today's split; it only merges the surface.

### Two migrations, not one

The dossier planned a single `Gruppen` migration and the build produced **two**, one per commit:
`20260921115711_Gruppenarten` (the `group_kind` table and `group.group_kind_id`, with G1) and
`20260921121638_Gruppensteckbrief` (`group.founded_year`, `group.tone` and `group_training_slot`,
with G2). G1's shipped first and re-generating it once G2's shape was settled would have meant
rewriting a model snapshot by hand. **The `calendar_entry_group` join table rode along with the
second** rather than getting a third of its own, so a migration named for the Steckbrief also
creates Mitwirkende Gruppen — and their schema exists two commits before G5 fills it. Harmless,
but worth knowing when reading the folder.

### Two declared deviations

**`groupTone` amends `docs/design/README.md` §12's „no new colors".** Ruling 8 required it: all six
`KkTone` values carry meaning — green = ok/paid, gold = warning, red = danger/action, blue = info —
so a Kalender tinted from them says *bezahlt* on every Perlen row. The ten identity hues live in
their own type (`KkGroupTone`) that shares no string with `KkTone`, so passing a Gruppenfarbe where
a status tone belongs is a compile error. They clear AA against `bg`, `panel` and `panel2` in
both schemes (`group-tone.test.ts`) and are never the only carrier of meaning. No font, radius or shadow was added.

**The Trainingsgenerator is a Gruppe-owned bulk act, not the Kalender's generic `+`.** The floor
plan and ADR-0013 have the Kalender author its own entries; CA-P5's E6 built that button. The
generator sheet (`TrainingGeneratorSheet`, opened from the Gruppe's Rhythmus panel) is a second
authoring surface for Kalendereinträge outside the Kalender, and it is meant to be: generating a
Session of Trainings is strictly the Gruppe's own act, gated on `CanAdministerGroupAsync` and out
of reach of `calendar.manage_club` — the club does not schedule the Garde's training. Every entry
it writes is an ordinary `CalendarEntry` with nothing on it that remembers the batch, so the
Kalender keeps authoring the record; only the bulk gesture lives elsewhere.
