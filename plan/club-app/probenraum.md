# Probenraum — rough page plan

Status: agreed 2026-11-27, grilled 2026-11-28 → RFC 0013 (docs/rfcs/0013-probenraum.md), ADR-0045, ADR-0046.
Design canvas: https://claude.ai/artifact/ALcwaPM5nyNTC4zM64AciQ

## Goal

The dance studio becomes the **Probenraum** (Beta). Members never deal with "Sessionsauftritte" as a
data type: a group's dance for the season simply is there, reached from the group hub. First version
stays simple — no "Weiterführen" (follow-on copy into the next session).

## Entry points

- **Group hub:** one slim neutral row per dance of the relevant session ("Probenraum · 26/27", Beta chip,
  dance name, "Platz 7 · 14 Schritte · 3 Videos", info button → explanation sheet). Empty season:
  compact "Noch leer" row; admin gets "Neu anlegen". Below it a quiet "Frühere Sessionen" list
  (replaces `/groups/$groupId/acts`).
- **Start tile "Üben":** unchanged target (practice).

## Page map

```
Probenraum /acts/$actId          Landing (done: stage loop, Üben, Training + next-performance tiles, Schritte row)
├─ practice                      Üben — one version of the dance for everyone (no evening variants in v1)
├─ steps                         NEW: step list by parts + step sheet ("Ab hier üben"); no timeline
└─ ✎ editors only (pencil)
   ├─ edit                       THE editor: the growing song chain on the shared timeline; every tool acts at
   │                             the centred "now" line (+ Song, crop, split steps, formation, video, swap)
   │                             — sheets are child routes (edit/songs/new, edit/songs/$songId, …)
   └─ settings                   Name, Plätze (spot holders, "Darf bearbeiten"), archive
```

## Route changes

