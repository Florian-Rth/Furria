# Studio — guided step setup and the step list

**Promoted 2026-11-07 — RFC 0003 phase 13:** the 3-stage setup (W1–W2) runs at `/acts/$actId/steps/setup`,
the step list is the edit page's *Schritte* job at `/acts/$actId?edit=true`; the lab routes are deleted.
S1, S2, S5's resume count and P1 are superseded by W1–W2; S6/S7 belong to the stage editor.

Shaped with Florian 2026-11-04. Builds on [studio-edit-variants.md](studio-edit-variants.md) (edit page
"one job at a time"); this replaces its *Schritte* job and holds that promotion until both land together.

## His words

> Lets imagine i start with a new dance for this session. We have our 4 songs … we only want specific parts
> of the songs … i (the trainer) have to think about the steps … i record myself dancing the steps. Now i
> have the video of a few steps together. So i need a wizard or similar here, where i am guided setting up
> what i have … upload the video, … match it to the music (start from auto-matched point if it found it), …
> marking split points (they mark how a step ends and the next one begins) … We need as much guidance and
> support and assistance features as possible.

> Parts: only for grouping steps and music parts … Only optional.

> Steps like the formation and so on should be optional. If i currently just want to upload the steps
> without thinking about the formation.

> Waypoints have to be integrated better. So i can EASILY setup a formation change over possibly complex ways.

## Rulings

| # | Ruling |
|---|---|
| S1 | **Guided setup** (*Schritte einrichten*) from a trainer video: Video → An die Musik anlegen → Schrittgrenzen setzen → Schritte benennen → *(optional)* Aufstellung → *(optional)* Wege → *(optional)* Teile → Übersicht. |
| S2 | Only video, matching and borders are the core; **every later stage is optional** — "Fertig" is offered from naming on; on an optional stage Weiter simply moves on (F6). Names default to *Schritt n*. |
| S3 | Matching starts from the automatic sound match (R17, `VideoMatching`); the trainer confirms or nudges. No match found → starts at the music position the video was placed at, quiet note. |
| S4 | Borders: the video plays with the music, one big tap "Schritt endet hier" sets a border at the playhead; then each border is fine-tuned while its step repeats (*Schritt wiederholen*). Borders are step marks (steps tile the music, R18). |
| S5 | A setup can stop after any stage and resumes later; the act page states what is open ("3 von 8 Schritten ohne Aufstellung") with *Weiter einrichten*. Every write is a normal save (versions, undo) — no draft state. |
| S6 | **Formation model:** a step has a start and an end formation (end of one = start of the next); the movement is the way between. Wegpunkte snap to step borders by default; extra Wegpunkte inside a step remain possible. No schema change — keyframes stay on the music. |
| S7 | **Ways are drawn, not placed:** hold a dot and draw its way with the finger while the step plays slowed; the stroke is simplified into a few smooth Wegpunkte. Dragging a point on the line bends it. Several selected dots: draw one way, the others follow keeping their spacing. |
| S8 | **Parts (*Teile*) become optional**: a named range of consecutive steps (first + last step), steps may stay ungrouped. Backend change: `ActPart` gains `LastStepId`; parts no longer tile. |
| S10 | **Every time view in the setup is the shared scrollable timeline** (centre-line scrub, zoom, exact time search, waveform) — no own strips. *An die Musik anlegen* shows **two waveform lanes**, music and the video's soundtrack, one above the other; dragging the video lane moves the video against the music, starting from the automatic match (Florian 2026-11-04: "you have to use the scrollable audio component there"). Videos get a peaks rendition of their soundtrack (media worker), like songs. *Built 2026-11-04:* act videos publish `Peaks` (same JSON `{peaksPerSecond, peaks}`) from the signal decoded for the sound profile, one decode for both; a video without a sound track publishes empty peaks (`peaks: []`), so the URL always answers; gallery videos keep none. `GET /acts/{actId}/studio` → `videos[].urls.peaks`. Existing videos get it by the lost-rendition repair (first fetch of a missing file queues the item) or `regenerate all` on deploy. |
| S9 | **Step list = backbone** of the edit page: steps in music order, under their part when grouped, each row with number, name, length, video thumb and a small before → after formation picture (or "ohne Aufstellung"). Add, rename, split, merge with next, delete, move into/out of a part (*describe* dropped by W1). Delete gives its time to the previous step and keeps its start formation as a Wegpunkt inside it. |

## Slices

1. **Backend — optional parts** (S8): `LastStepId`, migration (existing parts get the last step of their
   old tiling range), Post/Put validation (first ≤ last, no overlap), `StepIds` from the range, tests. *Done.*
2. **Guided setup** — built in the lab, now 3 stages (W2), promoted to `/acts/$actId/steps/setup`. *Done.*
3. **Step list** as the edit page's *Schritte* job (S9). *Done.*
4. Promoted together with the edit-jobs rework — RFC 0003 phase 13 (2026-11-07). *Done.*

