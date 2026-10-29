---
status: vision / knowledge base 2026-10-29 — brainstorm collected, nothing shaped into slices yet
scope: the Auftritt (Act) becomes the group's year — training studio per group kind (dance first),
  music, stage editor, trainer video, steps; the evening (members, tech); memory (season, person)
builds_on: plan/club-app/acts.md, plan/club-app/running-order.md (PR #50)
shaped_with: Florian (direction + rulings below); team: dancer, trainer, tech/stage, carnival culture
next: break down into feature sets, each shaped and planned on its own (see "Breakdown sketch")
---

# The group's year

Big-goal file. Everything we brainstormed about acts, groups and training lives here. Later
plans cut pieces out of it and shape each one properly; this file stays the map. Feature names
below are **working titles** — never UI copy (see memory "No concept names in UI").

## Why

Florian, 2026-10-29: *"We have so many management features. But the most people in the club are
just members that participate in groups. So we should work out more features for them."*

The club app today serves the board, planners and admins well. The plain member — the 15-year-old
guard dancer, the 35-year-old men's-ballet member, the parent of a 7-year-old in the children's
guard — has little reason to open it beyond the calendar and Zu-/Absagen. Group life (training,
music, choreography, the evenings, the memories) happens on WhatsApp, USB sticks and paper.

**Goal:** the Auftritt stops being an entry that exists only for one evening's Ablauf and becomes
the thread through the group's whole season — first music edit in May, every training, every
appearance, the memory after Ash Wednesday. That is what members open the app for, every day in
season.

## What exists today (2026-10-23, PR #50)

- `Act` (UI *Auftritt*): name ≤ 80, optional group (none = *Ablaufpunkt*), optional kind
  (`Dance Speech Music Show Point`), archived. No session, no media.
- `ActCastChange`: cast = group's members on the event date ± exceptions; group-less → the
  `Added` rows are the cast.
- `ActWish`: First/Last/FirstHalf/SecondHalf/Early/Late × Must/Prefer, travels to every Ablauf.
- Screens: `/acts`, `/groups/$groupId/acts` (catalogue, cast grid, wishes, *Gemeinsame Leute*),
  planner `/events/$eventId/ablauf`, Leitstand step *Ablauf*.
- Gaps: no CONTEXT.md entry for Act; `CalendarEntryKind.Performance` (copy *Auftritt*) is not
  linked to acts; later slices of running-order.md still open (participating groups write-through,
  member Start card, website + print after *Ablauf steht*, own picture).

Nothing is in production — **existing structures may be rebuilt** where the end state needs it
(Florian 2026-10-29).

## First feature scope (Florian 2026-10-29)

The first plan (**v1**) is **the rebuild + the dance studio** only: foundation, dance studio,
adjusted management screens. **The text studio and every other kind are v2** (grilling Q13). **The evening and Memory are not part of the first feature** — they stay
here as the later map. Order of work: grill the features, then the data structure; the data
structure becomes the first slice(s) of the plan.

## Rulings so far (binding)

| # | ruling | source |
|---|---|---|
| R1 | Training views and functions differ **per Auftritt kind** (not group kind — the group kind only suggests the default kind of new Auftritte): *Tanz* → dance studio, *Rede* → text studio, *Show* → both, *Musik* later, *Ablaufpunkt* none. Start with **dance**. | Florian 2026-10-29, refined in grilling Q1 |
| R2 | An Auftritt **belongs to a Session**. *Weitermachen* copies it into the next session and links it (*folgt auf*) — the chain is the piece's lineage. Cast freezes at Ash Wednesday. | foundation accepted 2026-10-29 |
| R3 | **Media can be owned by an Auftritt** (photo, video, **audio** — audio is new). | foundation accepted |
| R4 | **Calendar entries name their Auftritte** (a performance says which are danced; a training says what was worked on). | foundation accepted |
| R5 | Working music = **several uploaded files, ordered, each sliced** (start + end point); playback jumps to the next file at an end point. | Florian 2026-10-29 |
| R6 | The **final stage music is a separate upload by the group** (one file that holds everything). No server-side render of the slices. | Florian 2026-10-29 |
| R7 | A **full stage editor**: group leaders plan **formations and movements**. | Florian 2026-10-29 |
| R8 | Stage dots are **numbered spots + a person assigned** per spot (cast change / stand-in swaps the person, the choreography stays). | Florian 2026-10-29 |
| R9 | **Trainer videos** showing the steps can be uploaded; a video is **aligned once to the music by an offset** and then runs in sync. | Florian 2026-10-29 |
| R10 | **Steps** are placed into the music: each step = music from–to + formation/movement + the trainer-video part. All steps in order = the **step-by-step manual** of the dance. | Florian 2026-10-29 |
| R11 | A step anchors to **a position inside one source file** — re-trimming moves steps with their music; steps in a cut-away range are flagged. | Florian 2026-10-29 |
| R12 | **One screen** layers music control + trainer video + formation, all synced to the music. | Florian 2026-10-29 |
| R14 | **Training material is seen by the cast + the group's admins only** (guests in the cast included, removed people excluded). Planners see the Auftritt and its name, not the studio content. | grilling Q2 |
| R15 | **Editing**: group admins edit all of their group's Auftritte; a group admin may make individual **cast members co-editors of one Auftritt** (studio content only — not cast, not group). Everyone else in the cast views. No suggestion/approval flow. | grilling Q3 |
| R16 | ***Endfassung übernehmen***: the final file is aligned once to the working mix (one offset per working song); steps, formations and videos move onto it; from then on the player plays only the final file (working songs kept as history). A newer final file aligns to the previous one the same way; steps whose music vanished are flagged. | grilling Q4 |
| R17 | **Automatic alignment by comparing the audio** (Florian: "10 out of 10"): the app suggests the offsets itself — final file ↔ working songs (piecewise, per working song) and trainer video ↔ music (the video's soundtrack, recorded in the hall) — the editor confirms or fine-tunes. | grilling Q4 |
| R18 | **Steps tile the music without gaps** (a step = set a mark, it splits the step it lands in); **parts** (Einmarsch, Teil A, Hebung, Finale…) are a gapless strip above the steps, part borders sit on step borders. The player loops a step or a part. | grilling Q5 |
| R19 | A real **formation editor with movements**: the trainer moves dots "from here to there and in what time" — timing inside the music, not only formation at step end. | Florian, grilling Q5 |
| R20 | **Movement = keyframes per spot on the music** (position at a music moment; straight or bendable curve with easing in between); a step-border formation = all spots keyed there. Editor: select dots → drag → pull a bar "count 1 to 4". **Counts 1–8 as the grid** from worker beat detection (first "1" and tempo correctable by hand). Optional **facing** per keyframe. Keyframes anchor inside the source song like steps. | grilling Q6 |
| R21 | **v1 supports only our own stage** — no guest/outside stages. Stage = width × depth (m), audience side, centre/quarter/third marks, snap grid. Spots *Platz 1…n* (number + portrait/initials), one person per spot max, unassigned = dashed, a *Nein* for a training shows the spot open. Props not in v1. | Florian, grilling Q7 |
| R22 | **Three levels**: group → **Auftritt per session** (default cast, default choreography/formation) → **Auftritt per event** (the act at one evening: may vary cast and formation, has its own pictures). | Florian, grilling Q7 |
| R23 | **The evening inherits from the session, stores only differences**: (1) cast in/out on top of the session cast (*Nein* counts as today), (2) spot reassignment / spot empty, (3) *Für diesen Abend anpassen* = an evening copy of the choreography (without a copy the session version shows live; with one, later session changes show a notice — no auto-merge), (4) pictures belong to the evening's Auftritt (auto-sort later). **Music and steps stay session-wide.** v1 builds 1–3; pictures/tech times later, structure ready. | grilling Q8 |
| R24 | Terms: **Act** = the piece of one session (UI *Auftritt*); **Appearance** = that act at one calendar entry (UI always in context: *Auftritt am 11.11.*, *an diesem Abend*). The **running-order line merges into the appearance** (position, pin, block are the appearance's properties in that evening's Ablauf); an outside appearance (later) has no Ablauf. | grilling Q9 |
| R25 | **Trainer videos**: any number per act, each aligned to the music (R17) and covering its range; the editor marks the **main video per range**, others are alternatives (e.g. *Seite*); a newer video over the same range makes the old one **outdated** (kept, not in the player). No video → stage + music only, no gap message. Player: **mirror on by default**, speed 50–100 % (pitch kept, video with it), loop step or part. | grilling Q10 |
| R26 | **Act page `/acts/$actId` is the studio** — members land in the player, editors switch to edit on the same page; the old editor pane (name, kind, cast, wishes) becomes its settings. **Group hub** section *Auftritte* (this session's acts, cast + admins only). **Start** tile *Üben* per act you are in → player at your last step. The `/acts` catalogue stays for planners (act + name, no studio content). **The management screens (`/acts`, `/groups/$groupId/acts`, planner) are rebuilt/adjusted to the new structure** (session, appearance, co-editors). | grilling Q11 |
| R27 | **Offline**: for every act you are in, music + steps + parts + choreography + spots/people are cached automatically (small); **videos only by tap** (*Für offline speichern*, 720p rendition, storage shown). Editing needs a connection (locked offline, quiet note, no offline sync). Cache refreshes when online. | grilling Q12 |
| R28 | **v1 = dance only.** Text studio (Rede/Sketch, highlighted own parts, cue-line mode) and the other kinds are **v2**. | grilling Q13 |
| R29 | Training extras: **v1 = Absage → open spots** (per training, which spots are open in which steps) **+ training mode** (music over the hall speaker, current step/counts/formation big, one-tap loop). *Heute geprobt* later. **Side by side** v2. **No countdown** — most groups don't schedule all trainings ahead. | grilling Q14 |
| R30 | ***Weitermachen*** (carry an act into the next session) is **not in v1**. Open for the data part: default session of a new act (lean: the relevant session), freezing at Ash Wednesday. | grilling Q15 |
| R31 | ***Ablaufpunkte* are timeless** (no session, reused until archived). Only acts with a training kind (*Tanz*, *Show*, later *Rede*/*Musik*) belong to a session; kind *Ablaufpunkt* or no kind = timeless. | grilling Q16 |
| R13 | **No** skill grid (*kann / wackelt / neu*). | Florian 2026-10-29 (rejected) |

## Foundation (rebuilds everything else stands on)

### F1 — Auftritt per Session

- `Act` gains its session (derived span via the 11.11 rule, like everything session-related —
  store the session year, never a "current" pointer).
- *Weitermachen* in a new session copies the Auftritt (name, group, kind, wishes, cast exceptions,
  optionally music/steps/formations) and sets **folgt auf** → the previous one.
- Lineage = the *folgt auf* chain ("Gardemarsch since 1998"). A group handing a piece to another
  group = new Auftritt with *folgt auf*.
- **Cast freeze**: at Ash Wednesday the effective cast is materialised so later group changes never
  rewrite history ("evidence, not arithmetic", like the session number).
- Running-order lines reference the Auftritt of the evening's session.
- Considered and **not** chosen: Act + separate ActEdition per season (almost everything changes
  each year anyway; a chain of Acts is simpler and honest).

### F2 — Media owned by an Auftritt, audio support

- Keep the **single-owner rule** (deletion, erasure, per-fetch ownership check stay simple). Add an
  owner kind *Auftritt* (`OwnerActId`). An Auftritt outlives a training season and may have no group,
  so it is a better owner than the group.
- Tie to an event via a separate context field (e.g. "recorded at" calendar entry), never a second
  owner. Gallery recordings reused for an Auftritt are **copied** (existing reuse ruling).
- New media kind **audio**: MP3, WAV, AIFF, FLAC, M4A, sniffed like the other formats; audio limits;
  `MediaOwner.Accepts` becomes a rule per owner kind (today: only photos outside the gallery).
- Worker audio lane: renditions `Original` (handed to tech bit-exact), `Normalised` (two-pass
  loudness), `Preview` (low bitrate), `Peaks` (waveform JSON). Item facts: duration, LUFS, true
  peak, leading/trailing silence, sample rate, ID3 title/artist (later: fingerprint).
- **Audio is never public** (copyright). Read access: the cast + group admins + planners + tech
  (open question Q3).

### F3 — Calendar entries ↔ Auftritte

- A performance entry (own hall, outside appearance, parade) lists the Auftritte danced there.
  The own hall evening's Ablauf can seed from it.
- A training/rehearsal entry may record what was worked on (steps / sections of an Auftritt).
- Gives counts for free: "Gardetanz: 23 Auftritte, nächster Sa bei KG Blau-Weiß".

### F4 — The Auftritt kind decides the training (grilling Q1)

- The studio follows `ActKind`: *Tanz* → dance studio, *Rede* → text studio, *Show* → both,
  *Musik* later, *Ablaufpunkt* none. Covers the Elferrat doing a Büttenrede or a ballet with a
  spoken sketch.
- `GroupKind` (club-composed record) only suggests the default kind for a group's new Auftritte.

## Data structure (v1 draft — grilling in progress)

Draft from the feature rulings; each point is confirmed in the grilling, then becomes the first
slice(s) of the v1 plan.

| entity | fields (draft) | from |
|---|---|---|
| `Act` (changed) | + `SessionYear?` (null = timeless, R31), + `FollowsActId?` (lineage, R2) | R2, R31 |
| `ActCastChange` | unchanged — the session's default cast | R22 |
| `ActCoEditor` (new) | ActId, PersonId, granted by/at | R15 |
| `Appearance` (new, replaces `RunningOrderLine`) | Id, ActId, CalendarEntryId (unique pair), Position?, IsPinned, BlockKey? | R24 |
| `AppearanceCastChange` (new) | AppearanceId, PersonId, Added/Removed | R23 |
| `Spot` (new) | Id, ActId, Number, PersonId? (session assignment) | R8, R21 |
| `AppearanceSpot` (new) | AppearanceId, SpotId, PersonId? (null = empty this evening) | R23 |
| `ActSong` (new) | Id, ActId, MediaItemId (audio), Order, Start, End | R5 |
| `ActFinalTrack` (new) | Id, ActId, MediaItemId (audio), Version, AdoptedAt? + alignment offsets | R6, R16 |
| `ActStep` (new) | Id, ActId, start anchor, name, description (end = next step's start) | R10, R18 |
| `ActPart` (new) | Id, ActId, first step, name, main video? | R18, R25 |
| `Choreography` (new) | ActId, AppearanceId? (null = session version), keyframes, version | R20, R23 |
| `ActVideo` (new) | MediaItemId (video), anchor of video 0, outdated | R9, R25 |
| club record (changed) | + stage width, depth, stage SVG | R21, D6 |
| Media | `MediaOwnerKind.Act` + `OwnerActId`; `MediaKind.Audio`; audio facts + renditions; beat grid | F2, R20 |

**Anchor** = (source audio media item, position in it) — R11.

Data rulings:
- **D1** — keyframes live as **one document per choreography** (`jsonb`, session version or evening
  copy, saved whole with a version token, 409 on conflict). Everything with references stays
  relational: songs, final file, videos, spots + people, steps, parts. Keyframes reference spot ids
  and anchors; unknown spots are rejected.
- **D2** — *Endfassung übernehmen* **rewrites every anchor once** (steps, keyframes, videos) to
  (final file, position) via the alignment, in one transaction; anchors whose music is not in the
  final file keep their old anchor, marked *Musik fehlt*. A newer final version aligns to the
  previous one and rewrites again. Working songs stay as history; nothing points at them after.
- **D3** — **the media worker analyses**: per audio item peaks, loudness, duration, beat grid
  (first beat + tempo) and a compact comparison profile (chroma/onsets); per video item the same
  profile of its soundtrack — stored as facts/renditions of the item. **The API compares two
  stored profiles** for an alignment suggestion (offsets + confidence), no file access. Beat-grid
  corrections (first "1", tempo) are the editor's decision → stored per act song / final file.
- **D4** — **an appearance = act × calendar entry, independent of the Ablauf.** Created by the
  group admin / co-editor on an evening their group takes part in (*Wir tanzen hier* / *Für diesen
  Abend anpassen*) or by the planner in *Wählen*. A group-created appearance lands **unplaced in the
  planner's tray** (= the old "participating groups write-through"). Position/pin/block are empty
  without an Ablauf. Removing an act from the Ablauf deletes its appearance only without evening
  differences; otherwise the planner is warned first.
- **D5** — a new act's `SessionYear` = **the relevant session** (`ClubSession.RelevantYearOf`);
  changeable, never to a past session; no FK to the session record. **After the session closes the
  act is read-only** (studio, cast, choreography, appearances); its cast still sees it (*past
  season* on the group hub). The default cast is **materialised at Ash Wednesday**. The `/acts`
  catalogue defaults to the relevant session + timeless *Ablaufpunkte*, past sessions by filter.
- **D6** — **our stage lives on the club record**: width × depth (m) + an optional **stage SVG**
  designed in Inkscape (sanitised with the existing `SvgSanitizer`), edited in club management by
  whoever edits the club record. The app renders the SVG **non-interactively** as the backdrop of
  the stage area, its viewBox fitted to the configured width × depth (aspect mismatch warned on
  upload). Keyframes are stored **in metres from the centre front** — a later size change never
  distorts formations; dots outside the stage are flagged. Guest stages (later) can move onto venues.

## The dance studio (first and biggest piece)

The heart: **one timeline, built from the music**; steps sit on it; formation, movement and video
hang off steps; one screen plays it all in sync.

### Music — the working mix (R5, R6, R11)

- Upload several files (Spotify gives no files — every song is uploaded). Order them by drag.
- Each file gets **start and end point** (slice). Playback: end point reached → next file's start.
  Gapless, so the trainer hears the mix as the dance will feel.
- The **mix timeline** = concatenation of the slices. Every position a step or video uses is stored
  as *(source file, position in that file)* → re-slicing or reordering keeps steps glued to their
  music; a step whose music was cut away is flagged, never silently moved.
- **Final file** (*Endfassung*): a separate upload — the one file tech plays on the evening.
  - Open question Q1: *Endfassung übernehmen* — align the final file once to the working mix (one
    offset, maybe per slice) so steps, formations and videos move onto it and the member player
    plays exactly what tech plays. Without it, the final file carries no steps.
- Versions: a newer final file is a new version; the evening pins the version current at
  *Ablauf steht* (see tech).

### Steps (R10)

- A step = range on the mix timeline (from–to, anchored per R11), a name/short description, the
  formation at its end (and the movement from the previous formation), and the trainer-video part
  that covers it.
- Steps in order = the **manual** of the dance. Optional extras per step: counts (1–8 notes),
  a crib text, which spots move.
- Steps may group into **sections** (Einmarsch, Teil A, Hebung, Finale) for navigation and looping —
  to decide (Q6).

### Stage editor — formations and movement (R7, R8)

- Stage = a configurable rectangle (width × depth, front marked; optional second size for small
  outside stages — "narrow version").
- **Spots** Platz 1…n are the dancers in the choreography; each spot is **assigned a person** from
  the cast (stand-in = reassign). A spot without a person shows as open.
- Per step: positions of every spot at the step's end. Movement = path from the previous formation
  (straight by default, bendable curves; maybe facing direction — Q7).
- Tools the editor needs to feel "full blown": drag/multi-select, mirror left↔right, align/
  distribute, grid + centre line, copy formation from another step, lines/blocks/circle presets,
  onion-skin of the previous formation, play the movement scrubbed to the music.
- Playback: dots glide between formations exactly in time with the music; **your own dot pulses**
  ("2. Reihe, links außen").

### Trainer video (R9)

- Trainer films while the music plays, uploads to the Auftritt, sets **one offset** → the video runs
  in sync with the mix through every step it covers. Several videos may cover different parts
  (or alternatives: front view / back view).
- Player options: **mirror**, slow speed (music slowed with pitch kept, video slowed with it),
  loop a step or a section.

### The one screen (R12)

- Music control (waveform with slices + step marks, play/loop/speed) + trainer video + stage with
  moving formation, all driven by one clock = the music position.
- Two faces: **editor** (group leaders — place steps, edit formations, align video) and **player**
  (members — follow, loop, slow down, own dot highlighted, offline).
- Phone first for the player (390 px); the editor must work on phone but shines on tablet/desktop.
  Exact layouts: lab variants (page-rework way) when we get there.

### Around training (from the brainstorm, dance profile)

- **Heute geprobt** — after training the trainer taps the steps/sections worked on (3 seconds);
  people who sent an Absage get a catch-up card with the step and its video ("Teil C neu — bis
  Dienstag üben").
- **Countdown to the first appearance** — "Noch 14 Trainings bis 11.11." from the training rhythm
  and calendar (no skill grid, R13).
- **Absage → what it breaks** — an Absage for a training/performance shows which spots are open
  and in which steps; for an evening it flows into the Ablauf review (already: absences).
- **Side by side** — film yourself at home, see it beside the trainer video in sync. Private,
  never leaves the person's account, auto-deleted (not gallery).
- **Training mode** — the trainer's phone plays the music over the hall speaker while the screen
  shows the current step, counts and formation; one tap loops a step.

## The evening (members and tech)

### For members

- **Your evening on Start** (*Lampenfieber* / evening pass): on a performance day Start becomes
  your evening — your Auftritte tonight, your position ("nach der Büttenrede"), Umziehzeit between
  your Auftritte, meeting point/time, packing list. Data mostly exists (confirmed Ablauf, cast,
  findings).
- **Live pointer** on the Ablauf: someone at the stage advances it during the evening — a position,
  never times (open question Q2 vs. the "no times" ruling). Enables "noch 4 Auftritte bis zu euch",
  the tech playlist, and recordings sorting themselves (below).

### For tech / stage

- **Bühnenfassung** — the final file per Auftritt; confirming the Ablauf pins each line's version,
  a later upload never silently changes the evening.
- **Pegel** — the worker normalises loudness, trims leading silence, warns about clipping
  ("−14,2 LUFS → angeglichen, 1,8 s Stille vorne entfernt").
- **Cues on the waveform** — start on light-out, fade from 3:12, loop for an encore, no-music
  entrance.
- **Regiebuch** — confirming the Ablauf writes the show book: per line audio + cues, light mood,
  mics, props, entrance side, the MC's intro line (a *Bühnenzettel* on the Auftritt, travels like
  act wishes). Live on the phone and printable.
- **Tonpult** — the PWA as the evening's playback desk: all tracks offline the afternoon before
  ("17/17 Spuren offline, 312 MB"), one big GO, next track preloaded, follows the live pointer.
- **Spuren-Check** — Leitstand check *Alle Spuren da* on the Ablauf step: missing, unprocessed,
  clipping, or changed after *Ablauf steht*.
- **Auswärts** — outside appearances: one sheet with meeting point, bus departure, drivers (kids),
  stage size, host tech contact; a login-free link to the current music for the host's tech, valid
  until the evening.
- Smaller: same-song warning (two groups on the same title, audio fingerprint), mic plan
  (headset handovers treated like Umziehzeit), GEMA music list export from the confirmed Ablauf.

## Memory (after the evening, after the season)

- **Photos sort themselves** (Florian 2026-10-29): tech knows after the evening when each Auftritt
  started and ended on stage; the photographer's pictures carry their capture time (EXIF) → each
  picture is sorted to the Auftritt-per-event it was taken during. (Same mechanism as *Mitschnitt
  kommt heim*; needs the live pointer / stage log and camera clock offset handling.)

- **Mitschnitt kommt heim** — the live pointer logs when each Auftritt went on stage; videos in the
  evening's album fall into those windows by capture time and attach to the Auftritt (copied).
  Dancers see "Dein Auftritt vom 11.11.".
- **Sessionsbogen / season book** — at Ash Wednesday each group gets its season: trainings,
  appearances, every cast, best clips, debuts, farewells, guest shows. Group totals, never a
  ranking of individuals. Archived per session.
- **Kehraus** — the season closes with a ritual on Ash Wednesday (ring, numbers flip, motto bows),
  full animation every visit that day.
- **Bühnenbiografie** — a person's life on stage, session by session (Kindergarde 2008 → Aktive
  Garde), every Auftritt and evening, first solo — from group memberships, casts and Abläufe.
- **Stammbaum** — an Auftritt's lineage across sessions via *folgt auf*: motto, cast faces, music,
  reference video per session.
- **Übertritt** — moving up a group (children's → junior → main guard) is a rite: farewell card in
  the old group ("8 Sessions bei uns"), welcome in the new.
- **Erste Male + Pate** — newcomers' milestones light up from real data (first training, first
  Auftritt, first hall evening, first Orden); a sponsor from the group sees what is still dark.
- **Gastspiele & Ordenswand** — outside appearances with host club; photos of received medals form
  the group's wall, clubs visited over the years.

## Other group kinds (later, R1)

- **Büttenrede / Rede / Sketch / Zwiegespräch** — the **text is uploaded to the app** (Florian
  2026-10-29). Every involved person sees **their parts highlighted** in the whole text.
  **Training mode**: only the **last part of the previous person** (the cue) is shown, then your
  text — and so on through the piece (cue-line learning). Further ideas: prompter mode (lines
  scroll), every third line hidden, recordings of rehearsals, length in words/lines (no stage times).
- **Gesang / Musik** — songs, lyrics and parts/voices, backing tracks, recordings.
- **Sketch / Show** — script, roles, props list, scenes.
- **Organisation** (Elferrat, tech, kitchen) — no training studio.

## Parked (good, not now)

- **Elternblick** — parents see their child's Auftritte, evening pass, costume sizes and catch-up
  cards and answer Zu-/Absagen on the child's behalf. Needs a dated guardianship relation
  (person ↔ person) and an ADR on rights and data protection. The children's guard depends on it —
  its own project.
- **Kostümkammer** — costume pieces per Auftritt, sizes per person (dated, kids grow), hand-outs
  (same pattern as keys), tailor order export, inheritance to the next group.
- **Funkplan, same-song warning, GEMA export** — add-ons to the tech pillar.

## Rejected

- Countdown to the first appearance (trainings are not all scheduled ahead; grilling Q14).
- Skill grid *kann / wackelt / neu* per person × part (R13).
- A chat. Group communication stays notices/announcements ("explicitly not a chat").
- Any ranking of individual members (attendance, appearances).

## Open questions

| # | question | lean |
|---|---|---|
| Q1 | ~~Endfassung übernehmen~~ → R16, R17 | — |
| Q2 | Live pointer during the evening — welcome as "position, not time"? | yes |
| Q3 | ~~Who sees an Auftritt's media~~ → R14 (tech access decided with the evening) | — |
| Q4 | Parents: parked, or part of the first build? | parked |
| Q5 | ~~Ablaufpunkt session~~ → R31 | — |
| Q6 | ~~Sections above steps~~ → R18 (parts) | — |
| Q7 | ~~Movement detail~~ → R20 | — |
| Q8 | ~~Several trainer videos~~ → R25 | — |
| Q9 | ~~Offline~~ → R27 | — |
| Q10 | ~~Who edits the studio~~ → R15 | — |
| Q11 | Copy for the studio, the steps and the manual (never concept names). | — |

## Breakdown sketch (to be shaped one by one)

1. **Foundation** — F1 Auftritt per Session + *Weitermachen*/lineage, F2 media owner Auftritt +
   audio + worker audio lane, F4 training profile on group kind. (F3 can follow with the evening.)
2. **Music mix** — uploads, order, slices, gapless player, anchoring, final file (+ Q1).
3. **Steps** — steps on the timeline, the manual view.
4. **Stage editor** — spots + people, formations per step, movement paths, playback.
5. **Trainer video** — upload, offset alignment, mirror/slow/loop.
6. **The one screen** — editor and player, lab variants, offline.
7. **Around training** — Heute geprobt, countdown, Absage effects, training mode, side by side.
8. **The evening** — F3 calendar ↔ Auftritte, evening pass on Start, live pointer, tech (final
   file pinning, loudness, cues, Regiebuch, Tonpult, Spuren-Check), Auswärts.
9. **Memory** — Mitschnitt kommt heim, season book, Kehraus, Bühnenbiografie, Stammbaum, Übertritt,
   firsts.
10. **Other group kinds** — Rede, Gesang/Musik, Sketch.
