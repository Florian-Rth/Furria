---
rfc: 0008
title: Notify on creation — one push that follows the audience
status: in-progress
github_issue: 91
branch: feat/rfc-91-notify-on-creation
created: 2026-11-16
---

# RFC 0008: Notify on creation — one push that follows the audience

## Summary
Creating a calendar entry or an Aushang offers one toggle, **Benachrichtigen**, on by default. It
sends one push, once, to the people the entry is for — its **audience** — and is the only push on
creation. Who it may reach is bounded by who may choose the audience: a group admin without the
club calendar schedules for her own groups only (never *Verein*), so she can never push every
member, while her entries stay visible to the whole club. The `push.notify_club` permission from
PR #90 goes away. Grilled 2026-11-16; terms: `CONTEXT.md` → *Calendar entry* (**Notifying**,
**A group admin's audience**, **Push**), *Announcement*.

## Motivation
PR #89/#90 (2026-11-15) added an "Alle Mitglieder benachrichtigen" toggle and then gated it by a
new permission, without a design pass. Result:
- **Prod bug:** a new Aushang defaults to notifying, the toggle is hidden for everyone without
  `push.notify_club` (nobody holds it), the hidden `true` is still sent → every new Aushang is
  refused with 403.
- Aushänge silently went from "posting always pushes" to "posters cannot push at all".
- The toggle exists only for the audience *Verein*; a group admin cannot tell her group about a
  new training without a Zu-/Absage.
- Group admins may pick any audience (club, foreign groups, any person), so every push path needs
  its own exception to keep them from reaching all members.
- Three creation pushes (attendance question, chosen people, toggle) overlap; the toggle is shown
  locked on in one case.

## Proposal

### The rule (from the glossary)
| | |
|---|---|
| Offered | on creating a calendar entry or an Aushang; never on edit |
| Default | on, for both |
| Reaches | the audience's people: club → running members; groups → their current members; chosen → those people; Aushang → every member who reads Aushänge. Never the creator, never a paused member, never a cast guest for being in the cast |
| Text | "new entry"; asks to answer when the entry asks for something (Zu-/Absage, poll, sign-up list) |
| Only creation push | asking for a response or choosing people pushes nobody by itself; toggle off = no push |
| Unchanged | push to people **added** to an existing chosen-people entry; moved/deleted push to *Ja*/*Vielleicht*; *Erinnern* (reaches everyone owing an answer, cast guests included) |
| Who may notify | whoever may create it; no separate right |
| UI | label *Benachrichtigen*, line below names the reach: *Alle Mitglieder* · *Mitglieder von Tanzgarde, Showtanz* · *12 ausgewählte Personen*, plus *mit Bitte um Antwort* when it asks |

### A group admin's audience
Who does not manage the club calendar may set as audience only **groups she administers** or
**chosen people from their current members** — never *Verein*. Enforced server-side on create and
update; the editor offers only valid choices. A groups-audience entry stays seen by every member.
Club-calendar managers keep every audience for any owner.

### Data
- Drop `push.notify_club` (constant, checks, web key, role copy) and any role grants of it.
- Migrate group-owned entries with audience *Club* to audience *Groups* of their owner group. On
  prod these are ids 10 and 12 (Die frechen Früchtchen), checked 2026-11-16: no answers, add-ons,
  schedules, albums, borrowed add-ons or queued pushes.

## Phases

### Phase 1 — Aushang posters notify again, no extra permission
Goal: the prod bug is gone; `push.notify_club` no longer exists; Aushang behaviour matches the rule.
- [x] Test first: an Aushang author with `announcements.post` only may notify (push enqueued), and may post without notifying
- [x] Remove the `push.notify_club` check from `AnnouncementService` and `CalendarService` (calendar keeps today's club-only toggle until phase 3, gated by club-calendar management instead)
- [x] Remove `FurriaPermissions.PushNotifyClub` and delete stored role grants of `push.notify_club` in a migration
- [x] Web: drop `pushNotifyClub` from `PERMISSION_KEYS`, permission denials, role copy and roles hub order
- [x] Web: Aushang toggle shown to every author on creation (on by default); calendar toggle shown to club-calendar managers
- [x] Adjust `AnnouncementPushesTests`, `CalendarPushesTests` to the new gate

### Phase 2 — A group admin schedules for her groups only
Goal: server and editor confine a group admin's audience; existing data conforms.
- [ ] Tests first: a group admin without club-calendar rights is refused audience *Verein*, a foreign group, or a person outside her groups — on create and on update; a club-calendar manager is not
- [ ] Server validation in `CalendarService` create/update (audience groups ⊆ administered groups, chosen ⊆ their current members)
- [ ] Data migration: group-owned entries with audience *Club* → audience *Groups* of the owner group
- [ ] Web: audience options without *Verein*, group picker limited to administered groups, people picker limited to their current members, for group admins without club-calendar rights
- [ ] Glossary/UI check: groups-audience entries remain visible to every member

### Phase 3 — One creation push for every audience
Goal: the toggle is the only creation push, reaches exactly the audience, with the reach line.
- [ ] Tests first: toggle on pushes the audience's people only (groups members, chosen people, all members) and never cast guests or the creator; toggle off pushes nobody even with a Zu-/Absage or chosen people; asking entries push "please answer"; adding people on edit still pushes them
- [ ] `CalendarService.Pushes`: creation enqueues one push only when notified — `Announced`, or `AsksForResponse` when the entry asks (Zu-/Absage, poll, sign-up list); drop automatic `AsksForResponse`/`Chosen` on creation; keep `Chosen` on update
- [ ] Delivery: notification reach = audience's people (no cast-guest widening) while *Erinnern* keeps everyone concerned
- [ ] Web: toggle for every audience, on by default, never locked; label *Benachrichtigen* with the reach line (pure function → tested discriminant)
- [ ] Aushang editor uses the same label and reach line
- [ ] Browser check on phone size: create Aushang, club entry, group entry as group admin, chosen-people entry; toggle off/on

## Risks & alternatives
- **Notification fatigue** — toggle on by default for routine trainings; accepted, members can mute
  *Einladungen* / *Aushänge* in their push settings.
- **Group admins lose *Verein*** — a group's party for the whole club must be entered by the club
  calendar; accepted ("for the club" is the club calendar's).
- Rejected: a separate `push.notify_club` right (caused the bug, needs remembering to grant);
  separate per-audience toggles; a "whom to notify" picker apart from the audience; restricting
  only the pushes while leaving the audience open (needs an exception per push path).

## Out of scope
- Changing *Erinnern* rules or the moved/deleted pushes.
- Push settings/topics.
