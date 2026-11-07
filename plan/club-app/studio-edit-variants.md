# Studio edit page — three variants (common brief)

**Promoted 2026-11-07 — RFC 0003 phase 13:** variant B (one job at a time) with the round-2 rulings is the
production edit page at `/acts/$actId?edit=true`; the step cards, the desk editor and the lab route are
deleted. The brief below is kept as history — its file paths, lab constraints and function list describe the
pre-promotion state; step descriptions were removed later (step setup W1).

Worktree: /home/portainer/.herdr/worktrees/Furria/worktree-silver-meadow-b3ef. Owner: Florian. He compares the
variants on his phone and iPad (lab dev server http://10.10.20.12:3021/lab, test data behind API :5101) and
picks one. Branch feat/rfc-57-studio-package — the worktree holds uncommitted work of the lead; never revert,
reformat or stage files you don't own.

## Owner's wish (binding, his words, 2026-11-04)
> Now to the placement / positioning page. I think the edit card / config card is very messy. Its not clear
> what belongs to what, what does what and so on. Try to simplify this. In general, have a look at the full
> page. Make sure everything is as easy as it can be. But while keeping the functions we have. We dont want
> to loose functions. They must just be as simple as they can to use. Also check if the wording is correct
> or can be improved for better understanding.

Surface: **pro tool** (trainer's editor). Page: act page → Bearbeiten → "Im Studio bearbeiten"
(`/acts/$actId?view=play&edit=true`). Phone = step cards (`StepCardsView`), ≥ 840 px = desk (`ActDeskScreen`).

## Design rules (binding)
1. Dense information, well structured, never overloaded; group by kind, one fact line per item, detail in
   sheets/drawers. Never a mix of owners in one block.
2. Pro tool: work first — Linear / ops-console quality, inline actions, precise alignment, tabular numbers,
   the most important action in a few taps (bottom drawers on phone, side pane on tablet/desktop). No
   decorative metaphors. Visual richness from icons and state badges readable without colour.
3. Motion only explains a state change.
4. No concept names or trade jargon in the UI. Plain German about what happens.
5. Real data only. Quiet empty states ("keine").
6. Final form only — no interim or reduced versions. No fake controls.
7. Red = accent/action/current only; gold = attention; Anton for display and numbers, Archivo for UI;
   tokens only; light + dark both first-class.
8. Touch is binding (RFC 0003 §3): finger never hides what it moves, visible snapping, two fingers navigate /
   one finger edits, long press selects (adds) and shows the selection's actions, hit areas ≥ 44 px, undo one
   tap away in every edit view. iPad Safari matters as much as the phone (judge at 390×844 and 1180×820).
9. Native-app practice screens: fixed viewport, no page scroll, no jumps, calm.

## Lead's baseline critique (what must get better)
1. Desk inspector "Auswahl" mixes three owners in one scroll — the step (facts, Kürzer/Länger/Schritt hier/
   Teil ab hier/Schleife/Löschen, Name, Beschreibung), the formation at the step start (Linie/Kreis/Block/
   Spiegeln/Ausrichten/Ausrichten tief/Verteilen/Vom vorigen übernehmen) and a single spot (Person, Stelle,
   Blick, Zeitpunkte). No border, no owner label.
2. The same card changes meaning with whatever was tapped last (step, keyframe "Zeitpunkt", spot) and nothing
   on stage or timeline says what is selected.
3. At 820 px height the inspector is cut; half the actions, name, description and all formation tools are
   below the fold.
4. Button weights are random: pills, grey text links that look disabled, red outlined Löschen next to Schleife.
5. Stage chips mix kinds: Aufstellung/Wege (modes), Vorher (toggle, looks like an active mode), + Platz (action).
6. Phone chip row mixes modes, formation actions and a history chip; it scrolls off-screen. "Fertig" is clipped
   in the head. "Plätze" opens a sheet titled "Weg bearbeiten" with disabled Tempo/Kurve/Blick rows above the
   cast list. Card foot: Schritt hier, "Schritt …" (meaning unclear), an unlabeled undo duplicating the head's.
7. Functions exist on only one layout (see list below) — the trainer has to know which device can do what.
8. Copy: one thing has several names, several things share one name (see glossary).
9. Stage occupies ~40 % of its card on desk, big empty bands.

## Read first (mandatory)
CLAUDE.md · .claude/skills/frontend-work/SKILL.md · docs/design/README.md (READ FIRST) · docs/web/TESTING.md ·
CONTEXT.md (Sessionsauftritt, Auftritt, Schritt, Teil, Platz, Aufstellung, Bewegung, Fassung, Besetzung) ·
docs/rfcs/0003-studio-package-and-native-touch.md §3 and phases 7/9b/11 · docs/rfcs/0002-dance-studio-polish.md
phases 14–16 · docs/adr/0035-*.md, 0036-*.md, ADR-0007 (club-app visuals only via @furria/ui / studio kits).
Current code: web/packages/studio/src/screen/ActStudioView.tsx, StepCardsView.tsx, ActDeskScreen.tsx,
desk/ActDeskView.tsx, desk/use-desk-inspector.ts, desk/use-act-desk.ts, editor/use-act-studio-stage.ts,
editor/use-act-studio-movement.ts, editor/StudioEditStage.tsx, screen/ActStudioSpotSheet.tsx,
ActStudioStepDesk.tsx, ActStudioArrangeDesk.tsx, ActStudioMoveDesk.tsx, ActStudioCastList.tsx,
copy/*.ts; club-app web/apps/club-app/src/features/act-studio/hooks/use-studio-screen.ts.

## Functions that exist (ALL must stay reachable, on BOTH layouts)
Full inventory with copy constants: /tmp/claude-1000/-home-portainer--herdr-worktrees-Furria-worktree-silver-meadow-b3ef/d4258807-9b90-42bf-b733-fd08407a0732/scratchpad/edit-audit.md
(read it completely — it is the source of truth). Summary by owner:
- **Transport**: back/forward step, play/pause, readout (time + Achter·count), rate (slower), keys
  (Space, ←/→, Shift+←/→, +/− zoom on desk), count cells tap-to-seek (phone), swipe cards (phone).
- **Timeline (desk)**: zoom out/in, whole act, centre-line scrub lanes, overview bracket.
- **Schritt**: Schritt hier (mark), rename, description, Kürzer/Länger (±1 count), border drag, delete (phone
  confirms twice), loop (Schleife).
- **Teil**: new part from this step, rename, move start earlier/later, main video of the part, dissolve, loop.
- **Platz**: add, remove (phone only today), select (tap / long press adds / floor clears), drag, nudge keys,
  pinch zoom; floating toolbar after long press (Spiegeln · Reihe · Verteilen · Abwählen).
- **Besetzung** (phone only today): who stands on this spot (cast choices + Frei lassen), drag holders onto
  spots / "frei".
- **Aufstellung** (edits the formation at the current step's start): drag, presets Linie/Kreis/Block (selection
  or all), Spiegeln (≥1), In eine Reihe / Hintereinander (≥2), Gleich verteilen quer / tief (≥3; tief phone
  only today), copy from previous step / from any step (any: phone only today).
- **Bewegung** (keyframes at a count-snapped playhead): drag writes a keyframe, bend handles, straighten,
  turn ±45°, free facing (phone only), easing/Tempo (phone only), delete keyframe at playhead, keyframe lane
  (desk: tap/drag/←→ retime), onion "Vorher" (previous formation ghost).
- **Video on the timeline**: select, drag start, Früher/Später ±0,1 s, Hier beginnen, Löschen (server).
- **Einrichten**: progress chip n/m, checklist rows (Lied hochladen, Ersten Schritt setzen, Platz hinzufügen,
  Aufstellen, Video hochladen, Endfassung), empty-lane set-up buttons on desk.
- **History**: undo, redo, save state (Gespeichert / Speichert… / Erneut speichern), Verlauf list (desk only
  today).
- **Leave**: Musik & Video (link), Fertig.
- **Evening restrictions** (when an evening is set): keep exactly today's rules.
Functions that today exist on one layout only must exist on both in your variant (final form).

## Shared wording (use it; you may improve it — say so in your report)
- Movement is **Bewegung** (mode, lane, section). One path between two keyframes is a **Weg**.
- A keyframe is a **Wegpunkt** everywhere (never "Zeitpunkt"). "Wegpunkt löschen".
- Counts: "Achter 2 · 3" in facts and readouts; lengths "16 Zählzeiten · 2 Achter".
- Onion skin: a labelled switch "Vorige Aufstellung zeigen" (eye icon), never a chip that looks like a mode.
- Formation verbs, same label everywhere: Linie, Kreis, Block, Spiegeln, In eine Reihe, Hintereinander,
  Gleich verteilen (quer / tief), "Aufstellung übernehmen von Schritt n".
- Destructive: "Löschen" for step / spot / Wegpunkt / video, "Teil auflösen" for a part; same confirm pattern
  everywhere (second tap "Wirklich löschen").
- Unassigned spot: **frei** (not "offen"). Spot place: "1,2 m links · 6,0 m hinten". Facing: named directions.
- Step menu label says what's inside (no "Schritt …").
- Page label "Sessionsauftritt bearbeiten" (CONTEXT.md: bare Auftritt = one evening).
- Every action label is a verb or a clear noun; every section header names its owner
  ("Schritt 3 · Kicklinie", "Aufstellung bei Schritt 3", "Platz 5 · Sophie Wagner").

## Constraints
- Your code only in your own folders: web/apps/club-app/src/features/lab-<slug>/ and
  web/apps/club-app/src/routes/_app/lab_.<slug>.$actId.tsx (flat route, see lab_.welcome.$case.tsx). The
  route renders the full edit page for act `$actId` (load like the production act page does — reuse
  `use-act-page` / `use-studio-screen` etc. read-only) with `edit=true` semantics, so the owner edits real
  data. New studio-domain components may live in your lab folder for now (composing @furria/studio exports);
  new styled primitives in web/packages/ui/src/Kk<Prefix>*/ with an `exports` entry in
  web/packages/ui/package.json added by Edit-insert only (two other agents edit the same file).
- Never edit production files (packages/studio/src/**, features/act-studio/**, existing ui kits). Read-only reuse.
  If a hook you need is not exported from @furria/studio, add the export line to
  web/packages/studio/package.json by Edit-insert only.
- Lab hub entries are done by the lead.
- Pure decision logic → pure functions + co-located tests (decisions, not text). No UI tests.
- Validation (never docker without --user):
  W=/home/portainer/.herdr/worktrees/Furria/worktree-silver-meadow-b3ef; docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 -v $W:$W -w $W/web node:24.21-alpine sh -c "corepack pnpm exec biome check <your files/folders> && corepack pnpm --filter @furria/club-app typecheck && corepack pnpm --filter @furria/ui typecheck"
  Another agent's files may fail typecheck — re-run before blaming yourself; fix only your files. Never run
  `biome check --write` on folders (hangs) — pass explicit file paths.
- Browser check: lab dev server http://localhost:3021 (club app, proxies /api to the test API :5101; restart
  with `docker restart furria-lab-edit-3021` if a module is stale — curl the module and grep for your change
  first). Test act: **3** ("Marschtanz", 3 songs, 12 spots, 13 steps, videos), login
  `lena.brandt@furria.local` / `Furria-Persona-1!` (`SHOT_EMAIL`/`SHOT_PASSWORD` for web/tools/screenshot
  `dev-session.ts` `signIn`). Write throwaway Playwright scripts under web/tools/screenshot/tmp-<slug>/
  (Playwright image mcr.microsoft.com/playwright:v1.63.0-noble, --network host, --user $(id -u):$(id -g),
  -e HOME=/tmp, SHOT_BROWSER_CHANNEL=chromium, run from web/tools/screenshot). Append `?pwa=false` to URLs.
  **Block every non-GET /api request in your scripts** (`context.route` → abort) — the test data is the
  owner's. Shoot 390×844 and 1180×820 (+ 1400×900), light + dark, and the key states: nothing selected,
  step selected, one spot selected, several spots selected, Bewegung mode with a keyframe at the playhead,
  part selected, video selected, Einrichten, every sheet/drawer. Look at every shot as a demanding senior
  product designer and iterate (≥ 2 rounds). Delete your tmp folder's PNGs you no longer need.
- Do not commit. ≤ 5 agents run at once — keep disk use small (no extra node_modules, no builds).

## Final report (≤ 400 words)
Structure of the page on phone and desk, the first 3 seconds, the core loops (move a spot; set a formation
preset for 3 spots; add a Wegpunkt and bend the Weg; rename + shorten a step; assign a person), where each
function now lives (table owner → place), wording changes beyond the shared list, files, checks, shot paths,
honest weaknesses.

## Verdict and rulings (2026-11-04)
- Variant B "one job at a time" + A's selection chip chosen; A otherwise and C rejected (C's implicit mode by playhead).
- Round 2 (after critical review): see memory/plan — remove video editing here (read-only lane → Musik & Video), merge align/distribute into Linie/Kreis/Block/Reihe quer/Reihe tief + Spiegeln, drop easing, drop people drag area; add job-adaptive layout, Alle wählen, Übernehmen default = previous step, Fassungen in Verlauf; no new presets; all cleanups (empty states instead of disabled walls, Abwählen only on the chip, Ende früher/später, Hier teilen, Schleife into transport as "Schritt wiederholen", "Tempo 100 %", Besetzung "tauschen", facing compass, merged phone head, zoom into the timeline corner).
