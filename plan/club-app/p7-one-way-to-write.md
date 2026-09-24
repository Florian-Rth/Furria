---
status: shaped 2026-09-22
phase: CA-P7 — One way to write
shaped_with: Florian, grilling session 2026-09-22
binding: docs/adr/0016 (the ruling this phase implements), docs/adr/0009, docs/adr/0007,
  docs/adr/0013 + docs/adr/0014 (and its 2026-09-22 amendment), docs/adr/0002
supersedes: nothing — this is the first phase that treats writing itself as the subject
---

# CA-P7 — One way to write

Six phases each invented their own way to change something. The result is **five edit paradigms
with no rule connecting any of them to what is being written**: a centred dialog for the two-field
*Gruppe bearbeiten*, an inline panel two thousand pixels down the group hub for the six-field
group profile, an inline row editor that deletes the row it edits in person management, a bottom
sheet for the announcement, and bare controls that commit on change on `/manage/board` and `/profile`.
Five verbs start an edit, eight finish one, six visual weights signal the same act.

This phase builds no feature. It replaces **how every write works** with one system, and it is the
last structural seam before Start.

The review that produced it is worth keeping in one line, because the slices below are ordered by
it: **the app's worst write surface is not the ugliest one, it is the one that looks like it did
nothing.** Tapping *Pflegen* at the top of the group hub opens an editor 2 400 px below on a
phone, without scrolling, while the field being edited stays on screen above it in read mode.

---

## What was ruled on 2026-09-22

1. **A write surface is chosen by the kind of write** —
   [ADR-0016](../../docs/adr/0016-every-write-is-one-of-three-kinds.md). Never by field count,
   never by screen size, never by which feature happens to own it. There are exactly three kinds:
   a **detail write** (a thing's own fields, overwritten, no history), an **entry write** (one
   dated entry in a chain the club never deletes), and a **setting** (one stated value, committed
   on change).
2. **Detail writes and entry writes share one container**: a full-height editor at its own URL.
   `KkScreen` already has it — `kind="fullscreen"` plus `KkScreenActionBar` — and **the app has
   never used either**. Zero call sites for both. This phase is mostly *using what is there*.
3. **Ending is an entry write, not a confirmation.** The six *end* dialogs go; ending a
   membership is filling in its end date in the entry editor, with the consequence line the
   editor already owes.
4. **An entry write carries two things a detail write does not**: the rest of the chain, read-only,
   above the fields, so nobody has to remember what must not overlap; and the consequence line
   pinned directly above the button. Its button names the act, never *Speichern*.
5. **A setting is made visible by the control, not by documentation.** Only a switch or a segmented
   choice may commit instantly. **Anything with a keyboard or a dropdown has a save button.** This
   is the whole readability of the contract, and it is what today's app gets wrong most
   dangerously.
6. **Five words, app-wide.** `Bearbeiten` starts a detail write, `Speichern` commits a change,
   `Hinzufügen` commits a creation, `Abbrechen` leaves, and everything else names its own act.
   *Pflegen*, *Ändern*, *Umbenennen*, *Übernehmen*, *Anlegen*, *Eintragen*, *Aushängen*,
   *Aufnehmen* are retired **as button words** — they survive only where they *are* the act of an
   entry write.
7. **A row carries no buttons.** The whole row is the target and it opens the record it stands for:
   one entry opens that entry's editor, a thing holding several entries opens its own screen
   listing them as rows in turn. This is recursive and has no special cases.
8. **Peek sheets stop carrying write actions.** `HubPeekSheet` becomes *this person, in this
   group* — her group membership and her group admin appointment as rows that open their editors.
9. **The app bar finds, the section header writes.** Search and filter above; creation in the
   section header of the list it fills, always named. `/manage/groups` proved the ambiguity by
   shipping an unlabelled red `+` for *Gruppe anlegen* beside a fully labelled
   *+ Gruppenart anlegen*.
10. **The editor waits for the server.** Then it closes, the page scrolls to what changed, holds it
    lit for about a second, and a strip names what happened. A rejection keeps the editor open with
    the typed values and the reason on top. **The action is never disabled** — pressing it
    unchanged simply closes.
11. **Every exit path runs one check.** Unchanged closes silently; changed asks once; discard means
    discard. No drafts are kept anywhere.
12. **A destructive act never appears on a row.** It sits at the end of the thing's own screen as a
    single quiet danger-toned line, and its confirmation **states the consequence** instead of
    asking whether the person is sure.
13. **Read-only is an absence.** No greyed buttons, no *nur Ansicht* chips. Where the club wants
    the viewer to know who owns the block, that is one quiet line pointing at them.
14. **The group management register links to the hub** — ADR-0014's
    [2026-09-22 amendment](../../docs/adr/0014-the-group-hub-writes-its-own-record.md). Rows lose
    their action cluster, the club's acts move into a block at the end of the hub shown only to a
    holder of `groups.manage`. One named exception: an archived group has no hub, so *Zurückholen*
    stays on its row.
