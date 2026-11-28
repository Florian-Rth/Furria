---
rfc: 0013
title: The Probenraum — the dance studio reworked for how groups really build a dance
status: in-progress
github_issue: 109
branch: feat/rfc-109-probenraum
created: 2026-11-28
---

# RFC 0013: The Probenraum — the dance studio reworked for how groups really build a dance

## Summary
The dance studio becomes the **Probenraum** (Beta): one place per dance, reached from the group
hub, with four pages — landing, *Üben*, *Schritte* and, for editors, one **editor** plus
*Einstellungen*. The editor is the dance's growing song chain on the shared centred-"now"
timeline; every tool acts at the line. Hall mode, evenings, the step-setup wizard, the details
pages, the separate music/video pages and the final-file concept go. The cast becomes the whole
group. Five assistive features make the editor easier: shortest ways for presets, an undo bar
instead of confirmations, feedback on "Schritt endet hier", a smarter "1", and steps that follow a
new music version one by one.
Design: canvas https://claude.ai/artifact/ALcwaPM5nyNTC4zM64AciQ · page plan
`plan/club-app/probenraum.md` · decisions [ADR-0045](../adr/0045-an-act-is-danced-by-its-whole-group-the-same-every-evening.md),
[ADR-0046](../adr/0046-a-dance-s-music-is-a-chain-of-songs-replaced-in-place.md) · glossary
`CONTEXT.md` (Act, Probenraum, Appearance, Music, Step, Trainer video, Edit page, Spot).

## Motivation
The studio grew phase by phase (RFC 0001–0003) into ~45k lines across 17 routes: a score desk,
a one-job-at-a-time editor, a step-setup wizard, music and video pages with a waiting final file,
hall mode, per-evening variants and roll call. Members meet "Sessionsauftritte" as a data type.
Trainers must understand the tool's structure before they can work.

Groups really work like this (Florian, binding): pick a motto, find the first song, crop it, make
the first steps, add the next song, more steps — while the group already trains what exists, the
trainer builds more at home; songs get re-cropped and steps swapped throughout. The tool must be
made for exactly that, mobile first, around the centred-"now" slider.

## Proposal

