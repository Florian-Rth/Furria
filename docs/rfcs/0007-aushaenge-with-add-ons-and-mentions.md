---
rfc: 0007
title: Aushänge with add-ons, mentions and a push
status: in progress (phases 1–3 done)
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
- [ ] Rename `CalendarPoll*`, `CalendarSignUp*` to host-neutral classes; tables keep data
- [ ] Migration: nullable `announcement_id` on poll, sign-up list and attendance response; `calendar_entry_id` nullable; check constraint exactly one; cascades
- [ ] Host abstraction in the services: concern, manage, close time, reminder audience resolved per host (calendar implementation only)
- [ ] All calendar add-on tests green

### Phase 5 — Own add-ons on Aushänge (backend)
Goal: an Aushang carries Zu-/Absage, Umfragen and Eintragslisten through the API.
- [ ] Create/update accept add-ons in order (Zu-/Absage ≤ 1, polls, lists); removal with answers needs confirmation as on the calendar
- [ ] Announcement host: concern = running members (paused not), manage = author or `announcements.post`, close = own time / end of *Gültig bis* day / by hand
- [ ] Answer, vote, sign-up line, close, reopen (poll), remove line, *Erinnern* endpoints for the Aushang host
- [ ] Read model: results, *x von y*, not-answered for managers, closed state; withdraw reports the answer count
- [ ] Integration tests for each rule above

### Phase 6 — Own add-ons on Aushänge (club app)
Goal: members add and answer add-ons on Aushänge in the app.
- [ ] Extract the calendar add-on cards, sheet and detail parts so they take a host (calendar unchanged)
- [ ] Aushang form: *Funktion hinzufügen* with Zu-/Absage, Umfrage, Eintragsliste and *Antworten bis*
- [ ] Aushang screen: answer in place, results, managers' not-answered, close / reopen / *Erinnern*
- [ ] Withdraw confirm names the answers lost
- [ ] Pure tests for any new logic

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
