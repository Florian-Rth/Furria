---
rfc: 0001
title: Dance studio — the Auftritt becomes the group's year (v1)
status: in progress
github_issue: 52
branch: feat/rfc-52-dance-studio
created: 2026-10-29
---

# RFC 0001: Dance studio — the Auftritt becomes the group's year (v1)

## Summary

The club app serves the board and planners well, but most people in the club are plain members of
a dancing group, and their group life happens on WhatsApp, USB sticks and paper. This RFC turns the
**act** (*Auftritt*), today only a line in an evening's Ablauf, into the thread of a group's season.
It belongs to a **session** and has **appearances** at single evenings. For dance acts it gets a
**studio**:
- the working music (several songs, each cut with a start and end point) and the final file
- **steps** and **parts** laid over the music
- a **stage editor** with numbered spots, formations and keyframed movement on counts
- trainer videos, matched to the music automatically

All of it plays on **one screen**, in sync, as the step-by-step manual of the dance. v1 is dance
only. The text studio, the evening and memory features are later RFCs.

## Motivation

- Florian, 2026-10-29: *"We have so many management features. But the most people in the club are
  just members that participate in groups. So we should work out more features for them."*
- Building a dance runs from May to 11.11. Along the way, music edits, formations and the
  trainer's demonstrations scatter across phones and messengers. Dancers can't practise at home
  against the real choreography.
- The act model from PR #50 has no session, no media and no evening level. Cast and formation
  differences for one evening have nowhere to live, and the running-order line duplicates what an
  evening-level act would be.
- Nothing is in production, so structures may be rebuilt to fit the end state (CLAUDE.md: no
  interim versions).

The full brainstorm, all rulings (R1–R31, D1–D6) and the later map (text studio, evening, memory)
are in [`plan/club-app/group-year.md`](../../plan/club-app/group-year.md). That file is the
reference; this RFC is the v1 build.

## Proposal

### Domain (CONTEXT.md: **Act**, **Appearance**, **Co-editor**)

- **Act** = one piece in one **session**: a dance, a speech, a show. Its **act kind** decides the
  training: *Tanz* gets the dance studio, *Show* gets the dance studio in v1. The group kind only
  suggests the default kind.
  - *Ablaufpunkte* and acts without a kind are **timeless** (no session).
  - A new act gets the **relevant session**. After the session closes, the act is read-only and its
    default cast is materialised at Ash Wednesday.
  - `FollowsActId` keeps lineage. Carrying an act into a new session (*Weitermachen*) is not in v1.
- **Appearance** = one act at one calendar entry, independent of the Ablauf. It **replaces
  `RunningOrderLine`**: position, pin and block are appearance properties.
  - It is created by the group (*Wir tanzen hier* / *Für diesen Abend anpassen*) or by the planner.
    An appearance the group creates lands unplaced in the planner's tray.
  - It stores only differences from the act: cast in or out, spot reassigned or left empty, and
    optionally its own copy of the choreography. If the session choreography changes after that
    copy was made, the evening shows a notice; there is no automatic merge.
  - Music and steps stay session-wide.
- **Access**: training material is visible to the **cast + the group's admins** only. Planners see
  the act and its name. Group admins edit; a group admin can make individual cast members
  **co-editors** of one act, who edit the studio content but not the cast or the group.

### Studio data

| entity | content |
|---|---|
| `ActSong` | audio media item, order, start/end point — the **working mix** (playback jumps to the next song at an end point) |
| `ActFinalTrack` | separate upload of the final file, versioned; alignment offsets per working song (or per previous final file) |
| `ActStep` | start anchor, name, description. Steps tile the music without gaps; a step ends where the next starts |
| `ActPart` | name, first step, main video. A gapless strip above the steps |
| `Spot` | number, assigned person (session level) |
| `Choreography` | **one `jsonb` document** per act (session version) or per appearance (evening copy): keyframes per spot (position in metres from the centre front, curve, easing, optional facing), version token, 409 on conflict |
| `ActVideo` | video media item, anchor (the music position and the video moment playing there); *outdated* is derived |
| `ActCoEditor` | act, person, granted by/at |
| `AppearanceCastChange`, `AppearanceSpot` | the evening's differences |
| club record | stage width × depth (m) + optional stage SVG (Inkscape, sanitised, rendered non-interactively in the stage area) |

- **Anchor** = (source audio item, position in it). Re-cutting a song moves its anchors with it;
  anchors whose music was cut away are flagged.
- ***Endfassung übernehmen*** rewrites every anchor once onto the final file, in one transaction.
  Anchors whose music is missing keep their old anchor and are marked *Musik fehlt*. A newer final
  file aligns to the previous one.
- **Media**:
  - new owner kind `Act` (`OwnerActId`), keeping the single-owner rule
  - new `MediaKind.Audio` (MP3, WAV, AIFF, FLAC, M4A); audio is never public
  - the worker's audio lane produces: `Original`, `Normalised`, `Preview` and `Peaks` renditions;
    duration, loudness, beat grid (first beat + tempo); and a comparison profile, also for a
    video's soundtrack
  - the API compares two stored profiles to suggest an alignment (offsets + confidence)
  - corrections to the beat grid are stored per song or final file

### Screens

