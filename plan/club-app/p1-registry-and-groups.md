---
status: in progress — see p1-implementation-state.md
phase: CA-P1
pulls: Persons & Memberships, Groups, Roles & Permissions (backend, built with this phase)
shaped: 2026-09-10/11 (fresh start — earlier same-day draft discarded on request)
---

> **⚠ Implementation is under way and paused mid-phase. Resuming on a new machine? Read
> [`p1-implementation-state.md`](p1-implementation-state.md) FIRST** — it holds the slice-by-slice
> progress, the environment runbook, the workflow design, what is owed, and two incidents whose
> damage is still in the tree (notably: `CONTEXT.md` is partly reconstructed and needs review).
> The implementation contract every agent builds from is [`p1-contract.md`](p1-contract.md).

> **Start here (fresh implementation context).** Read, in this order: `CONTEXT.md` (glossary,
> amended 2026-09-10/11), this file, `docs/design/persons-groups/README.md` (tokens and
> patterns only — see section 4 for what is ignored), then invoke `/backend-work` and
> `/frontend-work`. Every decision below is final unless Florian changes it; nothing here is
> open for re-shaping. Build in the order of section 5, one PR per step, TDD on the backend.

# CA-P1 — Registry & Groups

Who is in the club, in which way, and where each group lives. This phase replaces the retired
`MembershipType`/`MembershipStatus` enums, adds groups, roles and a generic rights model, and
gives the club app its first domain surfaces. The model was derived from the club and
`CONTEXT.md` before any mock existed; mocks entered only in section 4.

Shaping order: **1 data model → 2 surfaces → 3 designer prompt → 4 mocks read back → 5 build.**
No layout decisions live in this file.

---

## 1. Data model — decided 2026-09-10

### Rulings

| # | Ruling | Consequence |
|---|--------|-------------|
| 1 | Registry access is **derived affiliation**, never "has an account" | Every registry endpoint checks: running membership, current group membership or current role. Ticket-buyer accounts see nothing. |
| 2 | The normal list shows **currently affiliated** persons only | Former members, ticket buyers and unaffiliated persons appear only in person management. |
| 3 | **Group membership is a dated period**, several per person and group | Leaving = set `left_on`. "Current members" is derived. History and "seit" come for free. |
| 4 | **Roles are created in-app; the rights model is generic** (the term was **office** until 2026-09-11, renamed to **role** to keep it generic) | A role, its grants and its holders are data. The set of permission *keys* stays a code constant (the code must know what it enforces). Optional JSON seed for roles: later topic. Overrules the glossary's "not freely created". |
| 5 | Role holding is a **dated period** | Same shape as group membership and group admin. |
| 6 | **Key holding is not P1** | The list's "hat Schlüssel" marker is owed to a later phase. Nothing modelled now. |
| 7 | Contact details are **hidden by default**; the person opts in in her profile; managers see everything | One flag on person. Persons without an account are switched by a manager on their word. |
| 8 | Group hub P1 = **info, group memberships, group admins**; group appointments and photos are reserved surfaces | Slots exist and point at their own later phases. No group-appointment entity, no term pinned yet. |
| 9 | A group admin manages **info, openness, group memberships and co-admins** of her group | Club management is the higher instance and the recovery path after a self-lockout. |
| 10 | Membership rework ships as **periods, membership pauses, fee reduction** as dated facts; **honorary membership is removed from P1** (2026-09-11) | No fee is computed or billed. Existing `membership` rows are recreated, not migrated (no production data). |
| 11 | Bootstrap seeder creates an **"Admin" role with every key** and an open role holding for the bootstrap person | Extends `BootstrapAdminSeeder`; afterwards the role is ordinary data. |
| 12 | The **group hub carries its admin tools inline**; the club-wide group management is a different page | Deliberate exception to the cut rule, ruled by Florian. |
| 13 | Person card and edit person are **two surfaces** | Card under members, edit under person management. |
| 14 | Person gets an optional **`birth_date`**, shown only in management and the own profile (2026-09-11) | Never shown to other members. Fee reduction basis `minor` stays a stated fact, not derived. |

