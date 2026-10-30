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
- [x] B1: tapping a waiting final file no longer loops renders; *Probehören* and *Endfassung übernehmen* are reachable (act 5)
- [x] B2: a missing compact rendition falls back to the original (no 404 freeze on phones); find the stale media reference (`/api/media/20/compact`); no layout swap ~4 s into play; the studio read stops polling once nothing is processing
- [x] B7: a double tap left/right no longer toggles play; the step-name block keeps a fixed height (no 5–6 px jump)
- [x] B11 (player): the count shows 1 at a step start; unnamed steps get *Schritt n*, never blank or "…: dorthin springen"; "1 Wegpunkt" plural rule
- [x] Landscape: gesture hints never cover the stage, and they show only for the first 3 visits with clearer copy; X close respects `from=` / history
- [x] Regression tests for the engine fixes (count, step naming); browser check of B1/B2/B7 at 390 px
- Notes: B1 was a render-phase `setState` comparing video objects that the final-file preview rebuilds every render. B2's `/api/media/20/compact` came from videos rendered by a media worker that predates the phone rendition; each 404 queued a repair that flipped the video to *Processing*, causing the polling and the layout swap. The server now serves the full video for a missing phone rendition (not cached as immutable) and only repairs when both are gone. The count reads 1 at a step start because a step start stored a hair before its beat (7.619 vs 7.61905) now counts as that beat.

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
- [x] B6: the rejected-refresh rate limit is keyed per token family or device, not per IP; 429 gets its own copy in `@furria/api-client` failure classification
- [x] B9: the calendar works for group admins without `scope=all`; Start, settings and the act pane only query what the user may read (no 403 on `/running-orders`, `/acts`, `/groups`)
- [x] *Kein Zugang* pages offer *Zur Startseite* / *Zu meinen Auftritten*, never a back link to another forbidden page
- [x] Copy: *Der Auftritt konnte nicht geladen werden*; an unknown group id reads *Diese Gruppe gibt es nicht*; the act page keeps its back chevron and title on error and renders header + skeleton on a cold load
- [x] Endpoint tests for the rate-limit key and the new permission rules

Done 2026-10-30. Rejected refreshes count per presented refresh token (its digest), so one stale
phone only locks itself out (`RateLimits:SignIn:RejectedRefreshesPerToken`, 20); a wide per-IP
backstop (`RejectedRefreshesPerIp`, 200) still caps token guessing. A 429 at
boot reads *Zu viele Versuche – gleich noch einmal*. `GET /calendar` and `/calendar/entries/{id}`
need a person instead of `club.read`; without `club.read` only entries tied to her groups show
(CONTEXT.md). `GET /groups` admits group admins and the managing login. Permission-gated screens
show their header and a skeleton until the permissions are known, so they never fire a query
that 403s.

### Phase 5 — Choreography history and merge (server) (∥ B)
Goal: choreography saves merge per spot and keyframe and can be restored.
- [x] Choreography versions stored per save (author, time, document), for the session version and evening copies; migration
- [x] Save = base version + changed spots/keyframes; applied when untouched since the base, 409 with the overlapping spots/keyframes otherwise
- [x] Read the version list; restore writes a new version
- [x] Core rules pure and tested (merge, overlap detection); endpoint tests; CONTEXT.md *Choreography* updated
- Notes: `choreography_version` keeps every write (kind *saved / restored / spotRemoved / musicAdopted*, author, time, full document); the migration seeds each existing choreography's current version. `PUT …/choreography` and `PUT …/evenings/{eventId}/choreography` take `baseVersion` + only the changed `tracks`; a track not sent stays untouched. Keyframes are matched by their music anchor (source + seconds); the three-way merge takes the other side wherever one side left a keyframe as it was, and refuses only same-keyframe clashes with `409 { errors.conflict, overlaps: [{ spotId, keyframes: [{ sourceMediaItemId, seconds }] }] }`. Adopting a final file is a barrier: a base or restore from before it answers 409. An evening copy made from an older session version merges the newer session into it. Reads/restores: `GET …/choreography/versions`, `POST …/choreography/versions/{version}/restore` and the same under `…/evenings/{eventId}/`; restore drops tracks of spots removed since. A save that loses the version race is re-merged on the server (up to 3 tries); a save that changes nothing keeps the version. History has no retention yet (full document per write) — revisit if it grows. The club app already sends only the changed tracks with `baseVersion`; the history list and restore get their UI in phase 6.

