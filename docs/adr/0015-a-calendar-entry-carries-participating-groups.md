# A calendar entry carries participating groups

A calendar entry has exactly one **owner** — the club, or one group — and that single axis
decides two things: who may edit the entry, and who a running entry summons through the Notice
([ADR-0013](0013-read-surfaces-show-what-is-running-the-back-office-holds-the-record.md), floor
plan). A group hub's dates panel is therefore a filter on `OwnerGroupId`.

Shaping CA-P6 on 2026-09-21 hit the consequence: **the gala session is club-owned and the dance
guard dances at it**, so the biggest date of the group's year is the one date its own hub does not
show. CA-P6 cut the performance profile and the repertoire, so nothing else in the model links a
group to a club-owned evening.

## The decision

**Participating groups is a second, independent axis** — a many-to-many between a calendar entry
and the groups expected there. The owner is untouched and keeps meaning exactly what it meant.

**Participating grants nothing.** It never confers the right to edit the entry — the dance guard
being on stage does not let its trainer move the gala session — and it never summons the Notice,
which stays the owner's alone. A group never lists itself as participating on an entry it owns;
ownership implies it.

A group hub's dates panel filters on `owner = this group OR participating = this group`.

## Considered and rejected

**Leave the panel owner-only.** Cheapest, and defensible: club evenings reach members through the
calendar and the Notice already. Rejected because it makes the group hub a training schedule
rather than the group's season, and because the link has to be invented anyway when the running
order is built — at which point every past event needs backfilling.

**Let an entry have several owners.** One axis, no new concept. Rejected because owner is
load-bearing for two separate rules that both require a single answer: who may edit, and whom the
Notice summons. Collapsing participation into it makes both ambiguous on the first event
with three groups on stage.

## Consequences

- One join table; the calendar-entry form grows a multi-select for whoever schedules a club entry.
- It is the hook the events phase needs for the running order, recorded a phase early and at a
  fraction of the cost.
- "Who is needed on 14 Feb" becomes answerable, which is most of what event planning is.
- Two axes that read similarly now exist on one entity, and prose must keep them apart —
  `CONTEXT.md` carries the _Avoid_ list that does it.
