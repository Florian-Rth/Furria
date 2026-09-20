# A Kalendereintrag carries Mitwirkende Gruppen

A Kalendereintrag has exactly one **Eigentümer** — the club, or one Gruppe — and that single axis
decides two things: who may edit the entry, and who a running entry summons through the Notice
([ADR-0013](0013-read-surfaces-show-what-is-running-the-back-office-holds-the-record.md), floor
plan). A Gruppe hub's dates panel is therefore a filter on `OwnerGroupId`.

Shaping CA-P6 on 2026-09-21 hit the consequence: **the Prunksitzung is club-owned and the Garde
dances at it**, so the biggest date of the Gruppe's year is the one date its own hub does not show.
CA-P6 cut the Auftrittsprofil and the Repertoire, so nothing else in the model links a Gruppe to a
club-owned evening.

## The decision

**Mitwirkende Gruppen is a second, independent axis** — a many-to-many between a Kalendereintrag
and the Gruppen expected there. The Eigentümer is untouched and keeps meaning exactly what it
meant.

**Mitwirken grants nothing.** It never confers the right to edit the entry — the Garde being on
stage does not let its Trainerin move the Prunksitzung — and it never summons the Notice, which
stays the Eigentümer's alone. A Gruppe never lists itself as mitwirkend on an entry it owns;
ownership implies it.

A Gruppe hub's dates panel filters on `Eigentümer = diese Gruppe OR mitwirkend = diese Gruppe`.

## Considered and rejected

**Leave the panel owner-only.** Cheapest, and defensible: club evenings reach members through the
Kalender and the Notice already. Rejected because it makes the Gruppe hub a training schedule
rather than the Gruppe's season, and because the link has to be invented anyway when the Ablauf is
built — at which point every past Veranstaltung needs backfilling.

**Let an entry have several Eigentümer.** One axis, no new concept. Rejected because Eigentümer is
load-bearing for two separate rules that both require a single answer: who may edit, and whom the
Notice summons. Collapsing participation into it makes both ambiguous on the first Veranstaltung
with three Gruppen on stage.

## Consequences

- One join table; the Kalendereintrag form grows a multi-select for whoever schedules a club entry.
- It is the hook the Veranstaltungen phase needs for the Ablauf, recorded a phase early and at a
  fraction of the cost.
- "Wer wird am 14.02. gebraucht" becomes answerable, which is most of what event planning is.
- Two axes that read similarly now exist on one entity, and prose must keep them apart —
  `CONTEXT.md` carries the _Avoid_ list that does it.
