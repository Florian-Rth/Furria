---
rfc: 0003
title: The studio as its own package — one engine, one stage, one timeline, native-grade touch
status: in progress
github_issue: 57
branch: feat/rfc-57-studio-package
created: 2026-11-02
---

# RFC 0003: The studio as its own package — one engine, one stage, one timeline, native-grade touch

## Summary

The dance studio (RFC 0001 #52, RFC 0002 #53) is complex enough to be an app of its own and is now
treated like one. It moves into a workspace package **`@furria/studio`** that owns the playback
engine, the models, a **local edit document with instant undo** (immer patches, autosaved through the
existing API), **our own gesture engine**, and **one `Stage` and one `Timeline`** component that
replace five stage renderers and five music tracks. Every power tool — seeking, cutting songs, moving
step borders, the stage editor, keyframes and paths — must behave like a **native app on phone and
iPad**. Well-known libraries replace hand-rolled code where they fit (immer, tinykeys, @dnd-kit/react,
more of signalsmith-stretch); a library audit decided where they do not.

Decisions: grilling 2026-11-02, [ADR-0035](../adr/0035-the-studio-is-its-own-package-and-owns-its-domain-components.md),
[ADR-0036](../adr/0036-the-studio-edits-a-local-document-saved-in-the-background.md).

## Motivation

- **Size and spread.** About 30k lines in ten club-app folders (`act-studio` 12.6k, `act-desk` 2.7k,
  `act-hub` 2.4k, `act-practice` 2k, `act-player` 1.5k, `act-lesson`, `act-hall`, …) plus about 35
  studio kits in `@furria/ui` (`KkStudio*`, `KkLane*`, `KkScore*`, `KkPractice*`, `KkLesson`,
  `KkHall`, …).
- **Duplication.** Five stage renderers (editor, practice, hall, hub thumbnail, lesson picture) and
  five music tracks (studio wave, desk lanes, hub score track, lane overview, practice strip), each
  with its own drawing and hit-testing.
- **Undo is fragile.** About 30 write kinds each have a hand-written inverse API write, plus id
  remapping after re-creation (~1.4k lines); every nudge waits on the network and is its own undo
  entry.
- **Touch is basic.** One shared single-pointer drag hook (4 px threshold); no pinch zoom or two-finger
  pan on the timeline or stage, no long-press, no precision drag, no loupe — the finger covers what it
  moves.
- **iPhone audio gaps.** No `audioSession` setting (the silent switch can mute the music), no handling
  of interruptions, backgrounding or output changes.

### Library audit (2026-11-02, summary)

| Area | Decision | Why |
|---|---|---|
| Undo / edit model | **immer** patches (MIT) | replaces inverse writes; tiny; works with the React Compiler |
| Keyboard | **tinykeys** (MIT, ~1 kB) | replaces seven `keydown` hooks |
| List drag and drop | **@dnd-kit/react** (MIT, pre-1.0, pinned) | keyboard sorting, announcements, touch delay, edge auto-scroll |
| Time-stretch, loops | **signalsmith-stretch** (kept) — use its `schedule`/loop API | replaces hand-rolled loop/seek code where it fits |
| Waveform | own SVG timeline | wavesurfer.js models one file per instance; our music is a sliced mix with steps and parts |
| Stage | own SVG stage | a few dozen dots; Konva/Pixi/Fabric add nothing we need; tldraw needs a commercial licence |
| Gestures | own engine on Pointer Events | @use-gesture and Hammer.js are unmaintained |
| Keyframe timeline / animation | own model (+ motion utilities) | Theatre.js stalled and AGPL; GSAP licence non-OSI and unnecessary |
| Video | native `<video>` slaved to the audio clock | no player library syncs to an external clock |
| Rejected | howler, Tone.js, peaks.js/waveform-data (LGPL), rubberband (GPL), essentia.js (AGPL), ffmpeg.wasm, NoSleep.js | stale, wrong fit or licence |

## Proposal

### 1. Package boundary (ADR-0035)
- `web/packages/studio` = `@furria/studio`, source-consumed like `@furria/ui`, one subpath export per
  module, no barrels, the same Biome rules as the club app (no raw MUI beyond layout, no design `sx`).
- **Moves in:** `act-player`, `act-studio`, `act-desk`, `act-practice`, `act-lesson`, `act-hall`, the
  score/formation views of `act-hub`, and the studio kits from `@furria/ui`.
- **Stays in the club app:** routes and page shells, `acts` (catalogue, settings, cast, co-editors),
  `act-card`, `act-training` attendance, the hub screen composition, TanStack Query hooks and
  endpoints.
- **The studio never fetches:** the club app passes the parsed studio, media URLs and a **save port**.
  All media go through one studio **media loader** (fetch, decode, cache) so offline can be added later.

### 2. Edit document and autosave (ADR-0036)
- The studio is edited as a local immer document; changes are patches. Undo/redo is local, instant,
  **one entry per gesture**, repeated nudges merge.
- **Autosave** through the save port after ~0.8 s quiet at gesture end, at once on leave/background;
  status *Gespeichert* / *Speichert…* / *Nicht gespeichert – erneut versuchen*.
- A **save planner** maps patches to the existing write endpoints (server unchanged). On a
  choreography refusal (same keyframe changed by someone else) the client reloads and replays its
  pending changes on top — the active edit wins, with a quiet note.
- **In the document:** song order and cuts, tempo and first "1", steps/borders, parts, spots and
  holders, keyframes/paths/bends/easing/facing, video offsets and main/alternative, names and
  descriptions. **Direct server actions outside undo:** uploads, adopting a final file, restoring a
  version, deleting media — the document reloads after them; inapplicable undo entries are dropped with
  a quiet note.

### 3. Native-grade touch (binding rules for every studio tool)
1. **The finger never hides what it moves** — lifted copy or loupe above the finger plus the live value
   (*1:23,4 · Zählzeit 5*, *2,5 m links*).
2. **Snapping you can see** (counts, beats, step borders, 0.25 m grid); the snap line lights up;
   haptics only where the platform offers them.
3. **Precision without a mode:** moving the finger away from the track slows the drag; nudge keys with
   long-press repeat.
4. **Two fingers navigate, one finger edits:** pinch zoom and two-finger pan on timeline and stage,
   also during playback.
5. **Long-press selects** (adds to a multi-selection) and opens the item's actions in a bottom sheet;
   nothing depends on hover or right-click.
6. **Hit areas ≥ 44 px**, overlaps resolved by priority (selected first).
7. **No fights with the browser:** no page scroll, pull-to-refresh, text selection or iOS magnifier in
   work areas; the edge swipe for *back* stays.
8. **Momentum and rubber band** at the ends of pans.
9. **Undo one tap away** in every edit view.

- The **gesture engine** generalises the tested pure `stage-machine` of the photo viewer (pan, pinch,
  swipe) into a pure recogniser (press, drag, long-press, pinch, two-finger pan, precision drag),
  unit-tested with input sequences; springs and momentum come from motion.
- **Validation:** an interaction lab served as an HTTPS static build, judged by Florian on his iPhone, a
  Pixel and an **iPad with Safari** (the trainers' tablet). Playwright touch scripts are dev tooling for
  films and shots, not CI tests (UI tests stay banned, docs/web/TESTING.md).

### 4. One Stage, one Timeline (SVG)
- **`Stage`**: a compound kit of layers — floor and drawing, spots, dots, paths and bends, own dot and
  cue, absences, editor handles, onion skin. Viewpoint (audience/dancers) and framing (whole stage or
  the step's frame) are props; thumbnails are the same kit with fewer layers.
- **`Timeline`**: layers — waveform from the server peaks, parts, steps, counts/beats, cuts, keyframes,
  playhead, loop range; density (strip, track, desk lane) and zoom are props.
- One motion model `f(musicTime) → positions` everywhere. Canvas only if the lab measures frame drops on
  the iPad.

### 5. iPhone audio robustness
- `navigator.audioSession.type = 'playback'` where supported.
- Background, lock or call → pause, keeping the exact position, loop and tempo; resume from the play key.
- Output device change (headphones out, Bluetooth gone) → pause.
- Wake Lock kept while practising. No background playback and no lock-screen controls (Web Audio clock).

## Phases

Each phase leaves the app intact (builds, lint and tests pass, no dangling references) and fits about
120k tokens. New code grows next to the old one; each screen moves over and its old code is deleted in
the same phase.

### Phase 1 — Package and pure models
Goal: `@furria/studio` exists with the lint boundary, and the pure models live there.
- [x] Create `web/packages/studio` (`@furria/studio`): package.json exports, tsconfig, vitest, catalog deps
- [x] Apply the club app's Biome restrictions to `packages/studio/**`; amend the ADR-0007 consequences with a pointer to ADR-0035
- [x] Move pure models + tests: music timeline and count math, choreography motion, stage view, mix waveform, step names, studio zod schemas
- [x] Re-point every club-app import; delete the moved files; lint, typecheck, affected tests

Done 2026-11-02. `@furria/studio/studio-schemas` holds the static schemas and `createStudioSchemas`
for the URL-bearing ones (the club app injects its `MediaUrlSchema`/`PictureSchema`). The package's
`Studio` is the dance itself (music, songs, steps, parts, spots, videos, choreography, stage); the club
app's `Studio` extends it with `evenings` and `trainings`. `MediaItemStateSchema` moved to
`@furria/api-client`.

### Phase 2 — Engine, media loader and iPhone audio
Goal: playback lives in the package behind a media loader; iPhone audio is robust.
- [x] Move the mix player, schedule, buffers, count-in, frame store, video sync, pitch keeper into the package
- [x] One media loader (fetch, decode, in-memory cache with eviction) used by the engine
- [x] Use signalsmith-stretch's `schedule`/loop API where it replaces own loop/seek code (keep the gapless song cuts)
- [x] `audioSession.type = 'playback'`; pause and keep position on background, lock, interruption and output change
- [x] Pure tests for the new scheduling decisions
- [ ] Device check on iPhone (silent switch, call, lock) and slowed playback on iPhone/iPad — owed to Florian

Built 2026-11-02. `@furria/studio` now holds the engine (`src/engine`): `mix-player`, `mix-schedule`,
`count-in`, `video-sync`, `use-mix-player`, `use-playback-seconds` (frame store), `use-slaved-video`
and `use-screen-wake-lock` (now `active`-gated; practice holds it while playing). The peaks query
(`act-player/api`) and `use-studio-playback` stay in the club app (TanStack Query).
- **Media loader** (`media-loader`): one shared fetch + decode cache, 256 MB of decoded audio, least
  recently used evicted (`evictionsOf`).
- **signalsmith-stretch:** slowed or sped playback now runs in its **buffer mode** — the mix is laid end
  to end in samples (`stretchSlicesOf`, gapless cuts, silence for unplayable songs) and every run is one
  `schedule({ input, rate, output })`; this replaces the old resample-then-pitch-shift route. Its own
  `loopStart`/`loopEnd` is **not** used: a loop pass carries the count-in gap, and the native path at
  rate 1 (and when the worklet fails) loops the same way, so both share one run scheduler. Note: the
  worklet drops later changes from `outputTime` (default *now*), so chained runs pass `outputTime`.
- **iPhone audio:** `navigator.audioSession.type = 'playback'` before the context is created; while
  playing, the player pauses (position, loop, tempo kept) on page hidden/`pagehide`, context
  `interrupted`/`suspended`, and on a lost audio output (`outputLostOf`; browsers that list no outputs
  pause on any device change).
- **Review follow-ups (device check):** the stretch holds a second copy of the whole mix (not counted in
  the 256 MB budget) — measure on the iPhone and trim to the loop range if memory is tight; check with a
  click track whether the extra stretch lead before a slowed start is needed; load failures still
  collapse to `failed` without a cause.

### Phase 3 — Edit document, save planner, autosave
Goal: the local edit document exists and is tested, not yet wired into the editor.
- [x] Studio document type and immer change functions for every in-document edit kind
- [x] Undo/redo stack: one entry per gesture, nudge merging, dropping entries after direct server actions
- [x] Save planner: patches → existing write endpoints, batching, ordering
- [x] Autosave scheduler (gesture end + quiet time, flush on leave/background) and save status
- [x] Choreography refusal → reload and replay pending changes, conflict note
- [x] Pure tests for change functions, planner, merging, replay

Done 2026-11-02. `@furria/studio/*` under `src/document/`: the document keeps only the editable facts
in id-keyed records (`studio-document`), so patches name items by id and replay onto a newer state;
`studioOf(base, document)` projects it back to a `Studio` for the views (step ends, part spans, spot
numbers and the music length are derived, the first step starts at 0 like the server tiling).
Locally created steps, parts and spots get negative ids from the editor (`newLocalId`, never part of
undo); the save run learns their server ids (`id-map`) instead of rewriting the document or the undo
stack. The planner diffs the last saved document against the current one (`savePlanOf`), so an edit
undone before saving sends nothing and a save that stops halfway resumes with the rest; `savedAfter`
advances the saved document write by write. `createStudioEditor(studio, port)` is the framework-free
store for phase 4 (`snapshot`/`subscribe` for `useSyncExternalStore`, `leave` on leave/background,
`direct(action)` for uploads/adoption/restore/deletes, which flushes, runs the action and reloads).
The port routes `tracks` and `spotAssign` — a Sessionsauftritt's copy can be edited through the same
document by a port that targets the evening endpoints.
Change functions mirror the server rules (step marks/moves inside the music and between neighbours,
part starts between neighbouring parts, the first part fixed) so a refusal is rare; the planner
orders step and part moves so none passes a neighbour on the way. A write the server still rejects
(port outcome `rejected`) reloads the studio and drops the pending changes with a quiet note — only a
choreography refusal replays them. Saves pause while a reload or a direct action runs.

### Phase 4 — Editor onto the document: music, steps, parts, videos
Goal: these edits run through the document; their inverse writes are gone.
- [x] Club app provides the save port and studio data to the package
- [x] Song order/cuts, tempo/first "1", steps/borders, parts, video offsets and main/alternative through the document
- [x] Save status in the editor bar; undo/redo keys and buttons on the new stack
- [x] Delete the replaced inverse writes and optimistic `with*` patches for these kinds

Done 2026-11-02. `act-studio/studio-editor-store` keeps one `createStudioEditor` per act (shared by
the studio, desk, cards and music page; held while a screen shows it, flushed on leave and closed
5 s after the last screen, so undo survives a hop to the music page). `studio-save-port` maps every
`ServerWrite` to the existing endpoints; a choreography conflict becomes `choreographyRefused`, a
400/409/422/404 `rejected`, anything else a failed save. `useStudioScreen` reads the studio from
the editor (`useStudioDocument`), so playback, desks and lanes show edits at once; drags (step
borders, video bars) are one gesture, text and nudges merge per item (`stepText`, `videoName`,
`partSettings` got merge keys). Server-computed results — *Video anlegen* and *Endfassung
anlegen* — are written into the document as one undoable change after the request.
- **Cache:** after a save the store writes `editor.savedStudio()` (server ids, `serverStudioOf`)
  into the act's studio query and marks it stale without refetching, so other screens are current
  and a racing refetch cannot roll an edit back. Every other change of the query (uploads, spot and
  choreography writes, auto-align) reaches the editor through `editor.adopt(studio)`: an echo of
  the saved state only refreshes the base, a real change rebases with the pending changes replayed
  (deferred to the end of a running gesture).
- **Two stacks until phase 5:** spots, choreography, evenings, uploads and removals still record in
  the visit history; undo/redo and the keys take the newer stack top (`history-turn`). The editor
  bars (desk, cards, music page) show *Gespeichert* / *Speichert…* / *Erneut speichern*
  (`StudioSaveButton`, tap retries); editor notes surface as quiet notices.
- **Deleted:** `useStepMutations`, the song order/settings, video name/start, final beat/offset
  mutations, their `with*` patches and tests, the `StudioEdits` bounds/texts/starts overlay, and the
  inverse writes for `songOrder`, `songSettings`, `finalBeat`, `finalOffsets`, `finalMatch`,
  `steps*`, `stepText`, `stepStart`, `part*`, `videoName`, `videoStart`, `videoAlign`.
- **Review follow-ups (fixed):** an editor with unsaved or failed changes is never closed (it waits
  for the next visit and its retry); an editor created but never held is reaped; redo of one stack
  is blocked once the other stack holds a newer edit, and nothing undoes while a visit undo runs;
  a drag that unmounts mid-gesture ends its gesture (`useGestureRelease`).
- **Open for phase 5:** song/video/final add, remove and adoption still write directly and
  compute their visit undo from the query cache (not the document) — they become `editor.direct`
  actions; a `rejected` write still drops every pending change, the note does not say which; the
  history list shows only visit entries.
- **Owed:** browser check of drag, trim, text and undo across both stacks on phone and desk; the
  save port does not route evening writes yet (phase 5 wires spots and choreography).

### Phase 5 — Editor onto the document: spots and choreography; old undo removed
Goal: every in-document edit uses the document; the old undo machinery is deleted.
- [x] Spots and holders, keyframes, paths, bends, easing, facing, formation presets through the document
- [x] Uploads, final-file adoption, version restore, media delete as direct actions with reload
- [x] Delete `studio-undo`, `undo-requests`, `studio-remap`, the visit history store and the remaining optimistic patches
- [ ] Device check: edit on phone and iPad, undo during a pending save, two editors at once — owed to Florian

Built 2026-11-02. Every stage edit is a document change: spot add/remove/assign and every track
commit (`use-track-commit`: formation presets, drags, keyframes, bends, easing, facing all end in
one `tracks` change). *Platz hinzufügen* is one gesture (local spot id + its first keyframe), so one
undo removes both; the picked spot keeps its local id across the save.
- **Evening copy (Sessionsauftritt):** the store keeps one editor per scope — `{ actId, eventId }`
  (`scopeKeyOf`). An evening editor edits `eveningViewOf(studio, eventId)` (evening spots, the copy
  or the session choreography) through `eveningSavePortOf`: `spotAssign` → evening spot,
  `tracks` → evening choreography (`eveningTracksBodyOf`: builds on the session version until the
  evening has its own copy, then on the copy's version); anything else is `rejected`. After a save
  `eveningSavedOf` writes the result back into the appearance in the query cache. The studio
  screen shows the session document with the evening editor's spots and choreography
  (`eveningStudioOf(session, stage, evening, cast)`), so music stays the session's.
- **Direct actions:** song/video/final add and remove, final adoption, version restore (session or
  evening), evening leave and dropping the evening copy run as `editor.direct` through
  `throughStudioEditor(scope, action)` (flush, act, reload; plain request when no editor is open).
  `direct` now returns the action's result (the upload flows need the created id).
- **One history:** the snapshot carries `history` (`historyRecordsOf`: every entry with its change
  kinds, undone ones on top). Undo/redo, keys, the save state and the history lists span all open
  editors of the act (`history-turn`: newest undo first, redo blocked once another editor holds a
  newer edit; `combinedStatusOf` shows the weakest save state; retry retries the failed ones).
  Editor notes of every editor surface as quiet notices.
- **Deleted:** `studio-undo`, `undo-requests`, `studio-remap`, `studio-history`,
  `studio-history-store`, `use-studio-undo`, `use-studio-history`, `stage-api`,
  `use-choreography-conflict` (the editor's replay + note replace *Meine Fassung behalten*), the
  evening stage mutations, the optimistic `withTracks`/`withSpot*`/`withoutSpot`/
  `withChoreographyVersion`/`withoutSong`/`withoutVideo`/`withoutFinalTrack`/
  `withEveningStudio`/`withEveningCopyVersion`/`withoutEveningCopy`/`withEveningLeft` patches,
  `overlapRowsOf` and the visit undo copy.
- **Outside undo by design:** joining an evening and its cast changes (dancer in/out) stay plain
  writes with their optimistic patch; they are not part of the document.
- **Review follow-ups (fixed):** a failed reload after a direct action no longer fails the action;
  a session save writes back only its own fields (evenings and trainings stay the cache's); the
  evening write-back makes a copy only once the port saved one (`copied()`), and never invents an
  appearance for an evening the act has not joined; an editor still saving at its close time is
  closed once it is saved; a rebase no longer reports the cleared redo steps as dropped undo.
- **Review follow-ups (open):** `adopt` applies the source it was handed after a running save, so a
  refetch that started before the save can briefly roll that save back (latest-wins + version
  check); a `rejected` write drops edits made while it was in flight, not only the plan's own; the
  editor and its listeners are created during render (move `attached` and the grace timer into
  the hold); direct actions use the access token taken before the flush.
- **Owed (device/browser check):** spot add + drag + undo on phone and iPad; formation preset and
  keyframe edits, undo during a pending save; an evening copy: first formation change creates the
  copy, spot assign, undo across session and evening edits, drop copy while edits are pending; two
  editors at once (another device) → replay note; upload, remove and adopt while edits are pending;
  version restore with pending edits.

### Phase 6 — Gesture engine
Goal: one tested gesture recogniser and its React binding exist in the package.
- [x] Generalise `stage-machine` into a pure recogniser: press, drag (threshold), long-press, pinch, two-finger pan, precision drag
- [x] Hit priority, momentum and rubber band (motion), browser-gesture prevention per work area
- [x] Lift/loupe and live-value hooks for drags
- [x] Pure tests with input sequences; Playwright touch script for films (dev tooling)

Done 2026-11-02. `@furria/studio/gesture-recogniser` is the pure recogniser (`stepGesture`): press,
tap, long-press (450 ms, fired by a `tick` or the next move), drag after 8 px touch / 3 px mouse,
held drag after a long press, precision drag (full/half/quarter/fine per 50 px off the track,
integrated so the value never jumps), two-finger navigate (incremental scale + pan; a second finger
cancels a running edit), wheel and Safari `gesture*` events as navigate. every press ends in tap, `pressCancel`, `holdEnd`, `dragEnd`/`dragCancel` or `navigateEnd`.
`use-gesture` binds it to Pointer Events (capture only once a gesture leaves the press, so taps
still reach child buttons; `data-gesture-ignore` opts a child out; long-press timer, area size,
wheel line/page units); `use-work-area` blocks scrolling, selection,
callout and context menu; `hit-priority` grows hit areas to 44 px and ranks selected → priority →
distance; `pan-bounds` + `use-pan-axis` give rubber band and motion inertia; `lift-placement` +
`use-drag-lift` place the lifted readout or loupe; `drag-readout` formats *1:23,4* and *2,5 m*.
The photo viewer keeps its own `stage-machine` in `@furria/ui` (the studio sits above the UI
package). `pnpm film <route> --script <gestures.json>` in `tools/screenshot` films touch sequences.

### Phase 7 — ⚖ Interaction lab
Goal: Florian picks the touch handling on his devices.
- [ ] Playground: timeline (seek, pinch zoom, trim a cut, move a step border, precision drag) on real data
- [ ] Playground: stage editor (drag a dot, multi-select, bend a path, keyframe on the timeline)
- [ ] Playground: lists (song order, spot holders with dnd-kit) and the practice step rail
- [ ] Variants where open: loupe vs lifted copy; long-press sheet vs selection toolbar; precision by distance vs by hold
- [ ] HTTPS static build; Florian tests on iPhone, Pixel and iPad Safari; rulings recorded here

### Phase 8 — One Timeline: build, practice strip, hub score track
Goal: the `Timeline` kit exists per the lab rulings and replaces the read-only tracks.
- [ ] `Timeline` kit with layers (wave, parts, steps, counts, cuts, keyframes, playhead, loop range), density and zoom props
- [ ] Practice strip and hub score track on `Timeline`; delete their old tracks
- [ ] Shots at 390 px, 844×390, iPad; film playback

### Phase 9 — One Timeline: editing tracks
Goal: every editing track is the `Timeline` with the gesture engine.
- [ ] Studio wave (cuts), desk lanes, lane overview on `Timeline` with the lab's touch handling
- [ ] Delete `KkStudioWave`, `KkLaneTrack`, `KkLaneOverview`, `KkScoreTrack` and their helpers
- [ ] Device check: trim, border move, zoom, precision scrub on phone and iPad

### Phase 10 — One Stage: read views
Goal: the `Stage` kit replaces the read-only renderers.
- [ ] `Stage` kit with layers (floor, spots, dots, paths, own dot and cue, absences), viewpoint and framing props
- [ ] Practice, lesson picture, hall and hub thumbnails on `Stage`; delete their renderers
- [ ] Film playback; check frame rate on the iPad (canvas only if it drops)

### Phase 11 — One Stage: editor
Goal: the stage editor is the `Stage` with editor layers and the gesture engine.
- [ ] Editor layers (handles, bends, onion skin, selection) with the lab's touch handling
- [ ] Spot holder assignment and song/video order with @dnd-kit/react
- [ ] Delete `KkStudioStage` and the old editor drag code
- [ ] Device check: dot drag, multi-select, bend, pinch/pan on phone and iPad

### Phase 12 — Screens into the package, keyboard, cleanup
Goal: the studio is one package; nothing studio-specific is left behind.
- [ ] Move practice, lesson, hall, desk and hub score/formation views into the package; the club app composes them
- [ ] tinykeys replaces the seven key hooks; one key map feeds the key help
- [ ] Delete the remaining studio kits from `@furria/ui` and empty club-app folders; grep for leftovers
- [ ] Update CONTEXT.md if terms changed, plan/club-app/group-year.md, docs/web; full web suite

## Risks & alternatives

- **Scope.** The largest refactor so far; mitigated by strangler phases that each leave the app intact.
- **Save planner correctness.** Mapping patches to many endpoints can lose or reorder writes; covered by
  pure tests and the replay on refusal.
- **@dnd-kit/react is pre-1.0.** Pinned exactly; used only in list wrappers.
- **SVG performance on the iPad.** Measured in the lab and phase 10; canvas as fallback.
- **iOS specifics** (`audioSession` support, Pointer Events quirks) are verified on devices, not only in
  Chromium.
- Rejected alternatives: see the library audit table, ADR-0035 and ADR-0036.

## Out of scope

- Offline practising (*Für das Training laden*): prepared by the media loader and the save port; a later RFC.
- Live collaboration (Yjs), soft locks, presence.
- Background playback and lock-screen controls.
- Changes to the server API or data model.
- New studio features beyond the touch handling and the rebuilt components.
