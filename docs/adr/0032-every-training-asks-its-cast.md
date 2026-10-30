# Every training asks its cast

An **attendance response** is switched on per calendar entry by whoever schedules it (decided
2026-09-18). Generated trainings never switch it on, so the dance studio's **open spots** — a
holder's *Absage* to one of the group's trainings — never appeared for regular trainings. And the
children's guard has no accounts: nobody could say for a child that she is not coming. The UI test
of 2026-10-30 (RFC 0002, #53) found both.

## The decision

**A training or rehearsal asks the cast.** A calendar entry of kind *Training* or *Rehearsal*
that a group owns or takes part in asks for an attendance response whenever that group has an act
(not archived) in the session the entry falls into — the session's **relevant** year, so a summer
training belongs to the coming session. The switch on the entry stays what its scheduler chose;
the cast is asked on top of it (`AsksTheCast` beside `AsksForResponse`). The entry **concerns**
everyone in the cast of such an act, a guest from another group included: it is owed on her Start,
she sees it and may answer it.

**A group admin records for her.** A running group admin of the act's group may mark a cast
member present (*Ja*) or absent (*Nein*) on one of the act's coming trainings. The mark is stored
as **her** attendance response, flagged as recorded on behalf and naming who recorded it — there is
one response store, not a second one for children. Whoever answers last wins: her own answer
replaces a mark, a later mark replaces her answer. Every answer is appended to a trail
(`AttendanceResponseChange`), so the training shows both. Withdrawing a mark (the undo of a mark)
removes it from the trail and restores the answer before it, or no answer.

An **open spot** is the spot of a holder whose response for the training is *Nein*, whoever gave
it.

## Considered and rejected

**Switch the response on when the training is generated.** Misses every training scheduled by
hand and every act created after the trainings, and a stored flag outlives an archived act.

**A separate attendance list for children.** Two stores for one question; the evening review,
Start and the studio would each have to merge them.

**Marks that never yield to her answer.** She knows best whether she comes; the mark is a stand-in
for her answer, not an override.

## Consequences

- `attendance_response` gains `is_recorded_on_behalf` and `recorded_by_person_id` (erasure keeps
  the mark, naming nobody); `attendance_response_change` keeps the trail, backfilled from existing
  responses.
- `PUT`/`DELETE /api/acts/{actId}/trainings/{calendarEntryId}/attendance/{personId}` mark and
  withdraw; the act studio lists each training's responses with their trail.
- The calendar reads `asksForResponse || asksTheCast` to offer an answer; the entry form still
  edits only the switch.
