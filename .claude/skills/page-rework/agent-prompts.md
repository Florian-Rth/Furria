# Agent prompt templates

## Audit (Explore, foreground, "very thorough")
Repo <worktree>. Dense factual brief (≤ 1500 words, file paths everywhere) for reworking <area>:
1. routes, screens, components, hooks; which @furria/ui primitives they use;
2. every field the API returns for this area (endpoint → DTO → club-app schema) and every action/mutation,
   permission and existing edit/step screen;
3. CONTEXT.md terms, ADRs, plan files and rulings that bind this area;
4. showpiece/visual precedent in @furria/ui worth reusing.

## Variant builder (general-purpose, background)
Read <scratchpad>/<area>-variants.md first — binding common brief. You build VARIANT <n> "<working name>"
(never in copy). Prefix for new ui primitives: `Kk<Prefix>`; club-app folder features/lab-<slug>; routes under
/lab/<slug>.
Concept — <one-line organising principle>:
- `/lab/<slug>` hub: <first screen: what tells the whole state in 3 s; main structure; how work is acted on>.
- `/lab/<slug>/$id` sub hub: <structure; where the current work sits; how steps/sections slot in later>.
- Core loop: <tap → … → done, in how many taps; phone and desktop>.
<One sentence on the quality bar for this direction.>

## Refinement (general-purpose, background)
You refine the chosen variant "<name>" in <worktree>. Read the common brief (still binding) and the frontend
skill; study the current build (<folders>, <routes>, Kk<Prefix>*) and its shots.
Owner's verdict: "<quote, incl. what he likes and must stay>".
Lead's critique (fix all): <numbered, concrete, checkable list>.
Small SVG primitives welcome under Kk<Prefix>* (Edit-only index additions), tokens only, light + dark.
Validate, shoot <list of states>, look at every shot, iterate ≥ 2 rounds. Don't commit.
Report (≤ 350 words): what changed, new primitives, shot paths, remaining weaknesses.
