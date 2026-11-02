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
- [x] Playground: timeline (seek, pinch zoom, trim a cut, move a step border, precision drag) on real data
- [x] Playground: stage editor (drag a dot, multi-select, bend a path, keyframe on the timeline)
- [x] Playground: lists (song order, spot holders with dnd-kit) and the practice step rail
- [x] Variants where open: loupe vs lifted copy; long-press sheet vs selection toolbar; precision by distance vs by hold
- [ ] HTTPS static build; Florian tests on iPhone, Pixel and iPad Safari; rulings recorded here
- [x] Scrub variant on the timeline playground: fixed centre "now" line, the wave moves under it
  (iOS Voice Memos style) vs the fixed view; Florian judges, Phase 9 builds the winner

**Rulings (Florian, 2026-11-02):**
- Timeline: live value above the finger (`lift=lifted`); precision by moving the finger away from
  the track (`precision=distance`).
- Stage: value above the finger; selection toolbar (`selection=toolbar`) — tap selects one dot without
  toolbar, long press adds to the selection and shows the toolbar. Precision on the 2D stage comes from
  pinch zoom + the 0.25 m grid snap (no track to move away from); `precision=distance` applies to the
  keyframe lane.
- Step rail: free momentum (`glide=free`).
- Phase 3 decisions confirmed: a rejected write reloads and drops pending changes with a note; media
  removal is a direct action without undo; Sessionsauftritt writes go through the save port.
- Rename the club app's `Studio` to `ActStudio` (Phase 12).
- Scrub (open): the centre-line variant must be fully fluid like iOS — no snapping to counts, steps
  or any point while scrubbing, continuous momentum; performance first (transform-only per frame, no
  React render per frame, 60 fps on iPhone). Practice strip, hub score track and lesson keep the fixed
  view.
- Rulings 2 (Florian, 2026-11-02): scrub = **centre line** (`scrub=centre`) for the editing timeline in
  Phase 9 (fixed view stays for practice strip, hub score track, lesson); a swipe during playback pauses
  and resumes where the glide rests; step rail free momentum confirmed with real momentum; song order
  only by drag/keyboard is fine; the Phase 10/11 stage looks (neutral open spot, practice discs, metre
  grid) are approved.

Scrub variant built 2026-11-02, awaiting the ruling: switch *Zeitleiste: Feste Ansicht |
Mittellinie* (`scrub=fixed|centre`) on `/lab/studio/timeline`. In *Mittellinie* the playhead stays
in the middle and the music moves under it: one finger swipes the wave with free momentum and a
rubber band at both ends (no snapping), tap glides to that point, two fingers zoom around the
line, the played half is tinted. A swipe during playback pauses the music and resumes it where the
glide comes to rest. Cut and step-border handles still drag (the wave freezes while editing) with
the Phase 7 lift and precision rulings. Every frame only writes transforms: one offset and one
zoom motion value move the wave, steps and ticks; the clock is a motion value; React renders only
when the wave window (about five widths wide, moved with hysteresis) has to move on, or when a
pinch is committed. Found on the way: Motion finishes `animate(value, value.get(), { type:
'inertia' })` at once, so a release targets the projected point (`momentumTargetOf` in
`pan-bounds`). `usePanAxis.release` (rail) and the fixed timeline's two-finger pan had the same
bug and are fixed too, so the step rail now actually glides; its `glide=free` ruling may deserve a
second look on the device.

