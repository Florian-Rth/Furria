---
status: paused — W4 complete, W5 round 1 complete, W5 round 2 and W6 owed
phase: CA-P1
updated: 2026-09-12
purpose: everything needed to continue CA-P1 on a different machine with no access to the
         session that started it
---

# CA-P1 — implementation state and handoff

> **To continue: read this file, then `p1-contract.md`, then resume at [§6 Next actions](#6-next-actions).**
> Everything the work depends on is committed. No session state is required.

The phase is being built by orchestrated subagent workflows. This file records what is done, what
is owed, how to run the machinery, and the mistakes already paid for so they are not repeated.

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
  "for later": no Ehrenmitgliedschaft, no Mitgliedschaftsart, no Ruhezeit-Grund, no Schlüssel,
  no founding year, no audit author, no Beitrag amounts.
- **The app seeds nothing** beyond the bootstrap Account and the Admin Rolle
  (contract §9, Florian's ruling 2026-09-11). No `DevelopmentDataSeeder`, no seed flag in any
  `appsettings`, no fixture data in the repository. There is **no slice 3a**.
- **Build the end state.** Never a reduced or interim version of anything.
- **Lacking a right hides an affordance**, never disables it.
- Never suppress a lint rule, weaken a test, use `any`, or add a `biome-ignore`.

---

## 2. Where the work stands

52 commits on `feat/club-app-p1` since `07dd7a0`. Head is `332e439`.

### Done

| Slice | Backend | Frontend |
|---|---|---|
| 1 Mitgliedschaft rework | ✅ `0345d20` | — |
| 2 Rights core | ✅ `0ab10e5`, `951058f` | — |
| 3 Gruppen core | ✅ `d077b6a` | — |
| — foundation review fixes | ✅ `2465819`, `38a0716` | — |
| — `@furria/ui` primitives | — | ✅ `527bc3c`, `abf1ce9`, `9d15358`, `af21fee`, `c27c75a` |
| 4 Mitgliederliste | ✅ `c343b43` | ✅ `c0847b6` |
| 5 Person-Karte | ✅ `6b10ef3` | ✅ `c8bd45a` |
| 6 Gruppen | ✅ `af71735` | ✅ `e4c9304` |
| 7 Profil-Sichtbarkeit | ✅ `b2b7716` | ✅ `172834b` |
| 8 Hub lesen | ✅ `d40060a` | ✅ `98aaf98` |
| 9 Hub verwalten I | ✅ `94d6600` | ✅ `5a7b3e1` + `b60f351` (finished and verified) |
| 10 Hub verwalten II | ✅ `aedfcf3` | ✅ `01d7da2` |
| 11 Personenverwaltung | ✅ `0b03990` + `3ab1533` (§4.15, late) | ✅ `72018f9` |
| 12 Person bearbeiten I | ✅ `e548b70` | ✅ `2b3df5a` |
| 13 Person bearbeiten II | ✅ `130a6fe` | ✅ `b60faf2` |
| 14 Gruppenverwaltung I | ✅ `4e1a95f` | ✅ `7b36527` |
| 15 Gruppenverwaltung II | ✅ `515ab18` | ✅ `4328ea1` |
| 16 Rollen & Rechte I | ✅ `5799e5d` | ✅ `3ea966c` |
| 17 Rollen & Rechte II | ✅ `c1b28e9` | ✅ `3ea966c` (one commit, see below) |
| 18 Website re-pointing | ❌ | ❌ |

**Slices 1–17 are complete on both ends.** Only slice 18 is unbuilt.

Slices 9–17's frontend was built by four families in parallel worktrees and replayed onto the
branch in the order hub → persons → groups → roles. Three integration commits followed:
`40a4cd6` (route tree regenerated for all three `/manage/*` routes — each family had regenerated
it with only its own route), `7f39a28` and `332e439` (two second spellings, below).

Slices 16 and 17 share one commit. `RoleDetail.tsx` is a slice-16 deliverable that imports all
three slice-17 components, so a separately-compiling slice-16 commit would have required shipping
a deliberately reduced `RoleDetail` and then rewriting it. The persons series (11 → 12 → 13) is
likewise only gate-verified at its tip; its two intermediate commits do not typecheck alone.

> **Slice 11 shipped without `GetPersonById` (§4.15).** `GET /api/manage/persons/{personId}`
> answered **405** — only `PutPerson` bound that route — so `/manage/persons/$personId` had no
> read at all. Built in `3ab1533` while integrating slices 13–17. If another §4.x endpoint is
> missing, this is how it looks: a route that answers 405 rather than 404.

> **Slice 9's frontend is now finished.** The audit that closed it found three real defects in
> `5a7b3e1`, all fixed in `b60f351`: a 404 on any Hub write was completely silent
> (`toWriteErrorMessage` returned `null`, so the dialog footer stayed empty and nothing toasted);
> the confetti burst fired ~950 px below the fold because `HubCelebration` centred it on the whole
> members panel; and the phone reading order put the admin-only Geschichte panel between Mitglieder
> and Gruppen-Admins.

### Gate state

```
server:  dotnet build  → 0 warnings, 0 errors
         dotnet test   → 19 analyzer + 643 API tests passing   (117 before the phase)
         dotnet csharpier check . → clean, 339 files
         (unchanged since slices 13-17 landed; no server file was touched by the frontend wave)
web:     pnpm lint      → 1224 files checked, zero warnings, zero suppressions
         pnpm typecheck → all four projects clean
         pnpm test      → 1161 passing, 0 failed, 0 skipped
                          club-app 545 (30 files) · website 502 (72) · ui 102 (13) · shot 12 (1)
         pnpm build     → club-app and website both Done

Verified on the integrated tree with `git status --short` empty at 332e439. The server suite
needs DOCKER_API_VERSION=1.41 on this machine, see the pitfall table.
```

Every route of the phase was screenshotted after integration at phone/desktop × light/dark and
read: `/members`, `/groups`, `/profile`, `/my-groups/1`, `/manage/persons`,
`/manage/persons/2`, `/manage/groups`, `/manage/roles`. A Playwright walk of all eight routes
logged **no `pageerror` and no `/api/` response ≥ 400**. The nav rail carries all three
Verwaltung entries, `resolveSectionTitle` resolves every new prefix (the phone dock reads
„ROLLEN & RECHTE" on `/manage/roles`), and the §5.2 `/profile` regression is confirmed gone.

**Anything uncommitted in the working tree when you arrive is an interrupted agent's work.**
Judge it, do not assume it is good: run the gates, finish or discard it, then continue.

### Primitive layer

28 new `Kk*` components, 7 shared internal parts, 9 extended, all in `@furria/ui`
(contract §7 + §7.6). A design review fixed real contrast defects in the **existing** palette
while building them — gold chip text was 1.70:1, dark-mode `blue` 2.7:1. The rule that came out of
it and that all later work depends on: **`.main` is the fill, the new `*Ink` token is the readable
foreground.**

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

### Machine limits that shaped the design

4 CPUs → the workflow concurrency cap is `min(16, cpus−2)` = **2 agents**. Wide fan-out buys
nothing here. On a bigger machine the lane design in §4 can widen; the *ordering* constraints
(backend before its frontend, one backend agent at a time) still hold.

---

## 4. How the work is being run

Six workflows, of which 1–3 are complete:

| # | Workflow | State |
|---|---|---|
| W1 | Contract & design: 4 readers → architect → 3 adversarial critics → revision | ✅ done |
| W2 | Backend foundation, slices 1–3, TDD, then 3 reviews + fix | ✅ done (+ a rescue, see §7) |
| W3 | `@furria/ui` primitive layer, then design + React review + fix | ✅ done |
| W4 | Slices 4–17, two lanes | ✅ done — backend and frontend both through 17 |
| W5 | UX roast: screenshot everything, critique, fix, re-shoot, loop until dry | ❌ not started |
| W6 | Slice 18 + hardening | ❌ not started |

### The W4 lane design (reproduce this)

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

Each agent: reads its contract sections → implements → runs **all** gates → (frontend) screenshots
its routes and fixes what it sees → commits its own pathspec only.

**Slices 9–17's frontend was finished differently, and it worked better.** Four families (hub 9–10,
persons 11–13, groups 14–15, roles 16–17) built concurrently in isolated worktrees, exported
`git format-patch` series, and one integration agent replayed them in the order
hub → persons → groups → roles, then ran a single gate pass and a single screenshot pass over the
merged tree. Two things make that reproducible:

- **Gate discipline.** Each family wrote its entire assignment before executing anything expensive,
  then ran `dotnet test` / `pnpm test` / `pnpm build` / `pnpm shot` **once**. Earlier agents burned
  25–45 minutes per slice on repeated Testcontainer boots and browser logins.
- **Replay order is load-bearing.** `groups` and `roles` both import the hub's dialogs and
  `PersonPicker`, so `hub` must land first; when `groups` duplicated slice 10's files (it was
  building against a base where they did not exist) the conflict resolved cleanly toward the hub
  family's versions, leaving only the two prop names to adapt in `GroupOverrideDetails.tsx`.

**The worktrees were provisioned at `main` (`07dd7a0`), not at the branch head.** All four families
caught it with `git rev-parse HEAD` as their first command and fast-forwarded. Any future worktree
wave must check this before reading a line — a family that misses it writes against a tree with no
contract file and no slice 4+ frontend, and its patch will look plausible and will not apply.

**Expect 25–45 min per agent.** That is the gates, not the model: every `dotnet test` starts a
Postgres Testcontainer (~35 s) and a TDD slice runs it 8–15 times; a frontend slice runs the full
web suite plus four real browser logins. Two lanes → roughly 45 min of wall clock per slice pair.

---

## 5. What is owed, and known risks

1. **The UX pass has no data to look at.** Nothing is seeded (§1), and the create endpoints only
   arrive in slices 11/14/16. Contract §9.2 pins the answer: a **throwaway script in the
   scratchpad, never committed**, that logs in as the bootstrap admin and creates data through the
   real write endpoints. §9.3 lists the cases it must produce — the `beendet`-but-affiliated
   Person, the Gruppen-Admin affiliated by nothing else, the archived Gruppe with open
   Zugehörigkeiten, the Gruppe with no admin, the unbesetzte Rolle. Write it before W5.
2. ~~**`/profile` regression**~~ — **fixed and verified.** All four `/profile` PNGs render the full
   page with no error state.
3. ~~**`KkToastProvider` mounting**~~ — **confirmed mounted** in
   `features/session/components/AppShell.tsx`; toasts were observed firing on real writes.
4. **Commit timestamps** — every commit of this phase falls in the weekday 04:00–17:00 window that
   the repo's convention avoids. Sweep with the global `fix-commit-times` skill before the PR.
5. ~~**Umlaut folding in `GetPersonSearch`**~~ — **judged sufficient.** The two-way fold
   (`GermanFold.Expand` + `GermanFold.Strip`, both sides ILIKE'd) covers every German spelling the
   register can hold; it needs **no** migration, no `unaccent`, no `pg_trgm`. What was actually
   broken there was the wildcard escaping, fixed separately: both calls used the two-argument
   `EF.Functions.ILike`, which emits `ESCAPE ''` — Postgres reads that as *no* escape character,
   so the backslashes the service inserted became literal pattern characters and any query
   containing `_`, `%` or `\` returned nothing. Now the three-argument overload with an explicit
   `\`, and the query is trimmed server-side rather than trusting the client's `toSearchTerm`.
   The still-open half is §8's pinned divergence: the client's `normalizeForSearch` is NFD-strip
   only, so `kuehnel` finds nothing on `/members` while the server finds Kühnel. Somebody should
   ratify which one is meant.
6. ~~**The `Since` chain-minimum** N+1 risk~~ — **closed.** It is computed in memory from one
   projection, never per row. What the same pass found instead: **`/manage/persons` and
   `/manage/roles` load every historic tie and throw it away.** `PersonRegistryProjection`
   (`PersonService.cs`) filters only on `Group.ArchivedOn == null`, never on the period;
   `RunningTies` computes `tie.Min(StartedOn)` and `ToSummary` drops it, because
   `GroupReference`/`RoleReference` carry two properties each. `RoleService.RolePageProjection`
   has the same shape and is shared between detail and list. Measured at 249 wire rows for 152
   Personen — no user-visible defect, so it was **not** fixed on this branch: it reshapes two hot
   projections. Trigger to watch: list cost grows with history, and decision Z pins these lists
   unpaged. `MembershipChainDetails` genuinely needs the full Mitgliedschaft chain — only the
   Gruppen/Rollen collections can be narrowed.
7. `de-DE-x-icu` **is** present in `postgres:18-alpine` and sorts correctly
   (`Adam < Ärger < Bach < Oehler < Öhler < Zöller`) — verified, not assumed. ADR-0008 records it.
8. **`IsRunningOn` is hand-copied ~15 times** — `PersonService`, `GroupService`,
   `PermissionAuthorizer`, `BootstrapAdminSeeder` — while `AffiliationQuery` already shows the
   right shape. Declined for this push (it rewrites the predicate in every hot read path for no
   observable change, at the cost of a full Testcontainer suite). Belongs in **W6 hardening** as
   `MembershipQuery` / `GroupMembershipQuery` / `GroupAdminQuery` `[Pure] Expression` factories
   with boundary tests for `start == today` and `end == today` (decision B).

---

## 6. Next actions

1. **Triage the working tree.** Anything uncommitted is an interrupted agent's. Run the gates,
   finish or discard.
2. ~~**Finish W4**~~ — done. Slices 1–17 are complete on both ends.
3. **Re-seed the dev database before W5.** The seed script exists (`seed.py`, scratchpad only,
   never committed) and its ids are deterministic, but the four families' live write-flow probes
   left residue in the shared database that makes several documented handles wrong today:
   persons **152 and 153** („Testine Überprüfung…", each with a Mitgliedschaft, an open Ruhezeit
   and a Beitragsermäßigung) so the register is **153 rows, not 151**; **Gruppe 14 „Testgruppe
   Zwei"**, archived, so `/manage/groups` counts 14 / aktiv 12 / archiviert 2; **Rolle 10
   „Materialwart"**, so there are ten Rollen; Gruppe 1 „Große Garde" has a changed description and
   `isRecruiting = false`, plus same-day-ended rows that make it read **22 Personen · 4
   Gruppen-Admins** instead of 18 · 2; and **Rolle 8 „Chronistin" is not unbesetzt today** (two
   holdings created and ended on 2026-09-12). Because period ends are **inclusive** (decision B) a
   row ended today still counts today, so most of that heals by itself on 2026-09-13 — but
   `docker compose down -v` + re-seed is the only way to get the documented state exactly.
   **There is no delete endpoint (decision U); the three created records never go away by
   themselves.** Match fixtures by name, never by count.
4. **W5 — the UX pass. Round 1 is complete; resume at round 2.** See §10 for exactly where the
   pause is and what is already on disk. Round 2's 56 screenshots were already taken at `7d4bc04`
   and are in the scratchpad — if that scratchpad is gone, re-shoot before critiquing. The loop as
   specified: screenshot every route (`/members`, `/members/$id`, `/groups`,
   `/groups/$id`, `/my-groups/$id`, `/profile`, `/manage/persons`, `/manage/persons/$id`,
   `/manage/groups`, `/manage/roles`) at phone/desktop × light/dark. Then a deliberately hostile
   critic: what is bad UX, where do pages drift from each other, where is the corporate design
   inconsistent, where is a wow moment missing, what fails on detail. **Full-page rewrites are
   allowed and wanted.** Fix → re-shoot → re-critique, and loop until a round finds nothing
   structural (minimum two rounds).
5. **W6**: slice 18 (website re-pointing — and note contract decision S: a separate anonymous
   `GET /api/public/groups`, not a widened `/api/groups`), full gates, final review, commit-time
   sweep, PR.

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

- **~6 lines are provably missing** — one flagged bullet between "Gast-Registrierung & Dubletten"
  and "Non-member Gruppen people have no name". The gap was measured, not papered over.
- Whole entries are substance-sourced but **not Florian's words**: Mitgliedschaft, Ruhezeit,
  Beitragsermäßigung, Berechtigung, Inhaberschaft, Kontaktdaten, and every `_Avoid_` line except
  Gruppe's and Gruppen-Admin's.
- The position of the `Kontaktdaten` entry is inferred.

The commit message of `4ba5a8e` lists all of this per entry.

---

## 8. Contract bugs reported by the frontend wave — all still open

Every one of these was reported rather than worked around, and every implementer's reading is
recorded so nobody writes a second spelling. **None of them blocked a slice.** They need a
decision written back into `p1-contract.md`, not re-litigating by the next implementer.

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
   mutely** — a Gruppen-Admin whose Person had just been removed would click „Aufnehmen" forever
   with no feedback. The write path now has its own line
   („Das gibt es so nicht mehr — jemand anderes war schneller. Lade die Seite neu."). If silence
   really was the intent, revert `WRITE_MISSING_MESSAGE` in `group-hub-messages.ts` — but then say so.
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
   unconditionally. Taken literally an archived Gruppe with no admin would hide that it is
   archived. Shipped **archiviert → kein Admin → openness**. The Rollen master list needs the same
   order.
7. **§5.10's `placeholderData` claim is half true.** §4.31's `Holders` are `PersonRefDto`, §4.32's
   are `RoleHolderDto` (+ `roleHoldingId`/`sinceOn`/`since`), so the seed cannot render a holder
   row and **running holders arrive late too**, not only `PastHolders`.
8. **§5.10 leaves three things unowned**: the default (no `?role=`) state has no component and no
   copy; `useRestoreRoleMutation` is named with no dialog and no copy (§10.5's restore row says
   „Gruppe aktivieren"); and `GetRoleById.pastHolders` has real data but no owner. All three were
   built to the end-state rule; the copy for them is **not pinned** and the UX pass may overrule it.
9. **§5.9 lists no history panel for the Gruppenverwaltung** while §4.30 returns `pastMembers` and
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
not be implemented as written; the resolution is recorded here and belongs folded back into the
contract when that file is next touched.

1. **§5.3 contradicts itself and is amended.** It pins `MemberHeader` as
   „KkAvatar + name + state chip + „Mitglied seit …"" **and** pins `MemberClubPanel` as
   „KkFieldRow Mitgliedschaft / Status / Mitglied seit" — so the right column of the Person card
   opened by restating its own header, with the same chip and the same date 120 px apart, and
   `MemberContactPanel` (the thing a member opens the card for) sat underneath.
   **Resolution: the state chip stays in the header as the at-a-glance identity marker; the
   „Mitglied seit" subline leaves it, and `MemberClubPanel` is the one place the dates live.**
   `toMembershipLine` and `MemberHeadline.line` are deleted. `MemberView`'s right column is
   reordered so Kontakt sits above Im Verein.

2. **§5.9's Grid 5/7 is amended to apply only to the *selected* state.** Written unconditionally it
   spent 60 % of a 1 400 px desktop on a 360 px dashed „KEINE GRUPPE GEWÄHLT" card followed by
   ~1 800 px of nothing — on the surface an admin is *sent to* after a lockout. With no `?group=`
   the list now renders full width as a 3-up card grid (`ManagedGroupsGrid` / `ManagedGroupCard`)
   and the archive footnote is a page footnote; with a selection the 5/7 split is exactly as
   pinned. `GroupOverrideEmpty` is deleted: the empty state disappears with the state that
   required it.

3. **§7.1 / §7.1a applied to the three Verwaltung surfaces.** The create action is each surface's
   one `variant="contained"` primary, in the `action` slot of its section `KkPanelHeader`. One
   gesture per screen: the header action is hidden below `desktop` and a `KkFab` carries the same
   verb there — on **all three**, so `/manage/roles` gains the `RolesCreateFab` it lacked and
   `/manage/groups` stops offering „+ Gruppe anlegen" and an unlabelled red FAB at once.
   `features/session/components/ManagePageLayout.tsx` owns the breakpoint, so no future surface
   has to remember it.

4. **§5.7's „the state chip moves to line two (after the Gruppen)" is not a call-site rule.**
   `KkPersonRow` renders `trailing` itself, so the app cannot order it; the chip sat *before* the
   Gruppen and the meta text therefore started at a different x on every row. Fixed inside the
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
   **A decision is owed: one of the two paragraphs has to give.**

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

4. **One list of people had three German names.** The running Zugehörigkeiten of one Gruppe were
   headed MITGLIEDER on `/groups/$groupId`, WER IST DABEI on the Hub and ZUGEHÖRIGKEITEN on
   `/manage/groups`, and the header sublines split the same three ways. `lib/group-sections.ts`
   now owns the titles and `toGroupSubline`; the two read surfaces say **MITGLIEDER** and only the
   Gruppenverwaltung, where the row is edited as a record, keeps **ZUGEHÖRIGKEITEN**. The subline
   always names the admins, so „kein Gruppen-Admin" is said out loud everywhere. **Consequence to
   watch:** the longer subline truncates in `/manage/groups`' 5-column master row
   („18 Personen · 1 Gruppe…"); the row's primary facts (name, size, status chip) survive.

### Contract bugs the final server review found and did not work around

1. **Decisions L and AG together produce a reachable dead link, and no payload could answer it.**
   Rows on the Gruppen surfaces link to `/members/$personId`, which decision L makes **404** for a
   Person who is not herself affiliated — and decision AG pins exactly such a Person as real (a
   Person who is only a Gruppen-Admin is not affiliated; an archived Gruppe/Rolle confers nothing,
   decision D). The client cannot compute the fact, so the server now carries it: a per-row
   **`isAffiliated` (bool)** on the running-row DTOs of `GetGroupById`, `GetMyGroupById`,
   `GetManagedGroupById` and `GetRoleById`. Because the past-row lists reuse the same DTO types,
   the field is on those rows too and is computed honestly there rather than defaulted.
   **This is a contract amendment: four §4 DTOs gain a field.** It is computed by one extra
   translatable query per detail request through the new `AffiliationLookup`, which calls
   `AffiliationQuery.IsAffiliatedOn(today)` — the predicate itself is untouched, because decision
   AG reserves widening it for Florian.

2. **A new §12 decision is owed on the Admin-Rolle holding failsafe.** `BootstrapAdminSeeder`
   calls `EnsureAdminRoleIsHeldAsync` unconditionally on every `StartAsync`: once the Admin Rolle
   exists, every start checks whether any `RoleHolding` on it is still running and, if not,
   silently opens a fresh one for the bootstrap account. Decision W's text says the Rolle is
   „created once … afterwards it is ordinary data", which reads as forbidding this. It is **not**
   an oversight: three tests in `BootstrapAdminSeederTests` pin the split deliberately — the
   permission keys are never re-granted (which *is* decision W's stated rationale), while a lost
   Inhaberschaft is repaired. It is not removable either: `roles.manage` can only be granted by
   someone who holds it and there is no delete endpoint (decision U), so the failure it prevents
   is a permanent lockout. Landed as a comment naming it, no behaviour change.
   **Florian decides:** either W-literal (drop the failsafe, accept a possible permanent lockout)
   or pin the failsafe as its own decision. Two things belong in the same decision:
   - the predicate ignores `SinceOn`, so a purely **future** holding counts as „still held";
   - the **lost-update policy** for `PutRolePermissions` and `PutGroupInfo`. There are no `xmin`
     concurrency tokens and none were added: a lost-update policy is a decision nobody has taken,
     and `PutRolePermissions` is a *declared* full replacement.

### Two behaviours that are correct and will be mistaken for bugs

- **Client and server fold German names differently, and the contract pins both.** §4.41's
  server-side `GermanFold` maps `ue → ü`, so `GET /api/person-search?q=kuehn` finds Kühnel; §5.1's
  `normalizeForSearch` is NFD-strip only, so typing `kuehnel` into `/members` or `/manage/persons`
  finds nothing while `kuhnel` and `KÜHNEL` both work. Both were implemented exactly as written and
  the divergence is pinned in `person-filters.test.ts`. Somebody should ratify which one is meant.
- **A row lying entirely in the future appears in no list on `/manage/groups`** — neither in
  `members`/`admins` nor in `pastMembers`/`pastAdmins` — while Person bearbeiten shows it with a
  `geplant` chip (decision AF). Decision C makes such rows legal and `PostGroupMembership` accepts
  them, and `AddMemberDialog`'s own date hint invites one („Darf in der Zukunft liegen"), **so this
  surface can create a row it then cannot display.** That needs a contract decision, not a third list.

---

## 9. On the UX pass's desk already (W5)

Things the families saw, judged and **deliberately did not change**, because changing them would
have been a contract amendment or a unilateral reshape of a primitive three siblings were using.

1. ~~**Twenty red `Beenden` ghosts form a red column**~~ — **resolved.** The UX pass (round 1,
   finding U2) took the §7.1 decision and wrote it into the contract as **§7.1a**: a repeated row
   action is `tone="danger" variant="text" size="small"`; the loud destructive treatment belongs to
   the confirming button inside `KkConfirmDialog` alone; each surface gets exactly one
   `variant="contained"` primary, in its section header's `action` slot. `KkButton`'s red *label*
   branches now paint through `kkTokens.color.*.redInk` (`error.main` at `size="small"` measured
   4.35:1 on cream). The call-site re-ranking belongs to the hub, groups and persons buckets.
2. ~~**On a phone every row with a `Beenden` becomes two lines**~~ — **resolved.** The
   `width: 100%` at `xs` is gone from `data-kk-since-row-trailing`; the slot sits inline at every
   width and the row keeps `flexWrap` so an unusually wide trailing still wraps rather than
   overflows (finding U1). The same rewrite gave `KkSinceRow` the link affordance it never had —
   eighteen named Personen on `/groups/1` were unclickable — an `avatar` slot, and the emphasis
   swap that stops the Session year outranking the person's name.
3. **`/manage/roles` is the one Verwaltung surface with no intro lead and no
   `KkPanelHeader` rule over its master column**, while `/manage/persons` and `/manage/groups` both
   open with a `KkLead` and an accent-square section head. Side by side the roles page reads as a
   different generation of the same app. Cosmetic, cross-page, exactly W5's remit.
4. ~~**The avatar stack on `/groups` clips its initials**~~ — **resolved.** `buildAvatarStack`
   emits a one-letter monogram for stacked circles (finding U6); the −10px overlap stays. The
   standalone `KkAvatar` at `medium`/`large` keeps both letters.
5. ~~**The app shell's fixed mobile dock button floats over content on every phone route**~~ —
   **resolved.** `KkAppShellMain` carries `pb: curtainClearance + 24` below `desktop` (finding U3),
   so all four consumers of `kkTokens.layout.curtainClearance` finally agree. Not on
   `KkAppShellStage` — the Stage's `pb` sits inside the masthead, not at the page bottom.
6. **Decision B's inclusive end is genuinely surprising in the UI**: a Zugehörigkeit, Gruppen-Admin
   row or Inhaberschaft ended **today stays in the running list until tomorrow**, with `untilOn`
   set. Confirmed on the wire. Do not add a client-side filter and do not read it as a broken end
   flow — the server is right and §2 owns the rule.

### Round 3 of the UX pass — the `ui` bucket, amendment to §7.1a

**§7.1a.1's „a red verb, never a pill" is about the *shape*, not the colour — `tone="danger"
variant="text"` is red at REST again.** Round 2 implemented the amendment as
`restingDangerLabel = { color: 'text.secondary', '&:hover, &:focus-visible': redInk(theme) }`,
which put the whole affordance behind a hover query. On a touch device the red never appeared, so
„Beenden" and „Ändern" rendered as the same `text.secondary` grey at 0.75rem — on
`PersonMembershipRow` the benign edit and the act that ends a Mitgliedschaft became two adjacent
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

Item 3 above (the `/manage/roles` intro) is **resolved**: all three Verwaltung surfaces now share
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
   „+ Admin" contained; `groups`, on the structurally identical Gruppenverwaltung panels, made one
   contained and one outlined. The contract says exactly one contained primary per surface, so the
   Hub now matches its sibling, at the `size="small"` every other `KkPanelHeader` action uses.
2. `e55a851` — the union merge left „Die Gruppe", „Geschichte" and „Bilder" spelled both in the
   shared module and again in the two feature label modules. Folded. `toMemberCountLabel` lost its
   last call site to G2 and survived only because its own test still imported it; deleted with it.
3. `9226b1d` — **`features/members` was nobody's bucket**, so `/members/$personId` ended up the one
   surface whose Gruppen and Rollen panels are dead ends while the identical panels on
   `/manage/persons/$personId` link. Both now link on the established pattern.

Gate state after integration: `pnpm lint` 1240 files, zero warnings, zero suppressions ·
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

## 10. Where the pause is (2026-09-12)

Florian stopped the W5/W6 workflow mid-run. **Nothing is lost and nothing is half-written** — the
working tree is clean, every agent that had started had already committed, and the run was killed
between rounds rather than inside one.

### The exact state

| | |
|---|---|
| Branch head | `7d4bc04` on `feat/club-app-p1`, tree clean |
| `origin` | **19 commits behind.** Nothing of W4 or W5 has been pushed |
| Slices | 1–17 complete on both ends. **Slice 18 not started** (that is W6) |
| W5 | **Round 1 complete and landed.** Round 2 stopped at its shooter, before any critic ran |
| Gates | Green at `7d4bc04`, verified by the round-1 integration agent. Nothing has touched the working tree since, so that verdict still stands — but re-run them before trusting it after any break in which the machine changed |

### What round 1 of the UX pass actually did

Five hostile critics (corporate design · cross-surface drift · interaction and accessibility ·
density and German copy · *where is it merely correct*) read all 52 screenshots and produced **79
raw findings**. Triage merged ~45 duplicates, **dropped 5 as contract contradictions** (each named
with its §12 decision letter) and verified every load-bearing claim against the code before keeping
it — several critic diagnoses were wrong in their file, their count or their fix. What survived was
**34 work items, 16 structural and 18 detail**, across five buckets, landed in **38 commits**
(`c93c3f0`…`7d4bc04`).

Two findings are worth knowing about even if you read nothing else:

- **The login page was printing the bootstrap admin's e-mail and password** as unguarded module
  constants, next to two permanently-disabled entrances and a form that did not submit. Rebuilt in
  `0309d98`. It was development convenience that would have shipped.
- **The „Beenden" wall**: `tone="danger" variant="outlined"` fired ~20× per surface as the only
  colour-ranked control in the product, with its label measured at **4.35:1 — below AA** — while
  `kkTokens.color.*.redInk` (6.38:1) existed for exactly that. Four of five lenses hit it
  independently. The resolution is written into the contract as **§7.1a**.

### Deliberately left for round 2

The round-1 integration agent declined three things rather than land a ruling in an integration
commit. They are the natural first work of round 2:

1. The two remaining dashed `tone="reserved"` panels (`/profile`'s contact preview,
   `/manage/roles`' no-selection column). G1's ruling is unambiguous; this is mechanical.
2. `KkBroomMark`'s size and colour — a primitive-level decision affecting 28 empty states, and the
   `ui` bucket's own open question.
3. Whether §7.1a item 3 should read „exactly one" or „at most one" contained primary — three
   surfaces currently have none.

### On disk, and **volatile**

Everything below lives in the session scratchpad
`/private/tmp/claude-501/-Users-florian-sources-Furria/1a16a9b7-9d1b-4532-85e4-740322ee09c8/scratchpad/`,
which is session-scoped and will not survive a reboot or a new session. **None of it may be
committed** (contract §9.4), so if it matters, copy it somewhere outside the repo before the break
ends:

- `dev-seed/seed.py` — the throwaway seeder. Deterministic ids, drives the real write endpoints.
  Rebuildable from contract §9.2 and §9.3, but rebuilding costs an agent-hour.
- `ux/round-2/` — 56 full-page PNGs (14 surfaces × phone/desktop × light/dark) plus 13
  viewport-sized reads in `ux/round-2/viewport/`, all taken at `7d4bc04`. **For a tall surface read
  the `vp-*` file, never the full-page one.**
- `ux/round-1*/` — round 1's before and after shots, per bucket.
- `patches/` — every family's `git format-patch` series from both waves. Already replayed; kept
  only as evidence if a conflict resolution turns out wrong.
- `wf/w5-w6.js` — the W5+W6 workflow script, ready to re-run.

### Also kept, on purpose

Eleven `worktree-wf_*` branches. Their worktrees are removed and their work is on the branch
(replayed as patches, so the shas differ), but the branches are the only record of the pre-replay
originals. Delete them with
`git branch -D $(git branch --list 'worktree-wf_*')` once you trust the merges.

### To resume

Re-run the W5/W6 workflow. It re-enters at round 1 by design, so either edit `w5-w6.js` to start at
round 2, or let round 1's critics re-read the round-2 shots — they will find less, which is exactly
the signal the loop's stop condition wants. **Re-seed the dev database first** (§6 item 3): the
residue described there is still present.
