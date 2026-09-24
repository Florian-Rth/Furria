---
status: implemented 2026-09-21
phase: CA-P6 — Groups
shaped_with: Florian, grilling session 2026-09-21
binding: docs/adr/0010, docs/adr/0013 (+ ADR-0014's exception), docs/adr/0014, docs/adr/0015,
  CONTEXT.md (group, group kind, group membership, group admin, calendar entry, account)
supersedes: floor-plan.md's "Groups — the list page reworked, the group hub taking its dates
  from the calendar", which assumed the existing Group model
---

# CA-P6 — Groups

The last **member** hub before Start, and the app's last open seam. One concept has three
surfaces today — `/groups` (read-only list and detail), `/my-groups/$groupId` (the same layout
plus write dialogs, reachable from no navigation at all) and `/manage/groups` — and the split
between the first two is purely about who is allowed in.

Underneath them sits a `Group` of three fields: `Name`, `Description`, `IsRecruiting`. That is an
address-book entry, not a group. This phase rebuilds the model first and the surfaces on top of
it.

---

## What was ruled on 2026-09-21

1. **The group hub writes its own record** —
   [ADR-0014](../../docs/adr/0014-the-group-hub-writes-its-own-record.md). The dividing line is
   **scope, not surface**: the group's own record lives in its hub including the ended half, and
   `/manage/groups` owns *which groups exist*. ADR-0013 gets a second, narrower exception, bought
   by the fact that the group hub was never the one-query, identical-for-everyone surface the rule
   was written to protect.
2. **The group photo is deferred to a media phase**, and so is the per-group file drive that would
   have carried a group's music files. CA-P6 designs the picture's place and renders a colour
   field there; it **adds no column** for it. A nullable reference to a store that does not exist
   gets the wrong shape early, and the media phase introduces the asset and the reference together.
3. **Group kind is club-composed data**, one per group, the same shape as board office —
   named, archivable, restorable, archive refused while in use. `CONTEXT.md` carries the term.
4. **No age group.** Its only real job was the scheduling constraint that CA-P6 cut with the
   performance profile; the group's name and description already say it, and the field would lie
   about a 43-year-old trainer of the children's guard.
5. **The MVP has no child accounts.** Nobody under the club's age of consent gets a login and no
   account is held on another person's behalf. This resolves the floor plan's open question 1.
   The consequence to carry: a group whose dancers cannot log in is reached through its
   group admin, so no surface may assume the dancer is the one reading it.
6. **One group hub, and nothing is denied.** `/groups/$groupId` is the only detail route;
   `HubDenied` goes. What varies is the **panel set**, by relationship, not the door. A carnival
   club is not secretive about who dances in the guard — it is printed in the programme — and
   `IsRecruiting` is pointless if only the people already inside can look.
7. **The training rhythm is a generator, not a recurrence rule.** A club training skips
   Christmas, skips a let hall and moves the week before a gala evening: the exceptions are the
   normal case, and a rule with fifteen exception records is a worse artifact than twenty rows.
   Every `CalendarEntry` the generator makes is an ordinary one, with nothing that knows it was
   born in a batch.
8. **The group tone comes from its own non-semantic palette.** `KkTone`'s six values all carry
   meaning — green = ok/paid, gold = warning, red = danger/action, blue = info — so a calendar
   tinted from them says "paid" on every pearl row. `groupTone` sits beside it and never mixes.
9. **No group announcements.** `CONTEXT.md`'s line that an announcement for one group belongs in
   that group's hub stays a promissory note, and is marked as deferred rather than left reading as
   built.
10. **Participating groups is a second axis on the calendar entry** —
    [ADR-0015](../../docs/adr/0015-a-calendar-entry-carries-participating-groups.md). Without it
    the gala session — club-owned, danced by the guard — is missing from the guard's own hub.
11. **The founded year is a year, not a date**, and the app derives the **anniversary** from it at
    every fifth year. Nobody remembers the day the beer guard formed, and a club that celebrates a
    13th anniversary celebrates nothing.
12. **No new bottom-navigation destination.** Ruled by Florian: the destination set is personal
    configuration, and **the common case is a member in exactly one group**, who will pin *that
    group* rather than a list of all of them. `/groups` stays reachable from the club hub as it
    is today; the hub needs a stable identity so pinning can reach it later.
13. **Group kinds live inside `/manage/groups`**, as `/manage/board` holds board offices
    above board seats — one key, one route, two related records. An eighth manage-hub panel
    would be the first to share a permission with another and would blur CA-P5 ruling 7.
14. **The group kind is nullable.** Every existing group has none the day this deploys, and the
    club fills its own master data; a migration that invents a value for eight groups is exactly
    the seeding the project forbids.
15. **The people panel labels nobody.** Whether someone pays club dues is a fact about the person,
    not about the group. Tapping a row opens the existing peek sheet, which already states the
    membership — `MEMBERSHIP_STATE_LABELS.none` is already the copy **`kein Mitglied`**. So the
    phase is not blocked on the club's open question about what to *call* such a person, and no
    term is invented.
16. **`IsRecruiting` is the group admin's switch**, on the hub — it follows ruling 1.

---

## The group

| | |
|---|---|
| **Name**, **Description** | unchanged |
| **Group kind** | nullable reference to club-composed data |
| **Founded year** | nullable `int`; the anniversary is derived, never stored |
| **Group tone** | one `groupTone` value; duplicates allowed, warned about in the picker |
| **Sucht Mitglieder** | unchanged `IsRecruiting`, now edited on the hub |
| **Training rhythm** | a *list* of slots — a guard trains twice a week |
| *Group photo* | **not a column in this phase** — the layout reserves its place, the media phase adds the reference |

A **training slot** is `(weekday, time, duration, venue)`. It is a **stated habit, not a
live rule**: changing it does nothing to entries already generated. The hub and the website's
recruiting answer read it ("Wir trainieren dienstags 19:30 in der Sporthalle"); the dates panel
reads reality. The two are allowed to disagree, and neither is derived from the other.

---

## The hub

`/groups/$groupId`, open to any affiliated viewer. `/my-groups/*` and today's `GroupPage` both fold
into it.

| | any affiliated viewer | in the group | group admin |
|---|---|---|---|
| Identity — name, description, group kind, founded year, group tone, anniversary, sucht Mitglieder | ✓ | ✓ | ✓ |
| Wer macht was — group admins and their function | ✓ | ✓ | ✓ |
| Wer dabei ist — names and portraits | ✓ | ✓ | ✓ |
| Dates, with attendance response | — | ✓ | ✓ |
| The ended half — past group memberships, past group admins | — | — | ✓ |
| Writes — identity, group memberships, group admins, training rhythm | — | — | ✓ |

**The opener** carries the group's colour as a field where the group photo will go, the name over
it in Anton, and **one per-viewer line**: „Du tanzt hier seit 2019" / „Du leitest diese Gruppe" /
„Du bist nicht dabei". That line is the only thing on the hub that varies for a reason other than
permission, and it belongs at the top.

**Wer dabei ist** shows everyone inline as a portrait grid, four across on a phone — a group is
eight to fifteen people and hiding them behind a tap would be worse. A row opens `MemberPeekSheet`,
reused unchanged.

**Contact details stay off the hub.** Name and portrait only; anything reachable stays on the
person surface behind the rule that surface already applies.

---

## The list

`/groups`, unchanged route, rebuilt.

- **The card's face is the group tone**, with the name set over it. It reads as deliberate rather
  than as a missing image, and when the media phase lands the photo drops into exactly that region
  without moving the layout. Under it: group kind, who runs it, an avatar stack, and the recruiting
  chip when the group is open.
- **My groups first, then the rest, flat.** One list, one section break — which is what retires
  `/my-groups`: the distinction that justifies a whole route today becomes an ordering decision. A
  member in no group sees one plain list and no empty heading.
- **No group-kind grouping.** With eight groups it is more structure than content; grouping by
  kind is the public website's job, where there is no "mine" to sort by.
- **Archived groups do not appear.** They are a record, and `/manage/groups` already lists and
  restores them. Accepted cost: a member who danced in Die Wirbelwinde until 2018 cannot browse to
  it from here. Her own group membership still shows on her person page.

---

## Permissions

**No new keys.** `FurriaPermissions` stays at ten.

- Group kind is `groups.manage`, like everything else on `/manage/groups`.
- Every group-scoped write goes through `PermissionAuthorizer.CanAdministerGroupAsync`, which
  already exists and already backs `PostGroupAdmin`. Group admin stays what `CONTEXT.md` says it
  is: not a role, not a key, a group-scoped resource.
- Generating trainings is **strictly the group's own act**. `calendar.manage_club` does not reach
  it — the club does not schedule the guard's training.

---

## The slices

**G0 — `groupTone` in `@furria/ui`.** The palette: eight to ten hues, a light and a dark value
each, named so nothing can pass a status tone where an identity tone belongs. Contrast-checked
against `bg` and `panel` in both schemes. Pure, and it unblocks G4, G5 and G7.

**G1 — Group kind.** Entity, endpoints, archive refused while a group uses it, restore. The
section in `/manage/groups`, mirroring `BoardOfficeSection`.

**G2 — the group grows up.** `FoundedYear`, the `groupTone` value, the training-rhythm slots.
The anniversary derivation as a pure function with its own test.

**G3 — one group hub.** `/groups/$groupId` replaces `GroupPage` and `HubPage`; `GetGroupById` and
`GetMyGroupById` become one endpoint whose payload varies by relationship. The opener, the panels,
the identity writes, and the group-membership and group-admin writes the hub already had.
`/my-groups/*` and `HubDenied` go.

**G4 — the groups list.** Colour-field cards, my groups first, archived excluded.

**G5 — Participating groups.** The join table, the multi-select on the calendar-entry form, and
the dates panel filtering on `owner OR participating`.

**G6 — the training rhythm and its generator.** A sheet opened from the dates panel: pick an
end date, then a preview listing every date it would create —

- `✓` will be created
- `⚠` the venue is already taken that evening (CA-P4's collision check, reused)
- `–` a training for this group already exists then, so re-running is safe

— every row untickable. That preview is the feature: it is where Christmas and the school holidays
get handled without modelling a holiday calendar, and it is what makes a bulk write trustworthy.
The default end date is `ClubSession.ClosingOf(RelevantYearOf(today))`, which already does the
right thing in July: it generates into the **coming** session, not the one that just ended.
Editable, because a group that trains through the summer exists.

**G7 — the calendar takes the group tone.** An edge, not a fill; never the only carrier of
meaning.

---

## Deliberately not in this phase

- **The media store**, the group photo's bytes, and the per-group file drive. Their own phase,
  with structure and permissions shaped properly — including whether an off-the-shelf system
  carries it. That phase also unblocks the portraits the club hub's board band already wants.
- **Group announcements** (ruling 9).
- **The performance profile** — duration, stage requirements, changeover time, technical needs —
  and the **repertoire**. Cut by Florian; both may return with events, and ADR-0015 is the hook
  they will need.
- **Age group** (ruling 4).
- **A bottom-navigation destination** (ruling 12).
- **Child accounts** (ruling 5).

---

## Open

- **The word for a person in a group without membership** stays open, and ruling 15 means
  nothing in this phase waits on it. The club-side insurance question `CONTEXT.md` carries with it
  is untouched.
- **Photo consent** travels with the media phase, not this one.
- **The club's own founded year** — 1971, per the handoff — still has no home in the model.
  `Session` carries motto, number and logo; nothing carries the club. Out of scope here, and it
  wants a small slice of its own before the website reads it from data rather than a constant.

---

## What was built — 2026-09-21

The phase is shipped, in six commits on `feat/club-app-p6-groups`. **Every slice G0–G7 landed**:
the `groupTone` palette in `@furria/ui`, the group kind, the group's profile, the merged hub,
the rebuilt groups list, participating groups, the training rhythm with its generator, and the
group tone on the calendar. What follows is where the build had to rule on something this file
left open, and where it knowingly left the shape above.

### Cut back — 2026-09-22

The group management shipped with an expanding override panel per group. It was deleted: it
duplicated the group hub, which a `groups.manage` holder already administers in full. See the
amendment to [ADR-0014](../../docs/adr/0014-the-group-hub-writes-its-own-record.md). With it went
`GET manage/groups/{id}`, the description and *sucht Verstärkung* fields on the club's own write
(ruling 16 put both on the hub), the permanent footnote, and the „Alles gepflegt." all-clear that
was computed from two checks. The register gained an *„ohne Personen"* facet — a group nobody is
in is the archive candidate the page never named.

### Four rulings the plan did not make

**`Group.Tone` is nullable, and the web derives the fallback.** Ruling 14 forbids a migration that
invents a group kind for the eight groups that already exist, and the same argument covers the
colour: a non-null column with a database default would paint all eight identically and store a
lie. So the column is `GroupTone?`, and `toGroupTone(groupId, tone)` in
`features/groups/group-identity.ts` picks a stable palette entry from the id until a group admin
chooses one. The group always has a colour on screen; the database only holds one once somebody
meant it. Pinned by `group-identity.test.ts`.

**The dates panel got its own endpoint, `GET groups/{groupId}/calendar`.** Widening
`CalendarScope.Group` on `GET calendar` would have silently changed the calendar's own group
filter for every caller, and ADR-0015 only ever speaks about *the group hub's dates panel*. The
new endpoint filters `owner = this group OR participating = this group` and reuses the
calendar's existing `VisibleTo` predicate unchanged.

**`VisibleTo` is deliberately untouched.** ADR-0015's „Mitwirken grants nothing" is read to include
*read* access: standing on another group's stage does not open that group's internal entries. The
motivating case — the club-owned gala session — is `Visibility.Club` and already passes for
everyone, so nothing was owed and nothing was widened.

**The admins panel keeps „Gruppen-Admins".** The hub table above titles it *Wer macht was*; that is
already the club hub's board panel, and two panels sharing one name inside one app is worse
than a small deviation from the shape. `lib/group-sections.ts` keeps `admins: 'Gruppen-Admins'`.
For the same reason the recruiting chip keeps the shipped *sucht Verstärkung* rather than the
table's *Sucht Mitglieder* — the public website already carries that string.

### The trap the phase turned on

**A group admin is not affiliated.** `AffiliationQuery` counts memberships, group memberships
and roles — never a `group_admin` row. So the trainer of the children's guard who dances in
nothing administers a group she is not affiliated with, and today she reaches it only through
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

The dossier planned a single Groups migration and the build produced **two**, one per commit:
`20260921115711_GroupKinds` (the `group_kind` table and `group.group_kind_id`, with G1) and
`20260921121638_GroupProfile` (`group.founded_year`, `group.tone` and `group_training_slot`,
with G2). G1's shipped first and re-generating it once G2's shape was settled would have meant
rewriting a model snapshot by hand. **The `calendar_entry_group` join table rode along with the
second** rather than getting a third of its own, so a migration named for the group profile
also creates participating groups — and their schema exists two commits before G5 fills it.
Harmless, but worth knowing when reading the folder.

### Two declared deviations

**`groupTone` amends `docs/design/README.md` §12's „no new colors".** Ruling 8 required it: all six
`KkTone` values carry meaning — green = ok/paid, gold = warning, red = danger/action, blue = info —
so a calendar tinted from them says *bezahlt* on every pearl row. The ten identity hues live in
their own type (`KkGroupTone`) that shares no string with `KkTone`, so passing a group tone where
a status tone belongs is a compile error. They clear AA against `bg`, `panel` and `panel2` in
both schemes (`group-tone.test.ts`) and are never the only carrier of meaning. No font, radius or shadow was added.

**The training generator is a group-owned bulk act, not the calendar's generic `+`.** The floor
plan and ADR-0013 have the calendar author its own entries; CA-P5's E6 built that button. The
generator sheet (`TrainingGeneratorSheet`, opened from the group's rhythm panel) is a second
authoring surface for calendar entries outside the calendar, and it is meant to be: generating a
session of trainings is strictly the group's own act, gated on `CanAdministerGroupAsync` and out
of reach of `calendar.manage_club` — the club does not schedule the guard's training. Every entry
it writes is an ordinary `CalendarEntry` with nothing on it that remembers the batch, so the
calendar keeps authoring the record; only the bulk gesture lives elsewhere.