### Entities

Identifiers are English; German terms per `CONTEXT.md`. All tables carry `created_at` /
`updated_at`. "Period" = `*_on` start date + nullable `*_on` end date, end ≥ start.

**person** — existing, plus
- `contact_visible_to_members bool default false` (ruling 7)
- `birth_date date?` (ruling 14)

**membership** — a membership *period*, several per person, at most one open at a time
- `person_id`, `started_on`, `ended_on?`
- drop `type`, `status`

**membership_pause** — membership pause, whole sessions
- `membership_id`, `first_session_year` (2025 = session 2025/26), `last_session_year?` (open-ended)
- state *paused* is derived: today's session lies within a pause

**fee_reduction** — fee reduction
- `person_id`, `basis` enum {`minor`, `school`, `apprenticeship`, `studies`}, `first_session_year`, `last_session_year`

**group** — group
- `name` (unique among non-archived), `description`, `is_recruiting` (openness), `archived_on?`

**group_membership** — group membership (ruling 3)
- `group_id`, `person_id`, `joined_on`, `left_on?`; at most one open row per pair

**group_admin** — group admin, *not* a group membership
- `group_id`, `person_id`, `function?` (label only), `since_on`, `until_on?`

**role** — role (ruling 4)
- `name` (unique among non-archived), `description`, `archived_on?`

**role_permission**
- `role_id`, `permission_key` — key ∈ code constant set below

**role_holding** — role holding (ruling 5)
- `role_id`, `person_id`, `since_on`, `until_on?`

### Permission keys (code constants, P1 set)

| Key | Grants |
|-----|--------|
| `persons.read_details` | See any person's contact data regardless of her visibility flag |
| `persons.manage` | Create/edit persons; record memberships, membership pauses, fee reductions |
| `groups.manage` | Create/edit/archive groups; set any group membership or group admin as higher instance |
| `roles.manage` | Create/edit/archive roles, edit the matrix, record role holdings |

**Group admin** is a separate, group-scoped resource: derived from an open `group_admin` row
for exactly that group, never from a key.

### Derived facts (never stored)

- **affiliated(person)**: open membership ∨ open group_membership ∨ open role_holding
- **membership state**: *ended* (no open period) / *paused* (open period, today inside a pause) / *active*
- **Member since**: `started_on` of the earliest period in the chain
- **current members / admins of a group**: open rows
- **holder**: open `role_holding`

### Authorization wiring

`PermissionAuthorizer.IsGrantedAsync` (currently a stub returning `false`) becomes:
Account → Person → open role_holdings → role_permissions ∋ key. Cached per request. A second
check `IsGroupAdminAsync(accountId, groupId)` covers the scoped resource. The bootstrap admin
gets in via ruling 11.

---

## 2. Surfaces — decided 2026-09-10

Cut rule: **one page = one concern = one permission.** One deliberate exception, ruled by
Florian: the group hub carries its admin tools inline. Each entry names audience, data and
actions. No layout.

### Read surfaces (audience: affiliated persons, ruling 1)

| Surface | Shows | Actions |
|---------|-------|---------|
| Members | every currently affiliated person: name, membership state (*aktiv* / *ruht* / *kein Mitglied*), groups, roles; *key-holding marker reserved* | none |
| Person | name, groups with "seit", roles, "Mitglied seit"; contact data only if she opted in or the viewer holds `persons.read_details` | none |
| Groups | all non-archived groups: name, description, member count, openness | none |
| Group | description, openness, current members, group admins with function; *photos reserved* | none |

### Group hub (audience: current members and group admins of that group)

One hub per group a person belongs to or administers. Distinct from the read-only group
surface and from the club-wide group management.

| Viewer | Shows | Actions |
|--------|-------|---------|
| current member | info, members with "seit", group admins with function; *group appointments* and *photos* slots reserved | none |
| group admin | the same plus group membership and admin history | edit info and openness, add/end group membership, add/end group admin with function |

### My profile (audience: the person herself)

Existing surface, gains one action: toggle visibility of contact details (ruling 7).

### Management (audience per key)

