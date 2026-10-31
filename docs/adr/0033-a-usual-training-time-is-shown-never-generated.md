# A usual training time is shown, never generated

Since CA-P6 a group stated a **training rhythm** (then `GroupTrainingSlot`: weekday, time, duration,
venue) and a group admin **generated** trainings from it: a preview of every matching date up to
the session's end, ticked and written as a batch of calendar entries. Florian's feedback of
2026-10-31: the difference between a fixed date and a time that is only *usual* is what matters,
and the generator blurred it — fifty identical entries nobody planned, each one claiming to be an
appointment, and a group without generated rows showed nothing at all in the calendar.

## The decision

**Two concepts, never mixed.**

- **Usual training time** (`UsualTrainingTime`, *Übliche Trainingszeit*) — optional, any number per
  group. It is only displayed: `GET /calendar` returns it as `usualTrainings`, one occurrence per
  matching day from today to the window's end, for every running group and every viewer — club
  scope included; a `groupId` filter narrows it to that group (ruled 2026-10-31). Planning a
  training from it stays with the group's admins. It writes no row, asks nobody and summons
  nobody. On a day the group owns a *Training* entry the occurrence is dropped — the real date
  replaces the habit.
- **Training** — a calendar entry of kind *Training*, planned one at a time through the ordinary
  calendar entry editor (`POST /calendar/entries`), prefilled from the group hub (next usual time)
  or from a usual-time hint in the calendar (that day). It is the only thing that is binding: it
  asks the cast (ADR-0032) and carries the act training attendance.

**The calendar draws them apart at a glance.** A training is a solid line in the day's panel; a
usual time is a dashed, transparent row below it with a hollow ring in the group tone — in the
week strip a ring instead of a dot, in the hour view a dashed outline instead of a filled block.
The day head still says *keine Termine* when only a usual time stands there.

## Considered and rejected

**Keep the generator beside the hint.** Two ways to the same rows, and generated rows are exactly
the "binding look-alike" the feedback rejects.

**Store usual occurrences as calendar entries with a flag.** Every surface (Start, owed responses,
venue collisions, the act studio) would have to learn to skip them; one forgotten filter makes a
habit binding again.

**Show usual times only to the group's members and admins.** Florian ruled against it
(2026-10-31): when a group usually trains is club knowledge — who uses the hall when, whom to ask —
and the dashed look already says it binds nobody.

## Consequences

- `POST /groups/{groupId}/trainings/preview` and `POST /groups/{groupId}/trainings` are deleted with
  `TrainingService`, `CalendarService.CreateManyAsync` and `TrainingPreviewState`; the club app
  loses `/groups/$groupId/trainings`.
- `GetCalendarResponse` gains `usualTrainings`; `UsualTrainingService` expands the slots with the
  pure `UsualTrainingTimes.OccurrencesBetween` (wall-clock across DST).
- `/calendar/new` accepts a draft (`group`, `kind`, `start`, `end`, `venue`) besides `day`.
- The old names are gone all the way down: `GroupTrainingSlot` → `UsualTrainingTime`, table
  `group_training_slot` → `usual_training_time` (migration `RenameUsualTrainingTime` renames table,
  keys, indexes and checks in place — no data moves), `PUT /groups/{groupId}/training-slots` →
  `/groups/{groupId}/usual-training-times`, club-app route `/groups/$groupId/usual-training-times/…`.
- *Training planen* from the group hub lands back on the hub after saving; *Planen* from the
  calendar lands in the calendar.