Lab built 2026-11-02, awaiting rulings. `/lab/studio/{timeline,stage,lists,rail}` (Labor → *Studio:
Bedienung mit dem Finger*), feature `studio-lab`, visuals in the throwaway `KkTouchLab` kit; every
playground loads the real studio of `?act=` (default: the first playable act the viewer leads) and
edits only locally with one-tap undo, music plays through the existing mix player. Variants are
switches at the top of each page and live in the URL: `lift=lifted|loupe`, `precision=distance|hold`,
`selection=sheet|toolbar`, plus `glide=free|snap` for the rail (free momentum vs settling on a step).
Timeline: tap seeks, one-finger drag on empty track scrubs, drag a step border (top row) or a cut
(dashed, lower half) with count snapping and a haptic tick, two fingers zoom and pan with momentum
and rubber band, the view follows the playhead after 1.8 s untouched. Stage: tap selects, long press
adds to the selection (sheet variant opens *Auswahl* after lifting; toolbar variant floats
*Spiegeln · Reihe · Abwählen* above the selection), dragging a selected dot moves the whole selection
and writes a keyframe at the current time (0.25 m grid snap), the diamond on the selected dot's move
bends it, pinch zooms the stage; the lane below shows keyframes (selected dots, else all), dragging one
retimes that formation change with count snapping. Lists: @dnd-kit/react 0.5.1 (pinned, catalog) —
song order by handle, holders dragged between places or to *frei* (touch delay from dnd-kit's default
sensor). Rail: swipe with momentum and rubber band, tap loops a step, follows playback.
Found and fixed on the way: `use-gesture` cancelled every touch drag on Chromium, because the
`lostpointercapture` of the implicitly captured child bubbled to the area; it now only reacts to the
area's own capture loss.

### Phase 8 — One Timeline: build, practice strip, hub score track
Goal: the `Timeline` kit exists per the lab rulings and replaces the read-only tracks.
- [x] `Timeline` kit with layers (wave, parts, steps, counts, cuts, keyframes, playhead, loop range), density and zoom props
- [x] Practice strip and hub score track on `Timeline`; delete their old tracks
- [x] Shots at 390 px, 844×390, iPad; film playback

Done 2026-11-02 (read and display layers only; the Phase 7 touch rulings are still open, so no lab
variant is built in — seeking stays a tap). `@furria/studio/Timeline` is the domain kit: the root
takes `label`, `density` (`strip` lesson, `track` hub phone, `full` hub wide; the desk lane joins in
phase 9), the music `length`, an optional `focus` range (the zoom: framed with a small margin) and
`onSeek(seconds)`; layers `Ruler` (clock ticks spaced by the visible window, full density only),
`Parts`, `Wave` (bars from the server peaks per density, plus the played wave when given the
player), `Counts` (every "1"), `Cuts` (song seams), `Steps` (blocks), `Ticks` (step ticks),
`Keyframes` (one mark per moment, lit for selected spots), `Loop` and `Playhead` (follows the
`MixPlayer` clock itself). Everything is placed in seconds; `@furria/studio/timeline-geometry` turns
seconds into shares (tested). The paint lives in `@furria/ui/KkTimeline` (the former `KkScoreTrack`,
renamed, with new Counts, Cuts, Keyframes and Loop parts); the shared score paint moved to
`@furria/ui` `internal/score-paint`. The hub score track (`ScorePanel`) and the lesson strip
(`LessonStrip`) are on `Timeline`; `KkScoreTrack`, `ScorePlayhead` and `act-hub/score-ruler` are
deleted, `ScoreModel` carries the count marks instead of precomputed shares. Shots and a playback
film (phone 390×844, 844×390, iPad portrait and landscape, light and dark) on the seeded Marschtanz.

### Phase 9 — One Timeline: centre-line scrub and the studio wave
Goal: the `Timeline` has the ruled centre-line scrub and the studio wave (cuts) is on it.
Split 2026-11-02 (the desk lanes and the overview alone exceed the soft cap) — desk lanes and
overview are phase 9b.
- [x] Centre-line scrub in the package (pure geometry + `use-centre-scrub`), the lab's centre hooks as reference
- [x] `Timeline` centre mode: moving strips, played half, centre line, song regions, cut handles, trim wash, snap line, lifted readout
- [x] Studio wave (cuts and the final-file shift) on `Timeline`; delete `KkStudioWave`
- [ ] Device check: trim, zoom, precision drag, fluid scrub with momentum on phone and iPad

