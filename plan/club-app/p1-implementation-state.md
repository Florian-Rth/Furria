---
status: complete — slices 1–18 built, both stacks green, branch pushed. The PR and a commit-time
        sweep are owed; nothing else blocks it.
phase: CA-P1
updated: 2026-09-13
purpose: everything needed to open the CA-P1 pull request, and to start the next phase, with no
         access to the sessions that built it
---

# CA-P1 — implementation state and handoff

> **CA-P1 is built.** All eighteen slices ship, both stacks are green, and `feat/club-app-p1` is
> pushed. What is left is in [§5 What is owed](#5-what-is-owed-and-known-risks) and
> [§6 Next actions](#6-next-actions) — read those two first.
> Everything the work depends on is committed. No session state is required.

The phase was built by orchestrated subagent workflows. This file records what is done, what is
owed, how to run the machinery, and the mistakes already paid for so they are not repeated.

---

## 1. The three files that bind the work

| File | What it is |
|---|---|
| `plan/club-app/p1-registry-and-groups.md` | **The plan.** 14 rulings, the surfaces, the 18-slice build order. Final; not open for re-shaping. |
| `plan/club-app/p1-contract.md` | **The contract.** ~4400 lines. Every entity, column, index, endpoint, DTO, route, guard, primitive, copy rule and harness extension. Written from the plan and the code, then hardened against three adversarial reviews. **This is what implementers build from.** |
| `CONTEXT.md` | The domain glossary. **Partly reconstructed — see §7.** |

Binding coding rules, enforced by analyzers and lint, not by review:
`.claude/skills/backend-work/SKILL.md`, `.claude/skills/frontend-work/SKILL.md`,
`.claude/skills/tdd/SKILL.md`, `docs/server/TESTING.md`.

### Rulings that are easy to violate by accident

- **Nothing from plan §4's "Ignored" table** may enter the code, not even as a nullable column
  "for later": no honorary membership, no membership type, no membership pause reason, no key
  holding, no founding year, no audit author, no fee amounts. The same table's extension bans the
  words **Amt / Ämter** and **Team** anywhere in code or copy (contract §0 and §10.6).
- **The app seeds nothing** beyond the bootstrap Account and the Admin role
  (contract §9, Florian's ruling 2026-09-11). No `DevelopmentDataSeeder`, no seed flag in any
  `appsettings`, no fixture data in the repository. There is **no slice 3a**.
- **Build the end state.** Never a reduced or interim version of anything.
- **Lacking a right hides an affordance**, never disables it.
- Never suppress a lint rule, weaken a test, use `any`, or add a `biome-ignore`.

---

## 2. Where the work stands

**CA-P1 is complete.** 183 commits on `feat/club-app-p1` since `07dd7a0`, plus the `docs:` commit
that carries this file. All eighteen slices ship on both stacks, five rounds of the UX pass have
run, both stacks are green, and the branch is on `origin`.

### Done

| Slice | Backend | Frontend |
|---|---|---|
| 1 Membership rework | ✅ `0345d20` | — |
| 2 Rights core | ✅ `0ab10e5`, `951058f` | — |
| 3 Group core | ✅ `d077b6a` | — |
| — foundation review fixes | ✅ `2465819`, `38a0716` | — |
| — `@furria/ui` primitives | — | ✅ `527bc3c`, `abf1ce9`, `9d15358`, `af21fee`, `c27c75a` |
| 4 Member list | ✅ `c343b43` | ✅ `c0847b6` |
| 5 Person card | ✅ `6b10ef3` | ✅ `c8bd45a` |
| 6 Groups | ✅ `af71735` | ✅ `e4c9304` |
| 7 Profile visibility | ✅ `b2b7716` | ✅ `172834b` |
| 8 Hub read | ✅ `d40060a` | ✅ `98aaf98` |
| 9 Hub manage I | ✅ `94d6600` | ✅ `5a7b3e1` + `b60f351` (finished and verified) |
| 10 Hub manage II | ✅ `aedfcf3` | ✅ `01d7da2` |
| 11 Person management | ✅ `0b03990` + `3ab1533` (§4.15, late) | ✅ `72018f9` |
| 12 Person edit I | ✅ `e548b70` | ✅ `2b3df5a` |
| 13 Person edit II | ✅ `130a6fe` | ✅ `b60faf2` |
| 14 Group management I | ✅ `4e1a95f` | ✅ `7b36527` |
| 15 Group management II | ✅ `515ab18` | ✅ `4328ea1` |
| 16 Roles & permissions I | ✅ `5799e5d` | ✅ `3ea966c` |
| 17 Roles & permissions II | ✅ `c1b28e9` | ✅ `3ea966c` (one commit, see below) |
| 18 Website re-pointing | ✅ `7d0bdc3` | ✅ `644180a` |

**Slice 18 followed decision S**: a separate anonymous `GET /api/public/groups`, never a widened
`/api/groups`. The website's `/club` reads the club's groups from that endpoint.

Slices 9–17's frontend was built by four families in parallel worktrees and replayed onto the
branch in the order hub → persons → groups → roles. Three integration commits followed:
`40a4cd6` (route tree regenerated for all three `/manage/*` routes — each family had regenerated
it with only its own route), `7f39a28` and `332e439` (two second spellings).

Slices 16 and 17 share one commit. `RoleDetail.tsx` is a slice-16 deliverable that imports all
three slice-17 components, so a separately-compiling slice-16 commit would have required shipping
a deliberately reduced `RoleDetail` and then rewriting it. The persons series (11 → 12 → 13) is
likewise only gate-verified at its tip; its two intermediate commits do not typecheck alone.

> **Slice 11 shipped without `GetPersonById` (§4.15).** `GET /api/manage/persons/{personId}`
> answered **405** — only `PutPerson` bound that route — so `/manage/persons/$personId` had no
> read at all. Built in `3ab1533` while integrating slices 13–17. If another §4.x endpoint is
> missing, this is how it looks: a route that answers 405 rather than 404.

> **Slice 9's frontend needed a second pass.** The audit that closed it found three real defects in
> `5a7b3e1`, all fixed in `b60f351`: a 404 on any Hub write was completely silent
> (`toWriteErrorMessage` returned `null`, so the dialog footer stayed empty and nothing toasted);
> the confetti burst fired ~950 px below the fold because `HubCelebration` centred it on the whole
> members panel; and the phone reading order put the admin-only History panel between members
> and group admins.

Everything on the branch after slice 18 is review and repair: five rounds of the UX pass (§9), a
final server review (§8), a composition review (§11) and a contract reconciliation (`d4a86c6`).

### Gate state

Measured on the integrated tree at `d4a86c6` with `git status --short` empty — not inherited from
an earlier report. Re-run them before trusting this after any break in which the machine changed.

```
server:  dotnet build             → 0 Warnung(en), 0 Fehler
         dotnet test              → 673 passing, 0 failed, 0 skipped
                                    Furria.Tests.Analyzers.Tests 19 (0.9 s)
                                    Furria.Api.Tests            654 (52.8 s)
                                    One warning is emitted, MTP0001 from the test SDK itself
                                    („VSTest-specific properties are set but will be ignored"):
                                    not ours, not on the restore path, absent from dotnet build
         dotnet csharpier check . → clean, 347 files
web:     pnpm install --frozen-lockfile → already up to date, 5 workspace projects
         pnpm lint                → biome checked 1283 files, no fixes applied,
                                    zero warnings, zero suppressions
         pnpm typecheck           → all four projects Done (club-app, website, ui, shot)
         pnpm test                → 1377 passing, 0 failed, 0 skipped, in 125 files
                                    club-app 661 (34) · website 525 (74) · ui 179 (16) · shot 12 (1)
         pnpm build               → club-app and website both Done
                                    2874 and 3197 modules transformed
                                    One rolldown note: a club-app chunk exceeds 500 kB. Splitting
                                    the club-app bundle is not CA-P1 work and is not a defect
```

**The server suite needs `DOCKER_API_VERSION=1.41` on this machine.** Without it every integration
test dies in its collection fixture in under a second and reads as a catastrophic regression that
is not one — see the pitfall table.

Every route of the phase was screenshotted at phone/desktop × light/dark in every UX round, and a
Playwright walk of all thirteen routes logged **no `pageerror` and no `/api/` response ≥ 400**:
`/`, `/login`, `/members`, `/members/$id`, `/groups`, `/groups/$id`, `/my-groups/$id`, `/profile`,
`/manage/persons`, `/manage/persons/$id`, `/manage/groups`, `/manage/roles` and the website's
`/club`.

**Anything uncommitted in the working tree when you arrive is an interrupted agent's work.**
Judge it, do not assume it is good: run the gates, finish or discard it, then continue.

### Primitive layer

W3 left 28 new `Kk*` components, 7 shared internal parts and 9 extended, all in `@furria/ui`
(contract §7 + §7.6). A design review fixed real contrast defects in the **existing** palette
while building them — gold chip text was 1.70:1, dark-mode `blue` 2.7:1. The rule that came out of
it and that all later work depends on: **`.main` is the fill, the new `*Ink` token is the readable
foreground.**

The five UX rounds added more and rewrote the rules two of them obey. New since W3:
`KkStickyBar`, `KkStickyRail`, `KkAppShell.BackLink`, `KkPageWatermark`, `KkPanelSection`,
`KkErrorState`, `KkReservedSlot`, `KkInlineLink`, and `KkLetterIndex`'s `strip` and `rail`
variants. The rules are **§7.1a** (the action hierarchy — at most one contained primary per
surface, a repeated row action is `tone="danger" variant="text" size="small"`) and **§7.1b**
(uppercase is chrome, a club name is data); §7.1c lists every other primitive change.

---

## 3. Environment runbook

### Services

```bash
cd server && docker compose up -d          # Postgres

# Dev API on :5100, built into an ISOLATED artifacts path so it never fights the
# backend lane's dotnet build/test over obj/bin. Idempotent, safe to re-run:
cd server
dotnet build src/Furria.Api --artifacts-path <scratch>/api-artifacts
cd <scratch>/api-artifacts/bin/Furria.Api/debug
ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5100 \
  nohup dotnet ./Furria.Api.dll > <scratch>/api.log 2>&1 < /dev/null & disown
                                           # NO setsid — macOS has none, see the pitfall table

cd web && pnpm dev:club-app                # dev server on :3001, HMR
```

Health: `curl -sf http://localhost:5100/api/health` → `{"status":"ok",...}`.
Login for the dev API and the screenshot tool: `admin@furria.local` / `Furria-Dev-Admin-1!`
(`server/src/Furria.Api/appsettings.Development.json`).

**The API must be restarted after a backend slice lands** — it does not pick up new endpoints
otherwise. Restart it before screenshotting anything that needs a new endpoint.

### Screenshots

```bash
cd web && pnpm shot /members        # 4 PNGs: phone/desktop × light/dark → web/tools/screenshot/out/
cd web && pnpm shot /login --no-login
```
Verified working end to end. Needs the dev server, the API and Postgres up. Read the PNGs with the
Read tool and actually judge them.

### Pitfalls already paid for — do not rediscover these

| Trap | What happens | Do this instead |
|---|---|---|
| `pkill -f 'Furria.Api.dll'` | the pattern matches the invoking shell's own command line, so pkill kills its parent — exit 144 | `pkill -f 'Furria[.]Api[.]dll'` |
| foreground `sleep` in a wait loop | the sandbox kills the command (exit 144) | `curl --retry N --retry-delay 2 --retry-all-errors --retry-connrefused` |
| `dotnet watch` for the dev API | its hot-reload MSBuild workspace times out under compile load on 4 cores and the API dies | plain `dotnet ./Furria.Api.dll`, restarted per slice |
| two agents running `dotnet build`/`test` at once | MSBuild and Testcontainer collisions | **one backend agent at a time**; give the dev API its own `--artifacts-path` |
| `git commit <pathspec>` | silently does **not** include untracked files | `git add <new files>` first, always |
| `git reset --hard` | destroys uncommitted work in the whole tree, not just commits | see §7 — it already cost real files |
| `dotnet test` with no env var | **every** integration test dies in its collection fixture in <1 s with `DockerUnavailableException: client version 1.44 is too new. Maximum supported API version is 1.41` — reads as a catastrophic regression, is not one. Docker Desktop 4.11.0 caps the engine API at 1.41; Testcontainers asks for 1.44 | `DOCKER_API_VERSION=1.41 dotnet test`. `DOCKER_HOST` does not help; the `docker` CLI is unaffected because it negotiates down. All three backend families of slices 13–17 lost a gate pass to this |
| `setsid` in the dev-API launch line | **macOS has no `setsid`** — the command dies with `command not found` and no API starts, while a stale one may still answer `/api/health` and fool the check | `nohup … & disown`. Then confirm with `pgrep -fl 'Furria[.]Api[.]dll'`, not with `/api/health` |
| `pkill -f 'Furria[.]Api[.]dll'` against an API started by `dotnet run` | matches nothing: `dotnet run --project src/Furria.Api` execs the **apphost** (`…/bin/Debug/net10.0/Furria.Api`), whose command line has no `.dll`. The stale API keeps the port and keeps serving the old route table | check `lsof -nP -iTCP:5100 -sTCP:LISTEN` and kill that pid. Always start the dev API as `dotnet ./Furria.Api.dll` from its own `--artifacts-path` so the documented pkill works |
| `pnpm --filter @furria/club-app dev -- --port 3011` | pnpm passes the `--` through, vite never sees the flag and binds its configured `strictPort` 3001, so it dies with „Port 3001 is already in use" — which reads like a collision with the shared server and is not one. All four frontend families hit this | drop the `--`: `pnpm --filter @furria/club-app dev --port 3011`, or `pnpm --filter @furria/club-app exec vite --port 3011 --strictPort` |
| a running club-app dev server during `git am` | the TanStack router plugin rewrites `routeTree.gen.ts` the moment a route file appears, so the next patch aborts with „local changes would be overwritten" | stop the dev server by port (`kill $(lsof -nP -iTCP:3001 -sTCP:LISTEN -t)`) for the duration of the replay, then restart it |
| resolving `routeTree.gen.ts` by hand | it is **generated**; each parallel family regenerated it with only its own route, so no hand-merge is right | take either side, `git add` it, finish the series, then run `pnpm build` once and commit the regenerated file |
| a throwaway Playwright driver inside `web/` | biome lints it and it can land in a commit | keep it in the scratchpad; `<scratch>/node_modules` is symlinked to `web/tools/screenshot/node_modules`, so `node <scratch>/drive.mjs` resolves `playwright`. Always give it `finally { await browser.close() }` and `context.setDefaultTimeout(...)` — without them a timed-out locator leaves node hanging with the browser open |
| `pnpm shot` for reading a long page | it always captures `fullPage`; `/manage/persons` is ~21 000 px tall and unreadable once downscaled, and macOS has neither ImageMagick nor PIL to crop it | shoot the same route with a viewport-sized `page.screenshot()` from a scratchpad driver when you need to *read* a page; use `pnpm shot` for the four-variant light/dark sweep |

---

## 4. How the work was run

Six workflows. **All six are complete.**

| # | Workflow | State |
|---|---|---|
| W1 | Contract & design: 4 readers → architect → 3 adversarial critics → revision | ✅ done |
| W2 | Backend foundation, slices 1–3, TDD, then 3 reviews + fix | ✅ done (+ a rescue, see §7) |
| W3 | `@furria/ui` primitive layer, then design + React review + fix | ✅ done |
| W4 | Slices 4–17, two lanes, then four parallel families | ✅ done |
| W5 | UX roast: screenshot everything, critique, fix, re-shoot, five rounds | ✅ done — §9 |
| W6 | Slice 18, the final server review, the composition review, the contract reconciliation | ✅ done |

### W4, first half — the two-lane design (slices 4–8)

Two promise chains, so exactly two agents are ever live and the ordering is guaranteed:

```js
let backendChain = Promise.resolve(null)
let frontendChain = Promise.resolve(null)
for (const slice of SLICES) {
  const beDone = backendChain.then((prev) => agent(backendPrompt(slice, prev), {...}))
  backendChain = beDone.catch(() => null)
  const feDone = Promise.all([beDone.catch(() => null), frontendChain])
    .then(([be, prevFe]) => agent(frontendPrompt(slice, be, prevFe), {...}))
  frontendChain = feDone.catch(() => null)
}
```

- backend lane strictly sequential (no two `dotnet` builds at once),
- frontend lane strictly sequential,
- frontend slice N waits for backend slice N,
- each agent is handed its predecessor's report, so knowledge carries forward without a barrier.

It worked, and it was slow: **25–45 minutes per agent**, roughly 45 minutes of wall clock per
slice pair. That is the gates, not the model — every `dotnet test` starts a Postgres Testcontainer
(~35 s) and a TDD slice runs it 8–15 times; a frontend slice runs the full web suite plus four real
browser logins.

### W4 second half, W5 and W6 — worktree families and a replayed patch series

**This is the shape to reuse.** Slices 9–17's frontend, and then every round of the UX pass, were
built by **four concurrent families, each in its own `git worktree` under `.claude/worktrees/`**,
each exporting a `git format-patch` series that one integration agent replayed onto
`feat/club-app-p1` in a fixed order, followed by **one** gate pass and **one** screenshot pass over
the merged tree. The families were the same four every time — `shared`, `hub`, `persons`,
`groups`/`roles` — so each owned a stable set of files across rounds.

What that bought, measured against the two-lane half:

- **Wall clock.** Four agents write at once instead of two, and the expensive part — the gates —
  runs once for the wave instead of once per agent. A UX round of 4 families plus integration took
  roughly the time one slice pair took in the two-lane design.
- **Fewer second spellings, not more.** The risk was that four agents would invent four versions of
  the same thing. In practice the conflicts were small, legible and nearly all *add/add on the same
  list* — the round-1 integration had four conflicts, every one resolved by keeping both sides.
  What the gates could **not** catch were three disagreements of judgement (`2b1d752`, `e55a851`,
  `9226b1d` — §9), and those are the real cost: **budget an integration agent that reads for
  disagreement, not just for conflict markers.**

What it cost, and how to avoid paying it again:

- **Gate discipline is the whole saving.** Each family must write its entire assignment before
  executing anything expensive, then run `dotnet test` / `pnpm test` / `pnpm build` / `pnpm shot`
  **once**. Earlier agents burned 25–45 minutes per slice on repeated Testcontainer boots and
  browser logins. (This is also Florian's standing rule: subagent gates only at the end.)
- **Replay order is load-bearing.** `groups` and `roles` both import the hub's dialogs and
  `PersonPicker`, so `hub` must land first; when `groups` duplicated slice 10's files (it was
  building against a base where they did not exist) the conflict resolved cleanly toward the hub
  family's versions, leaving only two prop names to adapt in `GroupOverrideDetails.tsx`.
- **Check the worktree's base before reading a line.** The slice 9–17 worktrees were provisioned at
  `main` (`07dd7a0`), not at the branch head. All four families caught it with `git rev-parse HEAD`
  as their first command and fast-forwarded. A family that misses this writes against a tree with no
  contract file and no slice 4+ frontend, and its patch will look plausible and will not apply.
- **Stop the club-app dev server for the replay.** The TanStack router plugin rewrites
  `routeTree.gen.ts` the moment a route file appears, and the next patch then aborts with „local
  changes would be overwritten". `routeTree.gen.ts` is **generated**: never hand-merge it, take
  either side, finish the series, run `pnpm build` once and commit the regenerated file.
- **Clean the worktrees up at the end.** They are not in the working tree's history and they are
  gitignored (`.gitignore`: `.claude/worktrees/`), but a stale one holds a branch ref and confuses
  `git worktree list`. `git worktree prune`, then `git worktree remove` each one whose commits are
  on the branch — verify by **commit subject**, because the replay gives every commit a new sha.

### What is deliberately kept

**The `worktree-wf_*` branches.** Their worktrees are removed and their work is on the branch
(replayed as patches, so the shas differ), but the branches are the only record of the pre-replay
originals. Delete them with `git branch -D $(git branch --list 'worktree-wf_*')` once the merges
are trusted.

### Machine limits that shaped the design

4 CPUs → the workflow tool's concurrency cap is `min(16, cpus−2)` = **2 agents**. The four-family
waves still ran four worktrees at once, which on four cores is oversubscribed: the saving came from
running the gates **once per wave** rather than from raw parallelism, and a fifth family would
probably have bought nothing. On a bigger machine the lane design can widen; the *ordering*
constraints (backend before its frontend, one backend agent at a time) still hold.

---

## 5. What is owed, and known risks

Nothing here blocks the branch — it is green and pushed. Everything below is owed **before or
around the pull request**, and none of it may be quietly dropped.

### Owed before the PR

1. **The commit-time sweep.** **15 commits of this phase fall in the weekday 04:00–17:00 window the
   repo's convention avoids** — the phase's first fifteen commits, contiguous, `6d9ba2a` …
   `efa5f6f`: the contract, the first primitive commits and the slice 1–3 backend. Counted on the
   log, not estimated:
   `6d9ba2a`, `527bc3c`, `0345d20`, `505b9ee`, `abf1ce9`, `9d15358`, `0ab10e5`, `af21fee`,
   `951058f`, `d077b6a`, `c27c75a`, `523f6b1`, `38a0716`, `2465819`, `efa5f6f`.
   **All fifteen are already on `origin`.** Fixing them means rewriting published history, which
   **Florian declined for now** — so the sweep was not run and the branch was pushed as a plain
   fast-forward. It stays owed. When it is taken (the global `fix-commit-times` skill), it is a
   force-push of a published branch and needs his explicit word, not an implementer's judgement.

2. **`CONTEXT.md` needs Florian's review.** It was **reconstructed, not recovered**, after the
   `git reset --hard` in §7: **~6 lines are provably missing**, several entries are
   substance-sourced rather than his words, and the position of one entry is inferred. §7 has the
   per-entry detail and the commit message of `4ba5a8e` has the rest. Until he reads it, **where
   `CONTEXT.md` is thin the contract wins**.

3. **`plan/club-app/p0-shell-and-session.md` and `plan/server/identity-foundation.md` were
   destroyed** by the same `git reset --hard`, and **Florian's edits to both must be redone**. The
   files exist at their pre-edit content; what is gone is his revision of them. Nobody else can
   reconstruct it.

4. **Decisions A, T and AA are reinterpretations declared in the contract and deliberately not
   folded back into `p1-registry-and-groups.md`** — that file is pinned and it is his.
   - **A** — the dot form (`persons.manage`) is the pinned spelling of a permission key; the plan
     and `identity-foundation.md` still carry the retired `persons:manage` colon form.
   - **T** — the management nav group appears when at least one of the **three keys that have a
     surface** is held; plan §4's navigation paragraph says „one entry per held key", and
     `persons.read_details` has no page.
   - **AA** — `beendet` appears **wherever it occurs**, members included; the plan's surface
     table and its derived-facts list each named only half of that axis.
   Each is written into contract §12 with its reason. **Writing them back into the plan is his
   call, not an implementer's.**

5. **Decision AG is flagged for him.** A person who is only a group admin **is not affiliated**:
   her group hub works, and `/members` answers her **403**. The predicate was deliberately left
   untouched — the client now carries a per-row `isAffiliated` instead, so no surface links to a
   person card that will 404 (§8). **If the club wants her in the register, that is a club act —
   give her a membership — not a change to the affiliation predicate.** Only Florian widens it.

6. **The final review's two triage verdicts, both already taken, both worth re-reading before
   anyone reopens them.**
   - **The `Since` chain-minimum N+1 is closed** — it is computed in memory from one projection,
     never per row. What the same pass found **instead** is still open: **`/manage/persons` and
     `/manage/roles` load every historic tie and throw it away.** `PersonRegistryProjection`
     (`PersonService.cs`) filters only on `Group.ArchivedOn == null`, never on the period;
     `RunningTies` computes `tie.Min(StartedOn)` and `ToSummary` drops it, because
     `GroupReference`/`RoleReference` carry two properties each. `RoleService.RolePageProjection`
     has the same shape and is shared between detail and list. Measured at **249 wire rows for 152
     Personen** — no user-visible defect, so it was **not** fixed on this branch: it reshapes two
     hot projections. Trigger to watch: list cost grows with history, and decision Z pins these
     lists unpaged. `MembershipChainDetails` genuinely needs the full membership chain — only
     the group/role collections can be narrowed.
   - **The umlaut folding is judged sufficient on the server.** The two-way fold
     (`GermanFold.Expand` + `GermanFold.Strip`, both sides ILIKE'd) covers every German spelling
     the register can hold; it needs **no** migration, no `unaccent`, no `pg_trgm`. What was
     actually broken there was the wildcard escaping, fixed in `e668b2e`: both calls used the
     two-argument `EF.Functions.ILike`, which emits `ESCAPE ''` — Postgres reads that as *no*
     escape character, so the backslashes the service inserted became literal pattern characters
     and any query containing `_`, `%` or `\` returned nothing. Now the three-argument overload
     with an explicit `\`, and the query is trimmed server-side rather than trusting the client's
     `toSearchTerm`. **The still-open half is the client/server divergence, and it is a decision,
     not an implementation: Q6 below. Do not settle it in code.**

7. **Eight decisions are owed to Florian and are written below as questions, not verdicts.** They
   are the §8 findings the reconciliation classed as *a decision nobody has taken* rather than *the
   contract was simply wrong*. Every one has a defensible shipped behaviour, so **none of them
   blocks the PR**; what they must not get is a second implementer's reading.

### Known risks that are not owed to anyone yet

8. **`IsRunningOn` is hand-copied ~15 times** — `PersonService`, `GroupService`,
   `PermissionAuthorizer`, `BootstrapAdminSeeder` — while `AffiliationQuery` already shows the
   right shape. Declined for this branch: it rewrites the predicate in every hot read path for no
   observable change, at the cost of a full Testcontainer suite. It belongs in a hardening slice as
   `MembershipQuery` / `GroupMembershipQuery` / `GroupAdminQuery` `[Pure] Expression` factories
   with boundary tests for `start == today` and `end == today` (decision B).

9. **The consolidation slice — nine composition findings, eight of them still open.** All nine were
   spot-verified and all nine are real. They were declined together while W5 was still reshaping
   surfaces; **that reason has now expired**, so this is the natural first work of the next phase.
   §11 lists them. **Re-deriving contract §5's file lists belongs to the same slice** — §5's *rules*
   were re-verified and bind, but its file lists are slice-era snapshots and the UX rounds moved
   the files (§8's closing note).

10. **The UX pass's last round left no written findings list.** Rounds 1–4 each produced a triage
    that was landed and recorded (§9); **round 5 was the closing sweep and its findings went
    straight into commits** — `bcdeae4` … `d4a86c6` — with no surviving document. Two consequences:
    a reader who wants to know what round 5 judged has to read those commit messages, and
    **nothing is known to be left unfixed by it**. The only UX item still deliberately standing is
    §9's inclusive period end, which is correct behaviour and not a defect.

11. **`de-DE-x-icu` is present in `postgres:18-alpine` and sorts correctly**
    (`Adam < Ärger < Bach < Oehler < Öhler < Zöller`) — verified, not assumed. ADR-0008 records it.

12. **The shared dev database carries write-flow residue** from the families' live probes, and
    **there is no delete endpoint (decision U)**, so the extra records never go away by themselves:
    persons **152 and 153** („Testine Überprüfung…"), **group 14 „Testgruppe Zwei"** (archived),
    **role 10 „Materialwart"**, and a changed description on group 1. `docker compose down -v`
    plus a re-run of the scratchpad seeder is the only way back to the documented state. **Match
    fixtures by name, never by count.**

### Decisions owed to Florian — an implementer may not take these

Eight questions that implementation raised and implementation must not answer. Each says what
ships **today**, the question, and the options. **None blocks anything**: every one of them has a
shipped behaviour that is defensible and written down. What they must not get is a second
implementer's reading — that is how a contract grows two spellings of the same thing.

Contract §12 points here; answers to Q7 and Q8 become §12 rows.

| # | Question | Ships today | The options |
|---|---|---|---|
| Q1 | **Is a 404 from a *write* meant to be silent?** Contract §5.0a scopes its 404 rule to detail *routes* and says nothing about a write. Slice 9 read that silence as intended and returned `null`, which made **every** Hub write fail mutely — a group admin whose person had just been removed would click „Aufnehmen" forever with no feedback. | `lib/write-error.ts` answers a write 404 with one shared line: „Das gibt es so nicht mehr — jemand anderes war schneller. Lade die Seite neu." All four write surfaces use it (the four byte-identical copies were folded into one module). | **(a)** Pin `WRITE_MISSING_MESSAGE` into §5.0a as the write-path rule. **(b)** Silence really was the intent → revert it, and **say so in §5.0a** so the next implementer does not re-add it. |
| Q2 | **`RequirePermission` takes a four-member union and §5.0 pins three messages.** `persons.read_details` guards no page (decision T), so a total `Record<PermissionKey, string>` cannot be written from the contract. | `Partial<Record<PermissionKey, string>>` plus a neutral fallback („Diese Seite ist an eine Rolle gebunden. Du hast sie gerade nicht.") that is **unreachable in P1**. | **(a)** Narrow the prop to the three keys that guard a page (a `GuardedPermissionKey` type), making the map total and the fallback unnecessary. **(b)** Pin a fourth message for `persons.read_details` and keep the prop wide. |
| Q3 | **Copy that nothing pins.** Four texts were written to satisfy „build the end state" and are **not** in §10. | `/manage/roles` with no `?role=` (the `RolesGrid` / `RoleCard` column); the restore-a-role dialog — §10.5's restore row says „Gruppe aktivieren" and no roles twin exists; the `pastHolders` panel; `toRolesLead`. Plus the new `GroupHistoryPanel` heads on `/manage/groups`. | **(a)** Ratify the shipped strings into §10 as they stand. **(b)** Rewrite them and pin the result. Either way the UX pass may still overrule — but then it overrules something pinned. |
| Q4 | **`PageSkeleton` is pinned and cannot be mounted.** §5.0 and §11's slice-3 row list it; decision AP makes a guard render its children while `me` is pending, so the branch that would have shown it does not exist, and every page owns a skeleton already. | Not built. Nothing imports it. | **(a)** Strike it from §5.0 and the ledger — dead code is not the end state, it is a second spelling of each page's own skeleton. **(b)** Give it a real consumer and say which. |
| Q5 | **§10.7 and §10.8 name `persons.read_details` two different ways**, and both strings ship, 800 px apart, on two surfaces. | §10.7 verbatim: „… wer das Recht „**Personendetails sehen**" hat …". §10.8's key title: „**Kontaktdaten aller Personen sehen**". | **(a)** §10.7 gives — but it is pinned *verbatim* copy and that is the point of §10.7. **(b)** §10.8 gives — the key title becomes „Personendetails sehen", and §10.8's one-liner carries the „Telefon, E-Mail und Adresse" detail. **Not an option:** a third spelling. |
| Q6 | **Client and server fold German names differently, and the contract pins both.** §4.41's `GermanFold` maps `ue → ü`, so `/api/person-search?q=kuehn` finds Kühnel; §5.1's `normalizeForSearch` is NFD-strip only, so typing `kuehnel` into `/members` or `/manage/persons` finds nothing while `kuhnel` and `KÜHNEL` both work. Both were implemented exactly as written, and `person-filters.test.ts` **pins the divergence**. | The divergence, deliberately. | **(a)** Client follows the server: `normalizeForSearch` gains the two-way German fold; one test changes. **(b)** Server follows the client: §4.41 drops `Expand`; a German club's register stops finding „kuehnel", which is how half the members type their own name on a phone. **(c)** Ratify the split and write down *why* a local list search and a server search differ. |
| Q7 | **RESOLVED 2026-09-23 — decision W revised to *yes*: the seeder reconciles keys, archive flag, role holding and `is_disabled` on every start.** **The `BootstrapAdminSeeder` Admin-holding failsafe, against decision W.** `EnsureAdminRoleIsHeldAsync` runs on **every** `StartAsync`: if no `RoleHolding` on the Admin role is running, it silently opens a fresh one for the bootstrap account. Decision W says the role is „created once … afterwards it is ordinary data", which reads as forbidding this. **It is not an oversight** — three tests pin the split deliberately: the permission keys are never re-granted (decision W's actual stated rationale), while a lost role holding is repaired. It is also not freely removable: `roles.manage` can only be granted by someone who holds it and there is no delete endpoint (decision U), so what it prevents is a **permanent lockout**. | The failsafe, with a comment naming it. No behaviour was changed. | **(a)** W-literal: drop the failsafe and accept that a club can lock itself out of its own rights matrix for good. **(b)** Pin the failsafe as its own §12 decision. Two things belong in the same decision either way: the predicate **ignores `SinceOn`**, so a purely *future* holding counts as „still held"; and the **lost-update policy** for `PutRolePermissions` and `PutGroupInfo` — there are no `xmin` concurrency tokens, none were added, and `PutRolePermissions` is a *declared* full replacement. |
| Q8 | **A row lying entirely in the future can be created on a surface that cannot show it.** On `/manage/groups` such a group membership appears in neither `members`/`admins` nor `pastMembers`/`pastAdmins`, while Person edit shows it with a `geplant` chip (decision AF). Decision C makes the row legal, `PostGroupMembership` accepts it, and `AddMemberDialog`'s own date hint **invites** it („Darf in der Zukunft liegen"). | The row is created and then invisible on the surface that created it. | **(a)** §4.30 gains a third pair (`futureMembers`/`futureAdmins`) and §5.9 a place to render them. **(b)** The running lists include future rows, carrying the `geplant` chip, as Person bearbeiten does. **(c)** The dialogs stop inviting a future date on this surface. **Not an option:** leaving a write flow whose result vanishes. |

---

## 6. Next actions

CA-P1 is finished. The next actions are the pull request and the next phase — **not this one**.

### Florian's, and nobody else's

1. **Open the pull request** for `feat/club-app-p1` → `main`. The branch is pushed and green; no
   agent opens it.
2. **Decide the commit-time sweep** (§5.1). Fifteen commits sit in the avoided window and are
   already published, so the fix is a history rewrite of a pushed branch. It is owed; it needs his
   word before anyone runs it.
3. **Answer Q1–Q8** above, at whatever pace suits. Two of them become new contract §12 rows.
4. **Read `CONTEXT.md`** (§5.2) and **redo the lost edits to `p0-shell-and-session.md` and
   `identity-foundation.md`** (§5.3).
5. **Rule on decisions A, T and AA** — whether they are written back into
   `p1-registry-and-groups.md`, which is pinned and his (§5.4) — and on **AG** (§5.5).

### The next phase's first work

6. **The consolidation slice (§11).** Eight composition findings, all verified, declined only
   because W5 was still reshaping the surfaces. That reason has expired. Run them as one slice.
7. **The hardening items**: the `IsRunningOn` expression factories (§5.8) and the two
   over-fetching projections (§5.6).
8. **Delete the `worktree-wf_*` branches** once the replayed merges are trusted:
   `git branch -D $(git branch --list 'worktree-wf_*')`. Their worktrees are already removed; the
   branches are the only record of the pre-replay originals, which is why they are still here.

### Before touching the running app again

9. **Re-seed the dev database** (§5.12). The residue from the families' live write probes is still
   in it, so several documented fixtures read wrong. `docker compose down -v`, then re-run the
   scratchpad seeder — it is deterministic, drives the real write endpoints and is **never
   committed** (contract §9.4). Rebuildable from contract §9.2 and §9.3 at the cost of about an
   agent-hour.

---

## 7. Incident record — read before trusting `CONTEXT.md`

Two things went wrong in the session that started this phase. Both are recorded because the damage
is still visible in the repository.

### A crashed fix agent left a backwards migration

W2's final fix agent timed out mid-pass with 28 files uncommitted and 4 tests red. It had generated
a migration that renamed the four partial-unique-index names *to* EF's derived `…1` names rather
than away from them, because it had removed the four `.HasDatabaseName(…)` calls on a mistaken
review finding. The calls are **load-bearing**: `UseSnakeCaseNamingConvention()` rewrites the name
the `HasIndex(expr, "name")` overload supplies, so without them the model-built test database and
the migrations disagree. Restored in `2465819`; do not remove them again.

### A `git reset --hard` destroyed uncommitted files

While rewriting a commit message. Commits were safe (a backup branch existed); **uncommitted
working-tree changes were not**.

| File | Outcome |
|---|---|
| `web/package.json`, `web/pnpm-workspace.yaml`, `web/pnpm-lock.yaml`, `CLAUDE.md`, `.gitignore` | restored and committed (`efa5f6f`) — the screenshot tool's wiring |
| `CONTEXT.md` | **reconstructed, not recovered** — `4ba5a8e` |
| `plan/club-app/p0-shell-and-session.md` | **lost.** Florian's edits must be redone. |
| `plan/server/identity-foundation.md` | **lost.** Florian's edits must be redone. |

**`CONTEXT.md` needs Florian's review.** It was rebuilt from the plan, the contract and 30 verbatim
line fragments; the domain map it was meant to lean on had itself been wiped with the scratchpad.
All 30 fragments sit at their original line numbers and every unamended line is byte-identical to
`07dd7a0`, but:

- **~6 lines are provably missing** — one flagged bullet between "Guest registration & duplicates"
  and "Non-member group people have no name". The gap was measured, not papered over.
- Whole entries are substance-sourced but **not Florian's words**: membership, membership pause,
  fee reduction, permission, role holding, contact details, and every `_Avoid_` line except
  group's and group admin's.
- The position of the `Contact details` entry is inferred.

The commit message of `4ba5a8e` lists all of this per entry.

---

## 8. Contract bugs reported by the frontend wave — dispatched 2026-09-13

Every one of these was reported rather than worked around, and every implementer's reading is
recorded so nobody writes a second spelling. **None of them blocked a slice.**

**They have now been dispatched, and the findings below are kept as the evidence, not as the
to-do.** Each was sorted into one of two kinds:

- **the contract was simply wrong and the code is right** → `p1-contract.md` is amended to say what
  ships, each amendment marked „Corrected 2026-09-13" with the reason. These are corrections of
  fact. Leaving them guaranteed the next implementer would build from a document that contradicts
  the codebase;
- **a decision nobody has taken** → written into §5's **„Decisions owed to Florian"** as a question
  with its options, and *not* decided. An implementer who meets one reports it and moves on.

| Finding below | Kind | Where it went |
|---|---|---|
| Deliverables — `RequirePermission` | contract wrong | §11 ledger row 2 + a note in §5.0: booked in slice 2, actually built during slices 9–17 |
| Deliverables — `PageSkeleton` | **decision owed** | **Q4** — drop it or give it a consumer. §5.0 and ledger row 3 now say so |
| Deliverables — `formatSessionLabel` / `formatSessionSpan` / `toPeriodChip` | contract wrong | §11 ledger row 1: missed in slice 1, landed with slices 12–13, pinned signatures unchanged |
| 1 — the detail route filename | contract wrong | §5.0 (the trailing-underscore rule, stated once), §5.3, §5.4, §5.8, ledger rows 5, 6, 12 |
| 2 — `AccessDenied`'s fourth key | **decision owed** | **Q2**. §5.0's table notes it |
| 3 — a 404 from a *write* | **decision owed** | **Q1**. §5.0a notes it and forbids a second spelling of the message |
| 4 — the 400 rule assumes RHF | contract wrong | §5.0a: the field mapping is conditional on the form actually being a react-hook-form |
| 5 — §5.9's desktop row | contract wrong | §5.9: one row form at every width; `Offenheit` moves to the card and the header card |
| 6 — §5.9's chip priority | contract wrong | §5.9: `archiviert` → `kein Admin` → none. §5.10 records that the roles row can show two chips, and that unifying them is UX work |
| 7 — §5.10's `placeholderData` | contract wrong | §5.0 and §5.10: **both** holder lists arrive late, because the two `Holders` are different DTOs |
| 8 — §5.10's three unowned things | **decision owed** | **Q3**. §5.10 names them and says the copy is not pinned |
| 9 — no history panel for Group management | contract wrong | §5.9: §4.30's past rows render in the shared `GroupHistoryPanel`; its copy joins Q3 |
| 10 — `KkTextField`'s unions | contract wrong | §7.1 gains a `KkTextField` row: `+ 'tel'`, `+ 'numeric'` |
| 11 — two 409s with no German | contract wrong | §4.26 and §4.29 (and their role twins) now carry the strings the server already sends |
| 12 — §5.7's two halves | contract wrong | §5.7 and §4.14: the row is the link; the editor opens from §5.8's `PersonMasterDataPanel` |
| `shared` bucket amendments 1–5 | contract wrong | folded: §5.3 (header vs „Im Verein"), §5.9 (5/7 only when selected), §7.1a.3 (the FAB breakpoint), §5.7 (the chip order is the primitive's), §5.10 (the master list split) |
| `shared` bucket bug 1 — §10.7 vs §10.8 | **decision owed** | **Q5**. §10.8 notes it; neither string was touched |
| `shared` bucket bug 2 — no password endpoint | contract wrong | §5.5: the „ZUGANG" card is folded away and why; it returns when §4 pins the endpoint |
| server review 1 — `isAffiliated` | contract wrong | §4.0 (the rule + the reason), and the field added to §4.5, §4.8, §4.30, §4.32's DTOs |
| server review 2 — the seeder failsafe | **decision owed** | **Q7**, with the `SinceOn` predicate and the lost-update policy folded into the same question |
| „will be mistaken for bugs" — the folding divergence | **decision owed** | **Q6** |
| „will be mistaken for bugs" — the invisible future row | **decision owed** | **Q8** |

Two things were **not** contract bugs and stay where they are: the „in Zahlen" cards that
hard-coded three of four states (a defect, fixed, and the lesson is below), and the three German
names for one list of people (the contract never pinned those titles; `lib/group-sections.ts` owns
them now).

One correction was made in passing while re-reading a paragraph that had to change anyway:
§5.0 pinned `usePermissions().isPending` and the code has said `isUndecided` since `eaa97c4`.

**§5 of the contract has drifted further than these findings.** UX rounds 2–4 reshaped surfaces
whose §5 file lists were never re-derived — `/manage/roles` most of all (`RolesGrid`, `RoleCard`,
`RoleColumn`, `KeyHandoverDialog`, `SelfLockoutDialog`, `RoleNotFound`), and `features/group-detail`
exists in no §5 paragraph at all. §5.10 now says so out loud. **The rules in §5 were re-verified
against the code and bind; the file lists are slice-era snapshots.** W5 has since settled the
surfaces, so **re-deriving those lists is open work now** — it belongs with §11's consolidation
slice, which reshapes the same files.

### Deliverables the contract pins that were never built

| What | Where pinned | What happened |
|---|---|---|
| `RequirePermission` | §5.0, ledger slice 2 | **Never built.** All three `/manage/*` pages are gated on it, so three families created it simultaneously and the integration kept one. Same failure shape as the missing §4.15 `GetPersonById`. |
| `PageSkeleton` | §5.0 | **Still missing.** Deliberately: decision AP makes a guard render its children while `me` is pending, so nothing in P1 mounts it. Shipping it would be dead code. |
| `formatSessionLabel`, `formatSessionSpan`, `toPeriodChip` | §5.1, slice 1 | Never shipped; slices 12–13 could not render a Session span without them. Added to their pinned modules with their pinned signatures. |

### Paragraphs that are wrong, impossible or read two ways

1. **§5.8 / §11 pin the detail route file as `routes/_app/manage.persons.$personId.tsx`. That
   spelling does not work** — TanStack nests it *under* `manage.persons`, so the register list
   would render above every Person's edit page. Shipped as
   **`manage.persons_.$personId.tsx`** (trailing underscore, the shipped `_affiliated.members_.$personId.tsx`
   precedent). The URL is identical; correct the paragraph.
2. **§5.0's `AccessDenied` table pins three messages for a four-member `PermissionKey` union.**
   `persons.read_details` guards no page (decision T), so a total `Record` cannot be written from
   the contract. Shipped as `Partial<Record<…>>` plus one neutral fallback
   („Diese Seite ist an eine Rolle gebunden. Du hast sie gerade nicht.") which is unreachable in P1.
   Either narrow the prop type or pin a fourth message.
3. **§5.0a's 404 rule is scoped to detail *routes* and says nothing about a 404 from a *write*.**
   Slice 9 had read the silence as intended and returned `null`, which made **every Hub write fail
   mutely** — a group admin whose person had just been removed would click „Aufnehmen" forever
   with no feedback. The write path now has its own line
   („Das gibt es so nicht mehr — jemand anderes war schneller. Lade die Seite neu."). If silence
   really was the intent, revert `WRITE_MISSING_MESSAGE` — but then say so. **Since the pre-push
   pass it is one file, not four**: `WRITE_ERROR_MESSAGES`/`toWriteErrorMessage` stood byte-identical
   in `group-hub-messages`, `manage-groups-messages`, `manage-roles-messages` and
   `manage-persons-messages`, and only the hub's copy knew the 404, so the other three answered a row
   another admin had just removed with „Das hat nicht geklappt. Bitte versuch es gleich noch einmal." —
   a retry that can never succeed. The hub's version now lives in `lib/write-error.ts`, verbatim, and
   the four copies are gone; the feature message modules keep only their read-path texts.
4. **§5.0a's 400 rule maps `failures[].field` „onto the react-hook-form field of the same name".**
   The four Hub forms are plain `useState` controls, not RHF (§5.6 does not require RHF), so only
   the same paragraph's footer fallback applies there. Say the field mapping is conditional on the
   form actually being RHF.
5. **§5.9's desktop row spec is not constructible.** „name · Personen · Admins · Offenheit · Status"
   at ≥ desktop, inside the same paragraph's Grid 5/7 split, leaves ~500 px and **truncates the
   names** („ARCHIV UND CH…", „TANZGRUPPE WIRB…" — seen in a screenshot, not predicted). Shipped
   the phone form (one chip) at both widths, which §5.9 itself calls „the primary one", with
   Offenheit in the detail header card.
6. **§5.9 contradicts itself on chip priority** — „the most urgent of kein Admin → archiviert →
   openness", then two sentences later „archived rows render dimmed with an `archiviert` chip"
   unconditionally. Taken literally an archived group with no admin would hide that it is
   archived. Shipped **archiviert → kein Admin → openness**. The roles master list needs the same
   order.
7. **§5.10's `placeholderData` claim is half true.** §4.31's `Holders` are `PersonRefDto`, §4.32's
   are `RoleHolderDto` (+ `roleHoldingId`/`sinceOn`/`since`), so the seed cannot render a holder
   row and **running holders arrive late too**, not only `PastHolders`.
8. **§5.10 leaves three things unowned**: the default (no `?role=`) state has no component and no
   copy; `useRestoreRoleMutation` is named with no dialog and no copy (§10.5's restore row says
   „Gruppe aktivieren"); and `GetRoleById.pastHolders` has real data but no owner. All three were
   built to the end-state rule; the copy for them is **not pinned** and the UX pass may overrule it.
9. **§5.9 lists no history panel for Group management** while §4.30 returns `pastMembers` and
   `pastAdmins` and says they are „always populated here". Rendering the payload and hiding half of
   it is not the end state, so an `OverrideHistoryPanel` was built.
10. **§7.3 / §7.6 never pin `KkTextField`'s `type` / `inputMode` unions**, and §5.7's form has a
    Telefon and a PLZ field that need a numeric keypad on a phone. Both unions were widened by two
    members (`'tel'`, `'numeric'`). A §7 „the primitive is missing an affordance" case.
11. **No German `ResultError.Message` is pinned for two 409s** that decision AH says render
    verbatim: §4.26 `PostGroup`'s duplicate active name and §4.29 `RestoreGroup`'s not-archived
    case. The server does answer „Eine Gruppe mit diesem Namen gibt es schon." — confirmed on the
    wire — but the string belongs in §4.
12. **§5.7 cannot hold both halves of one sentence**: it says `PersonFormDialog` „opens for edit
    straight off a list row" and pins the row as `KkPersonRow → /manage/persons/$personId`.
    `KkPersonRow` renders the whole row as the link, so an edit button inside it is a `<button>`
    inside an `<a>`. Shipped the pinned link, with „Bearbeiten" on the detail page's
    `PersonMasterDataPanel`.

### Amendments and bugs from the UX pass, round 1 — the `shared` bucket

**Contract amendments taken by this bucket.** Each is a paragraph of `p1-contract.md` that could
not be implemented as written. **All five were folded into the contract on 2026-09-13** and are
kept here as the record of why.

1. **§5.3 contradicts itself and is amended.** It pins `MemberHeader` as
   „KkAvatar + name + state chip + „Mitglied seit …"" **and** pins `MemberClubPanel` as
   „KkFieldRow Mitgliedschaft / Status / Mitglied seit" — so the right column of the Person card
   opened by restating its own header, with the same chip and the same date 120 px apart, and
   `MemberContactPanel` (the thing a member opens the card for) sat underneath.
   **Resolution: the state chip stays in the header as the at-a-glance identity marker; the
   „Mitglied seit" subline leaves it, and `MemberClubPanel` is the one place the dates live.**
   `toMembershipLine` and `MemberHeadline.line` are deleted. `MemberView`'s right column is
   reordered so *Kontakt* sits above *Im Verein*.

2. **§5.9's Grid 5/7 is amended to apply only to the *selected* state.** Written unconditionally it
   spent 60 % of a 1 400 px desktop on a 360 px dashed „KEINE GRUPPE GEWÄHLT" card followed by
   ~1 800 px of nothing — on the surface an admin is *sent to* after a lockout. With no `?group=`
   the list now renders full width as a 3-up card grid (`ManagedGroupsGrid` / `ManagedGroupCard`)
   and the archive footnote is a page footnote; with a selection the 5/7 split is exactly as
   pinned. `GroupOverrideEmpty` is deleted: the empty state disappears with the state that
   required it.

3. **§7.1 / §7.1a applied to the three management surfaces.** The create action is each surface's
   one `variant="contained"` primary, in the `action` slot of its section `KkPanelHeader`. One
   gesture per screen: the header action is hidden below `desktop` and a `KkFab` carries the same
   verb there — on **all three**, so `/manage/roles` gains the `RolesCreateFab` it lacked and
   `/manage/groups` stops offering „+ Gruppe anlegen" and an unlabelled red FAB at once.
   `features/session/components/ManagePageLayout.tsx` owns the breakpoint, so no future surface
   has to remember it.

4. **§5.7's „the state chip moves to line two (after the Gruppen)" is not a call-site rule.**
   `KkPersonRow` renders `trailing` itself, so the app cannot order it; the chip sat *before* the
   groups and the meta text therefore started at a different x on every row. Fixed inside the
   primitive. Both `MemberRow` and `PersonRow` were already correct as call sites.

5. **§5.10's master list is split.** `RolesMasterList` held the search field, the rows **and** the
   „+ Rolle anlegen" button at the bottom of its Stack. The search field is now `RolesToolbar`,
   the button is the section head's action, and the list is rows only. The roles intro lead
   (`toRolesLead`) is new copy; §8.8 records that this copy is not pinned.

### Contract bugs the `shared` bucket found and did not work around

1. **§10.7 and §10.8 name the same right two different ways.** §10.7 pins verbatim
   „Unabhängig davon: Wer das Recht „Personendetails sehen" hat, sieht deine Daten immer.";
   §10.8 pins the same key's title as **„Kontaktdaten aller Personen sehen"**. Both strings ship
   today, 800 px apart on two surfaces, for `persons.read_details`. The §10.7 sentence was **not**
   changed — it is pinned verbatim and shipping a third spelling would be worse than shipping two.
   **A decision is owed: one of the two paragraphs has to give — §5, Q5.**

2. **There is no password-change endpoint and §5.5 does not pin one.** The „ZUGANG" card was named
   after access, contained one read-only line and managed no access. „Build the end state" allows
   a button that calls an endpoint that does not exist yet, but §0 forbids **inventing an endpoint
   shape** — and a password dialog needs a route, a request body and a failure vocabulary that
   nothing pins. **Resolution: the card is folded away**; the login address is a `KkFieldRow`
   „Anmeldung" inside „DEINE DATEN". When `PUT /api/me/password` (or whatever it is called) is
   pinned, the card comes back with the action it promises.

3. **Both „in Zahlen" cards hard-coded three of the four states** and therefore contradicted the
   lead 300 px above them — `/members` dropped `totals.ended` (the very cohort decision AA exists
   to make visible) and read 113 · 6 · 11 = 130 under „132 Personen…"; `/manage/persons` dropped
   `totals.paused`. Not a contract bug, but worth recording as the shape of the mistake: **a card
   that restates a filter must be built from the same function the filter is built from.** Both
   now map `toStateStats`, the shared occurring-state source behind `toStateFilterOptions`.

4. **One list of people had three German names.** The running group memberships of one group were
   headed MITGLIEDER on `/groups/$groupId`, WER IST DABEI on the Hub and ZUGEHÖRIGKEITEN on
   `/manage/groups`, and the header sublines split the same three ways. `lib/group-sections.ts`
   now owns the titles and `toGroupSubline`; the two read surfaces say **MITGLIEDER** and only
   Group management, where the row is edited as a record, keeps **ZUGEHÖRIGKEITEN**. The subline
   always names the admins, so „kein Gruppen-Admin" is said out loud everywhere. **Consequence to
   watch:** the longer subline truncates in `/manage/groups`' 5-column master row
   („18 Personen · 1 Gruppe…"); the row's primary facts (name, size, status chip) survive.

### Contract bugs the final server review found and did not work around

1. **Decisions L and AG together produce a reachable dead link, and no payload could answer it.**
   Rows on the group surfaces link to `/members/$personId`, which decision L makes **404** for a
   Person who is not herself affiliated — and decision AG pins exactly such a Person as real (a
   Person who is only a group admin is not affiliated; an archived group/role confers nothing,
   decision D). The client cannot compute the fact, so the server now carries it: a per-row
   **`isAffiliated` (bool)** on the running-row DTOs of `GetGroupById`, `GetMyGroupById`,
   `GetManagedGroupById` and `GetRoleById`. Because the past-row lists reuse the same DTO types,
   the field is on those rows too and is computed honestly there rather than defaulted.
   **This is a contract amendment: four §4 DTOs gain a field.** It is computed by one extra
   translatable query per detail request through the new `AffiliationLookup`, which calls
   `AffiliationQuery.IsAffiliatedOn(today)` — the predicate itself is untouched, because decision
   AG reserves widening it for Florian.
   **The client consumes it since the pre-push pass**, which also amends §5: one boolean was carrying
   two unrelated facts. `canOpenPerson` was filled at every call site with the *reader's*
   `usePermissions().isAffiliated` and then decided a link to a *third party's* person card. The prop is now
   `viewerIsAffiliated` — the reader's clearance only — and `GroupMemberRow`, `GroupAdminRow` and
   `RoleHolderRow` each compute `canOpen = viewerIsAffiliated && row.isAffiliated`, so the two facts
   no longer share a name. `GroupDetailMemberSchema`, `GroupDetailAdminSchema`, the `groups`
   feature's `GroupMemberSchema`/`GroupAdminSchema` and `RoleHolderSchema` all carry the field, and
   the recruiting contact note on `/groups/$groupId` prints an unreachable admin as plain text rather
   than a link (`toOpenableAdminIds`). Nothing widened affiliation, client or server.

2. **RESOLVED 2026-09-23 — Decision W was revised to *yes*, the seeder reconciles on every
   start** (keys, archive flag, role holding, and the Account's `is_disabled`). The account below
   is kept as the record of how the question arose. **A new §12 decision is owed on the Admin role
   holding failsafe.** `BootstrapAdminSeeder`
   calls `EnsureAdminRoleIsHeldAsync` unconditionally on every `StartAsync`: once the Admin role
   exists, every start checks whether any `RoleHolding` on it is still running and, if not,
   silently opens a fresh one for the bootstrap account. Decision W's text says the role is
   „created once … afterwards it is ordinary data", which reads as forbidding this. It is **not**
   an oversight: three tests in `BootstrapAdminSeederTests` pin the split deliberately — the
   permission keys are never re-granted (which *is* decision W's stated rationale), while a lost
   role holding is repaired. It is not removable either: `roles.manage` can only be granted by
   someone who holds it and there is no delete endpoint (decision U), so the failure it prevents
   is a permanent lockout. Landed as a comment naming it, no behaviour change.
   **Florian decides — written up as §5's Q7:** either W-literal (drop the failsafe, accept a
   possible permanent lockout) or pin the failsafe as its own decision. Two things belong in the
   same decision:
   - the predicate ignores `SinceOn`, so a purely **future** holding counts as „still held";
   - the **lost-update policy** for `PutRolePermissions` and `PutGroupInfo`. There are no `xmin`
     concurrency tokens and none were added: a lost-update policy is a decision nobody has taken,
     and `PutRolePermissions` is a *declared* full replacement.

### Two behaviours that are correct and will be mistaken for bugs

- **Client and server fold German names differently, and the contract pins both.** §4.41's
  server-side `GermanFold` maps `ue → ü`, so `GET /api/person-search?q=kuehn` finds Kühnel; §5.1's
  `normalizeForSearch` is NFD-strip only, so typing `kuehnel` into `/members` or `/manage/persons`
  finds nothing while `kuhnel` and `KÜHNEL` both work. Both were implemented exactly as written and
  the divergence is pinned in `person-filters.test.ts`. **Ratification is Q6.**
- **A row lying entirely in the future appears in no list on `/manage/groups`** — neither in
  `members`/`admins` nor in `pastMembers`/`pastAdmins` — while Person edit shows it with a
  `geplant` chip (decision AF). Decision C makes such rows legal and `PostGroupMembership` accepts
  them, and `AddMemberDialog`'s own date hint invites one („Darf in der Zukunft liegen"), **so this
  surface can create a row it then cannot display.** That needs a contract decision, not a third
  list — **Q8**.

---

## 9. The UX pass (W5) — five rounds

The loop as specified: screenshot every route at phone/desktop × light/dark, set a deliberately
hostile critic on the set (what is bad UX, where do pages drift from each other, where is the
corporate design inconsistent, where is a wow moment missing, what fails on detail), fix, re-shoot,
re-critique — **full-page rewrites allowed and wanted** — until a round finds nothing structural.

**It ran five rounds.** Rounds 1–4 each ran as a four-family worktree wave (`shared`, `hub`,
`persons`, `groups`/`roles`) with an integration agent replaying the patch series; **round 5 was the
closing sweep and landed directly** (`bcdeae4` … `e133b68`), alongside the final server review. The
rounds got quieter, which is the stop condition the loop wanted.

### One behaviour that is correct and will be read as a defect

Everything the families and the early rounds flagged and deliberately left alone has since been
resolved — the red `Beenden` wall (§7.1a), the two-line phone rows, the clipped avatar stack, the
floating mobile dock, the missing `/manage/roles` intro, the two dashed `tone="reserved"` panels
and `KkBroomMark`. **One item stands, and it stands because it is right:**

**Decision B's inclusive end is genuinely surprising in the UI.** A group membership, group admin
row or role holding ended **today stays in the running list until tomorrow**, with `untilOn` set.
Confirmed on the wire. Do not add a client-side filter and do not read it as a broken end flow —
the server is right and contract §2 owns the rule.

### Round 1 — what a round actually costs

Five hostile critics (corporate design · cross-surface drift · interaction and accessibility ·
density and German copy · *where is it merely correct*) read all 52 screenshots and produced **79
raw findings**. Triage merged ~45 duplicates, **dropped 5 as contract contradictions** (each named
with its §12 decision letter) and verified every load-bearing claim against the code before keeping
it — several critic diagnoses were wrong in their file, their count or their fix. What survived was
**34 work items, 16 structural and 18 detail**, across five buckets, landed in **38 commits**
(`c93c3f0` … `7d4bc04`).

Two findings are worth knowing about even if you read nothing else:

- **The login page was printing the bootstrap admin's e-mail and password** as unguarded module
  constants, next to two permanently-disabled entrances and a form that did not submit. Rebuilt in
  `0309d98`. It was development convenience that would have shipped.
- **The „Beenden" wall**: `tone="danger" variant="outlined"` fired ~20× per surface as the only
  colour-ranked control in the product, with its label measured at **4.35:1 — below AA** — while
  `kkTokens.color.*.redInk` (6.38:1) existed for exactly that. Four of five lenses hit it
  independently. The resolution is written into the contract as **§7.1a**.

### Round 3 of the UX pass — the `ui` bucket, amendment to §7.1a

**§7.1a.1's „a red verb, never a pill" is about the *shape*, not the colour — `tone="danger"
variant="text"` is red at REST again.** Round 2 implemented the amendment as
`restingDangerLabel = { color: 'text.secondary', '&:hover, &:focus-visible': redInk(theme) }`,
which put the whole affordance behind a hover query. On a touch device the red never appeared, so
„Beenden" and „Ändern" rendered as the same `text.secondary` grey at 0.75rem — on
`PersonMembershipRow` the benign edit and the act that ends a membership became two adjacent
identical words. §7.1a.4 pins that the red *label* branches paint through `kkTokens.color.*.redInk`
(6.38:1 on cream, 6.55:1 on the dark panel); the grey rest state was a regression against the
amendment, not an implementation of it.

`KkButton` now paints `redInk` at rest for `tone="danger" variant="text"`, and **every**
`variant="text"` button carries a rest-state signifier that survives a device with no hover:
`textDecoration: 'underline'` at `kkTokens.line.hair`, offset `0.25em`, thickening to
`kkTokens.line.section` on hover/focus (MUI's own text-button hover ground keeps the two states
apart as well). Do not re-flatten either half: the loudness §7.1a took away is the *pill*, and the
rest state has to say „control" without one.

### Round 1 of the UX pass — the `shared` bucket

Item 3 above (the `/manage/roles` intro) is **resolved**: all three management surfaces now share
`ManagePageLayout` — `KkLead` intro, accent-square section head carrying the one contained create
action, sticky toolbar, list. Item 6 (decision B's inclusive end) is not this bucket's and stands.
Findings S1–S12 landed across `apps/club-app` with five changes in `@furria/ui`:
`KkStickyBar` and `KkLetterIndex variant="strip"` (new, S1), `KkAppShell.BackLink` (new, S5),
the `KkSplitLayout` sheet opening on first paint plus `useKkPaneOpen` (S2), `KkBrandStage
variant="band"` (S2), and the `KkPersonRow` chip order (S5.7 / S10). `KkPanel`'s interactive
branch gained `width: 100%` — a `<button>` panel shrink-wrapped, so a card grid came out ragged.
`useIsMobile` now passes `noSsr`, so the breakpoint is right on the first render and
`KkSplitLayout.Pane` stops mounting the desktop column on a phone.

### Round 1 of the UX pass — the `ui` bucket

Items 1, 2, 4 and 5 above are resolved; item 3 (the `/manage/roles` intro) and item 6 (decision B's
inclusive end) are not this bucket's and stand. Findings U1–U13 landed in `@furria/ui`, with two
rulings written back into the contract as **§7.1a** (the action hierarchy) and **§7.1b**
(uppercase is chrome, a club name is data); §7.1c lists every other primitive change. Two new
primitives exist and are unconsumed on purpose: `KkStickyRail` (the shared bucket needs it — a
page cannot write `position: sticky` with a px `top` under `noDesignSx`) and `KkPageWatermark`
(mounted on `/`, whose sheet was a blank cream field). **`KkEmptyState` lost its `icon` prop** —
all 28 call sites were updated in the same commit, so a bucket rebasing onto this must not
re-add it.

### Round 1 of the UX pass — the integration

All four bucket series (`shared` → `hub` → `persons` → `groups`) are replayed onto
`feat/club-app-p1` on top of the `ui` bucket's `c93c3f0`. **Item 3 above is now resolved too** —
`shared`'s S3 put `/manage/roles` on `ManagePageLayout`, so it opens with a `KkLead` and an accent
`KkPanelHeader` over its master column like its two siblings. Item 6 (decision B's inclusive end)
is the only one of the six still standing, and it is correct behaviour, not a defect.

Four conflicts, all of them two buckets adding to the same list, all resolved by keeping both
sides:

| Conflict | Resolution |
|---|---|
| `lib/group-sections.ts` + its test, add/add | `shared` and `hub` both created the module. Kept the **union** of the title keys and `shared`'s shorter count labels (`18 Personen`, not `18 Personen dabei`) — `shared`'s call sites had already landed, and `shared` had flagged that the longer admin half already truncates a master row. |
| `group-hub-labels.ts` | `HUB_SECTION_TITLES` dropped; the hub reads the shared module, which now carries `about`/`history`/`events`/`photos`. |
| `state-chips.test.ts` | `shared`'s `toStateStats`/`toSwitchStateChip` blocks and `persons`' `toSessionPeriodChip` block both kept. |
| `MemberHeader.tsx`, `PersonRow.tsx`, `GroupOverrideEmpty.tsx` | `persons`' eyebrow over `shared`'s removed subline (its `KkMeta` import dropped with the subline it served); `persons`' de-wrapped withheld chip using `shared`'s `WITHHELD_CHIP` object; `GroupOverrideEmpty` stays **deleted** — `shared`'s S3 removed the empty detail column that `groups` had merely de-dashed. |

Three integration commits followed, each a disagreement the gates could not catch:

1. `2b1d752` — **two buckets answered §7.1a.3 differently.** `hub` made both „+ Mitglied" and
   „+ Admin" contained; `groups`, on the structurally identical Group management panels, made one
   contained and one outlined. The contract says exactly one contained primary per surface, so the
   Hub now matches its sibling, at the `size="small"` every other `KkPanelHeader` action uses.
2. `e55a851` — the union merge left „Die Gruppe", „Geschichte" and „Bilder" spelled both in the
   shared module and again in the two feature label modules. Folded. `toMemberCountLabel` lost its
   last call site to G2 and survived only because its own test still imported it; deleted with it.
3. `9226b1d` — **`features/members` was nobody's bucket**, so `/members/$personId` ended up the one
   surface whose group and role panels are dead ends while the identical panels on
   `/manage/persons/$personId` link. Both now link on the established pattern.

Gate state after that round-1 integration — **historical; §2 carries the current numbers**:
`pnpm lint` 1240 files, zero warnings, zero suppressions ·
`pnpm typecheck` all four projects clean · `pnpm test` **1223 passing**, 0 failed
(club-app 579 · website 502 · ui 130 · shot 12) · `pnpm build` both Done · `git status --short`
empty. A Playwright walk of all thirteen routes logged **no `pageerror` and no `/api/` response
≥ 400**. No server file was touched, so no `dotnet` gate was run.

### Three implementation idioms worth copying, found the hard way

- **React Compiler eats react-hook-form errors across a component boundary.** If `useForm` lives in
  a custom hook and the child that renders the fields receives only the *stable* `form` object, the
  compiler memoises it and the child **never re-renders when `formState.errors` changes** — the
  field gets its red outline but the helper text stays empty, and it looks like a zod problem. It
  is not. Return `form.formState.errors` from the hook as its own value and pass it as a second
  prop. `LoginForm` is immune because it reads `formState` in the same component that hosts `useForm`.
- **TanStack Router: `useSearch` takes the ROUTE ID (`'/_app/manage/groups'`), `useNavigate({ from })`
  takes the PATH (`'/manage/groups'`)**, and a `from`-bound navigate types `search` as a *reducer*,
  not an object. The shape that compiles is `useNavigate()` with no `from`, then
  `navigate({ to: '/manage/groups', search: { group: 7 } })`; clearing is `{ group: undefined }`,
  never `{}`. See `features/manage-groups/hooks/use-group-selection.ts`.
- **Reset a dialog's fields with a render-phase update** (a `wasOpen` state compared during render),
  never a `useEffect` — an effect flickers the previous record's values into a freshly opened dialog.

---

## 10. On disk, and **volatile**

The evidence of the phase that is **not** in the repository lives in the session scratchpad
`/private/tmp/claude-501/-Users-florian-sources-Furria/<session-id>/scratchpad/`, which is
session-scoped and will not survive a reboot or a new session. **None of it may be committed**
(contract §9.4), so if it matters, copy it out of the temp directory before the session ends.

| Path | What it is |
|---|---|
| `dev-seed/seed.py` | the throwaway seeder. Deterministic ids, drives the real write endpoints. Rebuildable from contract §9.2 and §9.3, but rebuilding costs an agent-hour |
| `ux/round-2/` … `ux/round-5/` | the full-page PNGs of each round, 14 surfaces × phone/desktop × light/dark, plus per-bucket before/after sets and viewport-sized reads in `vp/` and `crops/`. **For a tall surface read the viewport file, never the full-page one** |
| `ux/website/` | slice 18's shots of the re-pointed `/club` |
| `patches/` | every family's `git format-patch` series from every wave. Already replayed; kept only as evidence if a conflict resolution turns out wrong |
| `wf/w5-w6.js` | the W5+W6 workflow script |
| `verify-*.mjs`, `probe-*.mjs`, `vp-*.mjs` | the throwaway Playwright drivers the rounds used. **Keep them in the scratchpad** — biome lints anything under `web/`, and one of these can land in a commit |

`<scratch>/node_modules` must be a symlink to `web/tools/screenshot/node_modules` — that is how
`node <scratch>/drive.mjs` resolves `playwright`. During the waves it pointed at a *worktree's*
copy instead, and removing the worktrees left it dangling; it has been re-pointed at the main
checkout. Point it there from the start.

---

## 11. The consolidation slice — the next phase's first slice

A composition review of the branch filed nine findings. All nine were spot-verified against the
source and **all nine are real**; one of them (the four-way fork of `toWriteErrorMessage`) was taken
immediately because it was user-visible copy, and is recorded in §8. The other eight were
**declined for that push, together, for one reason: W5 was still running, and W5 explicitly allows
and wants full-page rewrites.** Consolidating surfaces the UX pass is about to reshape means doing
the work twice and re-taking every screenshot.

**That reason has expired.** W5's five rounds are done and the surfaces have settled, so the eight
are simply open. They are recorded here so they are not rediscovered a fourth time. **Run them as
one slice, as the next phase's first work** — before any new feature lands on top of the
duplication.

1. **`/members` and `/manage/persons` are the same register built twice** — seven component pairs
   plus `member-filters.ts`/`person-filters.ts` and `use-member-search`/`use-persons-search`,
   ~500 lines. `PersonsLetterRail.tsx` and `MembersLetterRail.tsx` diff to **one import path**.
   Extract one register kit parameterised by row renderer + haystack.
2. **`AppListLayout`** (`features/session/components/AppListLayout.tsx:8`) is a 15-prop, 4-boolean
   matrix encoding three real layouts, with `ASIDE_SIZE`/`DETAIL_SIZE` declared twice per surface
   (body and skeleton) so they can drift silently. Replace with three named layouts, each owning
   its own `.Skeleton`.
3. **The Hub's roster admin and Group management's override panel** are ~150 lines of the same
   orchestration written twice (`use-hub-dialogs.ts` / `use-override-dialogs`), and „only one dialog
   open" has five different encodings on this branch. Collapse onto `useFactEditor`'s discriminated
   union, the one that is true by construction.
4. **No shared app-component home.** `PersonPicker` is imported from `@/features/group-hub` by
   manage-roles (and worded by `group-hub-messages`), and `GroupCardBody` — a group-feature name —
   draws a role. Give the app `src/components/` or non-page features, and add the missing
   feature-boundary rule to the frontend-work skill **by proposal only** (never edit a skill without
   Florian's explicit OK).
5. **Six form dialogs hand-assemble the same `KkModalFrame` scaffold**; `KkConfirmDialog` proves the
   extraction. `CANCEL_LABEL` is declared 16 times, `CLOSE_LABEL` 14, and one 110-character German
   sentence is pasted into three features.
6. **Four query+status filter hooks with four vocabularies**, three of which hide their pure filter
   functions inside `*-labels.ts` copy modules (`manage-roles-labels.ts` is 449 lines of German
   strings mixed with list projection).
7. **„this record is archived, so it is read-only" is spelled three ways with two polarities**
   (`canManage`, `canAdd={!isArchived}`, `isArchived`).
8. **`useDetailScroll` / `useScrollIntoView` are duplicated**, and two different router idioms drive
   the same URL-driven selection (`getRouteApi` vs `useSearch` + a hardcoded path string).
9. **The reset-on-open render-phase idiom is written out nine times**, and `lib/state-chips.ts`
   descriptors are manually re-spread into `KkChip` at 18 call sites. The fix is an app-level
   `StateChip` next to `state-chips.ts` — decision Y keeps `@furria/ui` free of the German
   vocabulary, so it does not belong in the primitive layer.

Also declined, and belonging to item 4 rather than to the debounce it was filed against: moving
`PersonPicker` out of `group-hub`.
