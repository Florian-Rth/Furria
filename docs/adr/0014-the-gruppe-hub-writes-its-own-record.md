# The Gruppe hub writes its own record

[ADR-0013](0013-read-surfaces-show-what-is-running-the-back-office-holds-the-record.md) ruled that
a read surface shows what is *running* and the back office holds the *record*, including what is
over. Shaping CA-P6 on 2026-09-21 found that applying it to the Gruppe hub breaks the one scoped
resource the model has.

`/manage/groups` is gated on `groups.manage`, a **global** key: holding it means administering
every Gruppe in the club. A Gruppen-Admin does not hold it and must not — her authority is scoped
to the Gruppe she runs, checked by `PermissionAuthorizer.CanAdministerGroupAsync`. So the literal
reading of ADR-0013 leaves her with no surface anywhere in the app that can open or end a
Zugehörigkeit, and the only way to give her one is to grant her every Gruppe.

It is not a hypothetical. `/my-groups/$groupId` has shipped `AddMemberDialog`,
`EndMembershipDialog`, `AddAdminDialog`, `EndAdminDialog` and a `GroupHistoryPanel` since CA-P1 —
before ADR-0013 existed. Applying the rule would delete working, correct functionality.

## The decision

**The dividing line is scope, not surface.**

- **The Gruppe's own record → the Gruppe hub**, including the ended half. Zugehörigkeiten opened
  and ended, Gruppen-Admins appointed and ended, the Gruppe's identity (Beschreibung, Gruppenart,
  Gründungsjahr, Gruppenfarbe, *sucht Mitglieder*), its Trainingsrhythmus, its past.
- **The club's record *about* Gruppen → `/manage/groups`.** Which Gruppen exist at all: create,
  archive, restore, the club-wide override, and the Gruppenarten the club composes.

The club decides which Gruppen exist; each Gruppe runs itself. Nobody asks the Vorstand for
permission to take a new girl into the Minigarde.

**This does not widen ADR-0013.** That rule was bought by CA-P4 ruling 13 — *the Verein hub is
identical for every viewer and is one query* — and a per-viewer affordance is exactly what would
cost it. **The Gruppe hub was never that surface.** `viewerIsAdmin` is already in its payload,
`GroupHistoryPanel` already renders for some viewers and not others, and "Du tanzt hier seit 2019"
is per-viewer by definition. The Gruppe hub belongs in the Kalender's category — an app you work
in — not the Verein hub's.

## Considered and rejected

**Apply ADR-0013 literally.** Consistent, and it keeps one authoring place per domain. Rejected
because the only way to hand a Gruppen-Admin a write surface is then `groups.manage`, which hands
her every Gruppe — a privilege escalation dressed as consistency.

**A scoped back office at `/manage/groups/$groupId`.** Keeps pencils off the hub and still scopes
the rights. Rejected because it produces a second detail surface per Gruppe that duplicates the
hub's panels, and it makes the floor plan's *"scoped rights live in the scope's hub"* a dead
letter — the rule would have exactly zero instances.

## Consequences

- **The Gruppe hub is per-viewer and does not cache like the Verein hub.** Accepted deliberately;
  it already was.
- **Two surfaces can end a Zugehörigkeit** — the hub and the club-wide override. ADR-0013's
  *"which act goes where must stay deliberate"* gets harder here, not easier.
- Every Gruppe-scoped write goes through `CanAdministerGroupAsync`, never through a key.
- Gruppen-Admin remains what `CONTEXT.md` says it is: not a Rolle, not a Berechtigung key, a
  Gruppe-scoped resource.