15. **The training generator is not an edit mode.** It is a bulk write with a preview, it already
    works, and it keeps a surface of its own — moved from a sheet to `kind="working"`, not folded
    into the editor.

---

## The editor

One component, `KkWriteScreen`, built on `kind="fullscreen"`:

```
┌────────────────────────┐
│ ✕   ANNIKA ADAM        │  origin: what this belongs to
│     ZEITRAUM ÄNDERN    │  title: what is being done
├────────────────────────┤
│ Bisherige Zeiträume    │  entry writes only:
│  11.01.2009–10.02.2016 │  the chain, read-only
│  01.03.2018 – offen  ◀ │
├────────────────────────┤
│ Mitglied ab            │
│ ┌─── 01.03.2018 ────┐  │  the fields, scrolling
│ Mitglied bis           │
│ ┌─── offen ─────────┐  │
│            ↓           │
├────────────────────────┤
│ ⚡ Ab 2020/21 zählt     │  KkScreenActionBar.context
│   Annika nicht aktiv   │
│ ███ Zeitraum ändern ██ │  .primary — never disabled
└────────────────────────┘
```

The header is fixed, the fields scroll, the action bar is fixed above the keyboard. Because it is a
route, the phone's back gesture closes it, a refresh does not lose it, and focus is restored by
navigating rather than by a timer.

**`KkScreenActionBar` needs one addition to carry this**: `context` exists and is a string; the
consequence line needs a tone so `KkConsequenceNote` can live there. Everything else on the bar is
already the right shape.

---

## The inventory this phase converts

Counted in `web/apps/club-app/src/features` on 2026-09-22.

**15 `KkModalFrame` dialogs.** Nine are detail writes — `CalendarEntryFormDialog`,
`BoardOfficeFormDialog`, `GroupFormDialog`, `GroupKindFormDialog`, `PersonFormDialog`,
`RoleFormDialog`, `SessionRecordFormDialog`, `VenueFormDialog`, `RhythmSlotDialog`. Six are entry
writes — `AddMemberDialog`, `AddAdminDialog`, `PromoteAdminDialog`, `OpenSeatDialog`,
`HandOutKeyDialog`, `AddHolderDialog`.

**20 `KkConfirmDialog` confirmations.** Six are entry writes in disguise and become entry editors:
`EndAdminDialog`, `EndMembershipDialog` (group-hub), `EndMembershipDialog` (manage-persons),
`EndSeatDialog`, `EndHoldingDialog`, `TakeBackKeyDialog`. Twelve are genuine destructive acts and
stay confirmations, moved off their rows: the four Archive/Restore pairs (board office,
group, group kind, venue), the unpaired `ArchiveRoleDialog`, plus `WithdrawAnnouncementDialog`,
`DeleteCalendarEntryDialog` and `DeleteSessionRecordDialog`. **Two are
neither and are untouched** — `PermissionHandoverDialog` and `SelfLockoutDialog` are guards against
locking yourself out of the app, not writes.

**2 inline editors.** `HubCarePanel` (detail write) and `FactEditorFrame` with its three users
`MembershipEditor`, `PauseEditor`, `FeeReductionEditor` (entry writes).

**2 write sheets.** `AnnouncementFormSheet` (detail write) and `TrainingGeneratorSheet` (ruling 15).

**5 peek sheets**, all read-only after this phase: `HubPeekSheet`, `GroupPeekSheet`,
`MemberPeekSheet`, `KeyHoldersSheet`, `RolesSheet`. Only the first carries writes today.

**3 instantly-committing controls.** `ProfileVisibilityPanel` is a switch and **stays** — it passes
all three parts of the test. `RolePermissionRow` is a switch and **stays**: a role's permission set
is a current stance, and nobody asks the date a key was added to it. `BoardOfficeRoleField` is a
**dropdown that grants permissions on change** and becomes a detail write. It is the single most
dangerous control in the app and the only one ruling 5 forces to change.

---

## The slices

**W0 — the chassis.** `KkWriteScreen` in `@furria/ui` on `kind="fullscreen"`: origin, title, the
optional read-only context block, the scrolling field area, `KkScreenActionBar` with the tone on
`context`. The leave-guard as a hook that owns `isDirty` and intercepts every exit path including
the router. `KkNotice` — the success strip, with `role="status"` and `aria-live="polite"`, because
**the app has no save confirmation of any kind today**; `KkShellNotice` is the only live region and
it is not one. The landing highlight as a token, not a per-feature animation. No feature changes,
nothing user-visible, and every later slice is blocked on it.