Built 2026-11-02. The music page's wave (`ActStudioWaveLayer`) is `@furria/studio/Timeline` in
**centre mode** (`centre={useCentreScrub(…)}`, `density="edit"`, fills its panel): the red line
stays in the middle and the music moves under it. One finger swipes with free momentum and a
rubber band at both ends, no snapping; tap glides to that point; two fingers (or ctrl/trackpad
wheel) zoom around the line; a swipe while playing pauses and resumes where the glide rests; the
played half left of the line is inked. The selected song's cut handles (or the final file's shift
handle while it is previewed) drag directly or after a long press, with the Phase 7 rulings: the
live value above the finger (`KkDragReadout`: *0:07,6 · 3. Acht · 1*, plus *halb/viertel/fein*),
precision by moving the finger away from the track, count snap at full speed with the lit snap
line and a haptic tick; arrow keys still nudge a focused handle.
- **Package:** `@furria/studio/centre-scrub` (pure, tested: centre offset/seconds, bounds, zoom
  limits, pinch scale, the strip window — about five widths, moved with hysteresis in whole bar
  steps — and its shares, snap candidates/snap, handle hit targets) and
  `@furria/studio/use-centre-scrub` (gesture engine + one offset and one zoom motion value + the
  player clock; React renders only when the strip window moves on, a pinch is committed or a
  handle moves). `mix-waveform` gained `waveformBetween`/`loudestPeakOf` (the wave is drawn for
  the strip window only, at a 4 px bar pitch); `liftPlacementOf` takes the room above the area.
- **Timeline kit:** context `centre`; every layer wraps itself in `TimelineStrip` (a moving
  `KkTimeline.Strip` in centre mode, nothing in the fixed view), `Playhead` yields to the centre
  line; new layers `Regions` (songs: number, name, cut and tempo), `Handles`, `Trim` (hatched
  wash between the old and the dragged edge), `Snap`. Paint in `@furria/ui/KkTimeline`: `Strip`,
  `Half`, `Region`, `Handle`, `Trim`, `Snap`, the centre line and the root's work mode (`work`:
  gesture area, overlay outside the clip); density `edit`; `Wave`/`Played` take a `span`.
- **Deleted:** `KkStudioWave` (root, bars, beats, ticks; region, handle and cut moved into
  `KkTimeline`). The step ticks lost their numbers (the `Timeline.Ticks` look of the practice strip).
- **Review follow-ups (fixed):** a kept cut edit resumes playback on the rebuilt player (not the
  old one); the edit's end value travels with the gesture (a quick flick keeps it); a finger landing
  on a coasting wave stops it without seeking; the snap haptic compares against a ref; wheel and
  trackpad zoom commit once after 160 ms idle instead of per event; a deep pinch-out widens the
  strip window so the edges stay drawn; a glide is stopped on a player swap; unmounting while
  steering resumes the paused music; the release momentum follows the precision tier; the last
  song's end handle stays reachable at the very end; the ruler spaces its ticks by the visible span;
  `Timeline.Playhead` subscribes to the clock only in the fixed view; the KkTimeline root has one
  frame for both modes (`work` = gesture area, `overlay` its own slot); the studio root's props are a
  union (`centre` excludes `focus`/`onSeek`).
- **Review follow-ups (open):** every layer mounts its own moving strip (about eight transformed
  layers) — measure on the iPhone/iPad and fold them into one root strip (the played half stays
  apart) if frames drop; the selected song (and so its handles) follows the player, which is paused
  while scrubbing, so the handles switch songs when the glide rests; `use-centre-scrub` holds clock,
  gestures, zoom and handle editing in one hook (split when phase 9b adds lane editing); no keyboard
  scrub of the centre line itself (the transport keys remain); the readout size is a constant;
  `snapCandidatesOf` judges count spacing by the first two counts.
- **Browser check (Playwright touch on the HTTPS lab build, 390 px, lab data):** swipe glides and
  settles the player, pinch zooms out to the whole mix, a cut-handle drag shows the readout and
  writes the cut (restored afterwards by arrow-key nudges).
- **Open:** a song's name sits at its start, so deep inside a long song at the default zoom
  (40 px/s) no name is visible on the wave (the list below names the selected song); the lab's
  `centre-view` copy stays until the lab goes (phase 12).