### Pages and routes
```
Group hub        one Probenraum row per dance of the relevant session · "Frühere Sessionen" · "Neu anlegen"
/acts/$actId              Landing — stage loop, Üben, training tile (date + own answer),
                          next-performance tile (date + place), Schritte row; read-only after the session
├─ practice               Üben — one version of the dance for everyone
├─ steps                  Schritte — list by parts + step sheet ("Ab hier üben"); editors get one pencil
├─ edit (+ child routes)  THE editor — sheets are child routes (edit/songs/new, edit/songs/$songId, …)
└─ settings               Name · Plätze (holders, "tauschen", "Darf bearbeiten") · Archivieren
```
| Today | Becomes |
|---|---|
| `acts/$actId/evenings/$eventId/{practice,edit}` | deleted |
| `acts/$actId/music`, `/videos`, `/steps/setup` | deleted — merged into the editor |
| `acts/$actId/training`, `/trainings/$trainingId` | deleted — hall mode gone |
| `acts/$actId/details` (+ children) | deleted — settings to `acts/$actId/settings`, roll call to the calendar |
| `/groups/$groupId/acts` | deleted — "Frühere Sessionen" in the group hub |
| `/acts` (planners' catalogue + wishes) | moves next to the running order |
| — | added: `acts/$actId/steps`, `acts/$actId/settings` |

### Domain changes (glossary updated 2026-11-28)
- **Cast = the whole group** for every act; spots are held by group members, a member may hold none
  (ADR-0045). `act_cast_change` goes; the Ash-Wednesday freeze stays.
- **Appearance = the act's place in one running order**, created by planners. Evening cast, evening
  spots, evening copies of the choreography and the group's own join/withdraw go, with their data;
  the planner checks the group minus *Nein* answers (ADR-0045).
- **Steps have their own end**; music may stay without steps before, between and after them. Üben
  plays through a gap ("Noch ohne Schritt", stage holds); Schritte shows it as one quiet row.
- **Aufstellung of a step = where everyone stands when it ends**, plus one *Anfang* picture. Stored
  keyframes are unchanged; a step without its own holds the previous one; nothing moves in a gap.
- **Music = a chain of songs** (ADR-0046): add (several files at once), remove, reorder (song list),
  crop, **Teilen** (split exactly at the line into two songs of one file), **Ersetzen** (finds the
  song in the new file, offers to take neighbouring songs along and merges them; immediate, undo
  bar; no match → "Als neuen Song anfügen"). Working mix vs final file, *Probehören* and adoption go.
- **Trainer videos:** per step the video filmed latest wins (recording time, else upload time);
  "Für diese Schritte nehmen" puts one on top. Per-step clip editing, video split and a part's main
  video go.
- **Attendance marks** move into the calendar entry ("Für andere eintragen" for the group's
  admins); open spots and training mode are retired.
- **Practice resume** is kept on the server per person and act (replaces `practice-memory`
  localStorage), so "Üben ab Schritt N" follows the person across devices.
- **Stage size** stays club-wide. **Versions:** one history (the editor's *Verlauf*).
- **Copy:** "Sessionsauftritt" leaves member-facing copy; the dance's own name is used.

### The editor
One screen around the shared `StudioTimeline` (lanes: Musik, Schritte, Video; centred "now" line;
pill on the line). The stage/video picture zone sits above, the dock below (tempo · back · play ·
next · Wiederholen), then the **context tool row** for what is under the line:

| Under the line | Tools |
|---|---|
| a step | Teilen · Aufstellung · ⋯ (Name, Tauschen, Zusammenlegen, Löschen, Teil beginnt hier) |
| music without steps | Schritt beginnt hier → playing: **Schritt endet hier** (big), Früher/Später, Fertig |
| a song (tapped) | Zuschneiden · Teilen · Ersetzen · Entfernen; song list (music-lane icon) for order and add |
| "+ Song" | Song hinzufügen (one file → Anfang hier / Ende hier / Fertig; several → appended whole) |
| a video (tapped) | Prüfen (when unsure) · Für diese Schritte nehmen · Löschen |
| steps without music | Zurückholen · Einzeln … · Löschen |

Aufstellung: picture rail (Anfang, Schritt 1…n), presets Linie · Kreis · Block · Reihe quer ·
Reihe tief + Spiegeln, Alle wählen, long-press selection with chip, Übernehmen (previous step by
default), ways drawn with the finger, "Wer steht hier" (holders via list with "tauschen"), facing
compass. Header: title, "Gespeichert", ⋯ (Verlauf, Einstellungen). Tablet landscape: left two
thirds stage + wider timeline + transport with time readout; right third a panel with video,
caption and every tool inline (no sheets). Portrait uses the phone frame.

### Assistive features (chosen 2026-11-28)
1. **Kürzeste Wege** — applying a preset assigns slots by optimal assignment (Hungarian, n ≤ ~40) of
   current to target positions instead of spot order, so straight ways never cross; one undo.
2. **Undo bar** — after every destructive or far-reaching edit a bar names what happened ("Song 2
   gekürzt · 2 Schritte ohne Musik") with "Rückgängig", until the next action. Built on
   `edit-history`; server-side music replacement keeps a one-level undo snapshot. Replaces every
   "Wirklich?" dialog in the editor.
3. **Tap feedback** — "Schritt endet hier" flashes the new border blue, shows "Schritt 4 · auf 1" on
   the line and plays a soft click through the mix player (iPhone Safari cannot vibrate).
4. **A smarter "1"** — `BeatTracker` scores which beat phase is the bar's "1" (accent and low-band
   energy per phase) and uses it only with a clear margin; existing act audio is re-analysed once;
   songs whose beat was set by hand keep it. Step taps snap to that grid.
5. **Steps follow a new music version one by one** — on *Ersetzen*, each step border is matched
   locally (sound-profile window around the old border, searched around the song-level offset);
   keyframes follow their borders piecewise; videos re-match by their own sound; a border below
   the confidence threshold keeps the song-level position and is flagged (gold) until an editor
   touches it.

### Data and API (summary)
| Area | Change |
|---|---|
| `act_cast_change` | dropped (data deleted); cast = group members |
| `appearance_cast_change`, `appearance_spot`, `choreography.appearance_id` copies | dropped (data deleted) |
| evening endpoints (`acts/{id}/evenings/*`), `RunningOrderLineDetails.EveningChanges` | removed |
| act training attendance `acts/{id}/trainings/{c}/attendance/{p}` | moves to `calendar/entries/{id}/attendance/{p}` |
| `act_step` | + end anchor, + `needs_check`; gaps allowed, overlaps refused |
| `act_song` | one cut per song (multi-piece songs migrate to several songs); + replacement endpoints with one-level undo |
| `act_final_track(_alignment)` | dropped; an adopted final file becomes the act's one song |
| `act_video` | + `preferred_at`; clip columns and split endpoint removed; `act_part.main_video_id` dropped |
| `practice_position` | new (person, act, step) + GET in studio read model, PUT endpoint |
| `MediaAudioFacts` | first beat = the bar's "1" when confident; one-off re-analysis of act audio |
| group acts read model | + own spot number, step and video counts, earlier seasons |

## Phases
Each phase leaves the system intact (builds, tests pass, no dangling references) and fits a
~120k-token session. Backend/model foundations come first while the current screens keep working;
then the new screens replace the old ones page by page; every phase deletes what it replaced.
Every new screen ships with its "?" help sheet and is checked at 420×740 and 390×664, light and dark.

### Phase 1 — Cast is the whole group
Goal: an act's cast is its group everywhere; nothing can add or remove single people.
- [x] Migration drops `act_cast_change`; cast readers (catalogue, studio, glance, running order, attendance "concerns") use group members
- [x] `PutAct`/`PostAct` lose cast changes; spots accept only members of the act's group (refusal otherwise)
- [x] Co-editors: only group members; leaving the group ends it
- [x] Club app: cast editing removed from `ActPane` (catalogue, details, group acts); spot pickers list group members
- [x] Tests: cast = group incl. frozen cast after Ash Wednesday; spot holder must be a group member; running-order findings with group cast

### Phase 2 — One version for every evening
Goal: an appearance is only a place in the running order.
- [x] Club app: evening UI removed (`ActEvening*`, `studio-evening`, evening routes, score evenings list, evening choreography versions)
- [x] Backend: `ActEveningService`, evening endpoints and `SpotCasting`/`EveningCasting`/`EveningChange` removed; `GetActStudio` without evenings
- [x] Running order: `EveningChanges`, lost-evening-change conflicts and evening-cast findings removed; checks use group minus *Nein*; group join/withdraw paths removed (planner's open-appearances endpoint kept — the archive notice still feeds it)
- [x] Migration drops `appearance_cast_change`, `appearance_spot`, evening choreography copies and `choreography.appearance_id`; `ChangedTables`, `ReferencesToPerson`, final-track rewrite and spot removal loops updated
- [x] Tests: running-order tests and fixtures without evening cast; gate allowlist and wire-name tests updated

### Phase 3 — Attendance marks in the calendar; hall mode out
Goal: group admins mark members in the calendar entry; hall mode and roll call are gone.
- [x] Endpoints `PUT/DELETE calendar/entries/{id}/attendance/{personId}` (group admins of the entry's group, same rules: stored as her answer, "eingetragen von", own answer replaces, undo restores); act training attendance endpoints removed
- [x] Calendar entry detail: "Für andere eintragen" sheet (group members, Ja / Nein, trail) for trainings with Zu-/Absage
- [x] Studio read model without trainings/open spots; glance keeps next training date + own answer
- [x] Club app: `act-training/` folder, training routes, `ST/hall`, `KkHall`, Üben's "Gruppentraining" and the score hall door removed
- [x] Tests: marking permissions and replacement rules on the calendar endpoints

### Phase 4 — Steps with their own end
Goal: steps may leave music without steps; overlaps are refused; current screens keep working.
- [x] Migration: `act_step` end anchor (filled from the next step's start / end of music), `needs_check`
- [x] Endpoints: create with start + end (inside a step = split as today), move start/end, overlap refusal; placement flags for ends ("ohne Musik")
- [x] `@furria/studio`: document steps carry their end; step-list, count and practice models handle gaps (Üben plays through, "Noch ohne Schritt"); current editor/setup create contiguous steps with ends
- [x] Tests: gap creation, overlap refusal, split keeps ends, migration fill (backend); gap handling in step and practice models (studio)

Decided while building (2026-11-28):
- `POST acts/{id}/steps {startSeconds, endSeconds}` → `{stepId}`; a new step that is exactly the tail of a step splits it atomically (parts keep both halves); everything else must lie in free music (touching allowed, 0,01 s tolerance). `PUT …/start` and new `PUT …/end` move one border each; `DELETE` leaves a gap. Step writes lock the act row.
- An end on a song border is anchored in the earlier song (split, move, migration, final-track adoption — which clamps an end past the final file to its end), so removing the next song keeps the step.
- A step is on the timeline only when both ends are, the end lies after the start and it does not overlap an earlier step; otherwise its seconds are null (`placement`/`endPlacement` tell which end lost its music). Null seconds is the "ohne Musik" contract for the client.
- The current editor keeps today's feel on top of ends: a border drag moves a touching neighbour's end along, removing a step lets the touching previous step absorb it. The save plan sends removes → shrinks → splits → creates → grows.
- Üben's gap handling is player logic (UI under the test rules), so the studio tests cover the step/document/save-plan models, not the player.
- Nothing moves in a gap: the current formation/movement tools are off while the line is in a gap; an act without any step still places across the whole song. The migration starts the first step with the music (as the old tiling drew it).
- For phase 5: step ends cascade with their media item like starts, so song replacement re-anchors ends before any media row goes.

### Phase 5a — Music chain: one cut per song, split, no final file
Goal: songs are split in place; the final-file concept is gone. (Phase 5 was split on 2026-11-28 —
it outgrew the ~120k-token cap.)
- [x] Migration: multi-piece songs become one song per piece; one cut per song; an adopted final file becomes the act's one song; pending final files and alignment tables dropped
- [x] Song split endpoint (exactly at a moment; halves cannot be cropped into each other)
- [x] Final-track endpoints, service, DTOs and the club-app/studio final section removed; songs carry one cut on the wire and in the studio document
- [x] Tests: split, halves cannot overlap, step end kept in the first half, migration of multi-piece songs and adopted/pending final files

Decided while building (2026-11-28):
- `act_song.start_seconds` + nullable `end_seconds` (null = to the file end); several songs may share one file, their cuts never overlap (PUT refuses with 409); the unique index on the file goes.
- `POST acts/{id}/songs/{songId}/split {atSeconds}` (seconds in the song's file, ≥ 0,5 s on both sides, else 422) → `{songId}` of the second half, placed right after it with the same beat grid; anchors stay untouched. Song cut and split writes lock the act row.
- The adopted final file becomes the one song with its own beat grid (the songs' grids placed into it are not carried over); the replaced songs' rows go, their files stay because unmatched anchors still point at them. Never-adopted final files are deleted (files buried by the media trigger). The migration's down path merges split halves back into pieces.
- `FinalTrackMatching`/`FinalTrackAdoption` stay in Core until 5b reshapes them; the version kind `MusicAdopted` stays until 5b renames it.

### Phase 5b — Music chain: replace in place
Goal: songs are replaced in place (per-song offset for now; phase 6 goes per border).
- [ ] Replacement: match endpoint (where the song lies in the new file + which neighbouring songs it also holds), apply endpoint (song or run of songs, merged into one; anchors rewritten per song; version kind *music replaced*, renaming `MusicAdopted` with its stored rows), one-level undo endpoint while nothing changed since
- [ ] `FinalTrackMatching`/`FinalTrackAdoption` reshaped into song matching/replacement
- [ ] Tests: replace one song, replace and merge neighbours, no match, undo, undo refused after a later change

### Phase 6 — Steps follow replaced music (helper 5)
Goal: on *Ersetzen* every border re-finds its music; unsure ones are flagged.
- [ ] Core: per-border local matching over sound profiles with confidence; piecewise keyframe mapping between matched borders
- [ ] Replacement applies per-border results, re-matches covered videos by their own sound, sets/clears `needs_check`
- [ ] Studio read model + document expose `needs_check`; any edit of that border clears it
- [ ] Tests: a shortened chorus moves only later borders of that section; low-confidence border flagged, not moved silently; keyframes follow

### Phase 7 — A smarter "1" (helper 4)
Goal: count marks and step taps sit on the bar's real "1".
- [ ] `BeatTracker` downbeat phase scoring with a confidence margin; `MediaAudioFacts` keeps the first "1"
- [ ] One-off re-analysis job for act audio; songs with a hand-set beat keep it
- [ ] Studio: count marks and tap snapping use the grid; tests for the scoring on synthetic accent patterns (backend) and snapping (studio)

### Phase 8 — Trainer videos: filmed latest wins
Goal: per step the right video is chosen without clip editing.
- [ ] `act_video.preferred_at` + endpoint "Für diese Schritte nehmen"; recording time from the media item (`CapturedAt`, else upload time) in the read model
- [ ] Clip columns, clip and split endpoints, `act_part.main_video_id` removed; current video page loses clip/split UI
- [ ] `@furria/studio`: `videoForStepOf` (latest of preferred/filmed among covering videos) used by Üben and the landing
- [ ] Tests: winner rules incl. a later-filmed video beating an earlier preference; removal of clip data in migration

### Phase 9 — Group hub: Probenraum rows, new dance, earlier seasons
Goal: the Probenraum is reached from the group hub; a group admin creates a dance in two sheets.
- [ ] Group acts read model: dances of the relevant session + earlier seasons with own spot, step and video counts
- [ ] Hub panel: Probenraum row(s) (Beta, info sheet), "Noch leer" + "Neu anlegen", "Weiteren Tanz anlegen", "Frühere Sessionen"
- [ ] "Neu anlegen": sheet *Name* → sheet *Plätze verteilen* (tap order = spots, "Später") → empty editor; one create request with spots
- [ ] `/groups/$groupId/acts`, the hub act tiles and `act-card` hub parts removed
- [ ] Tests: create with spots (backend); read model counts and season split

### Phase 10 — Landing, Schritte and Einstellungen
Goal: the new landing, the step list and settings replace the score desk and the details pages.
- [ ] Landing (approved design): stage loop, Üben, training tile (date + own answer), next-performance tile (date + place), Schritte row, pencil for editors; read-only for ended sessions (season in the bar, no pencil, no training tile)
- [ ] `acts/$actId/steps`: list by parts with gap rows, step sheet ("Ab hier üben"), one pencil for editors
- [ ] `acts/$actId/settings`: Name, Plätze (holders, "tauschen", "Darf bearbeiten"), Archivieren
- [ ] Score landing (`act-hub/`, `KkScore*`), details routes/panes and `act-card` details removed
- [ ] Help sheets for landing, Schritte, Einstellungen

### Phase 11 — Üben and practice resume on the server
Goal: the new Üben for everyone, resuming across devices.
- [ ] `practice_position` table, PUT endpoint, value in the studio read model; `practice-memory` localStorage removed
- [ ] Üben (approved design): fixed viewport, video with 112 px stage inset swapping on tap, "Schritt n / m" + count dots, timeline strip, dock, ⋯ sheet (mirror on by default; no part loops, no large-text layout, no Gruppentraining); gaps play through
- [ ] Start tile "Üben" and landing resume use the server value
- [ ] Old lesson/practice bodies removed; help sheet
- [ ] Tests: resume write/read permissions (backend)

### Phase 12 — Editor: shell, timeline, undo bar, songs (helper 2)
Goal: the new editor at `acts/$actId/edit` handles the whole song chain.
- [ ] Shell: header (Gespeichert, ⋯ Verlauf/Einstellungen), picture zone, shared timeline with lanes and pill, dock, context tool row
- [ ] Undo bar on `edit-history` + replacement undo; editor confirmation dialogs removed
- [ ] Songs: + Song (single → Anfang/Ende hier; several → appended), song list (order, add between, remove), Zuschneiden with ±0,01/0,1 s nudges, Teilen, Ersetzen ("Enthält auch … – mit ersetzen?", "Passt zu keinem Song"), Entfernen → "ohne Musik" rows (Zurückholen · Einzeln … · Löschen)
- [ ] Verlauf: one history (versions + Wiederherstellen) as a child route
- [ ] Current music page reduced to its video part (songs live in the editor now); it goes in phase 16

### Phase 13 — Editor: steps and parts (helper 3)
Goal: steps are made and changed at the line.
- [ ] "Schritt beginnt hier" → playing tap flow "Schritt endet hier" (auto-stops at the next existing step), Früher/Später, Fertig
- [ ] Tap feedback: blue border flash, "Schritt n · auf k" on the line, soft click via the mix player
- [ ] Step tools: Teilen, Name, Tauschen, Zusammenlegen, Löschen; parts ("Teil beginnt hier", name, end)
- [ ] `needs_check` borders gold with "Passt" / Früher-Später; setup wizard route and `ST/setup` (except reused pieces) removed
- [ ] Help sheet for the editor (steps)

### Phase 14 — Editor: Aufstellung (helper 1)
Goal: formations are set per step end with presets that never cross.
- [ ] Picture rail (Anfang, Schritt 1…n), stage editing, selection (long press, chip, Alle wählen), Übernehmen
- [ ] Presets Linie · Kreis · Block · Reihe quer · Reihe tief + Spiegeln with **Kürzeste Wege** (`shortestAssignmentOf`, Hungarian) and one undo
- [ ] Tests: optimal assignment (no crossings for line/circle cases, optimality against brute force for small n)

### Phase 15 — Editor: ways and spot holders
Goal: movement and holders are edited in the editor.
- [ ] Ways drawn with the finger (hold a dot, draw while the step plays slowed; drag a point bends it), always soft
- [ ] "Wer steht hier": holder list with "tauschen"; facing compass
- [ ] Old job editor (`jobs/`, `desk/`, `KkEditor*`) removed

### Phase 16 — Editor: videos
Goal: training videos are added and checked inside the editor.
- [ ] Upload from the editor; placed by sound; unsure placement → "Prüfen" at the line; Für diese Schritte nehmen; Löschen
- [ ] Video inset in the picture zone (swap on tap)
- [ ] Old music/videos page (`ActMusicPage`, `screen/` music view) and routes removed

### Phase 17 — Editor on the tablet
Goal: landscape tablets get the two-thirds/one-third layout.
- [ ] Left: big stage (video swaps in), wider timeline, transport with time readout; right: panel with video, context caption and every tool inline (step menu, formation tools, crop values)
- [ ] Portrait keeps the phone frame; checked at 1180×820 and 820×1180

### Phase 18 — Move-outs and clean-up
Goal: nothing of the old studio remains; the catalogue lives with the running order.
- [ ] `/acts` catalogue + wishes move next to the running order (planners), without cast
- [ ] Sweep: unreferenced studio/ui code, `Sessionsauftritt` in member-facing copy, studio help texts, `scripts/studio-seed`
- [ ] CONTEXT.md/ADR cross-check; plan `plan/club-app/probenraum.md` marked done
- [ ] Full web + backend suites, `pnpm shot` of all Probenraum routes

## Risks & alternatives
- **Size.** 18 phases touch ~45k lines; each phase deletes what it replaced so the old and the new
  never live side by side for long. Phases 1–8 change data under the current screens, which must
  keep working until phases 9–17 replace them. The branch merges once all phases are done; between
  phases 12 and 15 the editor on the branch has no formation tools yet.
- **Per-border matching cost/quality.** Synchronous per border in the API request; a dance has
  ≤ ~60 borders. Low confidence keeps the song-level position and flags it — never a silent move.
- **Downbeat scoring** may be wrong on unusual music; it only applies with a clear margin, and
  hand-set beats always win.
- **Data deletion.** Cast changes, evening variants and pending final files are deleted (Beta data,
  ADR-0045/0046).
- **Anchors stay file + moment**; split halves cannot overlap, so no anchor becomes ambiguous.
  Anchoring by song id was considered and rejected (rewrites every keyframe for no user gain).
- **Rejected helpers** (voice, auto borders, AI naming, auto mirror partners, missing-list,
  draft/publish, tutorial) and **deferred helpers** — see Out of scope.

## Out of scope
- Weiterführen (copying a dance into the next session); evening variants; a guided setup flow.
- Count-in, "Zur nächsten Lücke", "Hier bearbeiten" from Üben, "Ansehen als …", a second guess for
  ambiguous video placement, recording inside the editor, remote buttons, offline use, stage guides
  and hints, section marks in the waveform, formation from a hall video.
