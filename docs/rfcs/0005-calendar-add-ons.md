---
rfc: 0005
title: Calendar add-ons — three kinds, an audience and building blocks instead of entry kinds
status: phases 1–9 built; result views (phases 10–12) open
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
- **Add-ons:** whoever schedules an entry attaches **add-ons** (*Funktionen*): *Zu-/Absage*,
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
- **Funktionen:** each attached add-on is a card configured in place, with a remove button.
  *Funktion hinzufügen* opens a sheet with the five add-ons. Single-use add-ons disappear from the
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
Goal: the new form. Für wen has group and person pickers. *Funktionen* holds Zu-/Absage and
Mitwirkende Gruppen as cards, and the old switch and participating-groups field are gone.
- [x] Für wen chips + group multi-picker + person search picker with *Ganze Gruppe hinzufügen*
- [x] *Funktionen* section: add sheet, cards, remove with confirmation when answers exist
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
- [x] Tables, entity config, migration; schedule and step writes
- [x] Step editor card in the form (time, optional day on multi-day entries, text)
- [x] Timeline on the entry detail
- [x] Integration tests for ordering and multi-day steps

Decisions taken while building phase 6:
- **Storage:** a step is `(day, time, text)`: `day` counts club days (Europe/Berlin) from the
  entry's start day, `time` is a wall-clock `time`. Moving the entry moves its schedule with it.
  Steps are stored as entered and always read sorted by day, time, id.
- **Wire shape:** add-on items become `{ kind, poll, signUpList, daySchedule }`; `daySchedule`
  carries `dayScheduleId`, an optional `title` (≤ 120, blank = none) and 1–50 `steps` of
  `{ stepId, day, time, text }` (text ≤ 120). Schedules and steps travel with the entry write and
  reconcile by id like poll options, so a kept step keeps its id; unknown ids are refused.
- **Days:** a step must lie on a day of the entry (`0 ≤ day <` club days spanned, an open end
  spans one day). The endpoints answer 400, the service guards the same rule (422). Shortening the
  entry past a step's day is refused until the step moves; the form flags it on the day field.
- **No answers, no closing:** removing a schedule asks nothing and drops its steps; the change
  feed reports schedule and step writes as `calendarEntry`.
- **Club app:** the card holds a title and step rows (time, text; a day select appears once the
  entry spans several days), the last step can't be removed. The detail renders the new
  `KkDaySchedule` kit — a time column with a dotted rail — with day headings on multi-day entries.
  `shiftDay` / `daysBetween` moved to `@/lib/day`.

### Phase 7 — Push
Goal: calendar pushes as ruled.
- [x] New entry asking Zu-/Absage → everyone it concerns
- [x] Chosen for a chosen-people entry (on create and when added later) → that person
- [x] Time/place change or deletion → everyone with *Ja* / *Vielleicht*
- [x] Deep link from the push to the entry; tests for the recipient rules

Decisions taken while building phase 7:
- **Two-stage outbox:** a calendar write that should push adds a row to `outbox_calendar_push` in
  the same transaction as the entry (creating an entry now runs in one transaction). The row
  snapshots what is needed after the entry is gone: title, time, venue name, and the entry's
  owner, kind, audience, participating groups and Zu-/Absage. The new `PushDispatcher`
  (*Mitteilungen versenden* on the System page, every 5 s and woken on commit) first expands each
  calendar row, in its own short transaction with no network call, into one `outbox_push` row per
  account. It then sends each `outbox_push` row in its own transaction, as the mail outbox does.
  `outbox_push` is generic: title, body, app path, tag and expiry for one account, removed with
  the account. Both tables retry a failing row after 30 s, 2 min and 10 min, then drop it with a
  warning, so one broken row never blocks the queue. Per-device refusals stay the
  `PushSender`'s (ADR-0036) and are not retried.
- **Recipients come from the canonical `CalendarTies` rules** on the snapshot, never a second SQL
  copy of them:
  - For a new entry asking Zu-/Absage, everyone with an enabled account and a device whose person
    the entry concerns and who sees it.
  - Chosen people and *Ja* / *Vielleicht* answerers are taken at write time, because answers
    vanish with a deleted entry or a removed Zu-/Absage. Every reason still requires sight of the
    entry as written, so someone taken off a chosen-people list is not told it moved or was
    deleted.
  - The person who made the change is never pushed. Rights are looked up only for people the
    entry concerns.
  - Recipients are resolved one person at a time, about 8 queries each. This runs in the
    background, outside any network call. A batched ties query waits until club size makes it
    matter.