### Phase 9b — One Timeline: desk lanes
Goal: the desk's editing lanes are the `Timeline` in centre mode with the gesture engine.
Split 2026-11-02 (the overview and the two studio strips still on `KkStudioDrag` exceed the soft
cap) — overview and `KkStudioDrag` are phase 9c.
- [x] Desk lanes (ruler, parts, steps + borders, music, video, keyframes) on `Timeline` in centre mode
- [x] Lane-aware targets in the centre scrub (edges, spans, tap vs drag); zoom commands for the desk bar and overview
- [x] Delete `KkLaneTrack`, `use-desk-zoom`, `use-desk-follow` and the desk playhead
- [ ] Device check: border move, video drag, keyframe drag, zoom on iPad and desktop

Built 2026-11-02. The desk lanes (`DeskLanes`) are one `@furria/studio/Timeline` in **centre
mode** (`density="desk"`, 16.25rem tall): the red line spans all six lanes and the music moves
under it, with the same swipe, momentum, rubber band, tap-to-glide, pinch/ctrl-wheel zoom and
pause-while-steering as the music page. Lanes are `Timeline.Lane` (`data-timeline-lane`, sizes
ruler/thin/lane/wave, a fixed label chip at the top left); empty lanes show their note or setup
button right of the centre line (`data-gesture-ignore`, so the button still clicks).
- **Targets:** `@furria/studio/centre-targets` (pure, tested) generalises the cut handles to
  targets — edges (step borders, keyframes, cuts) or spans (`until`: parts, steps, videos), each
  on a lane (its band is read from the DOM at hit time) or full height, `movable`, `tappable`,
  `snaps`. Edges outrank spans; a tap on a tappable target selects it (part, step, video,
  keyframe) instead of gliding; a drag on a movable one edits it with the Phase 7 rulings (lifted
  readout, precision by distance, count snap with lit line and haptic; videos do not snap), any
  other drag scrubs. `use-centre-scrub` takes `targets` + `onTargetStart/Move/End/Cancel/Tap` and
  gained `zoomBy`, `fit`, `frame(start, end)`, `centreOn(seconds)`, `canZoomIn/Out`, `fitted`,
  `pxPerSecond`, `width`; `centreViewOf` gives the visible seconds.
- **Kit:** `@furria/ui/KkTimeline` gained `Lane`, `LaneLabel`, `LaneNote`, `LaneSetup`, `Block`,
  `Diamond`, `Marks` (moved from `KkLaneTrack`, without their own pointer handling) and a `tone`
  on `Handle` (`border` = ink, `cut` = warning); studio layers `Timeline.Lane`, `Blocks`,
  `Diamonds`, `Marks`, `Handles tone`.
- **Desk:** `use-desk-lanes` (replaces `use-desk-rows`) builds blocks, diamonds, border handles
  and the targets and owns the centre scrub; the top bar's zoom buttons, the keyboard zoom and the
  overview (still `KkLaneOverview`, its bracket fed from `centreViewOf` via the scrub's motion
  values) drive the scrub; panning or aiming the overview seeks. `ActStudioVideoBar.moveTo`
  places a take by seconds; the keyframe drag gained `cancel`. Deleted: `KkLaneTrack`,
  `use-desk-zoom`, `use-desk-follow`, `DeskPlayheadLive`, the old border hint bubble
  (`snapHintOf`), the scroll-window helpers in `desk-time`/`desk-window`.
- **Review follow-ups (fixed):** the keyframe drag holds its key in a ref and commits the
  release value (the first move and a quick flick were lost); a kept desk edit resumes playback at
  once (`editsRebuildPlayer` only on the music page, where the player is rebuilt); the overview
  bracket refreshes when the zoom or width changes at rest; zooming or aiming while a glide coasts
  settles it first (zoom used to freeze the wave off the player); a video tap only chooses the take
  (`ActStudioVideoBar.choose`).
