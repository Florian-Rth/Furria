---
name: work-with-rfc
description: >-
  Author and execute RFCs (Request for Comments / design proposals) that are tracked
  both locally in the repo and as a GitHub issue. Use this skill WHENEVER the user wants
  to create an RFC (e.g. turning a grilling/design session into a structured proposal),
  break work into phases, or execute a phase of an existing RFC. It triggers on the slash
  command `/work-with-rfc #XY phase Z` (where #XY is the GitHub issue number and Z is the
  phase), and also on phrases like "write an RFC", "turn this into an RFC", "work on phase N
  of the RFC", "advance the RFC", "tick off the RFC tasks", or any mention of RFC phases,
  RFC tasklists, or syncing an RFC with its GitHub issue. Use it even when the user only
  says "let's do the next phase" in a repo that has RFCs. Handles phase sizing (~120k token
  soft cap per phase), per-phase reviews, formatting/checks, committing on a feature branch,
  and keeping the GitHub issue body in sync by PATCHING the body (never by appending comments).
---

# Work with RFC

This skill manages the full lifecycle of an RFC: **authoring** one (local file + GitHub issue),
and **executing** it one phase at a time with reviews, checks, doc-sync, and commits.

## Mental model

An RFC has two synchronized representations:

1. **The canonical local file** — markdown in the repo (e.g. `docs/rfcs/NNNN-slug.md`). This is
   the source of truth. Its YAML frontmatter stores `github_issue: XY`, which is the mapping
   between the local file and the issue.
2. **The GitHub issue** — its **body** mirrors the local RFC and carries the **tasklist**
   (`- [ ]` / `- [x]`) that reviewers watch for progress.

Because the issue body mirrors the local file, "update the RFC" always means: edit the local file,
then **overwrite the issue body from it**. Never append a comment to report progress — comments
scatter state and reviewers can't see completion at a glance. **Always PATCH the body.** This is
non-negotiable and applies every single time the RFC is updated.

## Two entry points

- **Create an RFC** → user asks to author/turn a session into an RFC. Go to *Authoring an RFC*.
- **Execute a phase** → `/work-with-rfc #XY phase Z`. Go to *Executing a phase*.

If the command names an issue and phase, you're executing. If there's no issue yet, you're authoring.

---

## Authoring an RFC

Goal: produce a phased, reviewable proposal that exists locally **and** as a GitHub issue.

1. **Gather the substance.** If the RFC follows a grilling/design discussion, use that as raw
   material. If the scope still feels fuzzy, run a grilling skill first to pressure-test the idea
   before committing it to an RFC — a vague RFC produces vague phases. Take the first one installed:
   `/grill-with-docs`, else `/grilling`, else the deprecated `/grill-me`; skip the step when the
   project has none of them.

2. **Detect conventions.** Look for an existing RFC location (`docs/rfcs/`, `rfcs/`, `docs/proposals/`,
   any existing `*.md` with RFC frontmatter). Match the existing numbering and layout. If none exists,
   default to `docs/rfcs/NNNN-slug.md` with a zero-padded sequential number.

3. **Write the local RFC** using the template in `references/rfc-template.md`. The most important
   part is the **phase breakdown**. Each phase must satisfy two hard constraints:
   - **Intact state.** After a phase completes, the system still builds, tests pass, and there are no
     half-finished migrations or dangling references. A reviewer could stop after any phase and the
     repo is healthy. Order phases so this is always true (e.g. add-new before remove-old).
   - **~120k token soft cap.** Scope each phase so a single execution session can realistically do it
     within roughly 120k tokens of work. This is a soft cap — estimate generously, and if a phase
     looks too big, split it. Smaller, intact phases beat one heroic phase.
   Break every phase into concrete **tasks** rendered as a GitHub tasklist (`- [ ]`).

4. **Create the GitHub issue** and capture its number. See `references/github-mechanics.md` for exact
   commands. In short: create the issue with the RFC body, read back the issue number, then write that
   number into the local file's frontmatter (`github_issue: XY`) and commit the local RFC.

5. **Confirm the two are in sync** — the issue body should equal the local file's content (minus
   frontmatter if you prefer to omit it from the issue). From here on, the local file drives the issue.