- **`/acts/$actId` is the studio.** Members land in the player; editors switch to editing on the
  same page. The old editor pane (name, kind, cast, wishes) becomes the page's settings.
- **The one screen**:
  - music controls: waveform with song cuts, step and part marks, counts 1–8
  - the trainer video: main video per part, mirror on by default, speed 50–100 % with pitch kept
  - the stage with dots gliding along their keyframes; your own dot pulses
  - loop a step or a part
  - layout chosen from **three lab variants** (page-rework way)
- **Editor**:
  - music: upload, order, cut
  - step and part marks
  - *Endfassung übernehmen* with automatic matching
  - video upload with automatic matching and fine-tuning
  - formation and movement editor: select, drag, a bar from count to count, curves, facing; snap
    to counts and the stage grid
  - assigning people to spots
- **Evening adjustments** on the act page and from the planner.
- **Group hub** gets an *Auftritte* section; **Start** gets an *Üben* tile (opens the player at the
  last step, remembered per device). The `/acts` catalogue and `/groups/$groupId/acts` are rebuilt
  for sessions and appearances.
- **Training**: per training, the open spots (from Zu-/Absagen) and the steps they affect. A
  **training mode** plays the music over the hall speaker with the current step, counts and
  formation in large type, and loops a step with one tap.

## Inspiration