### Phase 6 — Undo everywhere (club app)
Goal: every studio write can be undone, and conflicts ask only about real overlaps. Follows phase 5.
- [x] Undo service: per write an inverse, a snackbar with *Rückgängig*, the visit's history list, Ctrl+Z / Ctrl+Shift+Z
- [x] Wire it into every studio write (music, steps, parts, spots, keyframes, videos, cast, evening changes)
- [x] Choreography saves send patches; a 409 opens a merge prompt naming only the overlapping spots/keyframes
- [x] Version history of the choreography (session and evening copy) in the act's history, with *Wiederherstellen* (phase-5 endpoints)
- [x] Desks bound to an entity id and titled with it; a desk closes with a message when its target disappears
- [x] Gold band naming the evening while editing an evening's version
- [ ] Pure tests for inverse-building; browser check of undo, conflict and band at 390 px and desktop (pure tests done; browser check open)
- Notes: every studio mutation remembers the cached studio before its optimistic patch (`remember` in `useApiMutation`) and records the write as data (`StudioWrite`); `inverseOf(studio, write, createdIds)` builds the inverse write, `performStudioWrite` replays it. Removals are undone by re-creating (new ids), so older history entries are re-pointed to the new ids (`studio-remap.ts`). A replay that fails part-way marks its entry as no longer reversible and reloads the studio. Writes that can't be reversed (adopting the final file, dropping an evening copy, leaving an evening that had its own cast/spots/formation) are listed as *nicht umkehrbar* and stop undo there. The visit's history lives per act in a module store, cleared when the act page closes; Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y work outside text fields. Undo snackbars are one replacing notice group (`KkNoticeRequest.group`, expires like a plain notice). The 409 body now reaches the client (`Refusal.payload`, `refusalPayloadOf`); the prompt lists the spots with their timeline times, *Meine Fassung behalten* refetches and saves the same changes on the fresh base, *Andere übernehmen* reloads. Act page: *Verlauf* (this visit, undo/redo buttons) and *Fassungen der Aufstellung* with *Wiederherstellen* (undoable); the evening pane lists the evening copy's versions. Step, song and video desks bind to the id they were opened on; *Teil „Marsch" · Schritt 3–7*. `KkStudioView.Band` + `BandNote` put the gold evening band above the studio only while it is shown. Open: the evening dancer inverse flips `dances` without reading the old state; a step re-mark puts its texts on the last returned id.

