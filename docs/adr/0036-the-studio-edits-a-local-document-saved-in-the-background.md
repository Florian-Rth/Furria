# The studio edits a local document, saved in the background

Until RFC 0003 every studio edit was an API write, and undo sent a hand-written inverse write (about 30
write kinds, id remapping after re-creation, ~1.4k lines). On touch that means waiting on the network
for every nudge and an undo that can fail. Decided 2026-11-02 (grilling for RFC 0003).

## The decision

- **Edits change a local studio document** (immer, with patches). They apply instantly; **undo and
  redo are local** to the visit and instant, **one entry per gesture** (a whole drag, trim or preset;
  repeated nudges merge).
- **Autosave, never a save button.** Changes go out through the save port when a gesture ends (after
  ~0.8 s of quiet) and at once when the studio is left or the app goes to the background; the bar shows
  *Gespeichert* / *Speichert…* / *Nicht gespeichert – erneut versuchen*. Undoing something already
  saved simply saves new forward changes.
- **The server API stays as it is.** Changes are sent through the existing write endpoints; the
  choreography's per-spot/per-keyframe merge already refuses only true conflicts. On such a refusal the
  client fetches the newer state and replays its pending changes on top — **the active edit wins** on
  the same item, with a quiet note; the other person's change survives in the saved **versions**.
- **Outside the document** (direct server actions, not undoable): uploads, adopting a final file,
  restoring a version, deleting media. After them the document reloads; undo entries that no longer
  apply are dropped with a quiet note.
- Saved **versions** remain the long-term history, separate from undo.

## Considered and rejected

- **A versioned server document** (one endpoint for the whole studio): simpler sync, but a migration and
  backend rewrite for no user-visible gain today.
- **Yjs live collaboration:** two people editing one act at the same moment is rare in a dance group;
  it needs a sync relay and moves the data model into Y types.
- **Soft locks** (*Lena bearbeitet gerade*): block people and need server presence.
