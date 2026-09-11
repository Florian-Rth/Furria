---
status: in progress — paused for handoff
phase: CA-P1
updated: 2026-09-11
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

28 commits on `feat/club-app-p1` since `07dd7a0`. Every commit left the tree green.

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
| 9 Hub verwalten I | ✅ `94d6600` | ⚠️ `5a7b3e1` **partial, unverified — see below** |
| 10 Hub verwalten II | ✅ `aedfcf3` | ❌ |
| 11 Personenverwaltung | ✅ `0b03990` | ❌ |
| 12 Person bearbeiten I | ✅ `e548b70` | ❌ |
| 13 Person bearbeiten II | ❌ | ❌ |
| 14 Gruppenverwaltung I | ❌ | ❌ |
| 15 Gruppenverwaltung II | ❌ | ❌ |
| 16 Rollen & Rechte I | ❌ | ❌ |
| 17 Rollen & Rechte II | ❌ | ❌ |
| 18 Website re-pointing | ❌ | ❌ |

**Backend is ~4 slices ahead of the frontend** by design (see §4).

> **⚠ Slice 9's frontend (`5a7b3e1`) is committed but NOT finished.** Its agent was stopped
> mid-slice. All four web gates are green and it typechecks, lints, tests and builds — but it was
> never screenshotted and its write flows were never exercised against a running API. The
> „Mitglied aufnehmen" and „Zugehörigkeit beenden" dialogs, the `PersonPicker` and the
> „Gruppe pflegen" panel are all present but unproven. **Finish and verify slice 9 before
> starting slice 10.**

### Gate state at the pause

```
server:  dotnet build  → 0 warnings, 0 errors
         dotnet test   → 19 analyzer + 244 API tests passing   (117 before the phase)
web:     pnpm typecheck / test / lint / build → all clean, 945 files, zero suppressions
```

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
  setsid nohup dotnet ./Furria.Api.dll > <scratch>/api.log 2>&1 < /dev/null &

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
| W4 | Slices 4–17, two lanes | 🔄 paused — backend through 11, frontend through 7 |
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
2. **`/profile` regression** — assigned to frontend slice 4; verify it is actually fixed
   (`pnpm shot /profile` must not show the error state). `GET /api/auth/me` returns valid JSON;
   the client zod schema had not followed slice 1's membership DTO change.
3. **`KkToastProvider` mounting** — built in W3, must be mounted in
   `features/session/components/AppShell.tsx` or the first `useKkToast()` throws and no mutation
   can report success. Assigned to frontend slice 4; verify.
4. **Commit timestamps** — every commit of this phase falls in the weekday 04:00–17:00 window that
   the repo's convention avoids. Sweep with the global `fix-commit-times` skill before the PR.
5. **Umlaut folding in `GetPersonSearch`** (contract §4.41) is the least-pinned piece of the
   contract; if `ILike` + `GermanFold` proves insufficient it needs a migration decision nobody
   has taken.
6. **The `Since` chain-minimum** appears in six DTOs and is computed per row — watch for an N+1 on
   `/members/$personId`, `/groups/$groupId`, the hub and `/manage/roles`.
7. `de-DE-x-icu` **is** present in `postgres:18-alpine` and sorts correctly
   (`Adam < Ärger < Bach < Oehler < Öhler < Zöller`) — verified, not assumed. ADR-0008 records it.

---

## 6. Next actions

1. **Triage the working tree.** Anything uncommitted is an interrupted agent's. Run the gates,
   finish or discard.
2. **Finish W4**: backend slices 12–17, frontend slices 8–17, using the lane design in §4 and the
   per-slice rows in contract §11.
3. **Write the seed script** (§5.1) and run it against the dev database.
4. **W5 — the UX pass.** Screenshot every route (`/members`, `/members/$id`, `/groups`,
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