- **Only what can still matter:** a new-entry push goes out only before the start; all others
  only until the entry is over (open end = start + 3 h). A queued push whose expiry passed is
  dropped. If an entry is deleted before its push went out, its chosen, asked and moved pushes
  are dropped with it.
- **One push per person per write:** a new chosen-people entry that asks Zu-/Absage sends one
  push. Someone newly chosen in the same edit that moves the entry gets only the chosen push.
  Answers are read only when the edit moves the entry. Attaching Zu-/Absage to an existing entry
  pushes nothing (ruled: only a *new* entry asks).
- **Payload:**
  - Title: the entry title, as *Geändert: …* for a move and *Entfällt: …* for a deletion.
  - Body: German weekday, date, time and venue, followed by *Bitte sag zu oder ab.* or *Du bist
    eingeladen.*
  - `url`: `/calendar/{id}`; a deletion opens `/calendar?day=<day>`.
  - `tag`: `calendar-entry-{id}`, so a later push about the same entry replaces the earlier one.
  - TTL: until the start, clamped to 1 h – 28 days.
- **Ordering** across several API instances is not guaranteed (`SKIP LOCKED`); there is one
  instance.
- **Phase-2 carry-over closed:** the calendar list and the entry detail now also check the
  canonical `ties.Sees` after the SQL pre-filter, so a cast guest without club membership sees a
  group's trainings only in her act's session year, as answering already required. `VisibleTo`
  stays a broader SQL superset of `Sees`.
- **Found on the way:** the audience person, poll vote and sign-up line references to a person
  (phases 2–5) were never classified in `ReferencesToPerson`. They are now *her own*: erased
  with her, and they block absorption, like attendance responses.

### Results — ruled 2026-11-10

An audit of phases 1–7 found that Zu-/Absage shows nobody who answered what. Polls, sign-up lists
and day schedules stay readable after they close, but nothing shows who has not answered, a closed
poll can reopen without notice, and open Funktionen are visible only on the entry itself. Florian
ruled:
- **Zu-/Absage names are visible to everyone who sees the entry**, like named polls. Counts are
  split into *Ja / Vielleicht / Nein*.
- **Organisers** (the people who may edit the entry) also see **who has not answered yet** on each
  Funktion that asks: Zu-/Absage, Umfrage and Eintragsliste.
- **Organisers may remind.** An *Erinnern* action pushes everyone who has not answered. It is manual
  and throttled; nothing reminds automatically.
- **Only the people an entry concerns may answer.** On a *Gruppen* entry, other members still see
  it and its results, but cannot answer, vote or sign up. Organisers may answer as well.
- **Polls can be reopened** explicitly by an organiser. A closed poll never reopens by itself.
- **Open Funktionen show in the calendar list and the group hub**, not on Start.
- Members who left a group do **not** keep its past entries. Poll results stay visible before
  voting.

### Phase 8 — Zu-/Absage results
Goal: everyone who sees the entry sees who answered what, and organisers also see who has not
answered. Zu-/Absage closes when the entry is over.
- [x] Entry detail carries the attendance results: each answer with its person, answer, who recorded it and when; counts for Ja / Vielleicht / Nein
- [x] Organisers also get `notAnswered`: the people the entry concerns, minus those who answered (canonical `CalendarTies`)
- [x] Zu-/Absage closes once the entry is over (open end = start + 3 h); answering after that is refused
- [x] Replace `responseCount` with the split counts on the wire; the form's removal confirm uses the total
- [x] Club app: an attendance result block on the entry detail (counts, names per answer, *Noch offen* for organisers, closed state)
- [x] Bug: an archived participating group no longer blocks editing an entry that already holds it
- [x] Integration tests (who sees names, who sees `notAnswered`, closing); pure-function tests