---

## Executing a phase

Invoked as `/work-with-rfc #XY phase Z`. Resolve `#XY` to the local RFC via the `github_issue`
frontmatter (or fetch the issue body if the local file is missing, then reconstruct it).

### Before doing the work
- **Ensure the feature branch exists.** One branch per RFC: `feat/rfc-<XY>-<slug>`. If it doesn't
  exist yet, create it from the default branch; otherwise check it out. Do all phase work here.
- **Re-read the phase's tasks** from the RFC so you execute exactly that phase's scope — not more.
  Respect the intact-state and ~120k-token boundaries set during authoring. If the phase has clearly
  grown beyond the soft cap, flag it and propose splitting rather than blowing through it.

### Do the phase's work
Implement the tasks for phase Z. Keep changes within the phase's stated scope.

### After the phase completes — run these four steps in order

**(1) Reviews and fixes.** Request reviews from the repo's **custom review agents**, which live in
`.claude/agents/`. List that directory to discover which agents exist, then dispatch the relevant ones
(via the Task tool, using each agent's name/type) against the phase's changes — run them in parallel
when more than one applies. Gather their findings and triage each by **blast radius**:
- *Small* (localized, low-risk) → apply the fix directly.
- *Large* (cross-cutting, risky, or design-affecting) → **ask the user** before proceeding, and think
  the change through with them using the first grilling skill installed: `/grill-with-docs`, else
  `/grilling`, else the deprecated `/grill-me`.
- *Very large* (amounts to a re-architecture) → don't bolt it onto this phase. Propose drafting a **new
  RFC** for it and note the dependency, so the current RFC stays intact and shippable.

**(2) Format and check.** Detect the project's toolchain and run the **matching formatter** plus the
checks (build, lint, type-check, tests — whatever the repo defines). See `references/formatters-and-checks.md`
for detection heuristics. Fix what the checks surface (small blast radius); escalate larger problems as
in step 1. Don't proceed until the system is in an intact state.

**(3) Update the RFC — local and GitHub.** Tick the completed tasks for phase Z and update any status/
progress fields:
- Edit the **local file**: change that phase's `- [ ]` to `- [x]` and update status.
- Sync GitHub by **PATCHing the issue body** from the local file (`gh issue edit XY --body-file ...`).
  **Do not add a comment.** Ticking happens by editing the body's tasklist, never by commenting.
  Commands are in `references/github-mechanics.md`.

**(4) Branch and commit.** Ensure the `feat/rfc-<XY>-<slug>` branch exists (create from default branch
if step "before" was skipped), then commit **all** of the phase's changes — including the updated local
RFC file — with a conventional message, e.g. `feat(rfc-XY): complete phase Z — <short summary>`. Push if
the repo's workflow expects pushed branches.

### Closing out
When the **last** phase is done, all tasks are ticked; mention that the issue can be closed (or close it
per the repo's convention). Don't auto-close mid-RFC.

---

## Invariants (apply everywhere)

- **Patch the body, never append comments.** Every RFC update overwrites the issue body. This keeps the
  tasklist authoritative and progress visible at a glance.
- **The local file is canonical;** the issue body is derived from it.
- **Phases stay intact and within the ~120k-token soft cap.** If reality diverges, re-scope rather than
  forcing it.
- **One feature branch per RFC.**

## Configurable defaults (change these to fit the repo)

These were chosen as sensible defaults; adjust freely:
- GitHub access via the `gh` CLI. If `gh` is unavailable, use the REST API with a token — see
  `references/github-mechanics.md` for the equivalent `PATCH /repos/{owner}/{repo}/issues/{n}` call.
- Local RFCs at `docs/rfcs/NNNN-slug.md` (auto-detected convention wins).
- Branch `feat/rfc-<XY>-<slug>`; conventional-commit messages.
- Reviews via the repo's custom agents in `.claude/agents/` (dispatched through the Task tool).

## Reference files

- `references/rfc-template.md` — the structure for a new local RFC and issue body, with the phase/task layout.
- `references/github-mechanics.md` — exact `gh`/REST commands for creating issues and PATCHing the body.
- `references/formatters-and-checks.md` — how to detect formatters and check commands per ecosystem.
