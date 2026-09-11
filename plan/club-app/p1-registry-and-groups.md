---
status: shaped — ready for implementation
phase: CA-P1
pulls: Personen & Mitgliedschaften, Gruppen, Rollen & Rechte (backend, built with this phase)
shaped: 2026-09-10/11 (fresh start — earlier same-day draft discarded on request)
---

> **Start here (fresh implementation context).** Read, in this order: `CONTEXT.md` (glossary,
> amended 2026-09-10/11), this file, `docs/design/persons-groups/README.md` (tokens and
> patterns only — see section 4 for what is ignored), then invoke `/backend-work` and
> `/frontend-work`. Every decision below is final unless Florian changes it; nothing here is
> open for re-shaping. Build in the order of section 5, one PR per step, TDD on the backend.

# CA-P1 — Registry & Gruppen

Who is in the club, in which way, and where each Gruppe lives. This phase replaces the retired
`MembershipType`/`MembershipStatus` enums, adds Gruppen, Rollen and a generic rights model, and
gives the Club-App its first domain surfaces. The model was derived from the club and
`CONTEXT.md` before any mock existed; mocks entered only in section 4.

Shaping order: **1 data model → 2 surfaces → 3 designer prompt → 4 mocks read back → 5 build.**
No layout decisions live in this file.

---

## 1. Data model — decided 2026-09-10

### Rulings

| # | Ruling | Consequence |
|---|--------|-------------|
| 1 | Registry access is **derived affiliation**, never "has an Account" | Every registry endpoint checks: running Mitgliedschaft, current Zugehörigkeit or current Rolle. Ticket-buyer Accounts see nothing. |
| 2 | The normal list shows **currently affiliated** Personen only | Former members, ticket buyers and unaffiliated Personen appear only in Personenverwaltung. |
| 3 | **Zugehörigkeit is a dated period**, several per Person and Gruppe | Leaving = set `left_on`. "Current members" is derived. History and "seit" come for free. |
| 4 | **Rollen are created in-app; the rights model is generic** (the term was **Amt** until 2026-09-11, renamed to **Rolle** to keep it generic) | Rolle, its grants and its holders are data. The set of Berechtigung *keys* stays a code constant (the code must know what it enforces). Optional JSON seed for Rollen: later topic. Overrules the glossary's "not freely created". |
| 5 | Rolle-holding is a **dated period** (Inhaberschaft) | Same shape as Zugehörigkeit and Gruppen-Admin. |
| 6 | **Schlüssel is not P1** | The list's "hat Schlüssel" marker is owed to a later phase. Nothing modelled now. |
| 7 | Contact details are **hidden by default**; the Person opts in in her profile; managers see everything | One flag on Person. Personen without Account are switched by a manager on their word. |
| 8 | Group hub P1 = **Info, Zugehörigkeiten, Gruppen-Admins**; Termine and Bilder are reserved surfaces | Slots exist and point at their own later phases. No Gruppentermin entity, no term pinned yet. |
| 9 | A Gruppen-Admin manages **info, openness, Zugehörigkeiten and co-admins** of her Gruppe | Club management is the higher instance and the recovery path after a self-lockout. |
| 10 | Mitgliedschaft rework ships as **periods, Ruhezeiten, Beitragsermäßigung** as dated facts; **Ehrenmitgliedschaft is removed from P1** (2026-09-11) | No Beitrag is computed or billed. Existing `membership` rows are recreated, not migrated (no production data). |
| 11 | Bootstrap seeder creates an **"Admin" Rolle with every key** and an open Inhaberschaft for the bootstrap Person | Extends `BootstrapAdminSeeder`; afterwards the Rolle is ordinary data. |
| 12 | The **Gruppen-Hub carries its admin tools inline**; the club-wide Gruppenverwaltung is a different page | Deliberate exception to the cut rule, ruled by Florian. |
| 13 | Person card and Person bearbeiten are **two surfaces** | Card under Mitglieder, edit under Personenverwaltung. |
| 14 | Person gets an optional **`birth_date`**, shown only in Verwaltung and the own profile (2026-09-11) | Never shown to other members. Beitragsermäßigung basis `minor` stays a stated fact, not derived. |

