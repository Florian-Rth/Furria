---
rfc: 0005
title: Calendar add-ons — three kinds, an audience and building blocks instead of entry kinds
status: in-progress
github_issue: 70
branch: feat/rfc-70-calendar-add-ons
created: 2026-11-10
---

# RFC 0005: Calendar add-ons — three kinds, an audience and building blocks instead of entry kinds

## Summary

Today the calendar entry form has six kinds (Training, Probe, Auftritt, Sitzung, Feier,
Sonstiges), a visibility (*Gruppenintern / Verein / Öffentlich*), a list of participating groups
and one switch for *Zu-/Absage*. Several labels clash with the club's language, *Öffentlich* does
nothing, and every new need asks for another kind. This RFC changes three things:

- **Kinds:** only **Allgemein** (plain), **Training** and **Ausflug** (trip) remain. Events stay
  in the events workbench.
- **Audience:** a single **Für wen** replaces the visibility. It is *Verein*, *Gruppen* or
  *Ausgewählte Personen*.
- **Add-ons:** whoever schedules an entry attaches **add-ons** (*Bausteine*): *Zu-/Absage*,
  *Umfrage*, *Eintragsliste*, *Mitwirkende Gruppen* and *Tagesablauf*.

Push reaches the people concerned. The domain is fixed in `CONTEXT.md` (**Calendar entry**,
**Add-on**, audience, kinds) and [ADR-0038](../adr/0038-attendance-is-an-add-on-nothing-asks-by-default.md).
The decisions come from the grilling session of 2026-11-10.

## Motivation

- **Kinds were standing in for features.** The members need to:
  - ask a question
  - collect who brings what
  - say who performs
  - plan a long day

  Today each of these needs either a new kind or nothing. With add-ons, members build what they
  need themselves.
- **The labels mislead.** *Sitzung* means the hall evening in carnival, and *Auftritt* now means
  an act at one evening. Neither is what the kinds stood for.
- **The visibility is half dead.** *Öffentlich* has no effect, because only events are public.
  *Gruppenintern* hid group dates from the rest of the club, and Florian wants club and group
  dates visible to everyone. Private things go to chosen people instead.
- **Training was special.** It asked the cast without a switch (ADR-0032). The add-on model makes
  every entry work alike, and ADR-0038 supersedes ADR-0032.

## Proposal

### Kinds

`CalendarEntryKind` becomes `Plain`, `Training`, `Trip` and `Event`:
- `Event` is created only by the events workbench, and the calendar API keeps refusing it.
- Training keeps its ties to the usual training times. A training replaces the hint of its day.
- Trip has no behaviour of its own. It is a label and a glyph.

### Owner and audience

The **owner** stays *the club* or *one group*. Only club-calendar managers and group admins
schedule entries, and an entry never has a person as owner.

The **audience** (`CalendarEntryAudience`) replaces `CalendarEntryVisibility`:

| Audience | Stored as | Seen by | Concerns |
|---|---|---|---|
| `Club` | — | every club member | every running member (paused members excepted, as today) |
| `Groups` | `calendar_entry_audience_group` (≥ 1) | every club member, plus the members and admins of those groups who are no club members | current members of those groups |
| `People` | `calendar_entry_audience_person` (≥ 1) | those people and whoever scheduled it | those people |

- **Who can be chosen:** anyone who may use the app. That is a running club member, or a
  current member or admin of a running group who is no club member. An account is not required,
  so an admin can record an answer for someone without one.
- **Whole group shortcut:** *Ganze Gruppe hinzufügen* copies the group's current members into the
  list once.
- **Removing someone:** she loses sight of the entry, and her answers stay.
- **No club membership:** without `club.read`, the calendar still shows only the entries tied to
  her groups or her person.

### Add-ons

Each add-on is its own table hanging off the entry, with a `position` for its order on the entry.
There is no generic JSON blob, because each add-on has its own rules and tests.

| Add-on | Storage | Cardinality | Rules |
|---|---|---|---|
| **Zu-/Absage** | `AsksForResponse` (kept) + `attendance_response` (as today) | 0..1 | Nothing asks by default. On a training it also concerns the act's cast and takes marks recorded on behalf (ADR-0038). Owed on Start: 14 days before a training, 42 days before anything else |
| **Mitwirkende Gruppen** | `calendar_entry_group` (kept) | 0..1 | Shows the entry in those groups' hubs and on Start as their stage; their acts may join as appearances. Adds no concern |
| **Umfrage** | `calendar_poll`, `calendar_poll_option`, `calendar_poll_vote` | 0..n | Single or multiple choice; optionally anonymous (only counts, even to the scheduler). Votes can change until it closes: at the start, at *Abstimmen bis*, or by hand. Options can be added later; rename or remove an option only while it has no votes. Never on Start |
| **Eintragsliste** | `calendar_sign_up_list`, `calendar_sign_up_line` | 0..n | A title and an optional hint. One short named line per person; she edits or deletes her own until it closes (*Eintragen bis*, the start, or by hand). Editors may remove any line but never rewrite it. No slots. Never on Start |
| **Tagesablauf** | `calendar_day_schedule`, `calendar_day_schedule_step` | 0..n | Steps of time plus a short text, sorted by time; a day appears when the entry spans several days. Never called *Ablauf* |