- **Review follow-ups (open):** a cancelled border or video drag (second finger) keeps the moved
  value as one undo step; on touch a drag that lands on a video span edits it instead of scrubbing
  (judge on the device, maybe require a long press for spans); tabbing to an off-screen block,
  diamond or border does not bring it under the line; keyframe targets are keyed by index; the
  whole desk re-renders while a target is dragged; keys always count-snap even at fine precision.
- **Browser check (Playwright on the HTTPS lab build, 1440×900, lab data, read-only):** six lanes
  at their heights, a swipe scrubs, zoom-in keeps the line, a step tap selects step 2 and glides
  there, readout, stage and overview follow; no writes.
- **Open:** the desk opens at the scrub's 40 px/s instead of fitted; the lanes have a fixed height
  (no vertical scroll on very short windows); the overview playhead follows the player, so it
  rests while the wave is steered.

### Phase 9c — One Timeline: overview and the last studio drags
Goal: no track is left outside `Timeline` and the gesture engine.
- [ ] Desk overview on `Timeline` (bracket = the centre scrub's view, edges zoom, tap aims); delete `KkLaneOverview`
- [ ] Video strip (`KkStudioPlacement`) and count strip (`KkStudioCounts`) on the gesture engine; delete `KkStudioDrag`
- [ ] Device check: overview bracket and edges, video and count strips on iPad and desktop

### Phase 10 — One Stage: read views
Goal: the `Stage` kit replaces the read-only renderers.
- [x] `Stage` kit with layers (floor, spots, dots, paths, own dot and cue, absences), viewpoint and framing props
- [x] Practice, lesson picture, hall and hub thumbnails on `Stage`; delete their renderers
- [ ] Film playback; check frame rate on the iPad (canvas only if it drops) — owed to Florian

Built 2026-11-02. `@furria/studio/Stage` is the one read stage: `Stage` (root) with `Dot`, `Path`,
`Target`, `Count` and `Cue`. Props: `stage` (width, depth, artwork), `viewpoint` (dancers = front
edge and front label on top, artwork turned; audience = at the bottom), `fit` (`contain` fills a
sized container and frames `frame` — the practice step framing, fading between frames — or `width`
for list and card figures), `density` (`full` | `card` | `thumb`: dot sizes, numbers, halo, paper vs
ink-wash floor), `centre` (centre line), `frontLabel`. Every layer places by stage shares (0–1) in
one field (`stage-framing`: `placeOf`, `containedPlaneOf`, `containedFrontOf`, `StageFrame`,
`WHOLE_STAGE_FRAME`, `frameKeyOf` moved here from practice); lines draw in a `0 0 1 1` SVG with
non-scaling strokes, so no aspect is passed around. `Stage.Dot` kinds: `own`, `cast` (`muted` in
practice beside the own dot, `moving` in the hall), `open`, `absent`; optional name tag above/below,
glide while paused, motion entrance from an earlier place (hub rows).
- **Paint stays in `@furria/ui`** (ADR-0035: the studio authors no design CSS): `KkStageInk` (plane,
  disc, name, line, ring, count, cue, front label) and `KkFormationLegend` (the hub's numbered cast
  list beside/below the live formation). `KkTheme` joins `@furria/ui/kk-sx`; the studio takes the
  theme augmentation through `src/ui-theme.d.ts`.
- **On `Stage`:** practice and the lesson picture (`PracticeStageLayer`, dancers, contain + step
  frame), the hall (`HallStageLayer`, its own viewpoint, contain), the hub (`ScoreFormation`:
  manual-row thumbs, the *Für dich* card, the live formation with legend; audience, width).
- **Deleted:** `KkPracticeStage`, `KkScoreFormation` (+ `formation-geometry`), `KkHall.Stage`,
  `KkHall.Dot`.
- **Unified looks (judge on device):** an open spot is one neutral dashed ring everywhere (practice
  had gold, now kept for absent people); the hall floor uses the practice veil and shadow; the hub
  live formation shows full-size numbered discs with the pulsing own halo.
- **Review follow-ups (fixed):** a dot only mounts motion when it enters (`StageEntering`) and
  promotes a layer only while gliding; thumbs need no label; `stage-framing` has pure tests.
- **Review follow-ups (open):** a `contain` frame change re-keys the plane with its layers (as the
  old practice stage did), so layers remount and an entrance would replay — keep `from` to `width`
  stages, or key only the floor when phase 11 needs it; the front label does not fade with a frame.
- **Owed:** shots at 390 px, 844×390 and iPad, a playback film and the iPad frame rate — the dev
  database holds no choreography, so nothing could be shot here; `KkTouchLab` and `KkStudioStage`
  stay for the open phase 7 rulings and phase 11.

### Phase 11 — One Stage: editor
Goal: the stage editor is the `Stage` with editor layers and the gesture engine.
- [x] Editor layers (handles, bends, onion skin, selection) with the lab's touch handling
- [ ] Spot holder assignment and song/video order with @dnd-kit/react — split into phase 11b
- [x] Delete `KkStudioStage` and the old editor drag code
- [ ] Device check: dot drag, multi-select, bend, pinch/pan on phone and iPad

Built 2026-11-02. The step card stage and the desk stage are one `StudioEditStage` (club app) on
`@furria/studio/Stage` (`fit="contain"`, `viewpoint="dancers"`) with the gesture engine bound by
`@furria/studio/use-stage-gestures`: hit testing over dots (and bend handles, higher priority)
through `hit-priority` in area pixels measured from the plane, tap → `editor.tap` (one dot alone,
again → none, empty floor → none), long press → `editor.hold` (adds to the selection, haptic) and
shows the selection toolbar (`Stage.Float` + `KkStageInk.Bar`: *Spiegeln · Reihe · Verteilen ·
Abwählen*, only *Abwählen* in Wege); drag a dot → `grab/move/end` (the selection when the dot
belongs to it, 0.25 m grid snap as before), `dragCancel` drops the preview (`editor.cancel`,
`TrackCommit.drop`); the live value (*1,5 m rechts · 2,0 m hinten*) floats above the finger
(`KkDragReadout`, `liftPlacementOf`), the snap lines light through the dragged dot, a haptic tick on
whole metres. Two fingers (and wheel/trackpad) zoom up to 6× and pan: the zoom is a smaller
`frame` (`stage-zoom`: `zoomedStageViewOf` keeps the point under the fingers, clamps to the
stage), so the contain stage needs no second geometry; `frameChange="follow"` keys the plane
once (closes the phase 10 re-key follow-up for edit stages). Quarter-metre grid lines appear from
2× (`stage-grid`, centred on the centre line, front-anchored in depth). Precision on the stage is
zoom + grid snap (ruling); no distance precision. Arrow keys nudge a focused dot by 0.5 m, Enter
selects (`Stage.Dot` `keys`).
- **New parts:** `Stage.Grid`, `Stage.Echo` (onion), `Stage.Handle` (bend), `Stage.Key`
  (waypoint), `Stage.Float`; `Stage.Dot` `selected`/`lifted`/`dimmed`; `StageRoot` `work`
  (gesture area wrapper as size container + plane ref), `overlay`, `frameChange`. Paint in
  `@furria/ui`: `KkStageInk.Grid/Echo/Handle/Key/Bar`, `KkStageInkDisc` selected/lifted/dimmed,
  `KkDragReadout` (phase 9 reuses it).
- **Selection:** the *Mehrere* switch is gone (step card tools and desk tools); long press adds.
  `grabbedSpotsOf` lost `multi`; the cast list's `choose` selects the spot (or keeps the
  selection it belongs to).