| Surface | Key | Shows | Actions |
|---------|-----|-------|---------|
| Person management | `persons.manage` | all persons incl. unaffiliated and former, full details, the visibility flag | create/edit person, set visibility on her word |
| Edit person | `persons.manage` | one person: membership periods, membership pauses, fee reductions, group memberships, role holdings (read) | record/end membership period, add/edit pause, add/edit fee reduction |
| Group management | `groups.manage` | all groups incl. archived, members and admins | create/edit/archive group, override any group membership or group admin (higher instance, lockout recovery) |
| Roles & Permissions | `roles.manage` | roles, the key matrix, holders | create/edit/archive role, toggle keys, add/end role holding |

Person management is the entry point of management; group management and roles & permissions
sit beneath it. A group admin without any role never needs management.

---

## 3. Designer prompt — handed over 2026-09-10

> Historical record, kept verbatim. Two later rulings are not reflected in it: honorary
> membership was removed from P1 and "office" was renamed "role" (both 2026-09-11).

The prompt below goes to Claude Designer. Layout is decided there, not here. Mocks come back
into section 4.

```text
You are designing screens for the club app of the Furrscher Carnevals Club e.V. ("FURRIA"),
a German carnival club founded 1971. The app is internal: members and people who belong to
one of the club's groups use it on their phones first, on a laptop second. All visible copy is
German. The club's carnival call is "Gross - Furria!" (never Helau or Alaaf).

BINDING DESIGN LANGUAGE (do not reinvent)
- Existing token set and primitives of the "Kk" design system: typography Anton (display) +
  Archivo (text), base radius 14, the existing color tokens, elevation and the Kk primitives
  (KkPanel, KkPanelHeader, KkHeading, KkText, KkButton, KkTextField, KkAvatar, KkAlert,
  KkNote, KkEyebrow, KkRule, KkPhoto/KkPhotoPlaceholder).
- The shipped app shell: a "stage" (content), a "curtain" (navigation drawer that opens like
  a theatre curtain) and a "rail" (compact navigation). Design pages that live inside that
  stage; do not redesign the shell.
- One theme across all apps, light and dark.

NOT BINDING: everything else. Invent layouts, hierarchy, interactions and micro-copy freely.
Every screen must look like a club, not like an admin dashboard: warm, festive, restrained.

DOMAIN FACTS (do not contradict)
- Registry of persons. A person may be: a member (membership state derived: *aktiv*, *ruht*,
  *beendet*), an honorary member (honour running alongside), a member of one or more groups
  (dance guard, Council of Eleven, ...), and/or holder of one or more offices (president,
  treasurer, ...). Any combination. A person in a group need not be a member. There is no
  "board" role.
- Group admin is a per-group responsibility with an optional function label (trainer, speaker,
  commander). A group admin need not belong to the group.
- Each group has a description and an openness flag ("sucht Verstärkung").
- Contact data (phone, email, address) is hidden from other members unless the person opts
  in; managers with the right always see it. Show the difference honestly (nothing hidden
  looks like missing data).
- Dates matter: "Mitglied seit", "in der Gruppe seit", "Amt seit".
- German states: aktiv / ruht / beendet; Ehrenmitglied; sucht Verstärkung.

SCREENS TO DESIGN (mobile first, plus one desktop variant each where the layout differs)

Read-only, for everyone in the club:
1. Members — the list of all currently affiliated persons. Per person: name, membership
   state, honorary-member marker, groups, offices. Reserve a small marker for "hat Schlüssel"
   (comes later). Must be pleasant to scan for ~150 people and searchable. No write actions.
2. Person — one person: name, groups with "seit", offices, "Mitglied seit", honorary member.
   Contact block in two states: opted in (shows phone/email) and not opted in.
3. Groups — all groups: name, short description, member count, openness. Should feel like a
   showcase of the club's units.
4. Group — one group: description, openness, current members, group admins with function,
   and a reserved "Bilder" area for a few photos from past years (placeholder, no upload).

Group hub, for members and admins of that group (one hub per group a person belongs to):
5. Hub as a member sees it: info, members with "seit", group admins, and two reserved
   areas "Termine" and "Bilder" (both empty placeholders pointing to later phases).
6. Hub as a group admin sees it: the same, plus inline management: edit description and
   openness, add a member / end a membership (with a date), add a group admin with function /
   end one. Include the confirm state for ending someone's group membership.

My profile:
7. The existing profile page gains one setting: "Meine Kontaktdaten für Mitglieder sichtbar"
   (off by default). Design that setting and its explanation.

Management, for holders of specific rights (may look more utilitarian, still on-brand):
8. Person management — all persons incl. former members and people with no club tie, full
   details, search/filter, "Person anlegen".
9. Edit person — one person's master data plus dated facts: membership periods
   (start/end), membership pauses (whole sessions, e.g. 2025/26–2026/27, may be open-ended),
   honorary membership (granted in a session ...), fee reductions (basis: minor /
   school / apprenticeship / studies, for a span of sessions). Read-only lists of her groups and
   offices. Design the add/edit interaction for one dated fact.
10. Group management — all groups incl. archived: create, edit, archive, and override any
    membership or admin (the higher instance).
11. Offices & Permissions — offices are created by the club; each office gets a set of rights from a fixed
    list (manage persons, see person details, manage groups, manage offices & rights);
    each office has holders with "seit". Design the matrix and the holder list.

STATES: for every list an empty state and a loading state; for every write action a
confirmation for destructive ends (resignation, end office, archive group).

DELIVERABLE: one artboard per screen and state, named by the numbers above.
```

