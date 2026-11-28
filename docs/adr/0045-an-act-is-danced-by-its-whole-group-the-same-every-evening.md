---
status: accepted
---

# An act is danced by its whole group, the same every evening

The Probenraum grilling of 2026-11-28 removed two flexibilities that RFC 0001 had built: a cast
that differs from the group (single additions, removals, guests from other groups) and evening
variants (an appearance's own cast, spot holders and copy of the choreography). Florian: evenings
are "too niche a complication for a first version", and only group members dance.

## The decision

**An act's cast is always its whole group.** Nobody is added or removed one by one; an act without
a group has no cast. A spot is held by at most one member of the act's group, and a member may hold
none (a trainer, someone injured). A speech by two people belongs to a group of those two or to no
group (*Ablaufpunkt*). The cast is still frozen on Ash Wednesday.

**An appearance is only the act's place in one evening's running order.** Every evening plays the
act's one choreography with its one cast; the planners create appearances in the running order,
and the planner's checks use the group minus the people who answered *Nein* to the evening. The
group's own *Wir tanzen hier* join, evening cast changes, evening spots and evening copies of the
choreography are deleted, with their data.

This amends [ADR-0038](0038-attendance-is-an-add-on-nothing-asks-by-default.md): a training's
Zu-/Absage concerns the group's members — there are no guests from other groups any more.

## Considered and rejected

**Keep cast changes for speeches and music acts only.** Two rules for one concept; the planner's
findings would explain differently per act kind.

**Keep evening variants, hidden behind a menu.** The data model, the running order and every
choreography write would still carry the copy logic for a case no group has needed yet.

## Consequences

Re-introducing either later means new tables and UI, not a toggle. The migration deletes
existing cast changes, evening cast changes, evening spots and evening choreography copies.