- **Deleted:** `KkStudioStage` (+ `Dot`, `Handle`, `Onion`, `Path`), `KkLaneDot`,
  `StepCardDotsLive`, `DeskDotsLive`, `use-step-card-dots`, `use-desk-dots`, desk `dotNameOf`/
  `dotLabelOf`. `KkStudioDrag/use-studio-drag` stays for the phase 9 tracks.
- **Unified looks (judge on device):** editor dots are the practice discs (ink cast dots, dashed open
  spots) with a primary outline when selected and a lift when dragged; the old 25/33/66/75 % guides
  are replaced by the metre grid and the centre line.
- **Review follow-ups (fixed):** a tap on a bend handle no longer clears the selection; keyboard
  choose/nudge focus the desk's spots like a touch; the editable stage is a `group` (not `img`)
  so its dot buttons reach assistive tech; the toolbar side is judged against the zoomed view; a
  drag that replaces the selection hides the toolbar; a long press and a drag start in one batch
  keep the added dot; pinch + pan keeps the point under the moving fingers; bends show no snap
  lines (they are not snapped); `StageWork` lives in `stage-work.ts`; the toolbar is a `group`
  and the readout no live region.
- **Review follow-ups (open):** formation drags read the previewed keyframes per move (as before
  this phase), so a drag landing on the next waypoint's place could join it to the held run —
  snapshot the keyframes at grab time; `use-act-studio-stage` is large (selection, arrange, copy,
  drag) — split in phase 12; no custom focus ring on stage dots; the readout size is a constant
  in `use-stage-gestures`.