More rules:
- **Using an add-on:** whoever *sees* the entry may answer, vote and add a line. This is the same
  rule as answering today.
- **Removing an add-on:** taking off an add-on that holds answers or lines asks first, then
  discards them.
- **Events:** an event carries no add-ons.

### Form

One screen, top to bottom:
- Titel
- Art: chips *Allgemein* (preselected), *Training*, *Ausflug*
- Wann
- Ort
- Für wen: chips, then a picker for groups or people
- Eigentümer: only shown when there is a choice
- Beschreibung
- **Bausteine:** each attached add-on is a card configured in place, with a remove button.
  *Baustein hinzufügen* opens a sheet with the five add-ons. Single-use add-ons disappear from the
  sheet once attached.

The entry detail shows the add-ons where people use them: answering, voting and adding a line.

### Push

Over the existing Web Push channel (ADR-0036):
- A new entry that asks for Zu-/Absage notifies everyone it concerns.
- Being chosen for a chosen-people entry notifies the chosen person.
- A change of time or place, or a deletion, notifies everyone who answered *Ja* or *Vielleicht*.

Nothing else pushes: no reminder before the start, and nothing for polls, lists or day schedules.

### Migration of existing entries

| Today | Becomes |
|---|---|
| `Training` | `Training` |
| `Rehearsal`, `Meeting`, `Party`, `Other` | `Plain` |
| `Performance` | `Trip`; its participating groups stay as *Mitwirkende Gruppen* |
| Group-owned entry (any visibility) | Audience `Groups` = the owner group plus its participating groups, so exactly the people it concerned before stay concerned |
| Club-owned entry or event | Audience `Club` |
| `AsksForResponse` | Unchanged; it is the Zu-/Absage add-on |

**Upcoming trainings that asked the cast automatically** get `AsksForResponse = true`, so their
answers, open spots and marks survive. Past trainings keep their answers as record.

## Phases

Each phase leaves the system intact: it builds, its tests pass and nothing is half migrated.
Backend and club app move together inside a phase, because the club app is the API's only
calendar client.

### Phase 1 — Three kinds and optional attendance
Goal: kinds are Plain / Training / Trip / Event. Zu-/Absage only asks when switched on, a training
included. Existing data is migrated.
- [x] Rework `CalendarEntryKind` to Plain, Training, Trip, Event; migration mapping old kinds (Performance → Trip)
- [x] Data migration: upcoming trainings that `AsksTheCast` today get `AsksForResponse = true`
- [x] `CastAttendance` / `CalendarEntryFacts`: the cast is asked only when `AsksForResponse`; marks on behalf only then
- [x] `StartComposer`: owed horizon (Training 14 days, else 42), "on stage" from participating groups instead of Performance
- [x] Studio open spots and training mode read only add-on trainings (no behaviour beyond the rule above)
- [x] Club app: kind chips Allgemein / Training / Ausflug, labels, `KkEntryKindGlyph` (trip glyph, plain glyph), filters, agenda copy
- [x] Integration tests for kinds, cast asking and migration mapping; pure-function tests on the club app

### Phase 2 — Audience (backend)
Goal: the API speaks `audience` instead of `visibility`. Sight, concern and answering follow it.
The club app is adapted to the new contract with its current UI.
- [x] `CalendarEntryAudience` (Club, Groups, People), `calendar_entry_audience_group`, `calendar_entry_audience_person`; drop `Visibility`
- [x] Migration: group-owned → Groups (owner ∪ participating groups), club-owned and events → Club
- [x] `CalendarTies` / `CalendarService`: sight, concern, answering, "her dates", no-`club.read` calendar per CONTEXT
- [x] Choosable people query: running members plus non-member group members and admins of running groups (guards newly chosen people on write; its endpoint lands with the picker in phase 3)
- [x] Post/Put/Get calendar endpoints, group calendar, Start, change feed carry the audience
- [x] Club app schemas and form adapted (Für wen chips Verein / Gruppen = owner group; an existing audience round-trips unchanged)
- [x] Integration tests: sight and concern per audience, chosen-people privacy, no-membership calendar

