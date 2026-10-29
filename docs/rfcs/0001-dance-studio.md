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
| `ActVideo` | video media item, anchor of video time 0, outdated flag |
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
- **Offline**: music and studio data are cached for your acts. Videos are saved by tap as a 720p
  rendition. Editing is online only.
- **Training**: per training, the open spots (from Zu-/Absagen) and the steps they affect. A
  **training mode** plays the music over the hall speaker with the current step, counts and
  formation in large type, and loops a step with one tap.

## Inspiration

Phone-only mock of the whole v1 studio (2026-10-29, liked by Florian):
[Auftritt Studio artifact](https://claude.ai/artifact/Y6x1BH1De244kSNPe61xzM), source kept in
`docs/design/dance-studio/auftritt-studio.html` (open it in a browser; sample data).
It shows the synced player (video + stage + timeline on one clock), the step manual, music cutting,
final-file matching, the stage and movement editor with the count bar, video alignment, evening
adjustments, training mode and offline.

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
- [ ] Seed a realistic studio (songs, steps, parts, 12 spots with keyframes, a video) for the lab
- [ ] Three divergent variants of the one screen in the lab (one based on the Inspiration mock) at 390 px and desktop: music + video + stage, steps/parts, loop/speed/mirror, own dot
- [ ] Client playback engine: one clock from the working mix (gapless song cuts), video slaved to it, keyframe interpolation (pure, tested)
- [ ] Pitch + Florian's pick; the rulings recorded in the RFC

### Phase 7 — Player promoted
Goal: members practise on the chosen screen with real data.
- [ ] Chosen variant promoted onto `/acts/$actId` (player mode); lab route removed
- [ ] Loop step/part, speed 50–100 % with pitch kept, mirror default on, own dot pulsing, main video per part, alternatives
- [ ] Last practised step remembered per device; Start *Üben* opens there

### Phase 8 — Music editor
Goal: editors build the working mix.
- [ ] Upload several songs, reorder, set start/end on the waveform; gapless preview
- [ ] Re-cutting moves anchors; cut-away steps/keyframes/videos flagged
- [ ] Counts 1–8 from the beat grid; correct the first "1" and the tempo per song

### Phase 9 — Steps and parts
Goal: the manual exists on the music.
- [ ] Set/move/delete step marks (gapless), name + description per step
- [ ] Part strip (name, borders on step borders), main video per part
- [ ] Manual view: steps in order with their music range, part, formation thumbnail

### Phase 10 — Final file
Goal: the members' player plays exactly what tech will play.
- [ ] Upload the final file (versioned)
- [ ] Automatic alignment suggestion per working song (profile comparison) + manual fine-tuning on the waveforms
- [ ] *Endfassung übernehmen*: rewrite all anchors in one transaction, *Musik fehlt* markers; a newer final file aligns to the previous one

### Phase 11 — Stage editor: spots and formations
Goal: formations per step on our stage.
- [ ] Stage area with our size, SVG backdrop, centre/quarter/third guides, snap grid
- [ ] Spots *Platz 1…n*: add/remove, assign cast members (one spot per person), unassigned dashed
- [ ] Formation at step borders: select, multi-select, drag, mirror left↔right, align/distribute, copy formation from another step, presets (line, block, circle), onion skin
- [ ] Choreography document load/save with version token (409 on conflict)

### Phase 12 — Movement editor
Goal: "from here to there and in what time".
- [ ] Keyframes per spot on the music; select dots → drag → pull a bar from count to count
- [ ] Bendable curves, easing, optional facing per keyframe
- [ ] Snap to counts; scrub/play the movement against the music

### Phase 13 — Trainer videos
Goal: the trainer's demonstrations run in sync.
- [ ] Upload videos to the act; automatic alignment from the soundtrack + manual offset fine-tuning
- [ ] Main video per part, alternatives, outdated when a newer video covers the same range
- [ ] 720p rendition for phones (and offline)

### Phase 14 — Offline
Goal: practise without signal.
- [ ] Cache music + studio data of your acts automatically; refresh when online
- [ ] *Für offline speichern* for the main videos (720p) with storage shown; remove
- [ ] Editing locked offline with a quiet note

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
- **Storage.** Videos are large. 720p renditions, explicit offline downloads and *outdated* instead
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
- **The evening**: live pointer, evening pass on Start, tech (show book, offline playback desk,
  track check), outside appearances and guest stages, pictures per appearance and their automatic
  sorting by capture time.
- **Memory**: season book, stage biography, lineage view, moving up a group.
- *Heute geprobt*, side by side, the parents' view, the costume store, props on the stage.