### Entities

Identifiers are English; German terms per `CONTEXT.md`. All tables carry `created_at` /
`updated_at`. "Period" = `*_on` start date + nullable `*_on` end date, end ≥ start.

**person** — existing, plus
- `contact_visible_to_members bool default false` (ruling 7)
- `birth_date date?` (ruling 14)

**membership** — a Mitgliedschaft *period*, several per Person, at most one open at a time
- `person_id`, `started_on`, `ended_on?`
- drop `type`, `status`

**membership_pause** — Ruhezeit, whole Sessions
- `membership_id`, `first_session_year` (2025 = Session 2025/26), `last_session_year?` (open-ended)
- state *ruht* is derived: today's Session lies within a pause

**fee_reduction** — Beitragsermäßigung
- `person_id`, `basis` enum {`minor`, `school`, `apprenticeship`, `studies`}, `first_session_year`, `last_session_year`

**group** — Gruppe
- `name` (unique among non-archived), `description`, `is_recruiting` (openness), `archived_on?`

**group_membership** — Zugehörigkeit (ruling 3)
- `group_id`, `person_id`, `joined_on`, `left_on?`; at most one open row per pair

**group_admin** — Gruppen-Admin, *not* a Zugehörigkeit
- `group_id`, `person_id`, `function?` (label only), `since_on`, `until_on?`

**role** — Rolle (ruling 4)
- `name` (unique among non-archived), `description`, `archived_on?`

**role_permission**
- `role_id`, `permission_key` — key ∈ code constant set below

**role_holding** — Inhaberschaft (ruling 5)
- `role_id`, `person_id`, `since_on`, `until_on?`

### Berechtigung keys (code constants, P1 set)

| Key | Grants |
|-----|--------|
| `persons.read_details` | See any Person's contact data regardless of her visibility flag |
| `persons.manage` | Create/edit Personen; record Mitgliedschaften, Ruhezeiten, Beitragsermäßigung |
| `groups.manage` | Create/edit/archive Gruppen; set any Zugehörigkeit or Gruppen-Admin as higher instance |
| `roles.manage` | Create/edit/archive Rollen, edit the matrix, record Inhaberschaften |

**Gruppen-Admin** is a separate, Gruppe-scoped resource: derived from an open `group_admin` row
for exactly that Gruppe, never from a key.

### Derived facts (never stored)

- **affiliated(person)**: open membership ∨ open group_membership ∨ open role_holding
- **membership state**: *beendet* (no open period) / *ruht* (open period, today inside a pause) / *aktiv*
- **Mitglied seit**: `started_on` of the earliest period in the chain
- **current members / admins of a Gruppe**: open rows
- **Inhaber**: open `role_holding`

### Authorization wiring

`PermissionAuthorizer.IsGrantedAsync` (currently a stub returning `false`) becomes:
Account → Person → open role_holdings → role_permissions ∋ key. Cached per request. A second
check `IsGroupAdminAsync(accountId, groupId)` covers the scoped resource. The bootstrap admin
gets in via ruling 11.

---

## 2. Surfaces — decided 2026-09-10

Cut rule: **one page = one concern = one Berechtigung.** One deliberate exception, ruled by
Florian: the Gruppen-Hub carries its admin tools inline. Each entry names audience, data and
actions. No layout.

### Read surfaces (audience: affiliated Personen, ruling 1)

| Surface | Shows | Actions |
|---------|-------|---------|
| Mitglieder | every currently affiliated Person: name, membership state (aktiv / ruht / kein Mitglied), Gruppen, Rollen; *Schlüssel marker reserved* | none |
| Person | name, Gruppen with "seit", Rollen, "Mitglied seit"; contact data only if she opted in or the viewer holds `persons.read_details` | none |
| Gruppen | all non-archived Gruppen: name, description, member count, openness | none |
| Gruppe | description, openness, current members, Gruppen-Admins with Funktion; *Bilder reserved* | none |

### Gruppen-Hub (audience: current members and Gruppen-Admins of that Gruppe)

