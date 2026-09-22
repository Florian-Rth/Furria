# Every write is one of three kinds, and each kind has one surface

By the end of CA-P6 the Club-App had **five edit paradigms** and no rule connecting any of them to
what was being written: a centred dialog for the two-field *Gruppe bearbeiten*, an inline panel
editor two thousand pixels down the Gruppe hub for the six-field Steckbrief, an inline row editor
that deleted the row it was editing in the Personenverwaltung, a bottom sheet for the Aushang, and
bare always-live controls that committed on change on `/manage/board` and `/profile`. Five verbs
started an edit (*Pflegen, Bearbeiten, Ändern, Umbenennen*, and nothing at all on the Rollen cards),
eight finished one, and six different visual weights signalled the same act. Decided with Florian on
2026-09-22 after a review of every write surface in the app.

## The decision

**A write surface is chosen by the kind of write, never by the field count, the screen size or the
feature that happens to own it.** There are exactly three kinds.

**A detail write** changes a thing's own fields. It overwrites; no history is kept. The Gruppe's
Steckbrief, a Person's Stammdaten, an Ort, a Rolle, an Aushang, a Kalendereintrag, a Sessionseintrag.

**An entry write** opens or closes **one dated entry** in a chain the club never deletes. A
Mitgliedschaft, a Ruhezeit, a Beitragsermäßigung, a Zugehörigkeit, a Gruppen-Admin-Ernennung, a Sitz,
eine Schlüsselübergabe, eine Inhaberschaft. **Ending is an entry write**, not a separate
confirmation — the separate *beenden* dialogs are retired.

**A setting** is one stated value, flipped instantly, with no save button. It qualifies only when all
three hold: it is a single value with no companion decision; flipping it back restores the world
exactly; and it states a current stance nobody will later ask the date of.

### The surface

**A detail write and an entry write use the same container: a full-height editor at its own URL.**
`KkScreen` already has it and the app has never used it — `kind="fullscreen"` and
`KkScreenActionBar` both had zero call sites. Fixed header naming what is being changed, the fields
scrolling between, the action fixed at the bottom above the keyboard. Because it is a route, the
phone's back gesture closes it and a refresh does not lose it.

An entry write carries two things a detail write does not: **the rest of the chain, read-only, above
the fields**, so the person can see what must not overlap; and **the consequence line pinned directly
above the button**, in the club's words. Its button names the act — *Zeitraum ändern*,
*Mitgliedschaft beenden*, *Mitglied aufnehmen* — never *Speichern*.

**A setting has no surface at all.** It commits on change, and it is made visible by a hard rule:
**only a switch or a segmented choice may commit instantly. Anything with a keyboard or a dropdown
has a save button.** This is what makes the contract readable without documentation.

### The vocabulary

Five words, app-wide. **Bearbeiten** starts every detail write. **Speichern** commits every change to
something that already exists. **Hinzufügen** commits the creation of a new record. **Abbrechen**
leaves. Everything else — entry writes and destructive acts — names its own act. *Pflegen*, *Ändern*,
*Umbenennen*, *Übernehmen*, *Anlegen*, *Eintragen*, *Aushängen*, *Aufnehmen* are retired as button
words, except where they *are* the act of an entry write.

One weight, app-wide. `Bearbeiten` and `+ <Ding>` are small pills in the section header of the block
they act on. **A row carries no buttons.** The whole row is the target, and it opens the record it
stands for: one entry opens that entry's editor, a thing holding several entries opens its own screen
listing them as rows in turn. Peek sheets become that screen and stop carrying write actions.

**Creation lives in the section header of the list it fills, and says what it makes.** The app bar's
action area is for acting on the screen as a whole with no block of its own — search and filter. It
carries no create: `/manage/groups` proved the ambiguity by shipping an unlabelled red *+* for
*Gruppe anlegen* beside a fully labelled *+ Gruppenart anlegen*.

### Committing and leaving

The editor **waits** for the server, then closes, scrolls the record to the row or block that
changed, holds it highlighted for about a second and names what happened in a short strip. A
rejection keeps the editor open with the typed values and the reason at the top. **The action is
never disabled** — pressing it unchanged simply closes, so nothing is ever greyed out without an
explanation. Every exit path — the X, the back gesture, a swipe — runs the same check: unchanged
closes silently, changed asks once, and discard means discard. No drafts are kept.

**A destructive act never appears on a row.** It sits at the end of the thing's own screen as a single
quiet danger-toned line, and its confirmation states what happens to the record rather than asking
whether the person is sure — the same consequence line the entry editor carries, used twice.

**Read-only is an absence.** No greyed buttons, no *nur Ansicht* chips. Where the club wants the
viewer to know who does own the block, that is one quiet line under the section header pointing at
them — which a badge could never do.

## Considered and rejected

**Classify by field count or viewport.** Mechanical and predictable to implement. Rejected because
the correlation in the shipped app ran backwards — two fields got a modal, six got an inline panel —
and because the same act would then feel different on a phone than on a desktop.

**Classify by scope of authority**, following ADR-0013: scoped surfaces write one way, the back
office another. Rejected because a Person's Stammdaten and a Gruppe's Steckbrief are the same act and
would land on opposite sides of the line.

**Keep the per-surface verbs and fix only the weight** — a Gruppe *gepflegt*, an Ort *bearbeitet*.
Warmer copy. Rejected because recognition over recall is the whole point: five words for one act is
five things to relearn in every corner of the app.

**Let a single value commit instantly whenever it is one field, whatever the control.** Fewest taps.
Rejected because it is precisely today's failure: the dropdown on `/manage/board` that grants
permissions commits on change and is visually identical to a dropdown inside a form that does not.

**Keep drafts instead of asking before discard.** Nothing would ever be lost. Rejected because a
draft and the record then quietly disagree, and a forgotten draft can be saved by mistake weeks
later.

## Consequences

- **`sucht Verstärkung` leaves the Gruppe's detail write** and becomes an instant switch on the read
  surface; **the Vorstandsfunktion's *zieht nach sich* dropdown loses its autosave** and becomes a
  detail write. Those are the two changes this rule forces on shipped behaviour.
- **The success strip is a new primitive.** The app has no toast, snackbar or save confirmation today
  — `KkShellNotice` is the only live region and it is not one. It must announce politely for a
  screen reader, which is also what the disabled-button reasons never did.
- **`isDirty` becomes a requirement of the editor, not a per-feature nicety.** It exists in exactly
  one hook in the app today and is used only to grey out a button.
- **`useReturnFocus` should disappear.** Its 500 ms `requestAnimationFrame` loop reclaiming focus
  from `<body>` is a patch on a lifecycle nobody owned; a routed editor restores focus by navigating.
- **Peek sheets lose their write actions.** `HubPeekSheet` becomes the person's screen within the
  Gruppe, listing her Zugehörigkeit and her Gruppen-Admin-Ernennung as rows that open their editors.
- **The design language is unchanged.** Nothing here touches tokens, typography or the primitives —
  `KkPanelSection`'s action slot, `KkConsequenceNote` and `KkScreenActionBar` are the pattern; they
  were simply used six ways or not at all.
