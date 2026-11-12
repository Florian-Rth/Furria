---
rfc: 0007
title: Aushänge with add-ons, mentions and a push
status: in progress (phases 1–6 done)
github_issue: 80
branch: feat/rfc-80-aushaenge
created: 2026-11-12
---

# RFC 0007: Aushänge with add-ons, mentions and a push

## Summary
An **Aushang** stops being a plain title-and-text notice. Posting one **pushes** every member who
can read Aushänge. Its text is written in the **news text subset with the news editor**, shared,
and may **mention** people, groups, calendar entries, events, Meldungen and albums. It carries
**add-ons** of its own (Zu-/Absage, Umfrage, Eintragsliste) and can **take over** a calendar
entry's add-ons, so members answer them right on the Aushang. Grilled 2026-11-12; decisions:
[ADR-0040](../adr/0040-an-add-on-has-one-host-and-may-be-shown-elsewhere.md); terms:
`CONTEXT.md` → *Announcement*, *Add-on*, *Mention*.

## Motivation
Today an Aushang is a passive notice: nobody learns that it exists unless they open Start or
the club hub, it cannot point at anything, and anything it asks ("who comes?", "who brings
what?") has to be answered elsewhere, or a calendar entry has to be invented just to carry a
poll. The calendar now has add-ons (RFC 0005); the Aushang should use the same pieces, not a
second set of them.

## Proposal

### Push
- Posting an Aushang pushes once to every account that can read Aushänge (`club.read`), except its
  author: title *Neuer Aushang*, body = the Aushang's title, tag per Aushang, URL to the Aushang.
- Editing never pushes; adding an add-on later never pushes; being mentioned never pushes;
  taking over an entry's add-on never pushes.
- Sent through the outbox like the calendar pushes.

### Text and mentions
- The body uses the strict Markdown subset of ADR-0026 (paragraphs, `##`, flat lists, bold,
  external links, mentions) and the same editor, extracted from `features/news` into a shared
  text kit. The **set of mentionable targets is per host**; news keeps its public-only set.
- An Aushang may mention: any **person** a member can look up, any not-archived **group**, a
  **calendar entry** the author can see, an **event**, a published **Meldung**, an **album**.
  Stored in the string and as `announcement_mention` rows (target kind + id), rewritten on save.
- Rendering: a mention is interactive (opens its target) while the target exists and the reader
  can see it; otherwise its label is plain text.
- Existing plain bodies are migrated once: punctuation that would read as markup is escaped.

### Add-ons (ADR-0040)
- Polls, sign-up lists and Zu-/Absage answers get **one host**: `calendar_entry_id` or
  `announcement_id`, exactly one set (check constraint). Classes drop the `Calendar` prefix.
- **Own add-ons** of an Aushang: at most one Zu-/Absage (answers yes / maybe / no to the Aushang),
  any number of Umfragen and Eintragslisten. No Tagesablauf, no Mitwirkende Gruppen.
  - Concern / may answer: every running club member, paused members not.
  - Results: everyone who reads the Aushang (names unless anonymous).
  - Manage (not-answered list, close, reopen polls, remove lines, *Erinnern*): the author or
    `announcements.post`.
  - Closing: the add-on's own time (*Abstimmen bis*, *Eintragen bis*, *Antworten bis*), the end of
    the *Gültig bis* day, or by hand — whichever first. Otherwise open until closed or withdrawn.
    Closed stays closed; only a poll may be reopened (before *Gültig bis* ends).
  - Reminder: same rule as calendar (by hand, ≤ once per add-on per 6 h, while open, pushes only
    the people concerned who have not answered).
- **Taken-over add-ons**: `announcement_borrowed_add_on` rows (announcement, add-on kind + id,
  position). The entry stays the host: its rules decide answering, managing and closing. Only
  entries whose audience is club or groups may lend; the author must see the entry. A deleted
  entry or removed add-on silently drops from the Aushang. Each shows a header naming its entry.
- Own and taken-over add-ons share one order set by the author.
- Withdrawing an Aushang deletes it and its own add-ons with their answers (confirm states how
  many answers are lost); taken-over add-ons stay with their entry.

### Start
- An Aushang's own open add-ons she owes join the ring and *Deine offenen Antworten*, under the
  Aushang's title. A taken-over add-on is listed once, under its entry, never also under the
  Aushang.

## Phases
Each phase leaves the system intact and fits a ~120k-token session.

### Phase 1 — Shared text kit
Goal: the news text model and editor are host-neutral; news behaves exactly as before.
- [x] Backend: split `NewsText` / `NewsInline` / mention parsing into a shared text model whose mention target kinds are given by the host; news passes group + person
- [x] Club app: move `news-text-editor` + mentionables plumbing into a shared text kit with a per-host mentionables source; news uses it unchanged
- [x] Shared renderer for the subset in the club app (used by news reading, ready for Aushänge)
- [x] Existing news tests green; pure tests for the per-host target kinds

### Phase 2 — Aushang text with mentions
Goal: Aushänge are written and read in the subset with the wider mentions.
- [x] Migration: escape existing Aushang bodies into the subset; `announcement_mention` table (kind: person, group, calendar entry, event, news post, album)
- [x] Create/update validate the subset and rewrite mention rows; refusals as for news
- [x] `GET announcements/mentionables` (search across the six kinds, calendar entries limited to the caller's sight)
- [x] Read model carries mentions resolved per reader (interactive or plain)
- [x] Club app: Aushang form uses the shared editor; Aushang screen, club-hub panel and Start render the text and open mention targets
- [x] Integration tests: mention rows, sight fallback, erased person / deleted entry fallback

Decisions taken in phase 2:
- `announcement.body` widened to 8000 in the database so the one-time escape can never overflow; the API still caps the stored text at 4000.
- The escape is frozen as SQL in the migration (also strips NBSP-style indentation, splits Unicode line breaks, escapes mixed rule lines).
- Mention rows keep every parsed target (no per-kind FK); reads drop what is gone or out of the reader's sight.
- Mentionables offer calendar entries and events from 14 days back to 365 days ahead; groups not archived, persons affiliated today, published Meldungen, albums not binned.
- Entry and event mentions open the calendar on that entry (`/calendar?day&entry`), never the edit screen.
- The Aushang list row is no longer one link (mentions are buttons); editors get an edit button.

### Phase 3 — Push on posting
Goal: a new Aushang reaches every reader's phone.
- [x] Outbox push on create to every `club.read` account except the author (title, tag, URL)
- [x] No push on update
- [x] Integration tests: recipients, author excluded, update silent

Decisions taken in phase 3:
- The push lands on a new reading screen `/announcements/{id}` (text, mentions, edit action for editors); the editor moved to `/announcements/{id}/edit`.
- Pushes are written straight into the push outbox in the posting transaction (no staged expansion): recipients are pushable accounts of running members plus `club.read` role/board holders, author excluded.
- An Aushang posted with *Gültig bis* already past pushes nobody; the push lives until the end of the *Gültig bis* day (1 h – 28 days, open-ended 28 days).
- Withdrawing an Aushang drops its undelivered pushes.

### Phase 4 — One host per add-on
Goal: the add-on tables accept an Aushang as host; calendar behaviour unchanged (ADR-0040).
- [x] Rename `CalendarPoll*`, `CalendarSignUp*` to host-neutral classes; tables keep data
- [x] Migration: nullable `announcement_id` on poll, sign-up list and attendance response; `calendar_entry_id` nullable; check constraint exactly one; cascades
- [x] Host abstraction in the services: concern, manage, close time, reminder audience resolved per host (calendar implementation only)
- [x] All calendar add-on tests green

Decisions taken in phase 4:
- Tables renamed too (`poll`, `poll_option`, `poll_vote`, `sign_up_list`, `sign_up_line`) with their sequences, keys, constraints and indexes, by a hand-written rename migration; data kept (migration test).
- Endpoints, requests, DTOs and the `calendarPollVote` / `calendarSignUpLine` change names keep their calendar names: they are the calendar's API and wire contract.
- `AddOnClosing` takes the host's closing time, which may be open (an Aushang without *Gültig bis*); the calendar host closes at the entry start.
- The host seam is `AddOnHost` with `CalendarEntryAddOnHost`; manage, sight/answer, closing and reminder audience switch on it. The add-on row locks still lock only the calendar entry — phase 5 adds the announcement lock (two statements; `FOR SHARE` can't apply to an outer join's nullable side).
- Dropped polls and lists are deleted explicitly: with an optional host key, removing them from the entry would only null the key.
- Phase 5 follow-ups: `attendance_response_change` stays calendar-only, and `ChangedTables` maps poll/list changes to the calendar change.

### Phase 5 — Own add-ons on Aushänge (backend)
Goal: an Aushang carries Zu-/Absage, Umfragen and Eintragslisten through the API.
- [x] Create/update accept add-ons in order (Zu-/Absage ≤ 1, polls, lists); removal with answers needs confirmation as on the calendar
- [x] Announcement host: concern = running members (paused not), manage = author or `announcements.post`, close = own time / end of *Gültig bis* day / by hand
- [x] Answer, vote, sign-up line, close, reopen (poll), remove line, *Erinnern* endpoints for the Aushang host
- [x] Read model: results, *x von y*, not-answered for managers, closed state; withdraw reports the answer count
- [x] Integration tests for each rule above

Decisions taken in phase 5:
- The Aushang's Zu-/Absage lives on the `announcement` row (`attendance_position`, `answers_until`, `attendance_closed_at` / `_by`, `attendance_last_reminded_at`); answers are `attendance_response` rows hosted by the Aushang. Unlike the calendar it can be closed by hand and has its own *Antworten bis*.
- Own endpoints under `announcements/…` (`{id}/response`, `{id}/attendance/close`, `{id}/reminders`, `polls/{id}/votes|close|reopen`, `sign-up-lists/{id}/my-line|close`, `sign-up-lines/{id}`), all behind `club.read`. Poll and list actions reuse the calendar service methods with an `AddOnHostKind`; a poll or list of the other host answers 404 on either route.
- `AnnouncementAddOnKind` (attendance, poll, sign-up list) is its own enum; the read reuses the calendar's poll, sign-up list, answer, person and reminder DTOs so the club app can share the cards.
- Removal confirmation stays client-side as on the calendar; the read carries `answerCount` (answers + voters + lines) for the withdraw confirm. Dropping the Zu-/Absage deletes its answers; a closed Zu-/Absage keeps its *Antworten bis*.
- The Aushang reminder writes its pushes straight into the push outbox (tag `announcement-{id}-reminder-{kind}-{addOnId}`, expiring with the add-on, at most 28 days); withdrawing drops them with the posting push.
- Concern is the running memberships of today without a pause in the current session; role holders who read Aushänge without a membership see the results but cannot answer.
- An edit stamps closings against the *Gültig bis* the Aushang had before the edit: an add-on closed by an expired Aushang stays closed when the date is extended (closed stays closed; a poll can be reopened).
- Removing an add-on also drops its undelivered reminder pushes; the `announcement` row has check constraints keeping the Zu-/Absage columns consistent.

### Phase 6 — Own add-ons on Aushänge (club app)
Goal: members add and answer add-ons on Aushänge in the app.
- [x] Extract the calendar add-on cards, sheet and detail parts so they take a host (calendar unchanged)
- [x] Aushang form: *Funktion hinzufügen* with Zu-/Absage, Umfrage, Eintragsliste and *Antworten bis*
- [x] Aushang screen: answer in place, results, managers' not-answered, close / reopen / *Erinnern*
- [x] Withdraw confirm names the answers lost
- [x] Pure tests for any new logic

Decisions taken in phase 6:
- The shared parts stay in `features/calendar` under their names; the seam is `AddOnHost` (calendar entry or Aushang) in the zod schemas and `AddOnAnswering` (host + may answer). Poll and sign-up list requests pick `/api/calendar/…` or `/api/announcements/…` by host kind; reminder targets carry the host.
- Editor cards take an `AddOnCardsEditor` (update, recheck, error lookup, deadline fallback time) instead of the calendar form; each host's editor hook subscribes to its `addOns` errors once. The *Funktion hinzufügen* sheet and the removal dialog take plain props; `useCalendarAddOns` takes offered kinds, attach, detach and the discarded-answer count.
- Poll reopening takes `reopensUntil` (entry start; end of the *Gültig bis* day; open-ended when the Aushang has none).
- Aushang deadlines (*Antworten bis*, *Abstimmen bis*, *Eintragen bis*) may not lie after the end of the *Gültig bis* day; an empty deadline reads *Solange der Aushang hängt*; a picked day defaults to 20:00.
- The Aushang Zu-/Absage answers through its own mutation (no pending-answer sharing with the calendar board); managers can close it by hand from the reading screen.
- The Aushang list read now also refreshes on `attendanceResponse`, `calendarPollVote` and `calendarSignUpLine` changes, which the server emits for Aushang answers too.
- The removal dialog eyebrow says *Funktion*, not *Baustein*.
- A held deadline left unchanged is never flagged as after *Gültig bis* (a closed add-on cannot change it; the server closes at whichever comes first).
- Poll and list close/reopen also refresh the Aushang read (`announcement` change).

### Phase 7 — Taken-over calendar add-ons
Goal: an Aushang shows and answers a calendar entry's add-ons.
- [ ] Migration: `announcement_borrowed_add_on` (announcement, kind, add-on id, position) sharing the order with own add-ons
- [ ] Rules: only club- or groups-audience entries, author must see the entry; entry/add-on gone → row gone
- [ ] Aushang read carries borrowed add-ons with the entry's results and the reader's right to answer (entry rules); answers go to the entry endpoints
- [ ] Club app: *Aus Kalendereintrag übernehmen* — pick entry, tick its add-ons; header naming the entry on each card
- [ ] Integration tests: lending rule, answering through the entry, view-only for non-concerned readers, drop on delete

### Phase 8 — Aushänge on Start
Goal: owed Aushang add-ons are asked on Start.
- [ ] Start read: Aushänge with own open add-ons she owes (Zu-/Absage unanswered, poll unvoted, list without her line) join the open answers
- [ ] Ring and *Deine offenen Antworten* show them under the Aushang title; borrowed add-ons only under their entry
- [ ] Integration and pure tests

## Risks & alternatives
- **Renaming add-on classes** touches much of the calendar code; phase 4 keeps behaviour fixed and
  only adds the host seam.
- **Club-wide push** on every Aushang could become noisy; editing never pushes, and posting stays a
  board permission.
- Rejected: copying an entry's add-ons (split results), per-host add-on tables (rules built twice),
  a host-neutral add-on set (needless indirection) — see ADR-0040.

## Out of scope
- Group-scoped Aushänge, replies, reactions, read receipts (still rejected).
- Per-topic push settings.
- Tagesablauf or Mitwirkende Gruppen on an Aushang.