**W1 — the group hub.** The reference implementation, and first because it carries four of the
five old paradigms on one screen. `HubCarePanel`'s inline editor becomes a detail write at
`/groups/$groupId/edit`; the duplicate *Pflegen* on `HubDescriptionPanel` goes with it and
`HubDescriptionPanel` keeps no action of its own. `RhythmSlotDialog` becomes a detail write.
`AddMemberDialog`, `AddAdminDialog`, `PromoteAdminDialog`, `EndMembershipDialog` and
`EndAdminDialog` become entry writes — five dialogs collapsing into two editors, one per entry
kind. `HubPeekSheet` becomes the person's screen within the group (ruling 8) and loses its
buttons. `sucht Verstärkung` leaves the form and becomes an instant switch on the read surface
(ruling 5). `TrainingGeneratorSheet` moves to `kind="working"`. `useReturnFocus` is deleted here,
not later: its 500 ms `requestAnimationFrame` loop reclaiming focus from `<body>` exists only
because no one owned the lifecycle W0 now owns.

**W2 — person management.** The worst offender for data, because `FactEditorFrame` replaces
the row it edits and takes the values being changed off the screen. `MembershipEditor`,
`PauseEditor` and `FeeReductionEditor` become entry writes with the chain shown above the fields —
which is a straight correctness win, since these are exactly the writes with overlap rules.
`EndMembershipDialog` folds into the membership editor. `PersonFormDialog` becomes a detail
write, which also fixes the clipped *Kontaktdaten für Mitglieder sichtbar* switch that is currently
unreachable on a 390 px phone. `FactEditorFrame` and `use-fact-editor` are deleted.

**W3 — the registers.** `/manage/groups`, `/manage/venues`, `/manage/roles`, `/manage/board`,
`/manage/keys`, `/manage/sessions`, `/manage/persons`. Rows lose their action clusters and become
whole-row targets (ruling 7). Creation moves from the app bar's `KkScreenAction` into the section
header of the list it fills (ruling 9). Archive and restore move off the rows onto the things' own
screens (ruling 12), and `/manage/groups` gains nothing of its own: its rows link to the hub, whose
new *für die Verwaltung* block carries Name, group kind and *Gruppe archivieren* (ruling 14).
`BoardOfficeRoleField` loses its autosave. The `nur Ansicht` chips go (ruling 13).

**W4 — calendar and announcements.** `CalendarEntryFormDialog` — eleven fields in a dialog whose footer
currently covers the *Art* field on a phone — becomes a detail write, which is the change that
makes the calendar usable on the device it is used on. `AnnouncementFormSheet` moves from a sheet
to the same editor. The row actions on both — *Bearbeiten*/*Löschen* and *Ändern*/*Abnehmen* —
resolve under rulings 7 and 12; the calendar row keeps its Zusage/Absage/Vielleicht, which are
settings and pass the test.

**W5 — the rest, and the retirement.** `manage-keys`, `manage-sessions`, `manage-roles` holder
writes. Then delete what nothing uses: `KkModalFrame` and its six parts, the form-dialog wrappers,
and every `use-*-dialogs` hook whose only job was holding `open` state now held by the router.
`KkConfirmDialog` survives — the twelve destructive acts and the two lockout guards still need it.

**W6 — the sweep.** One pass over every remaining string: five button words and nothing else
(ruling 6). One pass over every section header: one weight, one shape. `pnpm shot` over all
converted routes at 390 px, light and dark, with the editors open — the review that started this
phase found three surfaces broken only in a screenshot and none of them in a test.

---

## Deliberately not in this phase

- **Desktop.** Everything here is designed at 390 px. The editor's desktop presentation — a side
  drawer, a centred panel, or the same full screen — is Florian's, later, and nothing in W0 should
  foreclose it.
- **Offline drafts.** Ruling 11 settled discard-means-discard; a draft store is a different
  feature with a different failure mode.
- **Concurrency.** Two group admins editing the same group is last-write-wins today and stays
  that way. The editor is where it would surface, so W0 should not make it *harder*, but nothing
  here defines what it should say. Carried below.
- **Undo.** Considered and rejected in favour of stating consequences before the act. Revisit only
  if the consequence lines turn out not to be enough.
- **The training generator's preview** (ruling 15). It works; it moves container and nothing else.
- **Bulk editing.** No surface in the club needs it yet, and inventing it here would give the
  register rows a second meaning the one-target rule just removed.

---

## Open

- **Concurrency.** Unanswered, deliberately. The question is not technical — it is what the club
  wants a second group admin to be told when her save would overwrite one made four minutes ago.
- **`KkScreenActionBar.context` takes a string.** It needs a tone to carry `KkConsequenceNote`.
  Small, but it is the one change this phase makes to a shipped `@furria/ui` contract, so it is
  named rather than slipped in.
- **The archived-group exception** (ruling 14) is the only row in the app that keeps a button. If
  a second such case appears, the rule is wrong and not the case — revisit rather than add a
  second exception.
- **Whether `Hinzufügen` reads right on a Person.** Ruled by Florian over *Erstellen* and
  *Eintragen*; W6's copy sweep is the moment to look at it in place rather than in a table.
