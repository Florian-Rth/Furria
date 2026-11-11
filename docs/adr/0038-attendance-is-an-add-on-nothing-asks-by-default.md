---
status: accepted
---

# Attendance is an add-on — nothing asks by default, not even a training

Supersedes [ADR-0032](0032-every-training-asks-its-cast.md). The calendar grilling of 2026-11-10
replaced most calendar entry kinds with **add-ons** the scheduler attaches herself. The
**attendance response** (*Zu-/Absage*) became one of them, and Florian ruled that no entry carries
it unless its scheduler attaches it — a training included.

## The decision

**An entry asks for a response only when its scheduler attached the Zu-/Absage add-on.** Planning a
training attaches nothing on its own. A training without the add-on collects no answers: the
studio shows no **open spots** for it, training mode knows nobody missing and a group admin cannot
mark anyone present or absent.

**Once attached to a training, the add-on still asks the act's cast.** It concerns the whole cast of
the group's act (not archived) in the training's relevant session, a guest from another group
included, and a group admin of the act's group may record an answer on her behalf — the cast rules
of ADR-0032 hold, only the "switch or no switch" is gone.

## Considered and rejected

**Every training asks its cast (ADR-0032).** One kind with hidden behaviour no other entry has; the
add-on model makes every entry work the same way.

**Attached by default on a training, removable.** Florian wants the scheduler to decide every time;
a preset makes trainings different from every other entry again.
