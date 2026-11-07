# Act hub — three variants (common brief)

Worktree: /home/portainer/.herdr/worktrees/Furria/worktree-silver-meadow-b3ef. Owner: Florian. He compares
the variants on his phone and tablet via the **lab stack** (club app http://10.10.20.12:3013/lab, API :5101 on
the lab database `furria_acthub`, a copy of the dance-studio branch data) and picks one.

## Owner's wish (binding, his words)
> As a user i went to my group and opened this year's act hub. There i have the next big question marks in my
> head. It is not self explainable. Needs a restructuring and redesign. Icons, illustrations, animations. UI/UX
> must be hard improved. This must become a hub where the group members can see everything about their this
> year's performance. Be creative. Here we start with another approach than the rest of the app. This hub should
> also work — or work even better — on tablet and desktop sizes, mainly tablet, so that the trainers can work
> with a tablet in the training. A power user mode. The mobile view should be more like a read view. It must
> also provide all edit functionalities if a trainer only has a phone, but on a tablet we can put more
> functionality in a better UX.

Surfaces:
- **Phone = member read view** (member surface: expressive, showpiece motion plays in full on every visit).
- **Tablet (primary, 1180×820 landscape and 820×1180 portrait) + desktop = trainer power mode** (pro tool
  register: work in front, whole state in the first seconds, motion only explains a state change). Members on a
  tablet get the same layout read-only.
- A trainer on a phone reaches **every** edit function (inline where natural, otherwise one tap into the
  existing editor screens).

## Baseline critique (what must be fixed)
1. Four equal door tiles (Abend · Training · Üben · Besetzung) = a menu, not a hub; nothing shows what this
   year's dance *is* (music, parts, steps, formation) or how far it is.
2. Tiles stretch to viewport height: ~70 % empty card bodies on phone; tablet = four almost empty full-height
   columns — worst on the main target device.
3. Trainer content hides behind tiny header icons (info → a 2000 px "details" list incl. 54 choreography versions
   one per row; note → music page; hall mode only via a list button).
4. Training answers differ from the group page; desktop lists 13 trainings with answer buttons — a wall.
5. "Nr. 5" in display type without context; "–" rows for evenings the act is not in.
6. Cast said three times (count + first names + initials), nobody's place or presence.
7. No readiness picture for the trainer (music cut? steps placed? movement per place? video? open places?).
8. No illustration, no motion — the most emotional object of a group's year looks like a settings page.

## Design rules (binding)
1. Dense information. Max useful facts per pixel, well structured, never overloaded. No big greeting/title
   blocks, no one-fact hero cards, no generous min-heights, nothing stretched to fill height. Density never a
   mix: group by kind, one fact line per item, detail in sheets/drawers/panes.
2. Trainer power mode = pro tool (Linear / ops-console quality): counts that double as filters, status per
   item readable without colour (icon in a state badge), inline actions, drill-in panes (side pane on
   tablet/desktop, bottom drawer on phone), precise alignment, tabular numbers. No decorative metaphors
   that cost scan time. Visual richness from icons, small SVG gauges/illustrations, real portraits.
3. Member read view = showpiece: signature animation plays in full on every visit (no once-only/lighter
   repeats). Trainer parts: motion only for state changes.
4. No concept names in the UI. Plain German labels. Domain terms (CONTEXT.md): *Sessionsauftritt* (the act),
   *Auftritt* (one evening appearance, "Nr. 5"), *Abend*, *Training*, *Musik*, *Endfassung*, *Schritt*, *Teil*,
   *Platz*, *Aufstellung*, *Bewegung*, *Fassung*, *offen*, *x von y da*, *Training starten*, *Bearbeiten mit*.
5. Real data only. No invented numbers, no zero noise, quiet empty states ("keine"). Planned features: an
   obvious slot and at most one quiet "kommt noch" — never a fake control.