## 4. Mocks read back — 2026-09-11

Handoff: `docs/design/persons-groups/` (44 artboards, README with tokens, patterns and
per-screen notes). Florian's ruling on arrival: **inspiration and starting point only** — the
mocks are not yet the intended UI/UX, and their information structure and types are to be
ignored; the model and surfaces above stand. Tokens and primitives are binding as always.

### Taken as starting point (visual patterns, to be refined in the UX pass)

- **Editorial section header** (red square · Anton label · hairline rule · optional right meta)
  as the section signature on every surface.
- **Cream card as row container** with hairline-separated rows; **row with "seit"** (icon
  tile · title · meta · right-aligned Anton year) for groups, roles, members, holders.
- **State chip** vocabulary: *aktiv* (green dot) · *ruht* (gold dot) · *beendet* / *kein Mitglied*
  (neutral) · *sucht Verstärkung* (gold) · *Gruppen-Admin* (red).
- **Honest hidden contact block**: dashed card, "hinterlegt, aber nicht freigegeben", dotted
  `privat` bars — hidden never looks like missing. Third state for viewers with
  `persons.read_details`: data plus a blue "Du siehst das über deine Rolle" strip.
- **Members list**: surname letter dividers, search matching name · group · role, filter
  chips with **real counts**, desktop A–Z register, "Der Verein in Zahlen" stats.
- **Groups showcase cards** (name, member count in red Anton, avatar stack, openness) rather
  than a table; archived cards dimmed.
- **Group hub**: admin affordances appear in place (ruling 12) — `+ Mitglied`, `+ Admin`,
  `Beenden`, a "Gruppe pflegen" card with description and openness switch.
- **Write flows as modal frame**: dialog on desktop, bottom sheet on mobile, kicker · title ·
  explanation · fields · Abbrechen / verb button. "Mitglied aufnehmen" searches the registry
  and takes a `joined_on` with quick chips; "Gruppen-Admin ernennen" takes function as free
  text with suggestion chips and says the label carries no rights.
- **Confirmation anatomy** for every destructive end: red eyebrow with the action, a question
  in caps, one paragraph saying exactly what is lost and what survives, a facts table, the verb
  on the primary button. Cases: end group membership, archive group, end role holding.
- **Edit person**: dated facts as `FactRow`s (accent bar · title · span in Anton ·
  Ändern / Beenden) grouped membership · membership pauses · fee reductions; one inline editor open at a time, with a **consequence strip** stating
  what the fact changes ("zählt ab 2025/26 nicht als aktiv, Gruppen bleiben").