- **Not built:** momentum/rubber band at the stage pan ends (pan stops at the stage edge); a
  *whole stage* button — pinch out or wheel resets.
- **Owed (device check):** dot drag with the readout, long-press multi-select + toolbar, bend
  handle drag, pinch/pan during playback, keyboard nudge, on iPhone, Pixel and iPad Safari; shots at
  390 px, 844×390 and iPad (the dev database holds no choreography).

### Phase 11b — Lists with @dnd-kit/react
Goal: spot holders and song order are dragged like the lab's lists.
- [x] Song order in the song list by drag handle (`songOrder` change), replacing the earlier/later shift
- [x] Spot holder assignment by dragging people between places and *frei* (session and evening)
- [x] Video order: decided 2026-11-02 — no video order; main/alternative per part stays
- [ ] Device check: sort and assign on phone and iPad

Built 2026-11-02 (video order left open for Florian's decision). Song list: while the working mix
is editable and no final file is previewed, every song row is a `KkStudioList.SortRow` (the row plus
a drag handle, `useSortable`); a drop writes one `songOrder` change (`movedOrderOf`) and keeps the
playhead in the song it was in (`keptPositionOf`). The song desk's *Nach vorn / Nach hinten* are
gone (`shiftedOrderOf` deleted); its last line is *Lied* with *Lied entfernen*. Spot sheet: under the
places list a *Besetzung* section — every place a drop target (`KkStudioList.Places/Place`) holding
its person as a draggable chip (`KkStudioList.Holder`), plus a wide *frei* place with the cast
nobody holds. A drop is one undo step (`startGesture`/`endGesture` around the `spotAssign`
changes of `holderMovesOf`): onto an open place moves, onto a held place swaps, onto *frei* frees.
It writes through `stageDocument`, so the evening (Sessionsauftritt) assigns its own holders. The
spot desk's tap choices stay. Keyboard: dnd-kit's keyboard sensor on the handle and the chips
(both `ButtonBase`); screen reader instructions and announcements are German and name the song,
person and place (`studio-drag-copy`, dnd-kit `Accessibility` plugin; `@dnd-kit/dom` 0.5.3 pinned in
the catalog). Escape that cancels a keyboard drag no longer also closes the sheet
(`KkPracticeSteps` honours `defaultPrevented`).
- **Review follow-ups (open):** song order has no single-pointer alternative to dragging any more
  (the task replaced the earlier/later buttons; keyboard sorting remains) — Florian to confirm;
  the holder chips are `touch-action: none`, so a swipe starting on a chip does not scroll the
  sheet (judge on the phone).
- **Owed (device check):** sort by handle and assign/swap/free by chip with touch on iPhone, Pixel
  and iPad Safari (touch delay, auto-scroll inside the sheet, the sheet's own swipe), keyboard
  sorting; shots at 390 px and iPad.

### Phase 12 — Screens into the package, keyboard, cleanup
Goal: the studio is one package; nothing studio-specific is left behind.
- [ ] Rename the club app's `Studio` type to `ActStudio` (package `Studio` stays)
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
