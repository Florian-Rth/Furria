---
rfc: 0002
title: Dance studio polish — fix everything, then make it a tool people use every week
status: draft
github_issue: 53
parent: 52
branch: feat/rfc-53-dance-studio-polish
created: 2026-10-30
---

# RFC 0002: Dance studio polish — fix everything, then make it a tool people use every week

## Summary

RFC 0001 (#52) built the dance studio: acts per session, appearances, the synced player, the
editors, evening adjustments and training. A UI test with five personas on 2026-10-30 (trainer,
choreographer, dancer, planner, outsiders with 200 % text and a screen reader) found twelve bugs,
three of them blockers, and a set of missing capabilities. Florian's ruling: **"Fix and improve
everything."** This RFC first fixes every bug, with data safety and blockers first. Then it builds the
improvements the testers asked for:
- undo and safe merging in the editor
- every training asks its cast, and trainers can mark absences
- members see the running order and their own act at a glance
- a hall training mode for the trainer
- a rebuilt editor: a timeline desk on large screens, step cards on phones, a set-up checklist
- a season grid and a backstage *Heute* view for the planner
- an accessibility sweep

## Motivation

- Evidence: `.dev/ui-test-findings.md` (synthesis), `web/tools/screenshot/out/ui-test/planner/report.md`
  and `…/outsiders/report.md` (raw reports with stills, videos and scripts).
- **Work gets lost without a word.**
  - An evening copy that pulls in an archived act fails every save with 422, but the success toast
    still shows. 31 acts become 1 on reload.
  - A part desk jumps to another part, so *Teil auflösen* hits the wrong part.
  - A 409 on formation or movement silently reverts.
  - A 40-second auto-order result is thrown away when a line is opened.
- **Blockers on the main path.**
  - Tapping a waiting final file crashes the page ("Too many re-renders").
  - A compact rendition returns 404, so the video freezes on phones.
  - One IP-wide refresh rate limit locks the whole hall Wi-Fi out, and the 429 reads as
    "Verbindung fehlgeschlagen".
- **The people the studio is for can't use it.**
  - Members can't see when their act is on stage (the Ablauf says *Kein Zugang*).
  - Regular trainings never ask for responses, so open spots never appear.
  - Kids have no accounts, so nobody can mark them absent.
  - Speech and show acts get the dance template.
  - The *Üben* tile lists acts with nothing to play and hides acts a trainer leads.
- **Editors work without a net.** There is no undo, no keyboard and no zoom for timing. Conflicts
  revert silently. The music cut drifts on a round trip.
- **The planner has no season view.** "Which act is on which evening, and is it ready?" takes six
  planners. Evening cast changes are invisible to the planner, and there is no mode for the night
  itself.
- **Accessibility.** 200 % text breaks the player, training mode and the fact grid. Cast avatars are
  missing from the accessibility tree. Evening titles have 2.69:1 contrast. Targets are 8–28 px.
  There is no `h1`, and the sliders don't answer arrow keys.
- **Known gaps from #52.**
  - The music-timeline and music-cut rules exist twice in the server (writes vs reads).
  - Concurrent writes return 500 instead of 409.
  - The cast and wish controls of a closed act look editable.
  - The phase-2 migration from running-order line to appearance has no test.

Nothing is in production, so the end state is built directly (CLAUDE.md). Nothing is scaled down
to "work today".

## Owner rulings that bind every phase

- **Practice and training screens behave like a native app.** They use one fixed viewport, no page
  scroll, no layout jumps while music runs, and they are calm (RFC 0001 phase 6 rulings).
- **Management screens are dense pro tools.** They show queue, grid and inline actions. There are no
  decorative metaphors and no hero blocks.
- **Mobile first, judged at 390 px**, then tablet and desktop.
- **No concept names in UI copy.** *Halle*, *season grid*, *timeline desk* and *step cards* are
  working names in this RFC. The copy on screen is plain German (e.g. *Training starten*, *Heute*).
  The running order's UI copy stays *Ablauf* (CONTEXT.md retires *programme*).
- **Design rounds = lab variants on real data, Florian picks** (⚖, the page-rework way, as in
  RFC 0001 phases 6/7b). The rulings of a pick are recorded in the phase.
- **Every new or rebuilt screen meets the accessibility bar of phase 19 from the start.** That bar is
  200 % text, ≥ 44 px targets, names in the accessibility tree, AA contrast, an `h1` and landmarks,
  and the keyboard on every slider. The sweep in phase 19 covers what is left over.

## Proposal

### 1. Bugs (B1–B12 and the #52 gaps)

Each bug gets a regression test where the behaviour is business logic (server rule, pure engine
function). It gets a browser check where it is pure UI. Fix direction per bug is in the phase tasks.
Silent failure is never acceptable: every failed write shows a red, sticky message with the server's
reason, and a success toast only follows a confirmed write.

### 2. Safety: undo, history, merging

- **Undo per write.** Every studio write (music cut, step and part marks, spots, keyframes, videos,
  cast, evening changes) shows a snackbar with *Rückgängig*. Undo issues the inverse write.
  Snackbars are scoped to their route and dismissed on navigation.
- **History.** The act page keeps the writes of this visit as a list (who, what, when). Ctrl+Z and
  Ctrl+Shift+Z walk it.
- **The choreography is versioned on the server.** Every save stores a version with its author and
  time. The history lists the versions, and restoring one writes a new version, never a rewind.
- **Merging instead of conflicts.** A save carries its base version and only the spots and keyframes
  it changed. The server applies it when none of those changed since the base. Only a real overlap
  answers 409 with the overlapping spots and keyframes, and the client asks just about those.
- **Desks are bound to an entity id and titled with it** (*Teil „Marsch" · Schritt 3–7*). A desk
  never switches its target under the user. When its target is gone, it closes with a message.
- **Evening edits get a gold band** naming the evening (*Du bearbeitest Herbstball 31.10. — nicht
  die Session*).

### 3. Attendance: every training asks its cast (domain change)

- A calendar entry of kind *Training* or *Rehearsal* that a group with an act in the running session
  owns or takes part in **always asks for an attendance response** from that act's cast. The cast is
  concerned by the entry for that purpose.
- **A group admin can mark a cast member absent or present** by tapping the name on the training.
  This covers kids without accounts. The mark is stored as that person's response, together with who
  recorded it. When the person answers herself, her answer replaces the mark. The latest answer wins
  and the trail shows both.
- An **open spot** is then the spot of a holder whose response for that training is *Nein*, whether
  she gave it herself or a group admin marked it.
- Training rows read *9 von 10 da · Platz 10 offen*.
- CONTEXT.md (*Calendar entry*, *Open spot*) and an ADR record the change.

### 4. Members: their act and the running order

- **Running order for every evening, read-only.** Everyone who sees an evening sees its running order,
  with each act's position and an approximate time from the evening's start and the acts' lengths.
  Their own group and acts are highlighted. The website keeps showing the order only, never times.
  Planner wishes stay hidden from cast members.
- **The member's act card** (the working name is *Mein Auftritt*) shows, in the order a member needs
  it:
  - the next evening, with position and approximate stage time
  - the next training, with *Bin da* / *Kann nicht*
  - *Üben*, disabled with whom to ask while there is no music
  - the cast by name

  For editors, the stats, co-editors, wishes and session facts sit behind *Details*.
- **The act kind picks the template.** *Tanz* and *Show* get the studio. *Rede* gets its own template:
  notes, evenings with position and time, and the cast, with no studio stats. *Ablaufpunkt* gets the
  bare minimum.
- **Start *Üben*** lists only acts that can be played (they have music). It includes the acts a
  trainer leads as a group admin, and *+n weitere* becomes a button.

### 5. Hall mode (working name *Halle*)

Training mode and the landscape player merge into one view for the trainer's phone in the hall:
- dark and landscape-first
- a huge count (~30 % of the height), with the step name and the next step on the left
- the stage on ~60 % of the right, with named dots and today's absences
- keys: previous, play, next, loop, tempo 75/100, with a count-in before play and before every loop
  pass
- video off by default
- the screen kept awake (Wake Lock)

The player gets a **step rail** instead of the hair-thin step segments: ≥ 44 px targets, part
labels as buttons, and horizontal scroll inside a fixed box, so nothing jumps. A **large-text
layout** (≥ 150 % text or < 360 px width) stacks the player:
1. the step name
2. the stage
3. one play key
4. a 2×2 key grid

### 6. Editor rebuilt

- **Tablet and desktop: a timeline desk.** Zoomable lanes for parts, steps, the waveform with beat
  ticks, videos and paths. Edits snap to counts. The playhead stays centred while playing. Keys:
  Space, arrows and Ctrl+Z.
- **Phone: step cards.** One card per step, swipeable. Each card shows the name, a big stage with
  named dots, labelled formation chips, a count bar and *Rückgängig*. Music, video and the final file
  move to their own page (*Musik & Video*).
- **Set-up checklist for an empty act**: *Musik → Schritte → Plätze → Aufstellung → Video →
  Endfassung*. Each row jumps into its tool with the action prepared. Once the act has started, the
  checklist lives on as a progress chip.

### 7. Planner: season grid and *Heute*

- **Season grid** (working name) on `/acts` for planners: acts × evenings of the session.
  - A cell shows the position, *group asked* (in the tray) or *adjusted* (evening changes). One click
    adds or removes the act on that evening.
  - A readiness meter per act, derived from music, final file, steps, formation, videos and cast.
  - The first column is sticky. On phones it scrolls one evening per swipe.
  - The line pane shows the evening's cast changes and lets the planner change them inline.
- ***Heute*** = the backstage view of live direction (CONTEXT.md *Live direction*). It is a fixed
  viewport, landscape-first, and has no editing:
  - now / next / after, with elapsed time
  - who is missing and who stands in
  - the people to call for the next acts
  - one big *Weiter* key that moves the live pointer through the running order
  - the screen kept awake

### 8. Server

- **Refresh rate limit** per token family or device, not per IP. A 429 gets its own copy (*Zu viele
  Versuche — gleich noch einmal*), never "Verbindung fehlgeschlagen".
- **Auto-order** streams the best order found so far, with a live conflict counter and *Jetzt nehmen*.
  It is capped at ~5 s by default. Its result stays as a suggestion until *Übernehmen* or *Verwerfen*.
- **Evening copy** leaves archived acts out and says so.
- **Permission-gated queries.** The club app only asks what the user may read, so there is no 403 noise
  on Start, the calendar, settings or the act pane.
- **One home for the music-timeline and music-cut rules** (Core), used by writes and reads.

## Phases

Each phase leaves the system intact: it builds, tests are green, migrations are complete, and every
endpoint has a caller in the app. Each fits roughly 120k tokens. ⚖ = Florian picks between lab
variants. **∥ group** = phases that touch independent files and can run in parallel worktrees, merged
in the listed order.

| order | phases | parallel |
|---|---|---|
| 1 | 1, 2, 3, 4 | ∥ A |
| 2 | 5, 7, 8 | ∥ B (6 follows 5) |
| 3 | 6 | after 5 |
| 4 | 9, 11 | ∥ C (both ⚖ labs) |
| 5 | 10, 12 | ∥ D (10 after 9, 12 after 11) |
| 6 | 13 | ⚖, after 6 |
| 7 | 14, 15 | ∥ E, then 16 |
| 8 | 17 | ⚖ |
| 9 | 18a, 18b | ∥ F |
| 10 | 19, 20 | ∥ G |

### Phase 1 — Player and media bugs (∥ A)
Goal: the player and media never crash, freeze or jump.
- [ ] B1: tapping a waiting final file no longer loops renders; *Probehören* and *Endfassung übernehmen* are reachable (act 5)
- [ ] B2: a missing compact rendition falls back to the original (no 404 freeze on phones); find the stale media reference (`/api/media/20/compact`); no layout swap ~4 s into play; the studio read stops polling once nothing is processing
- [ ] B7: a double tap left/right no longer toggles play; the step-name block keeps a fixed height (no 5–6 px jump)
- [ ] B11 (player): the count shows 1 at a step start; unnamed steps get *Schritt n*, never blank or "…: dorthin springen"; "1 Wegpunkt" plural rule
- [ ] Landscape: gesture hints never cover the stage, and they show only for the first 3 visits with clearer copy; X close respects `from=` / history
- [ ] Regression tests for the engine fixes (count, step naming); browser check of B1/B2/B7 at 390 px

### Phase 2 — Studio editor data safety (∥ A)
Goal: no editor write is lost or applied to the wrong thing.
- [x] B4: the part desk stays on its part after *Beginnt später*; *Teil auflösen* hits the right part; a rename is never overwritten by a stale name
- [x] B5: a 409 on formation or movement shows a sticky message with *Neu laden*; it never reverts silently
- [x] B10: the music cut snaps to beats/counts and survives a round trip without drift; a drag during playback grabs the selected dot, never a passing one; presets act only on the visible selection
- [x] B11 (editor): withdrawing *Wir tanzen hier nicht* names what is lost (evening cast, own formation) and asks first
- [x] #52 gap: concurrent studio writes return 409 (concurrency token / unique violation mapped), never 500, with endpoint tests
- [x] #52 gap: a closed act's cast and wish controls render read-only (no editable look)
- [x] Endpoint and pure tests for every server-side fix

### Phase 3 — Planner bugs and the appearance migration (∥ A)
Goal: the planner never claims a success it doesn't have and never throws work away.
- [x] B3: an evening copy leaves archived acts out and says *n archivierte Auftritte nicht übernommen*; any 422 shows as a red sticky banner with the reason; the success toast only follows a confirmed save
- [x] Archived acts are marked *archiviert* in the tray and in *Wählen*; archiving offers *Aus allen offenen Abenden nehmen*
- [x] B8: auto-order streams the best order found so far with a live conflict counter and *Jetzt nehmen*, capped at ~5 s by default; the suggestion is its own state until *Übernehmen* / *Verwerfen*, and opening a line never discards it
- [x] B11: snackbars are scoped to their route and dismissed on navigation (global)
- [x] Minors: *Muss* is not preselected without a wish; `/acts` counts follow the search; the toolbar wraps at 390×664; badges move to their own row in the event header on phones
- [x] #52 gap: test for the phase-2 data migration from running-order line to appearance (positions, pins, blocks, cast)
- Notes: auto-order answers as an NDJSON stream (`POST …/suggestion` with `seedActIds`, `searchSeconds` 1–60, default 5); *Weiter suchen* seeds 30 s from the best order so far. *Aus allen offenen Abenden nehmen* = `DELETE /api/acts/{actId}/open-appearances` (planners; evenings from today on; closes the position gap, drops rules and suspended wishes naming the act, evening adjustments go with it). Notices with actions close on navigation; a failed planner save shows a sticky red notice with the reason, *Erneut versuchen* and *Neu laden*.

### Phase 4 — Auth, permissions and dead ends (∥ A)
Goal: nobody is locked out or sees a 403 they didn't cause.
- [ ] B6: the rejected-refresh rate limit is keyed per token family or device, not per IP; 429 gets its own copy in `@furria/api-client` failure classification
- [ ] B9: the calendar works for group admins without `scope=all`; Start, settings and the act pane only query what the user may read (no 403 on `/running-orders`, `/acts`, `/groups`)
- [ ] *Kein Zugang* pages offer *Zur Startseite* / *Zu meinen Auftritten*, never a back link to another forbidden page
- [ ] Copy: *Der Auftritt konnte nicht geladen werden*; an unknown group id reads *Diese Gruppe gibt es nicht*; the act page keeps its back chevron and title on error and renders header + skeleton on a cold load
- [ ] Endpoint tests for the rate-limit key and the new permission rules

### Phase 5 — Choreography history and merge (server) (∥ B)
Goal: choreography saves merge per spot and keyframe and can be restored.
- [x] Choreography versions stored per save (author, time, document), for the session version and evening copies; migration
- [x] Save = base version + changed spots/keyframes; applied when untouched since the base, 409 with the overlapping spots/keyframes otherwise
- [x] Read the version list; restore writes a new version
- [x] Core rules pure and tested (merge, overlap detection); endpoint tests; CONTEXT.md *Choreography* updated
- Notes: `choreography_version` keeps every write (kind *saved / restored / spotRemoved / musicAdopted*, author, time, full document); the migration seeds each existing choreography's current version. `PUT …/choreography` and `PUT …/evenings/{eventId}/choreography` take `baseVersion` + only the changed `tracks`; a track not sent stays untouched. Keyframes are matched by their music anchor (source + seconds); the three-way merge takes the other side wherever one side left a keyframe as it was, and refuses only same-keyframe clashes with `409 { errors.conflict, overlaps: [{ spotId, keyframes: [{ sourceMediaItemId, seconds }] }] }`. Adopting a final file is a barrier: a base or restore from before it answers 409. An evening copy made from an older session version merges the newer session into it. Reads/restores: `GET …/choreography/versions`, `POST …/choreography/versions/{version}/restore` and the same under `…/evenings/{eventId}/`; restore drops tracks of spots removed since. A save that loses the version race is re-merged on the server (up to 3 tries); a save that changes nothing keeps the version. History has no retention yet (full document per write) — revisit if it grows. The club app already sends only the changed tracks with `baseVersion`; the history list and restore get their UI in phase 6.

### Phase 6 — Undo everywhere (club app)
Goal: every studio write can be undone, and conflicts ask only about real overlaps. Follows phase 5.
- [ ] Undo service: per write an inverse, a snackbar with *Rückgängig*, the visit's history list, Ctrl+Z / Ctrl+Shift+Z
- [ ] Wire it into every studio write (music, steps, parts, spots, keyframes, videos, cast, evening changes)
- [ ] Choreography saves send patches; a 409 opens a merge prompt naming only the overlapping spots/keyframes
- [ ] Version history of the choreography (session and evening copy) in the act's history, with *Wiederherstellen* (phase-5 endpoints)
- [ ] Desks bound to an entity id and titled with it; a desk closes with a message when its target disappears
- [ ] Gold band naming the evening while editing an evening's version
- [ ] Pure tests for inverse-building; browser check of undo, conflict and band at 390 px and desktop

### Phase 7 — Attendance: every training asks its cast (∥ B)
Goal: open spots appear for every training, including kids without accounts.
- [ ] ADR + CONTEXT.md: group trainings/rehearsals always ask the act's cast; a group admin's mark is stored as the person's response with who recorded it, and her own answer replaces it
- [ ] Server: response recorded on behalf (`RecordedBy`), the cast concerned for the entry, permission for group admins of the act's group; migration
- [ ] Studio read: training rows with present/absent counts and open spots from both kinds of *Nein*
- [ ] Club app: tap a name on the training to mark it absent/present (dense list, undoable); rows read *9 von 10 da · Platz 10 offen*; owed responses on Start include the new trainings
- [ ] Endpoint tests (mark, override by her own answer, open spot, permission)

### Phase 8 — Running order visible to members (∥ B)
Goal: everyone who sees an evening sees when each act is on.
- [ ] Server: read-only running order for everyone who sees the evening (position + approximate time from the evening's start and act lengths); planner wishes left out for non-planners
- [ ] Calendar sheet of an evening: section with the running order, own group and acts highlighted
- [ ] Act page *Abende*: position + approximate time, full-contrast titles, state as a chip (*im Ablauf* / *noch offen*)
- [ ] Endpoint tests for visibility and the time derivation

### Phase 9 — ⚖ Lab: the member's act, act-kind templates, *Üben* (∥ C)
Goal: Florian picks how members see their act and how each act kind looks.
- [ ] Server reads the lab needs: the member's act summary (next evening + position + time, next training + her answer, cast names, playable), the *Üben* list (playable acts incl. those a trainer leads)
- [ ] Three divergent lab variants on real data at 390 px and desktop: member act card + *Details* for editors, *Rede* template, empty-act state with whom to ask, group hub with *Auftritte* first
- [ ] Pitch + Florian's pick; rulings recorded in the RFC

### Phase 10 — Promote the member's act and templates (∥ D, after 9)
Goal: members land on their act card; each kind has its template.
- [ ] Act page by kind (*Tanz*/*Show* studio, *Rede*, *Ablaufpunkt*); stats, co-editors, wishes and session facts behind *Details* for editors
- [ ] Member act card on the act page and in the group hub (*Auftritte* directly under the header); group cards become links
- [ ] Start *Üben* tile: playable acts only, trainer-led acts included, *+n weitere* as a button
- [ ] Cast as a named list in the accessibility tree; no repeated act/group name; jargon replaced (no planner wishes for cast)
- [ ] Lab variants removed; browser check light/dark at 390 px

### Phase 11 — ⚖ Lab: hall mode (∥ C)
Goal: Florian picks the trainer's hall view.
- [ ] Count-in engine (pure, tested): before play and before every loop pass, tempo 75/100
- [ ] Three divergent landscape-first lab variants on real data (dark, huge count, step + next step, stage with named dots and today's absences, keys, video off by default, Wake Lock); filmed playback at 60 fps
- [ ] Pitch + Florian's pick; rulings recorded in the RFC

### Phase 12 — Promote hall mode, step rail, large-text player (∥ D, after 11)
Goal: one hall mode replaces training mode and the landscape player; the player is usable at 200 % text.
- [ ] Hall mode replaces `?view=training` and the landscape player (one view, Wake Lock, absences of the chosen training)
- [ ] Step rail in the player (≥ 44 px, part labels as buttons, scroll inside a fixed box, no jumps)
- [ ] Large-text layout (≥ 150 % text or < 360 px): step name → stage → play → 2×2 keys
- [ ] Keyboard in player and hall mode: Space, ←/→ step, ↑/↓ tempo, L loop; listed in the ⓘ sheet
- [ ] Stage ARIA names the own spot and open spots; dot numbers hide below 18 px
- [ ] Old training kit and lab variants removed; filmed check at 390 px portrait and 844×390 landscape

### Phase 13 — ⚖ Lab: editor rework
Goal: Florian picks the timeline desk, the phone step cards and the set-up checklist. Follows phase 6.
- [ ] Timeline desk variants (tablet/desktop): lanes for parts, steps, waveform with beat ticks, videos, paths; zoom, snap to counts, centred playhead, keyboard
- [ ] Phone step-card variants: name, big stage with named dots, labelled formation chips, count bar, *Rückgängig*; *Musik & Video* page
- [ ] Set-up checklist variants for an empty act and its progress chip
- [ ] All on real data with undo and the evening band from phase 6; pitch + Florian's pick; rulings recorded

### Phase 14 — Promote the timeline desk (∥ E)
Goal: editing on tablet and desktop runs on the timeline desk.
- [ ] Lanes, zoom, snap to counts, centred playhead
- [ ] Space / arrows / Ctrl+Z, drag on every lane through the undo service
- [ ] The old desktop edit panes for these tools removed; browser check at 1024 and 1440 px

### Phase 15 — Promote phone step cards and *Musik & Video* (∥ E)
Goal: editing on phones runs on step cards.
- [ ] Swipeable step cards with the stage editor, formation chips and count bar
- [ ] *Musik & Video* page: music cut, final file, videos
- [ ] The old phone edit panes removed; browser check at 390 px

### Phase 16 — Promote the set-up checklist
Goal: an empty act guides its editors to a first playable version. Follows 14 and 15.
- [ ] Checklist *Musik → Schritte → Plätze → Aufstellung → Video → Endfassung*, each row opening its tool with the action prepared (desk and step cards)
- [ ] Progress chip once the act has started; state derived from the studio read (pure, tested)
- [ ] Lab variants removed

### Phase 17 — ⚖ Lab: season grid and *Heute*
Goal: Florian picks the planner's season view and the backstage view.
- [ ] Server: season read (acts × evenings: position, in tray, adjusted; readiness derived per act) and the live pointer for live direction (advance, read)
- [ ] Season-grid variants (dense, sticky first column, one evening per swipe on phones, one-click add/remove, readiness meter, inline evening cast)
- [ ] *Heute* variants (fixed viewport, landscape-first: now/next/after, missing and standing in, people to call, *Weiter*, Wake Lock)
- [ ] Pitch + Florian's pick; rulings recorded

### Phase 18a — Promote the season grid (∥ F)
Goal: the planner answers "which act, which evening, ready?" on one screen.
- [ ] Season grid on `/acts` for planners; one-click add/remove writes appearances (undoable)
- [ ] Readiness meter in the grid and the planner's line pane; line pane shows and edits the evening's cast changes
- [ ] Change line for group-made changes after *Ablauf steht* (*„Kindergarde tanzt neu mit …" · gestern 14:02*, *Einplanen* inline)
- [ ] Endpoint tests; browser check at 390 px and 1440 px

### Phase 18b — Promote *Heute* (∥ F)
Goal: the night runs from one calm screen.
- [ ] `/events/$eventId/heute` replaces *Live-Regie · kommt noch*; the operator advances, everyone else follows
- [ ] People to call from the evening cast and the attendance responses
- [ ] Endpoint tests for the live pointer; filmed check landscape and portrait

### Phase 19 — Accessibility and large-text sweep (∥ G)
Goal: every screen of the studio and planner passes the bar.
- [ ] 200 % text on player, hall mode, act page facts (one column above 150 %), planner, season grid
- [ ] Targets ≥ 44 px; AA contrast (evening titles and muted text); `h1` and landmarks on every act screen; real lists and `dl` structure
- [ ] Arrow keys on every slider; long-press actions have a button or keyboard equivalent; ⓘ details is a link
- [ ] axe run over the studio and planner routes is clean (serious/critical)

### Phase 20 — Consolidation, test data, wrap-up (∥ G)
Goal: one home for the music rules, a clean database, docs in sync.
- [ ] #52 gap: music-timeline and music-cut rules in one Core module used by writes and reads; tests moved onto it
- [ ] Remove the UI-test data: acts 14–34 "PT …", event 66 "PT Probeabend", the running orders on evenings 19/20, *Wir tanzen hier* and cast changes on 16/17/20, act 5's partial build and waiting final file, act 3 part *Marsch* id 1→4
- [ ] CONTEXT.md, docs and `plan/club-app/group-year.md` status updated

## Risks & alternatives

- **Merging choreography.** A per-spot/keyframe merge can combine two edits that each make sense but
  clash on stage (two dots on one spot). The merge stays structural. The stage editor's existing
  conflict hints show the result, and undo is one tap away.
- **Responses recorded on behalf.** Someone else's answer stored as hers could be wrong. It shows who
  recorded it, her own answer always replaces it, and only group admins of the act's group may record.
- **Streaming auto-order.** A capped search may stop before the exact best order (*Ablauf: best order
  only*). The cap is a default. *Weiter suchen* continues, and the result says whether it is proven
  best.
- **Many ⚖ rounds.** Five labs could stall the RFC. Bug, safety, attendance and visibility phases
  don't depend on any pick and ship first.
- **Considered and rejected:**
  - a server-side undo log for all writes (client inverses plus choreography versions cover it)
  - last-write-wins for choreography (silent loss)
  - a separate attendance store for kids (one response store, recorded on behalf)
  - raising the per-IP rate limit (still locks out a hall)

## Out of scope

- The text studio for *Rede* / *Sketch* (uploaded text, cue lines). Phase 10 only gives speeches
  their own template.
- *Weitermachen*, offline practising, the evening's tech (show book, playback desk), memory features
  (RFC 0001 out of scope).
- Lineage UI (*Folgt auf*) and *Trotzdem festhalten* for accepted conflicts in *Prüfen*. These are
  candidates for a later RFC.
