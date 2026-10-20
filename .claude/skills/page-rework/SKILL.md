---
name: page-rework
description: Rework an existing page, page group, hub or sub hubs into a better final version — audit, three divergent variants built for real in the lab on real data, pitch, owner's pick, critique-driven refinement, promotion. Use when Florian asks to improve, rebuild, rework or "work out more" an existing screen or hub, wants a more professional / better UI-UX version, or asks for several versions to choose from.
---

# Page rework

You are the **lead**. Subagents build; you set the brief, judge every screenshot yourself, cut losers, write
the critique and pitch. Florian decides by looking at **real, running screens on his phone** — never at static
mocks, artifacts or text descriptions alone.

Invocation: `/page-rework <route or area> [wish]`, e.g. `/page-rework /events "more professional, work first"`.

Before any code: invoke `/frontend-work` (and `/backend-work` if a phase touches `server/`).

## Florian's design rules (binding — paste the relevant ones into every brief)

1. **Dense information.** Max useful facts per pixel, well structured, never overloaded. No big greeting/title
   blocks, no one-fact hero cards, no generous min-heights. Budget the first screen in facts, not mood.
   Density must never become a mix: group by kind, one fact line per item, detail in sheets/drawers. (A case
   holding dates, announcements and groups side by side "totally overwhelmed" him.)
2. **Pro hubs: work first.** Management screens (workbenches, `/manage`, events, gallery admin, system) are pro
   tools — Linear / ops-console quality: counts that double as filters, status grids with drill-in
   panes/drawers, work queues, inline actions, precise alignment, tabular numbers. The whole state in the first
   seconds; the most important action in a few taps (bottom drawers on phone, side pane on wide desktop).
   Decorative metaphors get rejected ("split-flap board", "timeline ruler", "picture that prints in colour" —
   2026-10-19). Visual richness comes from icons, state badges readable without colour, small SVG gauges,
   real pictures as thumbnails — not from decoration.
3. **Member surfaces: full showpieces.** On member-facing screens signature animations and confetti play in
   full on every visit — no "lighter" repeat variants, nods, once-only or night modes. On pro hubs motion only
   explains a state change (ring fills, badge flips, a done item leaves).
4. **No concept names in the UI.** A design metaphor may have a working name, but it never appears in labels,
   headings or buttons, nor does its trade jargon. Plain German about what happens ("Veröffentlicht",
   "So erscheint sie"). The metaphor stays in visuals and motion.
5. **Real data only.** Show nothing that is useless or that we don't have: no invented numbers, no zero noise,
   quiet empty states ("keine"). Planned features get an obvious slot and at most one quiet "kommt noch"
   mention — never a fake control.
6. **Bold, never mainstream — but chosen by him.** Work as team lead: several specialists/builders, built
   variants, one distilled recommendation with honest trade-offs and the rulings it needs. His verdict pattern
   "take it as a base, more quality, more eye for detail" → do a screenshot detail audit before the next build.
7. **Final form only.** No interim or reduced versions; incomplete is fine, interim is not. Rulings that change
   (e.g. "absent, never a disabled button") are surfaced, not silently broken.
8. **Colour and type.** Red = accent/action/current only; gold = overdue/attention; Anton for display and
   numbers, Archivo for UI; tokens only, light + dark both first-class.

## Tooling rules (binding)

- Host has no node/pnpm: every web command runs in `node:24.21-alpine` via corepack, **always with
  `--user $(id -u):$(id -g)`** (a root run breaks `scripts/dev.sh` and worktree removal). Fresh worktree:
  `corepack pnpm install --frozen-lockfile` first. Use `corepack pnpm -r …` for recursive scripts.
- Browser checks: `mcr.microsoft.com/playwright:v1.63.0-noble`, `--network host`, `--user`,
  `SHOT_BROWSER_CHANNEL=chromium`; scripts under `web/tools/screenshot/`. Docker is a snap — it can't read
  hidden dirs (`~/.herdr`) or `/tmp`; keep throwaway files in a non-hidden home dir or the worktree.
- Dev stack: `scripts/dev.sh up|status|restart` (API :5100, website :3010, club app :3011, reachable from the
  phone via the host IP). The dev DB and media worker are shared across worktrees.
- At most 5 builder agents at once — parallel agents fill the disk and ENOSPC truncates files to 0 bytes; check
  for empty files before merging.

## Phase 0 — Intake (lead, ≤ 5 min)

1. Pin the **target**: which routes form the page group (hub + sub hubs + step screens), who uses it.
2. Classify the **surface** — it decides the whole design register:
   - **Pro / management hub** (workbenches, `/manage`, events, gallery admin, system): work in the
     foreground, whole state in the first seconds, Linear / ops-console quality, inline actions, motion only to
     explain a state change. No decorative metaphors.
   - **Member-facing surface** (Start, group hub, calendar, profile): expressive, showpiece motion plays in full
     every visit, still dense.
3. Write Florian's **wish** down in his words. If he gave none, default: "more professional, better UI/UX,
   more visual — icons, SVGs, purposeful animation — understandable at a glance, nothing useless."