One hub per Gruppe a Person belongs to or administers. Distinct from the read-only Gruppe
surface and from the club-wide Gruppenverwaltung.

| Viewer | Shows | Actions |
|--------|-------|---------|
| current member | info, members with "seit", Gruppen-Admins with Funktion; *Termine* and *Bilder* slots reserved | none |
| Gruppen-Admin | the same plus Zugehörigkeit and admin history | edit info and openness, add/end Zugehörigkeit, add/end Gruppen-Admin with Funktion |

### Mein Profil (audience: the Person herself)

Existing surface, gains one action: toggle Sichtbarkeit der Kontaktdaten (ruling 7).

### Verwaltung (audience per key)

| Surface | Key | Shows | Actions |
|---------|-----|-------|---------|
| Personenverwaltung | `persons.manage` | all Personen incl. unaffiliated and former, full details, the visibility flag | create/edit Person, set visibility on her word |
| Person bearbeiten | `persons.manage` | one Person: membership periods, Ruhezeiten, Beitragsermäßigungen, Zugehörigkeiten, Inhaberschaften (read) | record/end membership period, add/edit pause, add/edit fee reduction |
| Gruppenverwaltung | `groups.manage` | all Gruppen incl. archived, members and admins | create/edit/archive Gruppe, override any Zugehörigkeit or Gruppen-Admin (higher instance, lockout recovery) |
| Rollen & Rechte | `roles.manage` | Rollen, the key matrix, Inhaber | create/edit/archive Rolle, toggle keys, add/end Inhaberschaft |

Personenverwaltung is the entry point of Verwaltung; Gruppenverwaltung and Rollen & Rechte sit
beneath it. A Gruppen-Admin without any Rolle never needs Verwaltung.

---

## 3. Designer prompt — handed over 2026-09-10

> Historical record, kept verbatim. Two later rulings are not reflected in it: Ehrenmitgliedschaft
> was removed from P1 and "Amt" was renamed "Rolle" (both 2026-09-11).

The prompt below goes to Claude Designer. Layout is decided there, not here. Mocks come back
into section 4.