### Phase 7 — Attendance: every training asks its cast (∥ B)
Goal: open spots appear for every training, including kids without accounts.
- [x] ADR + CONTEXT.md: group trainings/rehearsals always ask the act's cast; a group admin's mark is stored as the person's response with who recorded it, and her own answer replaces it
- [x] Server: response recorded on behalf (`RecordedBy`), the cast concerned for the entry, permission for group admins of the act's group; migration
- [x] Studio read: training rows with present/absent counts and open spots from both kinds of *Nein*
- [x] Club app: tap a name on the training to mark it absent/present (dense list, undoable); rows read *9 von 10 da · Platz 10 offen*; owed responses on Start include the new trainings
- [x] Endpoint tests (mark, override by her own answer, open spot, permission)
- Notes: ADR-0032. The entry keeps its switch (`asksForResponse`); `asksTheCast` is derived (training/rehearsal kind + a non-archived act of an owner/participating group in the entry's relevant session) and the calendar offers an answer on either. Guests in the cast are concerned (owed on Start, may see and answer). Marks: `PUT`/`DELETE /api/acts/{actId}/trainings/{calendarEntryId}/attendance/{personId}` (group admins of the act's group, coming trainings of the act, cast members only, *Ja*/*Nein*); the latest answer wins and `attendance_response_change` keeps the trail (backfilled). `DELETE` is the undo of a mark: it drops the latest mark from the trail and restores the answer before it (409 once she answered herself). Act page: a training row opens *Wer ist da* (side pane / bottom drawer) with the cast grid, the trail and *Training starten*; each mark raises a notice with *Rückgängig* (always the withdrawal). Answers and marks lock the response row (`FOR UPDATE`) so a withdrawal never overwrites an answer given meanwhile; the calendar shows a guest in the cast the group-only trainings of her act's group. `KkCastGrid` takes an optional add tile. Left for phase 6: undo notices with actions stay until answered (the notice queue's rule), so a fast run of marks queues one *Rückgängig* each.

### Phase 8 — Running order visible to members (∥ B)
Goal: everyone who sees an evening sees when each act is on.
- [x] Server: read-only running order for everyone who sees the evening (position + approximate time from the evening's start and act lengths); planner wishes left out for non-planners
- [x] Calendar sheet of an evening: section with the running order, own group and acts highlighted
- [x] Act page *Abende*: position + approximate time, full-contrast titles, state as a chip (*im Ablauf* / *noch offen*)
- [x] Endpoint tests for visibility and the time derivation

Done 2026-10-30. `GET /calendar/entries/{id}/running-order` answers whoever sees the entry (else
404): the placed acts with position, approximate stage time and `own` (her group or her evening
cast), plus whether the order is confirmed; no rules, wishes or findings. Stage time = evening
start + each earlier act's length + a 2-minute changeover; length = adopted final file, else the
working mix, else the kind's typical length (dance 6, show 8, music 5, speech 10, point/none 5 min)
— Core `StageClock`. The first act shows the start, later ones *ca.* rounded to 5 minutes. The
studio read's evening appearance carries `position` + `stageStartsAt` instead of `placed`.
`KkHubRow` gained `dimWhenInert` so the act's evening titles keep full contrast when not linked.

### Phase 9 — ⚖ Lab: the member's act, act-kind templates, *Üben* (∥ C)
Goal: Florian picks how members see their act and how each act kind looks.
- [x] Server reads the lab needs: the member's act summary (next evening + position + time, next training + her answer, cast names, playable), the *Üben* list (playable acts incl. those a trainer leads)
- [x] Three divergent lab variants on real data at 390 px and desktop: member act card + *Details* for editors, *Rede* template, empty-act state with whom to ask, group hub with *Auftritte* first
- [x] Pitch + Florian's pick; rulings recorded in the RFC
- Ruling (2026-10-30): **C — four tiles**, worked out further: the first view shows only what matters right now, enriched with the best of A (next-evening hero line, training answered in place, cast by name) and B (what's coming, *Bin da*/*Kann nicht* inline); no empty space under the tiles — the first screen is filled and fixed. **No stage times in v1**: position (*Nr. 5*) only, no *ca. HH:MM* anywhere.
- Notes: `GET /acts/mine` now also lists the acts of groups she leads and carries per act `viewerInCast`, `viewerLeads`, `playable` (a song or an adopted final file), `cast`, `editors` (group admins + co-editors = whom to ask), `nextEvening` (coming, not cancelled: position, approximate stage time) and `nextTraining` (her answer, present/absent counts). It reads set-based over all her acts (`ActGlanceReader`), and it is the one read for the act card, the group hub and the Start *Üben* list. Lab: `/lab` → *Entwürfe* lists her acts and groups per variant. A `/lab/act-a/…` = one dense card per act (hero *Nr.* + time, training answer in place, red *Üben*, cast chips; *Details* drawer/side pane; hub = swipeable cards). B `/lab/act-b/…` = the act's coming trainings and evenings in time order, grouped by week, answers inline, sticky *Üben* bar, *Für mich* / *Details* switch; hub = act rows with their next item. C `/lab/act-c/…` = 2×2 tiles *Abend · Training · Üben · Besetzung*, each a door to a sheet; editors' *Details* fold; hub = one wide tile per act. Each has `/…/$actId` and `/…/group/$groupId`; primitives `KkPass*`, `KkAgenda*`, `KkFacet*`.