- **Roles & Permissions as master–detail**, never a checkbox grid: roles left with holder line and
  rights count; right a role header (holders with "seit", `+ Inhaber`, Beenden) and the key
  list one row per key with plain-German description and switch; mobile = list → detail.
- **My profile visibility card**: title + an/aus chip + switch, explanation, the blue-key note
  that key holders always see the data, and on desktop a live "Was andere von dir sehen"
  preview of the own list row.
- **States**: skeleton rows on first load only, empty states that name the query, FAB for
  "Person anlegen" on mobile.

### Ignored (mock information structure contradicting the pinned model)

| Mock | Why ignored |
|------|-------------|
| Membership type *Aktiv* / *Passiv* / *Jugend* / *Ehren*, "Aktiv · 30 € / Jahr" period titles | Retired 2026-09-10; a period has no kind, *Jugend* is a fee reduction, *Ehren* is not in P1 |
| Honorary-member seal, gold avatars, "verliehen in Session", honorary-member filter | Honorary membership removed from P1 (2026-09-11) |
| Membership pause with reason (Studium, Elternzeit, …) | `membership_pause` has no reason; not asked for by the club |
| "minderjährig automatisch aus dem Geburtsdatum" | Ruling 14: basis stays stated |
| Base role "Mitglied" that everyone holds, `p_view` basic right | Reading is gated by derived affiliation (ruling 1), not by a role |
| Role `kind` elected / appointed / technical, "genau einmal", Admin that cannot lose rights | Invented axes; role is a name, a description and its keys (ruling 4, 11) |
| 26-right catalogue in 7 groups, `sensibel` / `unwiderruflich` flags | P1 ships four keys; the list grows per phase, keys stay code constants |
| Group founding year, "beendet 2019" | Not in the model; `archived_on` exists, a founding year was never asked for |
| Profile switches Fotofreigabe / Push / E-Mail | Fotofreigabe collides with the open photo-consent ambiguity; the others have no backend |
| "Verlauf" button, "angelegt von Ilka Reineke" | No audit trail in P1; `created_at` may be shown, no author |
| Group "Mitmachen" card with training time, "Bei Anna melden" | Trainings are group-appointment territory (open); openness plus admins is what P1 shows |
| Rail groups MEIN BEREICH / VEREIN / VERWALTUNG with Spielplan, Bierliste, Beiträge & Kasse | Navigation stays the shipped P0 `APP_SECTIONS`; P1 only wires its own entries |

### Navigation and routes

`APP_SECTIONS` gains live targets for **Members** and a new **Groups** section; a
**My Groups** group lists one entry per group the person belongs to or administers; a
**Management** group appears only when the account holds at least one of the four keys, with
one entry per held key.

| Route | Surface |
|-------|---------|
| `/members`, `/members/$personId` | Members, Person |
| `/groups`, `/groups/$groupId` | Groups, Group |
| `/my-groups/$groupId` | Group hub |
| `/profile` | My profile (existing, gains the visibility card) |
| `/manage/persons`, `/manage/persons/$personId` | Person management, Edit person |
| `/manage/groups` | Group management |
| `/manage/roles` (role selected via search param) | Roles & Permissions |

Guards: affiliated for `/members` and `/groups`; member-or-admin of the group for the hub;
the key for each `/manage/*` route. Lacking a right hides the affordance, it never disables it.

### UX pass owed before build

The mocks are not the final look. Each surface gets a short UX pass against the Kk shell (stage,
curtain, rail) during implementation planning: density of the members rows on mobile,
whether the hub's admin tools read as one page, and the roles master–detail on a phone. Layout
decisions are taken in each build step's implementation planning, not in this file.

---

## 5. Build order — 18 slices, decided 2026-09-11

One concern per PR. Slices 1–3 are backend-only foundations; from slice 4 on every slice is a
thin vertical cut (endpoint + page piece). Backend by TDD, frontend gates green per slice.
**Every frontend slice ends with `pnpm shot <route>` for each new or changed route**; the agent
reads the four PNGs (phone/desktop × light/dark) and fixes what it sees before opening the PR.
Tool: `web/tools/screenshot/README.md`.

