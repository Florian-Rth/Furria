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

## Amended — 2026-09-22

CA-P6 shipped the club-wide override as an expanding panel inside `/manage/groups`: selecting a
Gruppe fetched `GET manage/groups/{id}` and rendered its Zugehörigkeiten, Gruppen-Admins and
Geschichte through the hub's own `GroupDetailLayout` and dialogs. **That is the scoped back office
this ADR rejected**, built inline instead of at its own route, and it cost the same thing the
rejection named: a second detail surface per Gruppe duplicating the hub's panels.

It was also unnecessary. `CanAdministerGroupAsync` is `IsGroupAdminAsync || IsGranted(GroupsManage)`,
so a key holder already *is* an admin of every Gruppe on the hub — the override was reachable there
the whole time. The panel is deleted, with `GetManagedGroupById` and `ManagedGroupDetails`.

**One surface ends a Zugehörigkeit** — the Gruppe hub — reached by two authorities, the Gruppe's own
Admin and the global key. The consequence above that predicted two surfaces is withdrawn.

`PutGroup` narrowed to match the dividing line: the club writes a Gruppe's **Name** and its
**Gruppenart**; `Description` and `IsRecruiting` are the Gruppe's own record and belong to
`PutGroupInfo`. The Gruppenart assignment stays on both, because `/manage/groups` carries the
*„ohne Gruppenart"* backlog and a page must be able to close the work it reports.

**The cost, accepted:** an archived Gruppe's hub is 404 (`ArchivedOn == null` in the hub query), so
its roster is no longer readable anywhere. The only decision an archived Gruppe carries is
*zurückholen oder nicht*, and the register row states its member count.

## Amended — 2026-09-22 (the register links to the hub)

[ADR-0016](0016-every-write-is-one-of-three-kinds.md) made a row's whole surface the tap target and
banned buttons inside rows. Applied to `/manage/groups`, the register's rows lose *Bearbeiten*,
*Archivieren* and *Admin ernennen*, and the row opens the Gruppe — which, by the amendment above, is
the hub and nothing else. The row's Name already linked there.

The club's acts therefore move **onto the hub**, into a block at its end shown only to a holder of
`groups.manage`: the Name, the Gruppenart, and *Gruppe archivieren*. This is the same reasoning that
withdrew the two-surfaces consequence — a key holder already is an admin of every Gruppe on the hub,
so nothing new becomes reachable. `/manage/groups` keeps what a register is for: the list, the
backlog facets, the search, and creating a Gruppe.

**One named exception.** An archived Gruppe's hub is 404 by the amendment above, so an archived
Gruppe has no screen for its single act to live on. *Zurückholen* stays on the archived row. The
exception is bounded by the same fact that created it: an archived Gruppe carries exactly one
decision, and a row is enough to carry one.