6. Bold, never mainstream. Different approach than the rest of the app is explicitly wanted here.
7. Final form only, no interim versions.
8. Red = accent/action/current only; gold = attention/overdue/open; Anton display + numbers, Archivo UI;
   tokens only; light + dark first-class; ≥ 44 px targets; 200 % text must not break; keyboard reachable.

Rejected earlier (never bring back): countdown to the first appearance · skill grid ("kann/wackelt/neu") ·
ranking or per-person attendance scores/percentages · chat · stage *times* (position *Nr.* only) · season grid /
"Heute" live mode · studio differing by group kind.

## Read first (mandatory)
CLAUDE.md · .claude/skills/frontend-work/SKILL.md · docs/design/README.md (READ FIRST) · docs/web/TESTING.md ·
plan/club-app/group-year.md (rulings R1–R31) · docs/rfcs/0002-dance-studio-polish.md (phase verdicts) ·
CONTEXT.md (Act, Appearance, Training, Step, Part, Spot, Choreography).

## Data and actions that exist (use ONLY these)
Read: `useActStudioQuery(actId)` (features/acts/api.ts) → `GET /api/acts/{id}/studio`:
- `act`: actId, name, kind, group {groupId, name, tone, icon, picture}, sessionYear, closed, archived,
  cast[{person + portrait, absent}], wishes[] (planners only — leave out of the member view).
- `viewer`: inCast, canEditSettings, canEditStudio, canGrantCoEditors, canMarkAttendance.
- `coEditors[]`.
- `studio` (cast + group admins): music {lengthSeconds, source workingMix|finalTrack}; songs[] (position,
  start/end, tempoBpm, fileName, urls incl. peaks); finalTracks[] (version, adopted, alignments); steps[]
  {stepId, name, description, start/endSeconds, placement onTimeline|cutAway|musicMissing}; parts[] {name,
  stepIds, mainVideoId, adrift}; spots[] {spotId, number, person}; videos[] {name, state, startSeconds,
  placement, outdated, urls video/compact/poster}; choreography {version, tracks[{spotId, keyframes[{seconds,
  position{rightMetres, backMetres}, facingDegrees}]}]}; stage {widthMetres, depthMetres, artworkSvg};
  evenings[] {eventId, title, startsAt, appearance{position, added, removedPersonIds, spotChanges,
  choreography}}; trainings[] {calendarEntryId, title, startsAt, openSpotIds[], responses[{personId, answer
  yes|maybe|no, isRecordedOnBehalf, recordedBy, trail}]}.
- `GET /api/acts/mine` (useMyActsQuery): per act nextEvening {title, startsAt, position}, nextTraining
  {startsAt, viewerAnswer, present, absent}, playable, editors.
- Audio peaks JSON from the signed `urls.peaks` (see features/act-player).
Existing hooks to reuse read-only: features/act-card/hooks/* (doors, training answer), features/act-training/
hooks/* (trainings, roll pane), features/act-studio, features/act-player (audio engine/clock), features/
act-practice, features/attendance (useAttendanceAnswer).

Actions (gates in parentheses) — every one must be reachable from the hub on phone and tablet:
- Own training answer (member, via attendance endpoint) — inline.
- Roll call: mark a cast member present/absent for a training (canMarkAttendance) — inline on tablet.
- Training mode / hall view: `/acts/$actId?view=training&training=<id>` (playable).
- Practice/player for members: `/acts/$actId?view=play` (playable or editor).
- Studio editing (canEditStudio): `/acts/$actId?view=play&edit=true` (step cards on phone, lane desk ≥ 840 px)
  — steps, parts, spots/places + person assignment, movement, choreography versions/restore, trainer video;
  `/acts/$actId/musik` (songs order/cut/beat, final file + alignment + adoption, videos).
- Evenings (canEditStudio): "Wir tanzen hier" join/leave, per-evening cast and place changes, evening
  choreography — existing pane `/acts/$actId?view=details&evening=<eventId>`.
- Settings (canEditSettings): rename, cast add/remove, wishes, archive — `/acts/$actId?settings=true`.
- Co-editors (canGrantCoEditors): grant/revoke — currently in details.
- Undo/redo history — currently in details (keep reachable for editors).
You may call existing mutations/hooks directly for inline actions; do not add endpoints (no server/ changes).
If a variant needs data that does not exist, say so in the report — don't fake it.

## Constraints
- Club-app visuals only via @furria/ui (ADR-0007, lint-enforced). Prefer existing primitives (KkFacet*,
  KkStudioStage, KkPracticeStage, KkHall, KkLane*, KkStudioWave, KkMasterDetail, KkSheet, KkBottomDrawer,
  KkHubRow, KkFactRow, KkChip, KkIcon…). New primitives in web/packages/ui/src/Kk<Prefix>*/ only, and each
  gets ONE line in web/packages/ui/package.json `exports` — **re-read the file right before an Edit-insert; never
  rewrite it** (three agents edit it).