| # | Slice | Contains |
|---|-------|----------|
| 1 | Membership rework | `membership` as periods, `membership_pause`, `fee_reduction`, migration recreating `membership`, derived state and "Mitglied seit", existing profile and `GetMe` adapted so nothing breaks |
| 2 | Rights core | `role`, `role_permission`, `role_holding`, key constants, `PermissionAuthorizer` against the matrix, seeded Admin role (ruling 11) |
| 3 | Groups core | `group`, `group_membership`, `group_admin`, `IsGroupAdminAsync`, affiliation query (ruling 1) |
| 4 | Members list | `GetMembers`, list page, navigation entry, affiliated guard |
| 5 | Person card | `GetMemberById` with the contact rule, page with the three contact states |
| 6 | Groups | `GetGroups`, `GetGroupById`, overview and detail pages, photos slot reserved |
| 7 | Profile visibility | `PutMyContactVisibility`, visibility card in My profile |
| 8 | Hub read | `GetMyGroups`, hub member view, My Groups navigation, group-appointment and photos slots |
| 9 | Hub admin I | `PutGroupInfo`, `PostGroupMembership`, `EndGroupMembership`, inline tools, "Mitglied aufnehmen" and "Zugehörigkeit beenden" modals |
| 10 | Hub admin II | `PostGroupAdmin`, `EndGroupAdmin`, "Gruppen-Admin ernennen" modal |
| 11 | Person management | `GetPersons` (all), `PostPerson`, `PutPerson` (master data incl. `birth_date`, visibility on her word), list and "Person anlegen" |
| 12 | Edit person I | membership period and membership-pause endpoints, fact rows and inline editor with consequence strip |
| 13 | Edit person II | fee-reduction endpoints and fact rows |
| 14 | Group management I | `PostGroup`, `PutGroup`, `ArchiveGroup`, `RestoreGroup`, list page, archive confirmation |
| 15 | Group management II | overrides of group membership and group admin, reusing slice 9/10 endpoints under `groups.manage` |
| 16 | Roles & Permissions I | `GetRoles`, `PostRole`, `PutRole`, `ArchiveRole`, `PutRolePermissions`, master–detail page with the key list |
| 17 | Roles & Permissions II | `PostRoleHolding`, `EndRoleHolding`, holder rows, "Inhaberschaft beenden" confirmation |
| 18 | Website re-pointing | groups list and openness read from the new schema |

## Decisions at a glance (the complete list, for a fresh context)

Model: rulings 1–14 in section 1 (honorary membership removed, office renamed role, 2026-09-11). Surfaces: section 2 (nine surfaces plus edit person and
the group hub's inline tools). Mock handling: section 4. Build order: section 5. Process
decisions taken along the way:

- No master plan; this file is the only plan for P1 and is derived from `CONTEXT.md` and the
  code, not from the website fixtures or the design mocks.
- Mocks are inspiration only; their information structure and types are ignored (section 4).
  Tokens, typography, radius 14 and Kk primitives are binding.
- Cut rule "one page = one concern = one permission", with the group hub as the one
  ruled exception.
- Gating vocabulary: *affiliated* (derived) for reading, *group admin of this group*
  (scoped) for the hub's tools, one code-constant key per management page.
- Lacking a right hides the affordance, never disables it.
- Contact data hidden by default; hidden never looks like missing.
- Ending anything (group membership, role holding, group) sets an end date and is confirmed in a
  modal; nothing is deleted.
- Routes and navigation as in section 4; no `/admin` prefix, `/manage/*` for the key-gated pages.
- Existing `membership` rows are recreated, not migrated (no production data).
- Website consumers are re-pointed at the schema as the last step, not before.

## Open

- none.

## Owed to later phases

- Key holding (inventory + handover) and the list marker.
- Group appointment (term not pinned) and the hub's group-appointment slot.
- Honorary membership (entity, conferring, markers) — removed from P1 on 2026-09-11.
- Member photo library and the group detail's photos slot.
- Optional JSON seed for roles.
- Website consumers (groups list, openness) re-pointed at this schema.