| Today | Plan |
|---|---|
| `/acts/$actId` | keep (new landing) |
| `/acts/$actId/practice` | keep |
| `/acts/$actId/evenings/$eventId/practice` | **delete** (no evenings in v1) |
| `/acts/$actId/edit` | keep |
| `/acts/$actId/evenings/$eventId/edit` | **delete** |
| `/acts/$actId/music` + `/videos` | **merge** into the editor (song + video sheets) |
| `/acts/$actId/steps/setup` | **delete** — steps are made in the editor at the now line |
| `/acts/$actId/training` + `/trainings/$trainingId` | **delete** — hall mode gone; Üben in Vollbild covers the group view, absences stay in the calendar |
| `/acts/$actId/details` (+ index) | **delete** — counts on landing, rest to settings |
| `/acts/$actId/details/settings` | keep as `/acts/$actId/settings` |
| `/acts/$actId/details/evenings/$eventId` | **delete** (no evenings in v1) |
| `/acts/$actId/details/trainings/$trainingId/roll` | **move** to calendar attendance |
| `/acts` (planners' catalogue) | **move** out of the Probenraum, next to the running order |
| `/groups/$groupId/acts` | **merge** into group hub ("Frühere Sessionen") |
| — | **add** `/acts/$actId/steps` |

## Data / domain changes

- **Hall mode removed** (`HallBody`, `KkHall`, hall absences/count). Üben's "Mehr" sheet has no "Gruppentraining" entry.

- **No evenings in v1** (Florian 2026-11-27: "too niche a complication for a first version"): drop the
  per-evening choreography copy (`Put/Delete/RestoreActEveningChoreography`, evening versions) and the
  per-evening cast (who is out, stand-ins). The dance has one cast and one choreography. The landing's
  next-performance tile (date + running-order number from the Ablauf) stays — it is plain running-order info.
- **Music is one chain of songs** (ADR-0046): add, remove, reorder, crop, split, replace; no final file.
- **Co-editors:** a toggle per group member in settings; no own section.
- **Wishes** (running-order inputs): move to the planners' running-order screen.
- **Readiness badges, parts' main video, drift flags:** editor-only, never in member views.
- **Two version histories → one** (the editor's saved versions).
- **Practice resume on the server** instead of `practice-memory` localStorage, so "Üben ab Schritt N"
  follows the person across devices.
- **UI copy:** "Sessionsauftritt" leaves member-facing copy; never "Stück" — the dance's name is used.
  CONTEXT.md needs the matching amendment.

## Editor concept (agreed 2026-11-27)

The dance is built during the season, song by song, while the group already trains the first steps. The
editor is made for exactly this — mobile first, around the shared centred-"now" timeline.

- **The editor is the growing timeline.** One screen; every action works at the now line (move the music
  under it, press a button). No handles, no wizard, nothing is ever "done"; what exists is usable for Üben.
- **The dance is a chain of songs**, each cropped (start/end), ending in a "+ Song" block.
- **Context tools** for what is under the line: step → Teilen · Aufstellung · ⋯ (Name, Tauschen,
  Zusammenlegen, Löschen); music without steps → "Schritt beginnt hier"; song → Zuschneiden · Ersetzen ·
  Verschieben · Entfernen; "+ Song" → Song hinzufügen.
- **Steps stick to their music:** re-cropping moves a song's steps along; a step whose music is cut away is
  marked for editors, never deleted silently. "Tauschen" swaps step content, the music stays.
- **Videos:** partial training videos are placed by sound; per step the newest covering video wins.
- **Members** see the dance up to the last existing step.
- **Tablet (landscape):** left two thirds = big stage (video swaps in) + wider shared timeline + transport with
  time readout; right third = a panel with the video, the context caption and every action inline (no sheets:
  step menu, formation tools, crop values all live in the panel). Portrait uses the phone frame.

## New dance and earlier seasons (designed 2026-11-27)

- **Neu anlegen** (group admins, hub row "Noch leer" or "Weiteren Tanz anlegen"): sheet 1 *Name*, sheet 2
  *Plätze verteilen* — group members tapped in spot order (tap order = spot numbers; untapped members hold no
  spot), "Später" allowed — then straight into the empty editor ("Song hinzufügen"). The cast is always the
  whole group.
- **Frühere Sessionen:** quiet rows in the hub's Probenraum panel (season, name, own spot, step count).
  They open the landing read-only (season in the bar, no pencil, no training tile); Üben and Schritte work.

## Decisions of the grilling (2026-11-28)

- **Steps may leave gaps.** Each step has its own start and end; music may stay without steps before,
  between and after them (a trainer may start the second song before the first is finished).
- **Üben in a gap:** the music plays through, the label reads "Noch ohne Schritt" (no count dots), the stage
  holds the last formation; "Weiter" jumps to the next step, "Wiederholen" loops steps only. Schritte shows a
  gap as one quiet row ("0:45–1:05 · noch ohne Schritte"). The dance ends at its last step.
- **Aufstellung = where everyone stands when the step ends**, plus one *Anfang* picture before step 1. A step
  without its own holds the previous one; nothing moves in a gap. Stored keyframes do not change.
- **Music:** *Ersetzen* on a song finds the song in the new file and offers to replace neighbouring songs the
  file also holds (they merge into one song); immediate, undo bar, "Passt zu keinem Song" → "Als neuen Song
  anfügen". Plain one-tap add (several files at once), remove, reorder (song list behind the music lane's
  icon), crop, and **Teilen** (split exactly at the line into two songs, each removable on its own).
- **Videos:** per step the video filmed latest wins (recording time, else upload time); "Für diese Schritte
  nehmen" puts one on top. Parts lose their main video.
- **Üben:** no whole-part loops, mirror stays on by default, no separate large-text layout.
- **Cast = the whole group for every act** (ADR-0045); spots are held by group members, a member may hold
  none.
- **Appearance = only the act's place in a running order** (ADR-0045); planners create it; evening cast,
  spots, copies and the group's "Wir tanzen hier" go, with their data.
- **Roll call moves into the calendar entry** ("Für andere eintragen" for group admins); open spots and
  training mode are retired; the landing's training tile shows date + own answer.
- **Stage size stays club-wide**; no "Bühne" row in Einstellungen.

## Editor helpers (chosen 2026-11-28)

Florian picked five of the proposed helpers for the first version:

1. **Kürzeste Wege:** applying a preset (Linie, Kreis, Block, Reihe quer, Reihe tief) assigns the slots with
   the shortest total way (optimal assignment) instead of spot order, so the straight ways never cross. One
   undo restores the previous formation.
2. **Undo bar instead of "Wirklich?" dialogs:** after every destructive or far-reaching edit, a bar names what
   happened (e.g. "Song 2 gekürzt · 2 Schritte ohne Musik") with "Rückgängig". It stays until the next
   action, not on a timer. It is built on the existing edit history and versions.
3. **Feedback on "Schritt endet hier":** iPhone Safari cannot vibrate. Instead, the new border flashes blue,
   the line shows "Schritt 4 · auf 1", and a soft click plays.
4. **A smarter "1":** the beat analysis scores which beat is the real "1" (intros, pickups) and uses it only
   when the evidence is clear. Step taps snap to that grid, so "Früher/Später" is needed less often.
5. **Steps follow a new music version one by one:** when a newer file of a song replaces the old one (e.g. a
   DJ edit), each step border re-finds its own music nearby instead of the whole chain shifting together.
   Borders the app is unsure about are marked for editors and never moved silently.

## Not in the first version

- Weiterführen / copying a dance into the next session.
- Evenings: per-evening cast changes, stand-ins, evening variants of the choreography.
- A guided one-flow setup for new dances (music → video → steps → places).
- The other editor helpers proposed 2026-11-28: count-in, opening where the work continues / "Zur nächsten
  Lücke", "Hier bearbeiten" from Üben, "Ansehen als …", a second guess for ambiguous video placement,
  recording inside the editor, remote buttons, offline use, stage guides and hints, section marks in the
  waveform, formation from a hall video.