4. Ask only what blocks you (use the options block). Don't ask what the code answers.

## Phase 1 — Audit (one Explore agent + lead)

Explore agent (foreground) returns a factual brief with file paths:
- routes, screens, components, hooks and the shared `@furria/ui` primitives they use;
- **every data field the API actually returns** for this area and **every action that exists** (mutations,
  permissions, existing step/edit screens) — this list is the variants' only source of truth;
- relevant CONTEXT.md terms, ADRs, plan files, earlier rulings.

Lead: shoot the current state (phone + desktop, light + dark, `web/tools/screenshot`) and write a numbered
**baseline critique** (what costs scan time, what is hidden, what is decoration, what wastes pixels).

Dev data: the dev DB is shared and holds Florian's own data — never change or delete it. If the area is empty
or uniform, **seed a few realistic records** (plain SQL or API, realistic names, varied states: overdue, in
preparation, complete, cancelled) so every state is visible; tell Florian and offer to remove them at the end.

## Phase 2 — Brief + three divergent variants (3 builder agents in parallel)

Write one **common brief** to the scratchpad (template: [brief-template.md](brief-template.md)). Then pick
**three directions that differ in structure, not in styling** — each a different organising principle and its
own page system (which sub hubs exist, what the hub's first screen is). Examples for a pro hub: *work queue*
(the hub is one list of open work with inline actions) · *control console* (health strip + entity × status grid,
tap a cell → pane/drawer that acts) · *pipeline* (lanes by lifecycle phase, gates). For member surfaces the
directions may be more expressive, but still three different structures.

Each builder gets (template: [agent-prompts.md](agent-prompts.md)): the brief path, its direction in concrete
terms (hub screen, sub hub screen, core interaction loop), a **prefix** for new `@furria/ui` primitives
(`Kk<Prefix>*`), its own feature folder `features/lab-<slug>/`, its own lab routes `/lab/<slug>…`.
Isolation rules that keep three agents in one worktree safe:
- only its own folders; `@furria/ui/src/index.ts` changes **by Edit-insert only, never rewrite**;
- reuse existing hooks/helpers read-only; no edits to the production feature; no `server/` changes;
- validation + screenshot loop per the brief, iterate on its own shots.
Lead meanwhile adds the lab hub entries (`features/lab/lab-drafts.ts` → `LabHubPage` "Entwürfe" section).

## Phase 3 — Judge + pitch (lead)

1. Combined `biome check apps packages` (exit code, not tail) + both typechecks; fix trivial format issues.
2. Open the key shots of every variant yourself. Reject your own weak work before Florian sees it.
3. Pitch in chat: link `http://<host-ip>:3011/lab`, per variant — idea in one line, **first 3 seconds**, core
   loop, honest strength, honest weakness. End with **one recommendation** (may be a combination) and an
   options block with the three variants + "combine".

If Florian rejects all: save the verdict as a feedback memory (why, how to apply), delete the variants
(folders, routes, primitives, index exports, shots), and run Phase 2 again with new directions shaped by his
words. Never polish a rejected direction.

## Phase 4 — Refine the chosen variant (1 builder agent)

1. Delete the losing variants completely (feature folders, routes, `Kk<Prefix>*` primitives, their index
   exports, shots, lab entries). Grep for leftovers.
2. Write a **numbered critique** from the winner's shots — concrete, checkable items. The refinement layer that
   worked (events hub, 2026-10-19):
   - one compact header strip: an SVG ring/gauge + icon counters that **are** the filters;
   - every state as an **icon in a state badge, readable without colour** (glyph per state), ≥ 44 px, each one
     a direct entry into its drawer;
   - real pictures as thumbnails for recognition (branded fallback);
   - next deadline / key fact folded into the header — no extra rows;
   - no truncation: icon column headers, short facts, collapse to badges when a pane opens;
   - drawer/pane: entity + step header, **icon tabs to switch steps without closing**, facts with leading
     icons, **one primary action sticky at the bottom**, secondary actions as quiet links;
   - quiet empty states ("keine"), no big zeros;
   - motion only for state changes (ring fill, badge flip).
3. One agent implements it, keeping what Florian praised (quote him), and iterates ≥ 2 shot rounds.
4. Lead reviews the shots, then re-pitches briefly with "still open" items.

## Phase 5 — Promote (only after Florian approves)

Replace the production routes with the chosen variant: move the feature into its real folder, rename
`Kk<Prefix>*` primitives to final names, re-point links (Start to-dos, entry sheets, calendar), delete the
old screens and the lab routes/entries, remove seeded demo data if Florian wants, update the plan file and
CONTEXT.md, run validation per CLAUDE.md, then `/self-improve`. Commit/PR only when asked.

## Rules of thumb (learned)

- Real data or nothing: every number, fact and chip must come from the API; omit what we don't have.
- The metaphor stays in the visuals, never in copy; plain German labels.
- Ruling changes (e.g. "absent, never a disabled button") are surfaced, not silently broken.
- ≤ 5 builders at once (disk). Every docker run with `--user $(id -u):$(id -g)`.
- Report outcomes honestly: unseen states (no data), unverified motion, cramped layouts.