### Phase 10 — Promote the member's act and templates (∥ D, after 9)
Goal: members land on their act card; each kind has its template.
- [x] Act page by kind (*Tanz*/*Show* studio, *Rede*, *Ablaufpunkt*); stats, co-editors, wishes and session facts behind *Details* for editors
- [x] Member act card = variant C refined (see phase 9 ruling) on the act page and in the group hub (*Auftritte* directly under the header); group cards become links
- [x] No stage times in v1: drop `stageStartsAt`/*ca.* times from the member running order, act page *Abende*, `nextEvening` and the calendar sheet (server + client, incl. `StageClock`); position only. Unconfirmed running orders stay visible with the *wird noch geplant* note
- [x] Start *Üben* tile: playable acts only, trainer-led acts included, *+n weitere* as a button
- [x] Cast as a named list in the accessibility tree; no repeated act/group name; jargon replaced (no planner wishes for cast)
- [x] Lab variants removed; browser check light/dark at 390 px

Done 2026-10-30. `/acts/$actId` now lands everyone on the act card (variant C refined); the player is
`?view=play` (studio editing `?view=play&edit=true`), the editors' page `?view=details`. The card
(`features/act-card`) fills the first phone screen with its tiles (`KkFacetStage` + `KkFacetGrid fill`),
no scroll for members; on wide screens the tiles sit above a pane + side pane. Doors by kind: *Tanz*/
*Show* = Abend · Training · Üben · Besetzung, *Rede*/*Musik* = Abend · Sprecher/Mitwirkende · Text,
*Ablaufpunkt* = Abend only, full width; viewers without the studio (planners outside the cast) see
the cast only. *Details* (header action for studio editors, group admins, planners) = header + stat
tiles (Musik, Schritte, Plätze, Videos only for *Tanz*/*Show*; Mitbearbeitung, Wünsche, Session)
above the existing evenings, trainings, history, versions and co-editor sections; cast members
asking for `view=details` stay on the card. Back from the player goes to the card or Details it was
opened from. Group hub: *Auftritte* is the first section; her own acts (cast or led) are wide tiles
(Abend · Training · Üben), the group's other current acts rows. Groups list cards are real links to
the hub (`KkGroupCard` takes `component`/`to`/`params`; the peek sheet is gone). Start *Üben*: only
playable acts (cast or led), `+n weitere` is a button opening the chooser, links go to
`?view=play&from=start`, no kind line repeating a group name. Stage times removed end to end
(`StageClock`, `EveningStageTimes`, `MusicLengthsOfAsync`, every `stageStartsAt`); the calendar
sheet and the act's evenings show *Nr.* only and the copy no longer says times are approximate.
Cast tile carries a hidden named list (`KkFacetTile.Names`); the header drops the group link when it
equals the act name and shows the session only to Details viewers; *Gruppen-Admins* → *Gruppenleitung*.
Labs A/B/C, `/lab` drafts and `KkPass*`, `KkAgenda*`, `KkFacetFold` removed. Browser-checked at 390 px
light/dark (Kevin act 6, Sabine act 3 and hub, admin act 3 card + Details) and 1440 px.