## Setup frame (Florian 2026-11-05)

> There must be a recognizable navigation / action on this page. It cant be, that the controls for audio /
> video and so on or the audio scroll component are on different positions all the time. If you understood
> the first step, it must enable you to know all the other steps as well. And think about dimensions.

| # | Ruling |
|---|---|
| F1 | One fixed frame on every stage: head · picture · timeline · transport · task · foot. Only the task zone changes per stage. |
| F2 | Picture zone = what you look at: the video, or on Aufstellung/Wege the stage with the video as a tap-to-swap corner. Same rectangle every stage. |
| F3 | The shared timeline on every stage, fixed lanes ruler · Musik · Schritte · Video (the video lane carries its soundtrack wave — the drag lane on *An die Musik anlegen*); Teile lane only when parts exist; the stage's working lane is highlighted. |
| F4 | One transport bar under the timeline everywhere: previous step · play · next step · repeat step · tempo · zoom (+ time readout on tablet). Replaces every per-stage play/step control. |
| F5 | Task zone: one sentence of instruction (no repeated heading), the stage's tools, at most one stage action (ink, never red). Overflow opens a bottom drawer — the frame never moves. |
| F6 | Red only on the foot's Weiter/Fertig; Fertig sits in the foot next to Weiter from naming on, never in the head. No separate *Überspringen*: on an optional stage Weiter simply moves on. |
| F7 | **Sized for the real phone viewport** — iPhone Air Safari ≈ 420×740, small phones 390×664 (2026-11-05, his screenshot: task zone squeezed to nothing, timeline text unreadable). Phone order stays fixed; the **picture is the only flexible zone** (min ≈ 140) — head ≈ 56 (stage + progress one line), timeline at the edit page's readable lane sizes, transport ≈ 48, task ≥ 200 (scrolls inside), foot ≈ 60, filling the visible height exactly (dvh, no gap under the foot). Tablet: left ≈ 2/3 picture (flex) + timeline + transport; right ≈ 1/3 task with the foot at its bottom. |

## Professional UI/UX pass (Florian 2026-11-06)

> The waveform thing is huge, the video smaller than it, the gaps are not equal … the button in the bottom
> bar is misformed … I did not get what the goal of each step is. A good UI must be straightforward.

Five critical reviews (layout, components, flow, Apple HIG, interaction/a11y) → rulings:

| # | Ruling |
|---|---|
| P1 | **5 stages + finish** (replaces S1's list): 1 *Video* (pick/upload; automatic match, then "Passt der Takt?" check with drag/nudge fallback inside the same stage) · 2 *Schritte trennen* (big tap; fine-tune follows automatically, no Setzen/Prüfen tabs) · 3 *Schritte benennen* (all steps of this video as one list with inline fields) · 4 *Aufstellung & Wege* (optional, per step, step stepper in the task) · 5 *Teile* (optional). Closing **finish screen** (not a stage): result of this video + *Zum Tanz* / *Noch ein Video*. |
| P2 | **Timeline (F3 refined):** all lanes on every stage at one fixed, compact phone scale (≈120 px instead of 168); the stage's working lane is highlighted on the lane itself. Video gets real 16:9. |
| P3 | **No red in the timeline** — playhead, current part/step marks become ink/neutral on every screen (edit page, Musik & Video, practice). Red only on the main action (F6). |
| P4 | **Foot = Zurück + Weiter only**, production buttons (`KkButton`). Weiter names its target ("Weiter: Benennen"); on an untouched optional stage "Ohne … weiter". No *Fertig* in the foot; the head's X ends the setup (everything is saved). |
| P5 | One spacing rhythm (8 px between zones, 16 px player → task), real production primitives instead of the `KkEj*` lab clones, one numbering (the dance's step number), save status never a ✓ next to the title, progress shows real per-stage completion, a new setup starts at Video. |

## Simpler wizard (Florian 2026-11-07)

> Steps dont need descriptions. Just keep names. And the aufstellung should be not part of the wizard.
> This can be done later in its own editor.

| # | Ruling |
|---|---|
| W1 | **Steps have a name only** — descriptions are gone from the whole product (wizard, step list, desk inspector, score pane, lesson card + read drawer, API, DB column `act_step.description` dropped by `DropStepDescription`). The save write is `stepName`; `PUT acts/{actId}/steps/{stepId}` takes `{ name }`. |
| W2 | **The wizard only turns a new video into its steps — 3 stages + finish** (replaces P1): *Video* · *Schritte trennen* · *Schritte benennen*. No optional stages. *Aufstellung & Wege* and *Teile* left the wizard — formations are made later in the stage editor, parts in the step list. The picture zone always shows the video. The act page's resume note only counts unnamed steps. S6/S7 apply to the stage editor, S8 to the step list. |

**Verdict 2026-11-07:** Florian takes the 3-stage wizard (W1–W2).