Decisions taken while building phase 8:
- **One `attendance` object** on every calendar entry that asks: `isClosed`, `yes`, `maybe`, `no`
  in the calendar list; the entry detail adds `answers` (name, answer, recorder's name, time) and,
  for whoever may edit the entry, `notAnswered`. `responseCount` is gone; the group calendar
  dropped it unused.
- **`notAnswered` follows the canonical `CalendarTies.Concerns`.** A superset of candidates (audience
  and cast groups' members, the acts' casts, running club members for a club audience, chosen
  people) is filtered through ties loaded in one batch: `CalendarTiesOfManyAsync` builds the same
  ties for many people in five queries, and `CalendarTiesOfAsync` now delegates to it.
- **Closing** uses `CalendarAddOnClosing.EntryEndOf` (also the push rules' end). The agenda line
  never reopens an answer on a closed entry.
- **Archived participating group:** groups the entry already holds are exempt from the archived
  check, as held audience groups already were.
- **Found on the way:** the phase-7 outbox tables were missing from the change feed's unrelated
  tables, which failed `ChangeFeedCoverageTests`.

### Phase 9 — Only the concerned answer; not answered on polls and lists
Goal: answering follows concern, and polls and lists show organisers who is still missing.
- [x] Answering Zu-/Absage, voting and signing up require that the entry concerns her or that she may edit it (`CalendarTies`); everyone else is refused
- [x] Entry detail: `mayAnswer` per entry; the club app hides the controls when it is false
- [x] Polls and sign-up lists: `notAnswered` for organisers, and an "x von y" count for everyone
- [x] Club app: *Noch offen* on poll and list cards for organisers
- [x] Integration and pure-function tests

Decisions taken while building phase 9:
- **May answer = her dates or may edit.** The rule uses the canonical `CalendarTies.IsHers`
  (concerns her, runs it via the owner or a participating group, or her group takes part in a club
  entry), not bare `Concerns`, so trainers and participating groups keep answering. Withdrawing her
  own sign-up line needs only sight.
- **Concerned count and *Noch offen* come only with the entry detail;** the calendar list carries
  `mayAnswer` only. The concerned people are read once per detail and shared by Zu-/Absage, polls
  and lists. On an anonymous poll, *Noch offen* names who has not voted, never what anyone chose.

### Phase 10 — Lifecycle of polls and lists
Goal: closed means closed, and every close carries a name.
- [x] Moving *Abstimmen bis* / *Eintragen bis* or the entry later never reopens a poll or list that had already closed: the close is stamped
- [x] Polls and lists record who closed them; the detail shows *Beendet von …*
- [x] Organisers can reopen a closed poll (*Wieder öffnen*)
- [x] The poll form freezes the question and the answers once the poll is closed, and the question once votes exist
- [x] A closed poll says its result: the winning answer with its count, a tie stated as a tie
- [x] Integration and pure-function tests

Decisions taken while building phase 10:
- **Closing is stamped on write:** an entry edit stamps `closed_at` on every poll and list that has
  already closed by its deadline or by the entry start (at the moment it closed, no closer), before
  the new values apply. `closed_at` is authoritative afterwards, so moving the deadline or the entry
  later never reopens it. Reads still derive a deadline close without a write.
- **Who closed:** `closed_by_person_id` on `calendar_poll` and `calendar_sign_up_list` (SetNull,
  her act in `ReferencesToPerson`). A close by hand records the closer; the detail sends
  `closedByFirstName` / `closedByLastName`. The cards read *Beendet von …* (poll) and
  *Geschlossen von …* (list, matching its *schließen* action); a deadline close reads without a name.
- **Reopen** (`POST calendar/polls/{pollId}/reopen`, organisers): clears the close and its closer;
  a passed *Abstimmen bis* is cleared with it. Once the entry has started a poll cannot reopen
  (closing at the start is not a deadline that can be dropped), so the server refuses and the
  button is hidden. Lists have no reopen.
- **Frozen polls and lists:** a closed poll or list accepts only an unchanged resubmission or its
  removal (removal still asks first when answers exist); its form fields are read-only. A poll's
  question is frozen once votes exist. A closed list cannot be reopened.
- **Closing by hand after time ran out:** closing a poll or list that had already closed by its
  deadline or by the entry start stamps the moment it closed, without a closer.
- **Result line:** a closed poll with votes states *Ergebnis: … · n Stimmen* or
  *Gleichstand: …, … · je n Stimmen*.

### Phase 11 — Erinnern
Goal: organisers push the people who have not answered.
- [x] `POST` remind per Funktion (Zu-/Absage, Umfrage, Eintragsliste): pushes everyone in `notAnswered` with a device, through the push outbox
- [x] Throttle: one reminder per Funktion every 6 hours; the detail shows when the last one went out
- [x] Payload: *Erinnerung: …*, deep link to the entry, the entry's tag
- [x] CONTEXT.md push ruling updated; integration tests for the recipients and the throttle

Decisions taken while building phase 11:
- **One endpoint:** `POST calendar/entries/{id}/reminders` with `{kind, addOnId}`; `addOnId` is
  the poll or list id and null for Zu-/Absage. Only people who may edit the entry may remind.
  Refused with 422 when the Funktion is closed or nobody but the organiser is still open, 409
  when the last reminder is under six hours old, 404 for a poll or list of another entry.
- **Recipients at expansion time:** the outbox row carries the Funktion (`reminder_kind`,
  `reminder_add_on_id`, its question or title, its closing moment) but no people. The expansion
  takes everyone with a device whose person the entry concerns (canonical `CalendarTies`) and who
  sees it, minus anyone who has answered by then and minus the organiser. A Funktion that was
  removed or closed by hand before the push went out sends nothing; one past its closing moment
  is dropped as not due.
- **Throttle per Funktion:** `calendar_entry.attendance_last_reminded_at`,
  `calendar_poll.last_reminded_at` and `calendar_sign_up_list.last_reminded_at` (migration
  `CalendarReminders`). Organisers get `reminder {lastRemindedAt, remindableFrom}` on each
  Funktion of the detail; everyone else gets null.
- **Payload:** *Erinnerung: <Titel>*; the body is the slot followed by *Bitte sag zu oder ab.*,
  *Bitte stimm ab: <Frage>* or *Bitte trag dich ein: <Liste>*; `/calendar/{id}`, tag
  `calendar-entry-{id}`, TTL until the Funktion closes (1 h – 28 days).
- **Reachable, not just open:** the detail gives organisers `reminder.reachableCount` — open
  people with an enabled account and a device, the organiser left out, the same account rule the
  expansion uses. A reminder nobody could receive is refused (422) and never uses up the six
  hours; no refusal stamps the throttle. Migration `CalendarReminderNamesItsFunction` makes
  `reminder_add_on_id` part of the reminder row check; the expansion drops a reminder row
  without its Funktion.
- **Own tag per reminder:** `calendar-entry-{id}-reminder-{kind}-{addOnId}`, so a reminder never
  replaces a moved/deleted notice or another Funktion's reminder.
- **Club app:** *Erinnern* sits under *Noch offen* on each card and asks "n Personen erinnern?"
  with n = reachable, in the neutral dialog tone. It is disabled while the six hours run (meta
  *Wieder ab HH:MM*, tied to the button via `aria-describedby`) and when nobody open has the app
  (*Niemand mit App*); otherwise the meta reads *Erinnert um HH:MM* (*Erinnert am TT.MM.* on
  another day). A 409 says *Gerade erst erinnert.*
- **Follow-up:** the expansion still looks up rights per recipient account; batching them waits
  until club size makes it matter.

### Phase 12 — Open Funktionen outside the entry
Goal: the calendar list and the group hub show what is open and what she still owes.
- [x] Calendar list and group calendar carry per entry: open poll or list and whether she answered, the attendance counts
- [x] Club app: marks on calendar lines (*Umfrage offen*, *Du fehlst noch*, *Liste offen*)
- [x] Group hub rows link to the entry detail and carry the same marks
- [x] Tests for the mark rules

Decisions taken while building phase 12:
- **`openFunctions`** on every calendar list, detail and group calendar entry: one item per poll or
  sign-up list that is still open, with its id and whether she has voted or holds a line. It is
  derived from the add-ons the read already loads, so no query is added. Closed ones are left out,
  and the list is empty when she may not answer the entry. The group calendar carries one
  `mayAnswer` (already gated by sight); the former `viewerMayAnswer` is gone, and the club app
  derives Zu-/Absage answering from `asksForResponse && mayAnswer`.
- **Marks only for what she still owes:** a line shows *Abstimmen* (poll glyph) or *Eintragen*
  (list glyph) when she may answer and has not; one mark per kind, however many are open. Nothing
  is shown once she answered or when she may not answer — results stay on the entry, and a quiet
  glyph on every line with a Funktion would add noise without a task. The marks sit in the line's
  meta row (after venue and groups), so the line keeps its height and the trailing badge column.
  The wording replaces the RFC's draft labels (*Umfrage offen*, *Du fehlst noch*, *Liste offen*)
  with the action itself.
- **Group hub rows** open the entry detail (`/calendar?day=…&entry=…`) and carry the same marks
  under the meta line (a `marks` slot on `KkFactRow`). The hub's owed count stays Zu-/Absage only.
- **Follow-up:** the group calendar still loads the full poll and list details only to derive
  `openFunctions`; a slimmer read is left for later.

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
- Automatic reminder pushes before an entry (manual *Erinnern* is phase 11).
- Keeping a group's past entries visible to members who left it.
- Templates for recurring club-wide entries.