```text
You are designing screens for the Club-App of the Furrscher Carnevals Club e.V. ("FURRIA"),
a German Karnevalsverein founded 1971. The app is internal: members and people who belong to
one of the club's Gruppen use it on their phones first, on a laptop second. All visible copy is
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
- Registry of Personen. A Person may be: a Mitglied (membership state derived: aktiv, ruht,
  beendet), an Ehrenmitglied (honour running alongside), a member of one or more Gruppen
  (Tanzgarde, Elferrat, ...), and/or holder of one or more Ämter (Präsident, Finanzen, ...).
  Any combination. A Person in a Gruppe need not be a Mitglied. There is no "Vorstand" role.
- Gruppen-Admin is a per-Gruppe responsibility with an optional Funktion label (Trainerin,
  Sprecher, Kommandantin). A Gruppen-Admin need not belong to the Gruppe.
- Each Gruppe has a description and an openness flag ("sucht Verstärkung").
- Contact data (phone, email, address) is hidden from other members unless the Person opts
  in; managers with the right always see it. Show the difference honestly (nothing hidden
  looks like missing data).
- Dates matter: "Mitglied seit", "in der Gruppe seit", "Amt seit".
- German states: aktiv / ruht / beendet; Ehrenmitglied; sucht Verstärkung.

SCREENS TO DESIGN (mobile first, plus one desktop variant each where the layout differs)

Read-only, for everyone in the club:
1. Mitglieder — the list of all currently affiliated Personen. Per Person: name, membership
   state, Ehrenmitglied marker, Gruppen, Ämter. Reserve a small marker for "hat Schlüssel"
   (comes later). Must be pleasant to scan for ~150 people and searchable. No write actions.
2. Person — one Person: name, Gruppen with "seit", Ämter, "Mitglied seit", Ehrenmitglied.
   Contact block in two states: opted in (shows phone/email) and not opted in.
3. Gruppen — all Gruppen: name, short description, member count, openness. Should feel like a
   showcase of the club's units.
4. Gruppe — one Gruppe: description, openness, current members, Gruppen-Admins with Funktion,
   and a reserved "Bilder" area for a few photos from past years (placeholder, no upload).

Gruppen-Hub, for members and admins of that Gruppe (one hub per Gruppe a Person belongs to):
5. Hub as a member sees it: info, members with "seit", Gruppen-Admins, and two reserved
   areas "Termine" and "Bilder" (both empty placeholders pointing to later phases).
6. Hub as a Gruppen-Admin sees it: the same, plus inline management: edit description and
   openness, add a member / end a membership (with a date), add a Gruppen-Admin with Funktion /
   end one. Include the confirm state for ending someone's Zugehörigkeit.

Mein Profil:
7. The existing profile page gains one setting: "Meine Kontaktdaten für Mitglieder sichtbar"
   (off by default). Design that setting and its explanation.

Verwaltung, for holders of specific rights (may look more utilitarian, still on-brand):
8. Personenverwaltung — all Personen incl. former members and people with no club tie, full
   details, search/filter, "Person anlegen".
9. Person bearbeiten — one Person's master data plus dated facts: membership periods
   (Beginn/Ende), Ruhezeiten (whole Sessions, e.g. 2025/26–2026/27, may be open-ended),
   Ehrenmitgliedschaft (verliehen in Session ...), Beitragsermäßigungen (Grund: minderjährig /
   Schule / Ausbildung / Studium, for a span of Sessions). Read-only lists of her Gruppen and
   Ämter. Design the add/edit interaction for one dated fact.
10. Gruppenverwaltung — all Gruppen incl. archived: create, edit, archive, and override any
    membership or admin (the higher instance).
11. Ämter & Rechte — Ämter are created by the club; each Amt gets a set of rights from a fixed
    list (Personen verwalten, Personendetails sehen, Gruppen verwalten, Ämter & Rechte
    verwalten); each Amt has holders with "seit". Design the matrix and the holder list.

STATES: for every list an empty state and a loading state; for every write action a
confirmation for destructive ends (Austritt, Amt beenden, Gruppe archivieren).

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
  tile · title · meta · right-aligned Anton year) for Gruppen, Rollen, members, holders.
- **State chip** vocabulary: aktiv (green dot) · ruht (gold dot) · beendet / kein Mitglied
  (neutral) · sucht Verstärkung (gold) · Gruppen-Admin (red).
- **Honest hidden contact block**: dashed card, "hinterlegt, aber nicht freigegeben", dotted
  `privat` bars — hidden never looks like missing. Third state for viewers with
  `persons.read_details`: data plus a blue "Du siehst das über deine Rolle" strip.
- **Mitglieder list**: surname letter dividers, search matching name · Gruppe · Rolle, filter
  chips with **real counts**, desktop A–Z register, "Der Verein in Zahlen" stats.
- **Gruppen showcase cards** (name, member count in red Anton, avatar stack, openness) rather
  than a table; archived cards dimmed.
- **Gruppen-Hub**: admin affordances appear in place (ruling 12) — `+ Mitglied`, `+ Admin`,
  `Beenden`, a "Gruppe pflegen" card with description and openness switch.
- **Write flows as modal frame**: dialog on desktop, bottom sheet on mobile, kicker · title ·
  explanation · fields · Abbrechen / verb button. "Mitglied aufnehmen" searches the registry
  and takes a `joined_on` with quick chips; "Gruppen-Admin ernennen" takes Funktion as free
  text with suggestion chips and says the label carries no rights.
- **Confirmation anatomy** for every destructive end: red eyebrow with the action, a question
  in caps, one paragraph saying exactly what is lost and what survives, a facts table, the verb
  on the primary button. Cases: Zugehörigkeit beenden, Gruppe archivieren, Inhaberschaft beenden.
- **Person bearbeiten**: dated facts as `FactRow`s (accent bar · title · span in Anton ·
  Ändern / Beenden) grouped Mitgliedschaft · Ruhezeiten · Beitragsermäßigungen; one inline editor open at a time, with a **consequence strip** stating
  what the fact changes ("zählt ab 2025/26 nicht als aktiv, Gruppen bleiben").
- **Rollen & Rechte as master–detail**, never a checkbox grid: Rollen left with holder line and
  rights count; right a Rolle header (holders with "seit", `+ Inhaber`, Beenden) and the key
  list one row per key with plain-German description and switch; mobile = list → detail.
- **Mein Profil visibility card**: title + an/aus chip + switch, explanation, the blue-key note
  that key holders always see the data, and on desktop a live "Was andere von dir sehen"
  preview of the own list row.
- **States**: skeleton rows on first load only, empty states that name the query, FAB for
  "Person anlegen" on mobile.

### Ignored (mock information structure contradicting the pinned model)

| Mock | Why ignored |
|------|-------------|
| Mitgliedschaftsart Aktiv / Passiv / Jugend / Ehren, "Aktiv · 30 € / Jahr" period titles | Retired 2026-09-10; a period has no kind, Jugend is a Beitragsermäßigung, Ehren is not in P1 |
| Ehrenmitglied seal, gold avatars, "verliehen in Session", Ehrenmitglied filter | Ehrenmitgliedschaft removed from P1 (2026-09-11) |
| Ruhezeit with Grund (Studium, Elternzeit, …) | `membership_pause` has no reason; not asked for by the club |
| "minderjährig automatisch aus dem Geburtsdatum" | Ruling 14: basis stays stated |
| Base role "Mitglied" that everyone holds, `p_view` Grundrecht | Reading is gated by derived affiliation (ruling 1), not by a Rolle |
| Rolle `kind` gewählt / ernannt / technisch, "genau einmal", Admin that cannot lose rights | Invented axes; Rolle is a name, a description and its keys (ruling 4, 11) |
| 26-right catalogue in 7 groups, `sensibel` / `unwiderruflich` flags | P1 ships four keys; the list grows per phase, keys stay code constants |
| Gruppe founding year, "beendet 2019" | Not in the model; `archived_on` exists, a founding year was never asked for |
| Profile switches Fotofreigabe / Push / E-Mail | Fotofreigabe collides with the open photo-consent ambiguity; the others have no backend |
| "Verlauf" button, "angelegt von Ilka Reineke" | No audit trail in P1; `created_at` may be shown, no author |
| Gruppe "Mitmachen" card with training time, "Bei Anna melden" | Trainings are Gruppentermin territory (open); openness plus admins is what P1 shows |
| Rail groups MEIN BEREICH / VEREIN / VERWALTUNG with Spielplan, Bierliste, Beiträge & Kasse | Navigation stays the shipped P0 `APP_SECTIONS`; P1 only wires its own entries |

### Navigation and routes

`APP_SECTIONS` gains live targets for **Mitglieder** and a new **Gruppen** section; a
**Meine Gruppen** group lists one entry per Gruppe the Person belongs to or administers; a
**Verwaltung** group appears only when the Account holds at least one of the four keys, with
one entry per held key.

| Route | Surface |
|-------|---------|
| `/members`, `/members/$personId` | Mitglieder, Person |
| `/groups`, `/groups/$groupId` | Gruppen, Gruppe |
| `/my-groups/$groupId` | Gruppen-Hub |
| `/profile` | Mein Profil (existing, gains the visibility card) |
| `/manage/persons`, `/manage/persons/$personId` | Personenverwaltung, Person bearbeiten |
| `/manage/groups` | Gruppenverwaltung |
| `/manage/roles` (Rolle selected via search param) | Rollen & Rechte |

Guards: affiliated for `/members` and `/groups`; member-or-admin of the Gruppe for the hub;
the key for each `/manage/*` route. Lacking a right hides the affordance, it never disables it.

### UX pass owed before build

The mocks are not the final look. Each surface gets a short UX pass against the Kk shell (stage,
curtain, rail) during implementation planning: density of the Mitglieder rows on mobile,
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
| 1 | Mitgliedschaft rework | `membership` as periods, `membership_pause`, `fee_reduction`, migration recreating `membership`, derived state and "Mitglied seit", existing profile and `GetMe` adapted so nothing breaks |
| 2 | Rights core | `role`, `role_permission`, `role_holding`, key constants, `PermissionAuthorizer` against the matrix, seeded Admin Rolle (ruling 11) |
| 3 | Gruppen core | `group`, `group_membership`, `group_admin`, `IsGroupAdminAsync`, affiliation query (ruling 1) |
| 4 | Mitglieder list | `GetMembers`, list page, navigation entry, affiliated guard |
| 5 | Person card | `GetMemberById` with the contact rule, page with the three contact states |
| 6 | Gruppen | `GetGroups`, `GetGroupById`, overview and detail pages, Bilder slot reserved |
| 7 | Profile visibility | `PutMyContactVisibility`, visibility card in Mein Profil |
| 8 | Hub read | `GetMyGroups`, hub member view, Meine Gruppen navigation, Termine and Bilder slots |
| 9 | Hub admin I | `PutGroupInfo`, `PostGroupMembership`, `EndGroupMembership`, inline tools, "Mitglied aufnehmen" and "Zugehörigkeit beenden" modals |
| 10 | Hub admin II | `PostGroupAdmin`, `EndGroupAdmin`, "Gruppen-Admin ernennen" modal |
| 11 | Personenverwaltung | `GetPersons` (all), `PostPerson`, `PutPerson` (Stammdaten incl. `birth_date`, visibility on her word), list and Person anlegen |
| 12 | Person bearbeiten I | membership period and Ruhezeit endpoints, fact rows and inline editor with consequence strip |
| 13 | Person bearbeiten II | Beitragsermäßigung endpoints and fact rows |
| 14 | Gruppenverwaltung I | `PostGroup`, `PutGroup`, `ArchiveGroup`, `RestoreGroup`, list page, archive confirmation |
| 15 | Gruppenverwaltung II | overrides of Zugehörigkeit and Gruppen-Admin, reusing slice 9/10 endpoints under `groups.manage` |
| 16 | Rollen & Rechte I | `GetRoles`, `PostRole`, `PutRole`, `ArchiveRole`, `PutRolePermissions`, master–detail page with the key list |
| 17 | Rollen & Rechte II | `PostRoleHolding`, `EndRoleHolding`, holder rows, "Inhaberschaft beenden" confirmation |
| 18 | Website re-pointing | Gruppen list and openness read from the new schema |

## Decisions at a glance (the complete list, for a fresh context)

Model: rulings 1–14 in section 1 (Ehrenmitgliedschaft removed, Amt renamed Rolle, 2026-09-11). Surfaces: section 2 (nine surfaces plus Person bearbeiten and
the Gruppen-Hub's inline tools). Mock handling: section 4. Build order: section 5. Process
decisions taken along the way:

- No master plan; this file is the only plan for P1 and is derived from `CONTEXT.md` and the
  code, not from the website fixtures or the design mocks.
- Mocks are inspiration only; their information structure and types are ignored (section 4).
  Tokens, typography, radius 14 and Kk primitives are binding.
- Cut rule "one page = one concern = one Berechtigung", with the Gruppen-Hub as the one
  ruled exception.
- Gating vocabulary: *affiliated* (derived) for reading, *Gruppen-Admin of this Gruppe*
  (scoped) for the hub's tools, one code-constant key per Verwaltung page.
- Lacking a right hides the affordance, never disables it.
- Contact data hidden by default; hidden never looks like missing.
- Ending anything (Zugehörigkeit, Inhaberschaft, Gruppe) sets an end date and is confirmed in a
  modal; nothing is deleted.
- Routes and navigation as in section 4; no `/admin` prefix, `/manage/*` for the key-gated pages.
- Existing `membership` rows are recreated, not migrated (no production data).
- Website consumers are re-pointed at the schema as the last step, not before.

## Open

- none.

## Owed to later phases

- Schlüssel (inventory + Ausgabe) and the list marker.
- Gruppentermin (term not pinned) and the hub's Termine slot.
- Ehrenmitgliedschaft (entity, conferring, markers) — removed from P1 on 2026-09-11.
- Bildergalerie and the Gruppe detail's Bilder slot.
- Optional JSON seed for Rollen.
- Website consumers (Gruppen list, openness) re-pointed at this schema.