### Phase 11 — ⚖ Lab: hall mode (∥ C)
Goal: Florian picks the trainer's hall view.
- [x] Count-in engine (pure, tested): before play and before every loop pass, tempo 75/100
- [x] Three divergent landscape-first lab variants on real data (dark, huge count, step + next step, stage with named dots and today's absences, keys, video off by default, Wake Lock); filmed playback at 60 fps
- [x] Pitch + Florian's pick; rulings recorded in the RFC
- Ruling (2026-10-30): **A — count wall**, stage ~55–60 % wide; stage from the **dancers' view** (as in the player); count-in **4 beats, on by default with a switch, every loop pass counts in again**.
- Notes (lab built 2026-10-30, awaiting the pick): `/lab/hall/{a,b,c}/{actId}?training=` (lab hub section *Training in der Halle*, act 3 *Marschtanz* on the RFC 0001 database). All three are dark, fill the whole screen above the shell, keep the screen awake, and count in four beats before play and before every loop pass. The count-in is gold, with a click on each beat (the first one higher). Dots that move right now turn red. Absent people show as gold dashed dots with their names struck through, plus chips (*Fehlt Di., 03.11.*). *Video* swaps the stage for the trainer video and is off by default. Tempo toggles between 100 % and 75 %. Names alternate below and above the dots so a line never overlaps.
  - **A — count wall:** the count fills the left two fifths. Below it are the step, *Danach: …* and who is missing. The stage is on the right from the dancers' view (front on top). One key row runs along the bottom. It reads best from 3 m, but the key row costs about a fifth of the height.
  - **B — two thumbs:** the left thumb column holds the count, *Zurück* and *Schleife*. The right thumb column holds *Start*, *Weiter*, tempo and video. The stage sits between them from the trainer's view (front at the bottom, as she faces the group). It has the biggest stage and the thumbs never cross it, but the count is the smallest of the three.
  - **C — count band:** eight count cells run across the top, with the current one red and the count-in gold. The step card is the play key. It is the only one that shows where you are inside the eight, but the stage is the smallest and names get shortened on phones.
  - Recommendation: A, with the viewpoint as an open ruling. Rulings needed: dancers' or trainer's view of the stage; four or eight beats of count-in, always on or with a switch; whether a loop pass counts in again or loops seamlessly.
  - Engine: `count-in.ts` (pure, tested) and `MixPlayer.setCountIn`/`leadCount`. Loop passes are scheduled with a count-in gap, and `positionInRuns` holds the loop start during the gap. Absences in the lab come from the training's open spots. Until phase 7 makes trainings ask, the films inject two absences in the browser.
  - Films: `~/furria-hall-lab-film/hall-{a,b,c}.mp4` plus contact sheets and stills (landscape 844×390 and portrait 390×844). Headless Chromium's screencast delivered about 32 fps, not 60, so motion was checked frame by frame on the contact sheets: nothing jumps, and the count-in flows into count 1.

### Phase 12 — Promote hall mode, step rail, large-text player (∥ D, after 11)
Goal: one hall mode replaces training mode and the landscape player; the player is usable at 200 % text.
- [x] Hall mode replaces `?view=training` and the landscape player (one view, Wake Lock, absences of the chosen training)
- [x] Step rail in the player (≥ 44 px, part labels as buttons, scroll inside a fixed box, no jumps)
- [x] Large-text layout (≥ 150 % text or < 360 px): step name → stage → play → 2×2 keys
- [x] Keyboard in player and hall mode: Space, ←/→ step, ↑/↓ tempo, L loop; listed in the ⓘ sheet
- [x] Stage ARIA names the own spot and open spots; dot numbers hide below 18 px
- [x] Old training kit and lab variants removed; filmed check at 390 px portrait and 844×390 landscape
- Notes (done 2026-10-30): hall mode is variant A (`features/act-hall`, `KkHall` with the wall layout only). It uses the dancers' view, front on top, with the stage about 60 % wide. A four-beat count-in runs before play and before every loop pass. It is on by default, and the *Einzählen* key switches it off. `?view=training` opens it, and without `training=` the next training's absences are shown. *Training beenden* steps back in history when the act page is behind, otherwise it opens the act page. Editors and trainers (`canEditStudio`) start it from the player's step sheet (*Training starten* next to the title); group admins also start it from the training row. The landscape player is no longer the trainer's tool, but members keep its layout for practising. The transport pill had no room for an extra key at 844×390. In portrait the hall keys show icons only, and their names stay in the accessibility tree. The step rail (`KkPracticeSegments`) has 44 px numbered tiles with proportional widths. A part key in front of each part loops the whole part, as a button instead of a long-press. The rail scrolls inside its box, and the current tile scrolls into view only when it leaves the box. Large text (root font ≥ 150 % or < 360 px wide, `lib/large-text.ts`) stacks the player: the step name, the stage (or the video via the *Video* key), one *Abspielen* key, then *Schritt zurück / Schritt vor / Tempo / Video*. It never applies while editing. Keyboard: `practice-keys.ts` (pure, tested). Space is left to a focused button, and arrows are left to a focused slider. Player tempo steps through 100/85/70/50 %, hall tempo through 100/75 %. On keyboard devices the keys are listed at the foot of the step sheet and behind a keyboard button in the hall. Stage labels read e.g. *Du stehst auf Platz 1. Plätze 11 und 12 frei*, and in the hall also *Es fehlt Lena auf Platz 1*. Hall dot numbers hide when a dot is under 18 px. `KkTrainingView`, `ActTrainingBody`, `use-act-training`, `/lab/hall/*` and the lab's thumbs and band layouts are gone. Left for phase 19: at 200 % text the large-text stage overlaps the play key by a few pixels.

### Phase 13 — ⚖ Lab: editor rework
Goal: Florian picks the timeline desk, the phone step cards and the set-up checklist. Follows phase 6.
- [x] Timeline desk variants (tablet/desktop): lanes for parts, steps, waveform with beat ticks, videos, paths; zoom, snap to counts, centred playhead, keyboard
- [x] Phone step-card variants: name, big stage with named dots, labelled formation chips, count bar, *Rückgängig*; *Musik & Video* page
- [x] Set-up checklist variants for an empty act and its progress chip
- [ ] All on real data with undo and the evening band from phase 6; pitch + Florian's pick; rulings recorded (lab built on real data with undo and band; pick open)
- Notes (lab built 2026-10-30, awaiting the pick): the lab hub section *Auftritt bearbeiten* links `/lab/editor-{a,b,c}/{actId}` (`?evening=` shows the gold band) and each variant's *Musik & Video* page at `…/{actId}/musik`. Data is the RFC 0001 database: Lena edits act 3 *Marschtanz*, Sabine edits act 5 (partly built) and act 14 (empty, so it shows the checklist). All three variants run on the phase-6 act-studio hooks. Every write goes through the existing mutations and the undo service, and Ctrl/Cmd+Z works. In all three, edits snap to counts, dots are named and can be moved with the arrow keys, the page itself never scrolls (`scrollHeight ≤ innerHeight` holds on every view and in both films), and the music page reuses the existing song, final-file and video lists and desks.
  - **A — lanes under the stage** (`KkLane*`): works like video-editing software. The top bar has the transport, a time and count readout, zoom, undo/redo, *Musik & Video* and a ring chip *5/6*. Below it, the stage takes ~60 % and an inspector shows the one selected thing, with three tabs: *Auswahl*, *Verlauf* and *Einrichten*. At the bottom are full-width lanes *Zeit · Teile · Schritte · Musik* (eight numbers) *· Video · Wege*, with a fixed centred playhead and a snap hint (*Achter 3 · 5 · 0:09,5*). On the phone, steps are cards that you swipe sideways. An empty act shows a dense six-row checklist. Strongest desk; the inspector gives every selection a precise home. Weak spots: step names get cut at whole-act zoom, count cells on the phone are narrower than 44 px, and video bars don't snap.
  - **B — eights stacked down the page** (`KkEights*`): time runs from top to bottom. Each row is one eight: eight count cells, each with a slice of the waveform, a beat tick and a keyframe mark. The columns are *Teil | Schritt | 1–8 | Video | Wege*. Borders are grips between cells. While playing, the current row stays in the middle. Density switches between ½ · 1 · 2 eights per row and *Alles*. The stage is pinned on the right, under the selected step's chips. On the phone, step cards stack and you swipe up/down. An empty act shows a six-segment rail with one *Als Nächstes* panel. This one reads most like how trainers count. Weak spots: the sheet of repeated count cells is visually heavy, cells are under 44 px at density 2 and *Alles*, there's no auto-scroll while dragging a border, and video bars are read-only.
  - **C — stage first, overview and detail** (`KkFocus*`): an outline of parts and steps on the left, the stage as the hero, and a context bar of labelled actions under the stage. Below that, a strip of the whole act with a bracket you can drag and resize, and count-level detail lanes for the bracketed window. On the phone, the stage stays fixed and a strip of step cards snaps below it. On an empty act, the editor itself is the checklist: every empty lane shows its numbered set-up action, and a chip shows *0 von 6*. Best overview of the whole act and the most guided empty act. Weak spots: the context bar scrolls sideways at ≤ 1440 px, the phone at 844 px leaves empty space around the stage, and there's no *Rückgängig* in the phone top bar.
  - Recommendation: A's desk (inspector + lanes), with B's eights as the count bar on phone cards and C's overview strip as the act-wide row of A's lanes. For the empty act, C's in-place set-up actions, with A's checklist as the chip's sheet. Rulings needed: inspector vs context bar; horizontal vs vertical time on the desk; cards swiped sideways, swiped up/down, or as a strip under a fixed stage on the phone; the checklist as its own screen or inside the editor.
  - act-studio gaps found (left for phases 14–16):
    - `useStudioVisit` clears the visit history when a page unmounts, so going to *Musik & Video* wipes it.
    - `useActStudioMarks` only exposes the borders of the current step (C rebuilt dragging all of them).
    - Keyframes have no write that moves them in time.
    - `useStepTexts` only edits the current step.
    - The desks need `mode.tool` set to their tool.
    - Each keyboard nudge is its own write, with its own undo notice.
    - *Aufstellung* only edits at the step start.
  - Left for the promotion of the chosen variant (from the lab review):
    - **Undo:** one way to wire undo — a history-keeping `useStudioVisit` on the editor and its *Musik & Video* page. Today B and C bind their own Ctrl+Z and never forget the history.
    - **Mode:** a starting tool in `ActStudioModeStart`, instead of each lab page calling `mode.choose` while rendering.
    - **Shared primitives:** one swipe-carousel root and one desk breakpoint hook (the three variants each copied them).
    - **Copied logic:** the border drag/nudge code is copied three times.
  - Shots and films (gitignored): `web/tools/screenshot/out/editor-lab/{a,b,c}/`.

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
- [ ] Choreography history retention: thin out old versions (keep every version of the last 14 days, then one per day) and page the version list
- [ ] Media rendition read: check the signature before the lost-rendition repair, so unsigned requests can't queue regeneration jobs
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