Phone-only mock of the whole v1 studio (2026-10-29, liked by Florian):
[Auftritt Studio artifact](https://claude.ai/artifact/Y6x1BH1De244kSNPe61xzM), source kept in
`docs/design/dance-studio/auftritt-studio.html` (open it in a browser; sample data).
It shows the synced player (video + stage + timeline on one clock), the step manual, music cutting,
final-file matching, the stage and movement editor with the count bar, video alignment, evening
adjustments and training mode (the mock's offline is not in v1).

It is **design direction, not spec**, the same as `docs/design/` ("READ FIRST"). Tokens and
primitives stay binding, and the layouts and copy may be improved. Phase 6 starts from it as one of
its three variants.

## Phases

Each phase leaves the system intact (builds, tests green, migrations complete, every endpoint has a
caller in the app) and fits roughly 120k tokens. The data structure comes first. Phases that need a
verdict from Florian are marked ⚖.

### Phase 1 — Act per session
Goal: acts carry a session and lineage, past sessions are read-only, the catalogue filters by session.
- [x] `Act.SessionYear?` + `Act.FollowsActId?`, migration (existing group acts with a training kind → relevant session; *Ablaufpunkte* and acts without a kind → timeless)
- [x] Core rules: a new act defaults to the relevant session; never set to a past session; timeless when the kind is *Ablaufpunkt* or unset
- [x] Read-only after the session closes (studio, cast, wishes, appearances) — endpoint tests
- [x] Materialise the default cast at Ash Wednesday (lazy on first read/write after the close, or a hosted job — decide in phase)
- [x] `GET /api/acts` session filter; `/acts` and `/groups/$groupId/acts` default to the relevant session + timeless, past sessions by filter
- [x] CONTEXT.md / docs touched where behaviour changed

Done 2026-10-29. Decisions taken in the phase:
- The cast is frozen by an hourly hosted job (`ActCastFreeze`) into `act_frozen_cast_member`; until
  it runs, a closed act's cast is already read as of Ash Wednesday, so nothing shifts when it does.
- A closed act refuses edits *and* archiving (409). An edit without a session keeps the act's
  session; only a new act (or a kind turning into a training kind) defaults to the relevant one.
- Timeless acts are listed with the relevant and coming sessions, not with ended ones.
- The planner loads the acts of the evening's session.
- Carried into phase 2: the running order does not yet refuse acts of another or an ended session
  (the appearance owns that check); an act created from the planner takes the relevant session.

### Phase 2 — Appearance replaces the running-order line
Goal: one appearance per act and calendar entry; planner and Leitstand step unchanged in behaviour.
- [x] `Appearance` entity (act × calendar entry, unique; position?, pinned, block key?) replacing `RunningOrderLine`; migration moving lines into appearances
- [x] `AppearanceCastChange` (evening cast in/out) feeding the effective cast used by review, suggestion and findings
- [x] Running-order service, review input, suggestion and endpoints switched to appearances (wire shape kept where possible; adjust the client schemas where not)
- [x] Removing an act from the Ablauf deletes its appearance only without evening differences; otherwise 409 with what would be lost
- [x] Planner tray lists unplaced appearances (including those a group created)
- [x] Endpoint tests migrated/extended; planner client updated

Done 2026-10-29. Decisions taken in the phase:
- `appearance` belongs to the calendar entry, not to the running order; the running order keeps
  only version, confirmation, rules and switched-off wishes. The migration moves every line into an
  appearance with its id, so finding line ids stay stable. The wire keeps `lines`/`lineId`; a line
  gains `eveningChanged`.
- The evening cast is the act's cast on that day ± the appearance's cast changes; review,
  suggestion, findings and the planner's cast all use it. No endpoint edits it yet (phase 15).
- A new appearance refuses an act of an ended session or of another session than the evening's
  (relevant session of the evening's day); acts already on the evening stay, like archived ones.
  The planner now loads the acts of the evening's *relevant* session (a summer evening plans the
  coming session).
- Taking an act out (PUT) or deleting the running order with evening changes is a 409 naming the
  acts; the planner keeps such a line and says why instead of dropping it.
- The tray already lists every unplaced line. A group creating an appearance (phase 15) goes
  through the running-order service, which creates the running order if missing and bumps its
  version, so the planner sees it in the tray and an open draft reloads.

### Phase 3 — Audio in the media store
Goal: an act can own media; audio is a first-class media kind with analysis.
- [x] `MediaOwnerKind.Act` + `OwnerActId`; `MediaOwner.Accepts` becomes per owner kind (act: audio + video; photos later)
- [x] `MediaKind.Audio`: sniffing (MP3, WAV, AIFF, FLAC, M4A), limits, never public; access = cast + group admins (+ co-editors) — uploads by the act's group admins (archived acts refuse); listening is granted by the signed URLs the studio endpoint issues (phase 5), co-editors join with phase 4/5
- [x] Worker audio lane: `Original`, `Normalised` (two-pass loudness), `Preview`, `Peaks` (JSON); facts: duration, loudness, true peak, leading silence, sample rate
- [x] Worker analysis: beat grid (first beat + tempo) and comparison profile per audio item; comparison profile of a video's soundtrack
- [x] Pure profile comparison (offset + confidence) in Core, tested on fixtures (same song, trimmed song, hall recording with noise)
- [x] Docs: media ADR addendum (owner kind act, audio)

### Phase 4 — Studio data model and our stage
Goal: every studio entity exists with its invariants; our stage is configurable.
- [x] Entities + migration: `ActSong`, `ActFinalTrack` (+ alignment), `ActStep`, `ActPart`, `Spot`, `AppearanceSpot`, `Choreography` (`jsonb`), `ActVideo`, `ActCoEditor`
- [x] Core rules: anchors; gapless steps (marks split a step); part borders on step borders; choreography document validation (known spots, keyframes inside the stage, monotonic per spot); one person per spot
- [x] Club record: stage width × depth + stage SVG (sanitised; aspect mismatch warning)
- [x] Club management: stage settings (size + SVG upload with preview inside the configured stage area)

Done 2026-10-29. Decisions taken in the phase:
- No studio endpoints yet: every entity, check constraint and index exists, but endpoints come with
  the phase whose screen calls them (backend rule: no endpoint without a caller).
- An **anchor** is stored as (source media item, seconds) columns; `ActMusic` places it on the
  working mix (or the adopted final file) as *on the timeline*, *cut away* or *music missing*.
  Nothing about being cut away or missing is stored; it is derived on read.
- Steps: the first step reaches back to the start of the music; a first mark set later also opens
  a step at the start. Parts tile the steps the same way. Steps and parts whose music is gone are
  returned *adrift*, never deleted.
- Choreography: keyframes are metres right of centre / back from the front edge, with an optional
  bend point, easing (camelCase names in the document) and facing 0–359°. The check reports
  problems (unknown spot, spot twice, unknown music, off the stage, against the music, facing). It
  orders keyframes only where their music is still on the timeline. `Version` is the concurrency
  token; the write path in phase 11 raises it.
- Our stage: 2–40 m per side to the centimetre, all or nothing on the club record. Setting it
  again without a drawing removes the drawing; there is no "remove stage". The aspect-mismatch
  warning is a client rule (the drawing is still saved, stretched to fill). The drawing is
  rendered as an image, never inline.
- Carried forward: the services of later phases must keep cross-act references consistent (a
  part's first step and main video, an appearance spot's spot, an evening choreography's act),
  must keep song positions unique when reordering, and must raise the choreography version.

### Phase 5 — Act page, settings, co-editors, entry points
Goal: `/acts/$actId` exists with access rules; members and editors can reach it.
- [x] `GET /api/acts/{id}/studio` (everything the page needs, access per cast / group admin / co-editor)
- [x] Act page shell `/acts/$actId` with the settings moved from the old editor pane (name, kind, group, cast, wishes)
- [x] Co-editors: grant/revoke by group admins (endpoints + settings UI)
- [x] Group hub section *Auftritte* (this session's acts; past seasons below); Start tile *Üben*
- [x] Catalogue rows link to the act page; planners see no studio content

Done 2026-10-29. Decisions taken in the phase:
- `GET /api/acts/{id}/studio` returns the act (the catalogue shape), the viewer's rights, the
  co-editors and the whole studio read: music (working mix, or the adopted final file), songs and
  final files with signed audio URLs, steps and parts tiled on the music (adrift ones last),
  spots, videos with their place on the music and signed URLs, the session choreography. It is
  read in one repeatable-read snapshot.
- Who sees what: the cast, the group's admins and co-editors see the training material; planners
  and the group's other members get the act without it; anyone else 403. A co-editor counts only
  while in the cast. Rights are reported as flags (`canEditSettings`, `canEditStudio`,
  `canGrantCoEditors`); a closed act offers none, an archived one only the settings (to restore).
- Co-editors: `PUT`/`DELETE /api/acts/{id}/co-editors/{personId}` by the group's admins only;
  granting needs a cast member and an open, unarchived act and is idempotent; revoking is always
  allowed. Co-editors may upload act media.
- `GET /api/acts/mine` (relevant session, cast or co-edited) feeds the Start tile *Üben*;
  `GET /api/groups/{id}/acts` (non-archived session acts, `viewerInCast`) feeds the group hub
  section for members, admins and planners. Person references of co-editors and spots are
  classified for absorption/erasure.
- The act page shows the act's facts and a studio overview (music length, songs, own spot, steps,
  parts, spots, videos) until the player arrives in phase 7; settings open as the old editor pane
  (side pane / bottom drawer). The catalogue keeps its pane only for creating; rows open the page.
- The studio read has no endpoint tests with content yet (no write path exists); the phases that
  add the writes test the read through it.

### Phase 6 — ⚖ The one screen: lab variants
Goal: Florian picks the layout of the player/editor screen before the editors are built into it.
- [x] Seed a realistic studio (songs, steps, parts, 12 spots with keyframes, a video) for the lab
- [x] Three divergent variants of the one screen in the lab (one based on the Inspiration mock) at 390 px and desktop: music + video + stage, steps/parts, loop/speed/mirror, own dot
- [x] Client playback engine: one clock from the working mix (gapless song cuts), video slaved to it, keyframe interpolation (pure, tested)
- [x] Pitch + Florian's pick; the rulings recorded in the RFC

Done 2026-10-29 (Florian picked E after two rounds). Decisions taken in the phase:
- The studio read also returns **our stage** (`studio.stage`: width, depth, drawing), read through the
  club record service; the player needs it and planners/admins-only club endpoints can't serve members.
- **Engine** (`features/act-player/`): one shared Web Audio context is the clock. The working mix is
  scheduled as back-to-back buffer pieces (sample-exact song cuts); a loop schedules its next passes
  ahead. Decoded music is cached per media item (renditions are immutable). The trainer video is muted
  and follows the clock (seek beyond 0.3 s drift, otherwise a small playback-rate nudge). Frame-rate
  values reach only small leaf components through one per-player frame store.
- **Keyframes**: a move eases by the *arriving* keyframe's easing; a **bend is the point the path passes
  through half way** (quadratic curve). **Right** = right as seen from the audience; **facing 0° = facing
  the audience**, clockwise. Viewpoints: *audience* (front edge at the bottom) and *dancers* (turned 180°).
- **Speed** uses the playback rate, so pitch is not kept yet; keeping it needs a time-stretch stage in
  phase 7.
- Seed for the lab: `scripts/studio-seed/` (synthetic songs and trainer videos made with the worker's
  ffmpeg, steps, parts, spots, choreography, stage), run against a branch database (`furria_rfc52`) so
  the shared dev database never gets this branch's migrations.
- **Round 1 rejected** (A stacked layers, B step list with an expanding card, C editor lanes). Florian's
  rulings for the practice view, binding for phase 7 on:
  - It behaves like a **native app**: one fixed viewport, **no page scrolling**, and **nothing jumps
    while the music runs** (no auto-scroll, no layout change; only content inside fixed boxes changes).
  - **Show less**: practising is calm and focused, every element earns its place; secondary things sit
    behind one tap as an overlay.
  - Scope is the **cast member's practice view only**; editing, configuration and planning come with
    their own phases and leave no hints or lanes here.
  - "Perfect professional UI/UX"; motion is judged by filming playback, not by stills.
- **Round 2** lab variants at `/lab/studio-d|e|f/$actId` (entries on `/lab`): **D** the mirrored trainer
  video fills the screen like a native player, controls fade while playing, a small stage inset;
  **E** the stage from the dancer's view is the screen, your dot large with the next move drawn ahead and
  counted down ("in 3"), the video behind one tap; **F** one step at a time like a lesson, looping by
  default, story-style step progress, video or stage in one fixed frame.
- **Pick: E** (2026-10-29), refined in the lab as `/lab/studio-e/$actId` (D and F removed). Rulings:
  - The **trainer video is the hero** while training, not the formation.
  - The **formation is always visible next to the video**, never behind a tap or toggle; it may be
    smaller and keeps E's large red own dot and the next-move countdown.
  - The **controls are worked out properly** (creative and professional); where a part has no video the
    formation takes the hero slot without a layout jump.
  - The **step list** (part headers, one dense row per step with a formation thumbnail) is an
    **openable menu**, never on the main screen: a bottom sheet on phone, a collapsible side panel on
    landscape/desktop, overlaying without moving the layout; it opens from the step name or the step
    bar, and tapping a step jumps there (and can loop it) without stopping the music.
  - **Controls**: the **step bar** is the scheme (segments per step, gaps between parts; tap a segment to
    loop the step, hold to loop its part; a slim pill with previous, play, next and speed 50–100 %),
    with **gestures as extra shortcuts** on the video/stage: tap = play/pause, double-tap left/right or
    a horizontal swipe = previous/next step, vertical swipe = speed. The thumb ring and a gesture-only
    scheme were built and dropped; count-in and a haptic tick on "1" were left out (the player can't
    pause before a loop restarts; iOS has no vibration).

### Phase 7 — Player promoted
Goal: members practise on the chosen screen with real data.
- [x] Chosen variant promoted onto `/acts/$actId` (player mode); lab route removed
- [x] Loop step/part, speed 50–100 % with pitch kept, mirror default on, own dot pulsing, main video per part, alternatives
- [x] Last practised step remembered per device; Start *Üben* opens there

Done 2026-10-29. Decisions taken in the phase:
- **Promotion**: the lab feature became `features/act-practice` and the primitives `KkPractice*`
  (`KkPracticeView`, `-Screen`, `-Stage`, `-Steps`, `-Segments`, `-Transport`, `-Count`,
  `-StepName`, `-Description`). The lab route `/lab/studio-e/$actId` and the lab entries are gone.
- **Page modes**: `/acts/$actId` opens the practice view (fullscreen screen) whenever the viewer
  sees the studio and some music is ready. Its one header action *Über den Auftritt* opens
  `?view=details`, the former page (facts, studio overview, co-editors, settings pane), which
  offers *Üben* back and *Bearbeiten*. Planners, viewers without the studio and acts without
  ready music get the details directly. Fullscreen screens may now carry one quiet action.
- **Pitch kept**: when slowed, the mix runs through the Signalsmith Stretch AudioWorklet
  (`signalsmith-stretch`, MIT, WASM) in live-input mode, transposing up by −12·log2(rate)
  semitones. Sources start earlier by the node's latency, so the clock (and video and stage)
  stays on what is heard. The node is only connected while slowed. If it cannot load, slowed
  music plays at a lower pitch. **Open**: production's CSP (`web/deploy/security-headers.conf`)
  needs `'wasm-unsafe-eval'` in `script-src` for the WASM to compile; until Florian approves
  that change, the fallback applies in production. The worklet file is precached (`mjs`).
- **Alternatives**: the takes offered at a moment are the playable videos covering it, the
  part's main video first. A chip *1/2* in the video corner cycles them; the choice holds
  while it covers the moment, otherwise the main video shows.
- **Remembered step**: per device *and* person (`furria.practice.<person>.<act>.step`), written
  while the music plays, restored once when the page opens; the Start tile *Üben* links to the
  act page, so it opens there.

### Phase 7b — ⚖ Edit mode: lab variants
Goal: decide the shell of edit mode before the editors (phases 8–13) are built into it: how editors enter
edit mode from the player, where the tools live, and how music, steps, formation and video share the
screen. The native-app rules of the practice view apply (fixed viewport, nothing jumps, calm).
- [x] Three divergent edit-mode variants in the lab on the seeded studio (390 px + desktop)
- [x] Pitch + Florian's pick; the rulings recorded in the RFC
- [x] Phases 8–13 task wording adjusted to build into the chosen shell

Done 2026-10-30 (Florian picked H plus two parts of I). Decisions taken in the phase:
- Three variants were built in the lab on act 3 (Lena made a co-editor on the branch database), each opening
  in the practice view, edits local only: **G** one shared timeline with lanes under stage + video and an
  inspector; **H** the practice screen itself becomes the editor, one tool at a time; **I** one page per step
  with a step rail. G and I are removed; H stays in the lab (`/lab/studio-h/$actId`, `features/lab-studio-h`,
  `KkStudioH*`) only until phase 8 promotes it.
- **Pick: H** as the edit-mode shell. Rulings, binding for phases 8–13:
  - **Entry/exit**: editors (`canEditStudio`) get a **pencil at the end of the transport pill**; in edit mode
    the same place shows **Fertig**, which returns to practising at the same moment. Head, hero, side,
    controls and the pill keep their place in both directions; nothing jumps, no page scroll.
  - **One tool at a time**: *Musik · Schritte · Aufstellung · Bewegung · Video* — a bottom tab bar on phone, a
    slim rail on the left on landscape/desktop. A tool re-casts the same fixed boxes (hero, side, strip);
    the switch is a short morph, the transport never moves. Selection details open as a bottom sheet on phone,
    in the side box on desktop.
  - Per tool: **Musik** — the mix waveform with song cuts is the hero, songs + the *Endfassung* slot in the
    side box. **Schritte** — the step bar grows into the mark strip with parts above, name + description
    inline in the head. **Aufstellung** — the stage is the hero (grid, centre line), the video moves to the
    side box, a contextual stage toolbar. **Bewegung** — stage hero with the selection's paths and the count
    bar *Takt 1 – 4* under it. **Video** — the trainer video is the hero, a strip with each video's place on
    the music and the offset.
  - **Taken from I**: the **step rail with formation thumbnails** (grouped by part, number, name, counts) is the
    Schritte tool's overview; the **previous formation shown faintly plus the paths** between belong to
    Aufstellung and Bewegung.

### Phase 8 — Edit-mode shell and music editor
Goal: editors enter edit mode on the act page and build the working mix.
- [x] Promote the H shell onto `/acts/$actId`: pencil in the transport pill → edit mode → *Fertig*, the tool bar (phone) / rail (desktop) with the five tools, the fixed boxes re-cast per tool; the lab route and `KkStudioH*` names removed
- [x] Musik tool: upload several songs, reorder, set start/end on the hero waveform; gapless preview; *Endfassung* slot in the side box
- [x] Re-cutting moves anchors; cut-away steps/keyframes/videos flagged
- [x] Counts 1–8 from the beat grid; correct the first "1" and the tempo per song

Done 2026-10-30. Decisions taken in the phase:
- **Promotion**: the lab feature became `features/act-studio` (`ActStudio*` components, `useStudioScreen`)
  and the primitives `KkStudio*` (`KkStudioView`, `-Edit`, `-Tools`, `-Wave`, `-List`, …); the lab route
  `/lab/studio-h/$actId`, `features/lab-studio` and the lab entries are gone. The act page's practice
  mode now renders the studio screen for everyone; the old `PracticeBody`/`-Hero`/`-Side`/`-BarControls`
  were removed (the studio screen without edit rights is exactly the practice view).
- **Entry without music**: editors (`canEditStudio`) get the studio screen even before any music plays;
  it then opens straight in edit mode on *Musik*. Their details page offers *Musik anlegen* back.
- **Endpoints** (one shared rule `ActStudioGate`: group admin of the act's group or a co-editor in the
  cast; archived/closed acts 409): `POST /api/acts/{id}/songs` `{mediaItemId}` → 200 `{songId}` (an
  audio item of this act, not yet a song or final file; at most 100 songs), `PUT …/songs/order`
  `{songIds}` (exactly the act's songs, else 409), `PUT …/songs/{songId}` `{startSeconds, endSeconds,
  firstBeatSeconds, tempoBpm}` (cut ≥ 2 s; end/first "1" past a known duration 422; tempo 40–300;
  null beat values fall back to the analysis), `DELETE …/songs/{songId}` (the media item stays, so
  anchors on it read as *music missing*).
- **Musik tool**: songs upload by tus (owner `act:{id}`, several at once, progress rows) and are added
  on completion; the song under the playhead is *selected* — tapping it again opens the song desk (the
  same sheet/side panel as the spots): tempo ±0.1/±1 BPM, the first "1" nudged by 20 ms or put on the
  playhead, *Nach vorn/Nach hinten*, *Lied entfernen* (second tap confirms). Cuts on the hero waveform
  save on release. All song writes are optimistic patches of the studio read, serialised in one
  mutation scope; the playhead keeps its place when the mix is rebuilt. The waveform shows a line on
  every "1"; the head's live count follows the corrected grid at once.
- **Cut-away**: anchors live in source time, so re-cutting moves them without a rewrite; what falls
  outside the music (steps, videos, keyframes) is counted in the side box as *Außerhalb der Musik*.
- **Still local in the shell**: the Schritte, Aufstellung, Bewegung and Video tools keep the lab's
  in-memory edits until their phases (9, 11–13) persist them.

### Phase 9 — Steps and parts
Goal: the manual exists on the music, in the Schritte tool.
- [x] Schritte tool: set/move/delete step marks on the mark strip (gapless), name + description inline in the head
- [x] Part strip above the marks (name, borders on step borders), main video per part
- [x] Step rail as the tool's overview: steps grouped by part with number, name, counts and formation thumbnail

Done 2026-10-30. Decisions taken in the phase:
- **Endpoints** (all behind `ActStudioGate`; positions are seconds on the music the studio plays):
  `POST /api/acts/{id}/steps` `{atSeconds}` → `{stepIds}` (splits the step there; the first mark set
  later also opens a step at the start, so 1 or 2 ids; on a border or outside the music 422),
  `PUT …/steps/{stepId}` `{name, description}` (trimmed, blank description stored as none),
  `PUT …/steps/{stepId}/start` `{atSeconds}` (only strictly between the previous step's start and the
  step's own end; the first step always starts with the music; a step adrift 422), `DELETE …/steps/{stepId}`
  (its music goes to the previous step; a part stored on it moves to another of its steps, or is
  removed when that was its only step). `POST /api/acts/{id}/parts` `{firstStepId, name}` → `{partId}`
  (409 when a part already begins there or the step is adrift), `PUT …/parts/{partId}` `{name,
  firstStepId, mainVideoId}` (the start only between the neighbouring parts' starts, the first part never
  moves; a video of another act 404), `DELETE …/parts/{partId}` (its steps go to the previous part).
- **The first part reaches back** to the first step. When a new part opens on the step the first part is
  stored on, the first part is re-anchored on its first shown step, so what the editor sees stays true.
  The same happens when the next part's start moves onto that step. Renaming the first part with its
  shown first step does not move it.
- **Anchors** are rewritten on a border move (`ActTimelineReader` builds the music + tilings for writes).
- **Schritte tool**: the side box shows the **step rail** (the practice step list with part headers,
  formation thumbnails, loop buttons) with the action *Neuer Schritt hier* in its head — it marks at the
  playhead, snapped to the nearest count, so marks can be tapped along while the music plays. Tapping the
  current step (on the mark strip or in the rail) opens the **step desk** (sheet on phone, side panel on
  desktop): *Schritt entfernen* (second tap confirms), *Neuer Teil ab hier* / part name, *Beginnt früher /
  später* (one step), *Teil auflösen*, and the part's *Hauptvideo* (any act video or none).
- Border drags preview locally and save on release; name/description save on blur or Enter (every open
  text draft is flushed, so a draft survives the playhead moving on); drafts clear when their write settles. All step and
  part writes are optimistic patches of the studio read (marks and new parts wait for their ids), in one
  mutation scope with the domain change `actSteps`.

### Phase 10 — Final file
Goal: the members' player plays exactly what tech will play; built into the Musik tool.
- [x] Upload the final file (versioned) from the *Endfassung* slot
- [x] Automatic alignment suggestion per working song (profile comparison) + manual fine-tuning on the waveforms
- [x] *Endfassung übernehmen*: rewrite all anchors in one transaction, *Musik fehlt* markers; a newer final file aligns to the previous one

Done 2026-10-30. Decisions taken in the phase:
- **Endpoints** (all behind `ActStudioGate`): `POST /api/acts/{id}/final-tracks` `{mediaItemId}` →
  `{finalTrackId}` (an audio item of this act that is neither a song nor a final file; the version
  counts on; 409 while a newer, not adopted final file still waits — only one at a time),
  `PUT …/final-tracks/{finalTrackId}` `{firstBeatSeconds, tempoBpm}` (the beat grid correction of a
  final file, as for songs), `DELETE …/final-tracks/{finalTrackId}` (the waiting file and its media
  item; an adopted one 409), `POST …/{finalTrackId}/alignment` → `{matches}` (compares every source
  of the music playing — the working songs, or the adopted final file — with the new file, keeps the
  offsets found with confidence ≥ 0.35; 409 while anything is still analysed, 422 when nothing is
  found), `PUT …/{finalTrackId}/alignments/{sourceMediaItemId}` `{offsetSeconds}` (fine-tuning; a
  source that does not play 404), `POST …/{finalTrackId}/adoption` (one transaction: steps, videos and
  every choreography of the act, evening copies included, are rewritten; choreography versions rise).
  Matching, tuning and adopting refuse an adopted or older file (409). The adopted final file is the
  adopted one with the highest version (no longer the latest adoption time).
- **Offset** = where source second 0 lies in the final file (`final = source + offset`), one per
  source. An anchor moves only when its source is matched and the moved moment lies inside the final
  file; otherwise it keeps its anchor and reads as *Musik fehlt*. A video keeps its lead-in.
- The studio read returns each final file's name, beat grid (corrected or analysed) and offsets; the
  player counts on the adopted final file's grid.
- **Musik tool**: the side box's *Endfassung* section uploads the file (tus), shows the waiting one
  with how many songs were found, and offers *Endfassung entfernen* (second tap). Editors' clients
  ask for the matching once per ready, unmatched file and state of the music (silently). Tapping the
  waiting file starts **Probehören**: the whole studio (music, steps, counts, video, formation)
  plays exactly as it would after adopting, computed on the client from the offsets; the song list
  then shows where each song lies in the final file and the waveform shows the final file with the
  songs' regions — the selected one's start drags to shift it, saved on release. Tapping the
  current song (or one not found) opens the desk: ±0.02/0.1 s, *Beginnt hier*, *Automatisch
  abgleichen*. *Endfassung übernehmen* appears while listening, and its second tap names what
  would lose its music. Once
  adopted, the file's row opens a desk for its tempo and first "1". Probehören ends when leaving the
  Musik tool or edit mode; the playhead keeps its musical place in both directions.

### Phase 11 — Stage editor: spots and formations
Goal: formations per step on our stage, in the Aufstellung tool.
- [x] Stage hero with our size, SVG backdrop, centre/quarter/third guides, snap grid; the video in the side box
- [x] Spots *Platz 1…n*: add/remove, assign cast members (one spot per person), unassigned dashed
- [x] Formation at step borders via the stage toolbar: select, multi-select, drag, mirror left↔right, align/distribute, copy formation from another step, presets (line, block, circle); the previous formation shown faintly with the paths
- [x] Choreography document load/save with version token (409 on conflict)

### Phase 12 — Movement editor
Goal: "from here to there and in what time", in the Bewegung tool.
- [x] Keyframes per spot on the music; select dots → drag → pull the count bar *Takt 1 – 4* from count to count
- [x] Bendable curves, easing, optional facing per keyframe; paths and the previous formation on the stage
- [x] Snap to counts; scrub/play the movement against the music

Done 2026-10-30. Decisions taken in the phase:
- **No new endpoint**: every edit saves the whole session choreography through phase 11's
  `PUT /api/acts/{id}/choreography` (version token, optimistic patch), shared with the Aufstellung
  tool (`useTrackCommit`). Drags preview locally and save on release.
- **Waypoints**: dragging dots in Bewegung pauses the music, snaps the playhead to the nearest count
  and keys the grabbed spots there: a keyframe already at that count moves, otherwise a waypoint is
  inserted (it takes the spot's facing there and the split move's easing; the split move loses its
  bend). On a step border this edits the formation, as Aufstellung does.
- **The move** of a spot is the one under the playhead within the current step (a segment between
  two keyframes that changes place or is bent). The count bar shows the selection's move; dragging
  from count to count retimes it for every selected spot. **Retiming keeps the formations**: hold
  keyframes are left at the old times when the move gets shorter, a hold before or after may be
  absorbed when it gets longer, and a neighbouring move is never shortened. A tap on a count (or a
  drag without a selection) scrubs to it.
- **Bend** = a handle on the stage at the move's bend point (or half way); dragged back near the
  middle it straightens. **Easing, facing, removal** sit in the selection sheet's *Weg* desk:
  *Gleichmäßig · Langsam los · Langsam ankommen · Weich*, *Gerade ziehen*, *Blick am Ziel* in 45°
  turns (named from the dancers' view, *frei* = none; it also applies to the hold after the arrival),
  *Wegpunkt entfernen* when a keyframe sits on the playhead (the last keyframe of a spot stays).
- The editor's dots show every spot's facing as a notch; *Vorher* in Bewegung shows the formation at
  the step's start faintly. The selected spots' paths over the step are drawn with their keyframes.

### Phase 13 — Trainer videos
Goal: the trainer's demonstrations run in sync, set up in the Video tool.
- [x] Upload videos to the act; automatic alignment from the soundtrack + manual offset fine-tuning on the tool's strip
- [x] Main video per part, alternatives, outdated when a newer video covers the same range
- [x] 720p rendition for phones (and offline)

Done 2026-10-30 (built in parallel to phases 10–12). Decisions taken in the phase:
- **Endpoints** (all behind `ActStudioGate`; positions are seconds on the music the studio plays):
  `POST /api/acts/{id}/videos` `{mediaItemId}` → `{videoId}` (a video item of this act, not yet a
  video; at most 100), `PUT …/videos/{videoId}` `{name}` (trimmed, blank = none),
  `PUT …/videos/{videoId}/start` `{atSeconds}` (where video time 0 lies; may be negative when the
  recording starts before the music; 422 when the video would miss the music),
  `POST …/videos/{videoId}/alignment` → `{startSeconds, confidence}` (409 while the video or the
  music is still analysed or the video has no sound, 422 when the music is not found),
  `DELETE …/videos/{videoId}` (the row and its media item; a part showing it loses its main video).
- **Anchor**: a video stores the music anchor *and* the video moment playing there
  (`start_video_seconds`), so a recording that starts before the music keeps its lead-in. A place
  before the music anchors on the music's start.
- **Matching**: the song profiles are cut to the working mix and joined into one profile, which the
  soundtrack profile is compared with once (`VideoMatching`, confidence ≥ 0.35). Editors' clients
  ask for it once per ready, unaligned video and state of the music (silently); the video desk offers *Automatisch anlegen*
  again with a message.
- **Outdated is derived on read** (`act_video.outdated_at` dropped): a video is outdated when a newer
  one (higher id) covers its whole range within 1 s. Placing a video hands it every part it covers at
  least half of whose main video is missing or now outdated (unless it is outdated itself).
- **Video tool**: the side box lists the takes per part plus *Noch nicht auf der Musik* (processing,
  unaligned, cut away, music missing) with uploads (tus, several at once) and *Videos hinzufügen*.
  Bars on the strip drag with a local preview and save on release; the nudges save ±0.1 s at once.
  Tapping the selected video opens the **video desk**: name, *Automatisch anlegen*, *Beginnt hier*
  (video start at the playhead), *Hauptvideo für* each covered part, *Video entfernen* (second tap).
  The studio polls while songs or videos are still being prepared.
- **Compact rendition**: act videos also get `Compact` (H.264 within 1280×720); the studio read
  returns its URL and phones/tablets (below the desktop breakpoint) play it. Existing act videos get
  it on `regenerate`.

### Phase 14 — Offline (dropped from v1)
Ruling 2026-10-30 (Florian): offline is not needed for v1. Practising needs a connection; moved to *Out of scope*.

### Phase 15 — Evening adjustments
Goal: an evening can differ from the session without touching it.
- [ ] *Wir tanzen hier* / *Für diesen Abend anpassen* on evenings the group takes part in (creates the appearance → planner tray)
- [ ] Evening cast in/out, spot reassignment / empty spot
- [ ] Evening copy of the choreography; notice when the session version changed after the copy
- [ ] Player and planner show the evening's version

### Phase 16 — Training
Goal: the studio is used every week.
- [ ] Open spots per training (from Zu-/Absagen on the group's training entries) and the steps they affect
- [ ] Training mode: music over the hall speaker, current step/counts/formation big, one-tap loop
- [ ] Wrap-up: CONTEXT.md, docs, `plan/club-app/group-year.md` status

## Risks & alternatives

- **Audio analysis quality.** Beat detection and profile matching can fail on live recordings or
  tempo changes. Every automatic result can be corrected by hand, and the comparison is tested on
  realistic fixtures in phase 3.
- **Playback sync on phones.** Gapless song cuts plus a video kept in sync across iOS Safari and
  Android need a single audio clock (Web Audio) with the video slaved to it. Proven in the phase 6
  lab before the editors depend on it.
- **Storage.** Videos are large. 720p renditions and *outdated* instead
  of duplicates keep this in check.
- **Considered and rejected:**
  - a server render of the song cuts into one file (the group uploads the final file)
  - translating anchors on every read (they are rewritten once instead)
  - one keyframe per table row (a document per choreography instead)
  - a separate act edition per season (one act per session with *folgt auf* instead)
  - studio by group kind (decided by act kind instead)
  - a skill grid
  - a countdown

## Out of scope

- **Text studio** for *Rede* / *Sketch*: uploaded text, your own parts highlighted, cue-line
  training mode. Other kinds (*Musik*, *Gesang*).
- ***Weitermachen*** (carry an act into the next session).
- **Offline practising** (cached music + studio data, *Für offline speichern* for videos, editing locked offline) — dropped from v1 on 2026-10-30.
- **The evening**: live pointer, evening pass on Start, tech (show book, offline playback desk,
  track check), outside appearances and guest stages, pictures per appearance and their automatic
  sorting by capture time.
- **Memory**: season book, stage biography, lineage view, moving up a group.
- *Heute geprobt*, side by side, the parents' view, the costume store, props on the stage.
