---
rfc: 0009
title: Archiving closes a person out in one act
status: done
github_issue: 95
branch: feat/rfc-95-archive-closes-out
created: 2026-11-19
---

# RFC 0009: Archiving closes a person out in one act

## Summary
*Person archivieren* stops refusing while something runs. One confirmation ends every running tie
of the person — membership, group memberships, group admin tenures, role holdings, board seats,
key holdings — on one **Letzter Tag** the archiver picks (default yesterday), cuts her membership
pauses at that day, and **deletes** what has not begun yet. The dialog names everything it ends and
everything it deletes. *Personen verwalten* alone suffices. Restoring reopens nothing. Grilled
2026-11-19; terms: `CONTEXT.md` → *Archived person* (reverses the 2026-10-07 ruling "archiving
ends nothing").

## Motivation
Today archiving a former member takes a trip through every panel first: end the membership, leave
each group, end roles, admin tenures, board seats and keys — some of them only reachable with
other permissions — and only then does the foot of her screen offer *Person archivieren*. Until
then it shows *Archivieren geht erst, wenn nichts mehr läuft. Läuft noch: …*. A manager wants to
open the person, press archive, confirm with a date and be done.

## Proposal

### The rule (from the glossary)
| | |
|---|---|
| Where | foot of the person's screen (`/manage/persons/$personId`), as today; one person at a time |
| Who | `persons.manage` — ends roles, board seats, keys too, whatever key they otherwise need |
| Ends | every tie not yet ended that has begun: membership, group memberships, group admin tenures, role holdings, board seats, key holdings — also those whose group/role/office is archived (otherwise restoring that parent would lift her archive again) — and those already ending later |
| On | one **Letzter Tag** (inclusive): default yesterday, at most yesterday, at least the latest start among the ties it ends |
| Pauses | a membership pause reaching past the last day's session is cut to it; one lying wholly in a later session is deleted |
| Deletes | every tie dated to begin today or later (membership included) and every pause lying wholly after the last day |
| Untouched | fee reductions; her account; ended history |
| Restore | lifts the archive only — nothing ended or deleted comes back |
| Atomic | one request, one transaction: all ends + deletes + archive mark, or nothing |

### Dialog
```
PERSON ARCHIVIEREN
Max Mustermann archivieren?
Die Person verschwindet aus dem Register und aus jeder Auswahl.

Letzter Tag   [ 18.11.2026 ]
              Frühestens 16. Nov. – Gruppe Garde begann da   (only when that limit binds)

Endet am 18. Nov.
  Mitgliedschaft · Ruhezeit 2026/27 (gekürzt)
  Gruppe Garde · Rolle Kassenprüfer · Vorstandssitz Kassierer · Schlüssel Vereinsheim

Wird gelöscht – hat noch nicht begonnen
  Gruppe Prinzengarde ab 1. Dez. · Ruhezeit 2027/28

Wiederherstellen öffnet nichts davon wieder.
                                   [Abbrechen]  [Archivieren]
```
- Nothing running and nothing ahead → no date field, no lists (today's dialog).
- Only things ahead → no date field, only the delete list.
- The *Archivieren geht erst …* note is gone.

### API
`PUT manage/persons/{personId}/archived` `{ isArchived, lastDay? }`
- `lastDay` (ISO day) is required when archiving a person with a begun, unended tie; refused
  (validation) otherwise when out of range: after yesterday → *Der letzte Tag ist spätestens
  gestern.*; before the latest start → *Der letzte Tag liegt vor dem Beginn von Gruppe Garde.*
- Restoring ignores `lastDay`. Idempotence stays (archiving an archived person changes nothing).
- The 409 *Archivieren geht erst …* refusal is removed.

### Decisions recorded (technical)
- **The client derives the dialog's lists** from `PersonDetails` with one pure function
  (`toArchivePlan`), mirroring the server's own derivation — the existing pattern of
  `toRunningTies`. The server is the authority and validates `lastDay`; no preview endpoint.
- **Ties under an archived parent are ended too**, so restoring that group/role/office never
  lifts her archive by an open tie.
- **The close-out writes rows directly** in `PersonArchiveService` (one `SaveChanges`), reusing
  `MembershipService`'s pause clamping as a shared pure helper; the per-tie services' extra
  checks (e.g. *MaySeatIntoOffice*) do not apply — ruling: person management suffices.
- **A tie starting today counts as not yet begun** and is deleted: the last day is at most
  yesterday, so it could never be ended on or after its own start. The client mirrors this
  (begun = start before today).
- **Two refusal paths:** a last day of today or later fails the request validator (400, field
  `lastDay`); a missing last day or one before the latest start is refused by the service (422,
  *Der letzte Tag fehlt – es läuft noch etwas.* / *Der letzte Tag liegt vor dem Beginn von …*).

## Phases
Each phase leaves the system intact (builds, tests pass).

### Phase 1 — Backend: the archive closes her out
Goal: `PUT …/archived` with `lastDay` ends, cuts and deletes in one transaction; no more 409.
- [x] `PutPersonArchivedRequest.LastDay` (`DateOnly?`) + `PersonArchiveCommand.LastDay`; validator: not after yesterday (club clock)
- [x] `PersonArchiveService.ArchiveAsync`: load her unended ties (all six kinds, archived parents included) + memberships with pauses; split begun vs ahead (start ≥ today, see decisions)
- [x] Refuse (validation) when a begun tie exists and `lastDay` is missing, or `lastDay` < latest begun start — message names the tie
- [x] End begun ties on `lastDay` (membership `EndedOn`, `LeftOn`, `UntilOn`s); cut pauses past the last day's session, delete pauses wholly after it (extract the clamp from `MembershipService` into a shared pure helper)
- [x] Delete every tie dated ahead; set `ArchivedOn`/`ArchivedByPersonId`; one `SaveChanges`
- [x] Remove the running-ties refusal + its strings; update `PersonExpectations`/test helpers
- [x] Integration tests (`PutPersonArchived`): ends all six kinds on the day; archived-parent tie ended; ahead ties + later pauses deleted; open pause cut; fee reduction untouched; lastDay today/after → 400; lastDay before a start → 400; missing lastDay with running tie → 400; nothing running → no lastDay needed; restore reopens nothing; holder of `persons.manage` only can end a board seat/key
- [x] `dotnet csharpier format .` + `dotnet build` (zero warnings) + the touched test classes

### Phase 2 — Club app: the archive dialog
Goal: the foot always offers *Person archivieren*; the dialog shows Letzter Tag + end/delete lists and sends `lastDay`.
- [x] Check `PersonDetails` carries what the plan needs (ties ahead, ties under archived parents, starts, pauses); extend the person-details response + schema if not — added `unendedTiesUnderArchivedParents` (kind, name, sinceOn)
- [x] Pure `toArchivePlan(person, todayIsoDay, lastDay)` in `person-archive.ts` → `{ ends, deletes, earliestLastDay, limitingTie }`; unit tests for the derivation (ahead vs begun, pause cut vs delete, earliest day)
- [x] `PersonArchiveFoot`: drop the blocked note → always `PersonArchiveLine` (or restore)
- [x] `PersonArchiveLine`: `KkConfirmDialog` with a `KkDateField` *Letzter Tag* in `fields` (default yesterday, min/max, *Frühestens …* hint), lists in `consequence`, the restore line; hidden date field / lists per the empty cases
- [x] `use-person-archive` + `requests.ts`: send `lastDay`; surface server validation in the dialog's `error`
- [x] Remove `toArchiveBlockedLine` and dead copy; adapt `person-archive.test.ts`
- [x] `pnpm lint` + club-app typecheck + affected tests; browser check of the dialog (phone 420×740, light/dark) on a seeded person with every tie kind

## Risks & alternatives
- **Deleting a membership dated ahead deletes its admission record** with it — accepted: an
  admission that never took effect is exactly the "never ran" case; the dialog names it.
- **Wider reach of `persons.manage`** (board seats, keys) — accepted, same as *Person löschen*; the
  dialog names every tie, and the board/key screens show the end.
- Rejected: ending only the membership (B) — the other ties would still force the panel trip.
- Rejected: keys still block — the club wants one act; the return of a key is recorded by the end.
- Rejected: blocking on ties ahead — a planned tie for someone being archived is a leftover.
- Rejected: restore reopening what archive ended — wrong for returners, needs stored provenance.
- Rejected: archive button in the header — stays at the foot, beside *Person löschen*.

## Out of scope
- Archiving in bulk or from the register list (still one person at a time on her screen).
- Any change to deletion, restoring, account handling or fee reductions.