- Your code only in web/apps/club-app/src/features/lab-<slug>/ and routes
  web/apps/club-app/src/routes/_app/lab_.<slug>.$actId.tsx (+ further lab_.<slug>… files if you need sub pages).
  The lead adds the lab hub entries.
- Don't touch server/, production feature folders, or the other variants' folders.
- Pure decision logic → pure functions + co-located tests (decisions, not text; see frontend-work rules).
- Responsive: phone 390 px; tablet 1180×820 landscape is the design centre; check 820×1180 portrait and 1400 px desktop.
- Validation (never docker without --user):
  W=/home/portainer/.herdr/worktrees/Furria/worktree-silver-meadow-b3ef; docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 -v $W:$W -w $W/web node:24.21-alpine sh -c "corepack pnpm exec biome check apps/club-app/src/features/lab-<slug> apps/club-app/src/routes packages/ui/src && corepack pnpm --filter @furria/club-app typecheck && corepack pnpm --filter @furria/ui typecheck && corepack pnpm --filter @furria/club-app test <your tests>"
  Another agent's files may fail a check — re-run before blaming yourself; fix only your files. Format with
  `biome check --write <explicit file paths>` only (whole-dir --write hangs).
- Browser check on the **lab stack** (vite :3013 → API :5101, already running; the route tree regenerates on its
  own). Shots:
  docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -e SHOT_BROWSER_CHANNEL=chromium -e SHOT_EMAIL=<persona> -e 'SHOT_PASSWORD=Furria-Persona-1!' --network host -v $W:$W -w $W/web/tools/screenshot mcr.microsoft.com/playwright:v1.63.0-noble node --disable-warning=ExperimentalWarning src/shot.ts '/lab/<slug>/3' --base http://localhost:3013 --name <slug>-<persona> --viewport phone --viewport tablet --viewport desktop --scheme light --scheme dark [--reduced-motion] [--click <selector>]
  Personas (act 3 *Marschtanz*, Tanzgarde, 3 songs / 13 steps / 3 parts / 12 places / 2 videos / choreography,
  5 evenings, 13 trainings with some answers):
  - `sabine.roth@furria.local` — trainer (group admin): canMarkAttendance, canEditStudio, canGrantCoEditors, canEditSettings.
  - `lena.brandt@furria.local` — co-editor in the cast: canEditStudio only.
  - `jana.kuehn@furria.local` — plain member in the cast (place 10): read view.
  Also check act 5 (Kindergarde, partly built, Sabine leads) and act 14 if present (empty) for empty states.
  Look at every shot as a demanding senior product designer and iterate (≥ 2 rounds). Film motion with
  `--filmstrip` once.
- Lab data lives in `furria_acthub` only — you may answer trainings/mark attendance there while testing.
  Never touch the `furria` database.
- Do not commit. Keep total new files reasonable; check for 0-byte files before you report (disk).

## Final report (≤ 400 words)
Page system (routes, panes, drawers), the first 3 seconds per persona and device, the core loops (member:
answer + practice; trainer in training: roll call → start hall; trainer editing on phone), files, checks, shot
paths, honest weaknesses.