Decisions taken while building phase 2:
- The cast of an act is asked by a training its group **owns or is the audience of** (CONTEXT), no longer by
  a training it only participates in; studio open spots and training mode read the same set.
- A chosen-people entry stays out of the cast rule, out of *expected*, and runs only via its owner group.
- The group calendar lists entries whose owner, participating or audience groups include the group.
- Archived audience groups and unchoosable people are refused only when newly added; held ones stay.
- Rolling the image back across the audience migration needs the pre-migration dump: the old API
  reads `visibility`, which no longer exists.
- Known, older than this phase: the calendar list shows a cast guest's trainings of any session year
  while answering checks the year; to be aligned with the push work in phase 7 at the latest.

### Phase 3 — Form: Für wen and the add-on frame
Goal: the new form. Für wen has group and person pickers. *Bausteine* holds Zu-/Absage and
Mitwirkende Gruppen as cards, and the old switch and participating-groups field are gone.
- [x] Für wen chips + group multi-picker + person search picker with *Ganze Gruppe hinzufügen*
- [x] *Bausteine* section: add sheet, cards, remove with confirmation when answers exist
- [x] Zu-/Absage card and Mitwirkende Gruppen card replace the switch and the participating-groups field
- [x] API: removing Zu-/Absage discards its answers; clearing participating groups removes their appearances only when they hold no evening changes (else refused, as today)
- [x] Entry detail: audience line, add-on sections in add-on order
- [x] Browser check phone + desktop, light + dark

Decisions taken while building phase 3:
- **Add-on order** is one sequence across all add-ons of an entry. The two kept add-ons store their
  place as `attendance_position` / `participating_groups_position` on `calendar_entry` (check:
  `asks_for_response` ⇔ attendance position set). Post/Put take `addOns` (attached single-use
  add-ons in card order) instead of `asksForResponse`; responses carry `addOns` and `responseCount`.
  Phases 4–6 extend the same order with their own positions.
- **Removing Zu-/Absage** deletes its answers and their change history, so re-attaching starts
  empty. Answering and marking on behalf take a share lock on the entry and re-check that it still
  asks, so no answer lands after the discard.
- **Appearances** only ever hang off events, which the calendar API refuses; clearing participating
  groups there never touches them, so no refusal was needed.
- **Choosable people** come from `GET /api/calendar/choosable-people` (with each person's current
  group memberships for *Ganze Gruppe hinzufügen*); callers must be able to schedule an entry.
  Paused members stay choosable, matching the write guard.
- **Für wen = Gruppen** always lists its groups explicitly (the owner group is preselected); there
  is no implicit owner fallback any more.

### Phase 4 — Umfrage
Goal: polls can be attached, voted on, closed and shown.
- [x] Tables, entity config, migration; write endpoints for options, settings, closing and votes
- [x] Rules: single or multi choice, anonymous counts only, closing (start / *Abstimmen bis* / by hand), option edits only without votes
- [x] Poll card in the form; voting and results on the entry detail
- [x] Change feed domain change for votes
- [x] Integration tests for the rules; pure-function tests for result shaping

Decisions taken while building phase 4:
- **Wire shape:** `addOns` on Post/Put becomes an ordered list of `{ kind, poll }` (poll set iff
  `kind = poll`); responses carry the same list with the poll's details (options with counts,
  `viewerChose`, voters, `voterCount`, `isClosed`). Card order is the list index, shared with
  `attendance_position` / `participating_groups_position`; each poll stores its own `position`.
  The group calendar keeps a plain list of kinds.
- **Options, settings and removal travel with the entry write**, so a new entry can carry its polls
  and the form saves once. A poll left out of `addOns` is deleted with its votes (the form asks
  first). Only voting (`PUT /calendar/polls/{pollId}/votes`, replaces her whole set, `[]` withdraws)
  and closing by hand (`POST /calendar/polls/{pollId}/close`, entry editors only, idempotent) have
  their own endpoints.
- **Locks once votes exist:** an option with votes can't be renamed or removed; anonymity can't be
  lifted; single choice can't be set while someone holds several votes. The question stays
  editable. *Abstimmen bis* may not lie after the entry start (it closes at the earlier of both).
- **Limits:** question ≤ 200, 2–20 options of ≤ 120 characters, labels unique (trimmed,
  case-insensitive).
- **Anonymous** polls still store who voted (she must be able to change her vote); names never
  leave the server.
- **Concurrency:** voting takes the entry `FOR SHARE` (the entry write holds it `FOR UPDATE`) and
  then the poll row `FOR UPDATE`, so a vote never lands beside an option edit and single choice
  holds under parallel taps. Votes reference their option through `(poll_id, option_id)`.
- **Change feed:** `calendar_poll` / `calendar_poll_option` notify `calendarEntry`, votes notify the
  new `calendarPollVote`, which refreshes only the calendar reads (Start and the group calendar carry
  no poll data).
- **Club app:** a tap votes at once; tapping the chosen answer of a single-choice poll again
  withdraws it. *Umfrage beenden* asks first. Anonymous polls say *Anonym* in their meta line. The
  ballot is the new `KkPollBallot` kit (toggle buttons with `aria-pressed`). A held *Abstimmen bis*
  is sent back unchanged unless its day or time was edited. At most 30 add-ons per entry.

### Phase 5 — Eintragsliste
Goal: sign-up lists can be attached, filled and moderated.
- [x] Tables, entity config, migration; endpoints for list settings, own line upsert/delete, moderator removal, closing
- [x] Rules: one line per person, own line only, editors remove never rewrite, closing like polls
- [x] List card in the form; list with own-line editing on the entry detail
- [x] Integration tests for the rules

Decisions taken while building phase 5:
- **Wire shape:** add-on items become `{ kind, poll, signUpList }`; `signUpList` (set iff
  `kind = signUpList`) carries `signUpListId`, `title` (≤ 120), `hint` (≤ 300, blank = none) and
  `signUpUntil` (not after the start). Settings and removal travel with the entry write like
  polls; a list left out of `addOns` is deleted with its lines (the form asks first). Responses
  carry `closedAt`, `isClosed` and the lines in sign-up order, each with `byViewer`.
- **Endpoints:** `PUT` / `DELETE /calendar/sign-up-lists/{id}/my-line` write or withdraw her one
  line while the list is open; `DELETE /calendar/sign-up-lines/{lineId}` lets entry editors remove
  any line, also after closing; `POST /calendar/sign-up-lists/{id}/close` closes by hand
  (idempotent).
- **The line text is optional** (≤ 120, blank = just her name), so a list like *Wer hilft beim
  Aufbau?* needs no text.
- **Closing** shares one rule with polls (`CalendarAddOnClosing`): by hand, at *Eintragen bis*, or
  at the start, whichever comes first.
- **Concurrency:** her line writes take the entry `FOR SHARE` and the list `FOR NO KEY UPDATE`;
  `(sign_up_list_id, person_id)` is unique, so parallel taps leave one line.
- **Change feed:** `calendar_sign_up_list` notifies `calendarEntry`, lines notify the new
  `calendarSignUpLine`, which refreshes only the calendar reads.
- **Moderation runs under the entry lock:** removing a line and closing a list (or a poll) take the
  entry `FOR SHARE` before checking who may edit it, so an owner change can't slip in between.
- **Club app:** the list renders through the new `KkSignUpSheet` kit; her own line is edited in
  place (*Eintragen* / *Ändern* / *Austragen*), editors remove foreign lines and close the list
  after a confirm. Deadline fields (*Abstimmen bis*, *Eintragen bis*) share one module, and the
  poll and list close/remove confirms share one dialog.

### Phase 6 — Tagesablauf
Goal: day schedules can be attached and are shown on the entry.
- [ ] Tables, entity config, migration; schedule and step writes
- [ ] Step editor card in the form (time, optional day on multi-day entries, text)
- [ ] Timeline on the entry detail
- [ ] Integration tests for ordering and multi-day steps

### Phase 7 — Push
Goal: calendar pushes as ruled.
- [ ] New entry asking Zu-/Absage → everyone it concerns
- [ ] Chosen for a chosen-people entry (on create and when added later) → that person
- [ ] Time/place change or deletion → everyone with *Ja* / *Vielleicht*
- [ ] Deep link from the push to the entry; tests for the recipient rules

## Risks & alternatives

- **Going live on 2026-11-11.** Real entries may exist by the time phase 1 lands. The migrations
  map every old value, and upcoming trainings keep asking their cast.
- **Visibility removal touches many reads.** About 13 files read `Visibility` and 21 read
  participating groups. Phase 2 is the largest. If it overruns, split it into "audience
  storage + migration" and "sight and concern rules".
- **Rejected: a generic poll as attendance.** Start, open spots and marks need fixed meaning.
- **Rejected: training asks by default.** Florian ruled that nothing is attached by default
  (ADR-0038).
- **Rejected: one JSON add-on column.** Each add-on has its own rules and queries (who voted, own
  line), so each gets typed tables.
- **Rejected: personal entries owned by a member.** The calendar is the club's.

## Out of scope

- Add-ons on events.
- Rides (*Mitfahrgelegenheit*), photos per entry, documents, a helper rota with slots, cost
  shares, packing checklists. Candidates for later RFCs; cost shares need their own grilling
  because of money.
- Reminder pushes before an entry.
- Templates for recurring club-wide entries.
