---
title: Test Strategy Web
slug: testing-strategy
type: cross-cutting
status: shipped
scope: web/apps/website, web/packages/ui, docs/web/TESTING.md
depends-on: []
adrs: []
---

## What & Why

The web test suite grew to **124 files / 1021 cases / 4m01s wall clock**. Two costs, both
paid on every agent run:

- **Wall clock.** A UI render case costs ~2.2s; a pure-function case costs ~0.002s. The
  ratio is ~1000×. Twelve render files account for 92% of the runtime.
- **Token churn.** Roughly 350 cases assert module constants, German copy or placeholder
  seed data. Every copy edit breaks a test, so every copy edit becomes a read-fix-rerun
  cycle instead of an edit.

**Decision (user, 2026-08-20): the UI is not tested. Only logic — pure functions — is
tested.** No component tests, no route tests, no rendering, no Testing Library.

## Measurements (baseline, before any change)

| Run | Files | Cases | Wall |
|---|---|---|---|
| Full suite (`pnpm -r test`) | 124 | 1021 | **4m01s** |
| Logic only (`--exclude '**/*.test.tsx'`), happy-dom | 90 | 846 | 57.0s |
| Logic only, `environment: 'node'`, no setupFiles | 90 | 839 (+7 fail) | **30.3s** |

Breakdown of the logic-only node run: `tests 2.0s`, `import 50s`, `transform 4.1s`,
`environment 0.1s`. Actual assertion work is ~2 seconds. Everything else is module loading
and per-file fixed cost — so **file count is the remaining lever**, not case count.

Rejected on evidence: `userEvent.setup({ delay: null })` on the worst file (`ApplyPage`,
66s) measured 38.0s vs a 35.7s isolated baseline — **no improvement**. The cost is MUI
re-rendering the form per keystroke; no knob fixes it. Confirms the decision above.

## The rule

> A test asserts the return value of a pure function for explicit inputs. Nothing else.

Corollaries, each mechanically checkable:

1. **No `*.test.tsx` exists.** No `@testing-library/*`, no `renderHook`, no DOM assertions.
2. **Never assert a module constant.** If the subject of the assertion is an exported
   `const` (copy, label, list, `SEEDED_*` fixture) rather than a function's output, delete
   the test. Typecheck already guarantees its shape.
3. **Never assert German copy.** Assert the decision, not the wording:
   `deriveOrderFlowAction(1, false).kind === 'step'`, never its label string.
4. **Don't test a function with no branch.** If the body has no conditional, loop,
   arithmetic or date math — e.g. `buildEventHref = (id) => \`/events/${id}\`` — there is
   nothing to get wrong that the type system misses.
5. **Fixtures are literals, built in the test.** Import `SEEDED_*` only when a literal is
   genuinely impractical, and never as the subject.
6. **One test file per module, `it.each` over branches.** Files carry fixed cost; cases
   don't.

## What we do test

Date and money formatting · sales-status and capacity derivation · order-flow step machine
· matcher scoring and progress · membership derivation from birth date · form payload
building and search-param parsing · Zod coercion/normalisation (not "required is
required") · storage read/write helpers · geometry and layout math · the `EMBARGOED_MECHANICS`
copy guard, as **one** sweep over all copy modules rather than 8 sprinkled assertions.

## What we never test

Rendering · routing and redirects · a11y roles and labels · MUI wiring · React Query
wiring · React Hook Form wiring · that a constant equals itself · that placeholder seed
data has N entries.

## Harness changes

- `apps/website/vite.config.ts`: `test.environment: 'node'`, drop `setupFiles`.
- `packages/ui/vitest.config.ts`: same.
- Delete `src/test/`: `render.tsx`, `setup.ts`, `form.ts`, `apply-form.ts`, `changelog.ts`,
  `head.ts`, `viewport.ts` (`viewport.ts` is already dead). Keep `embargo.ts`.
- Drop from both `package.json`s and the `pnpm-workspace.yaml` catalog:
  `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`,
  `happy-dom`.
- `src/lib/runtime-config.ts` reads `window.__RUNTIME_CONFIG__` at module scope, which
  breaks `api-fetch.test.ts` under `node`. Fix by passing the base URL into `apiFetch`
  instead of importing a module-level constant (fallback: a per-file
  `// @vitest-environment happy-dom` pragma, at a cost of ~0.5s).

## Per-file verdicts

### Kill — every UI test (31 files, 175 cases)

All `*.test.tsx`: `components/NotFoundPage`, 6 under `features/events/components/`,
`GroupMatcherSection`, `EventsTeaser`, 6 under `features/membership/components/`,
`PreviewAccessDialog`, 13 under `routes/`, and `packages/ui`'s `KkPhoto` + `KkStatRow`.

### Kill — constant/fixture-only files (11 files, 98 cases)

`club/{header,narrenruf,recruit,season}-content` ·
`events/{order-confirmation,order-flow,order-summary}-content` ·
`membership/{closing,contact}-content` · `lib/seed/{groups,group-matcher}`

Verified: none of these import a single function from the module under test.

### Trim to logic only (17 files, 258 → ~46 cases)

| File | now | keep |
|---|---|---|
| `news-content` | 51 | `parseInlineBold`, `deriveReadingTime`, `sortPostsByDateDesc`, `selectRelatedPosts`, `resolveArchiveSession` |
| `gallery-content` | 49 | `selectOlderSessionGroups`, `buildAlbumPhotoEntries`, `selectNewestAlbumForEventType`, `countPhotos`, `sortAlbumsByDateDesc` |
| `seed/events` | 30 | `buildEvent` status/capacity derivation, `buildCancelledEvent` |
| `apply-content` | 24 | `buildApplySummaryRows` |
| `seed/orders` | 17 | `buildOrder` |
| `matcher-content` | 16 | `buildExclusionReason`, `resolveRecruitingBadge`, `buildMatchPercentageLabel` |
| `faq-content` | 15 | id builders (1 case) |
| `club/groups-content` | 11 | `buildGroupProfiles`, `resolveGroupTint` |
| `steps-content` | 10 | `buildJoinStepNumeral` |
| `club/people-content` | 8 | `resolvePersonTint` |
| `changelog-content` | 7 | `sortEntriesByDateDesc` |
| `club/chronik-content` | 6 | `resolveMilestoneTint` |
| `club/story-content` | 5 | `buildStoryStats` |
| `landing/hero-content` | 3 | `buildHeroStats` |
| `join-content` | 3 | `buildJoinStats` |
| `landing/events-teaser-content` | 2 | `deriveEventDisplay` |
| `landing/ticker-content` | 1 | `buildTickerPhrases` |

### Trim copy assertions out (9 display files, 107 → ~45 cases)

`event-detail-display` · `event-display` · `hero-display` · `next-event-display` ·
`order-confirmation-display` · `order-flow-display` · `order-summary-display` ·
`sales-status-display` · `ticket-panel-display`

Keep the branching functions (`deriveTicketPanelFace`, `deriveOrderFlowAction`,
`deriveSalesUrgency`, `deriveNextEventFace`, `selectOtherEventsInSession`,
`deriveProximityLabel`, `deriveOrderFlowNotice`, `deriveOrderFlowCapacity`). Drop the
single-expression string builders (`buildEventHref`, `deriveOrderFlowBackLabel`,
`buildOrderFlowDocumentTitle`, `deriveOrderTotalLabel`, …) per rule 4.

### Keep as-is (~53 files)

Pure branching logic, already correct in style and effectively free to run: `countdown`,
`events-json-ld`, `order-buyer`, `order-flow-steps`, all four `schemas`, the `photo-*`
family, `scoring`, `match-reasons`, `apply-handoff`, `session-storage`, `matcher-progress`,
`matcher-result`, `step-motion`, every `use-*` (these export pure functions and do **not**
render), `api-fetch`, `club`, `color-mode`, `date`, `event-tint`, `money`,
`runtime-config`, `group-interests`, `membership-derivation`, `apply-fallback`,
`apply-payload`, `apply-search`, `birth-date`, `read-state`, `changelog-storage`,
`dialog-open-state`, `changelog-dialog-a11y`, `chip-nav-mask`, `reveal-geometry`,
`theme-color`, and `packages/ui`'s three geometry tests.

## Documentation

- **New `docs/web/TESTING.md`** — the rule, the corollaries, the do/don't lists, the
  measured rationale. Mirrors the role `docs/server/TESTING.md` plays for the backend.
- **The `frontend-work` skill's Testing block contradicts this policy** — it says *"Main
  components must have unit tests"* and *"Render components through `renderWithProviders`"*.
  **This plan must not edit it.** Files under `.claude/skills/` are the user's tooling, shared
  across every project; only a direct instruction from the user authorises a change there.
  Surface the contradiction and propose replacement text — never edit. Project-specific test
  policy lives in `docs/web/TESTING.md`, never in a skill.
- `CLAUDE.md`: add `docs/web/TESTING.md` to the repo-layout tree.

## As built (2026-08-20)

| | before | projected | **actual** |
|---|---|---|---|
| Test files | 124 | 82 | **83** |
| Cases | 1021 | ~470 | **565** |
| Test LOC | 10 444 | — | **5 473** |
| Wall clock (`pnpm -r test`) | 4m01s | ~30s | **29.7s** |
| `packages/ui` alone | 6.5s | — | **0.8s** |
| Testing Library / happy-dom | 4 deps | none | **none** (21 packages removed) |

`pnpm lint` and `pnpm typecheck` are clean; all 565 cases pass.

Two deviations from the projection, both deliberate:

- **565 cases, not ~470.** The projection was derived from function counts; the trims were
  done per *branch*. Every genuine branch was kept — `parseInlineBold` keeps six rows,
  `deriveProximityLabel` keeps five boundaries, the `sales-status-display` mapping tables keep
  all seven states. Hitting the projected number would have meant deleting real coverage. Case
  count is not the cost anyway: assertions are 1.9s of the 25.4s website run.
- **83 files, not 82.** `src/test/copy-guard.test.ts` was added (see below), and
  `src/test/embargo.ts` was deleted rather than kept.

### Second pass (same day)

The first pass left the suite disagreeing with its own rule: twelve files held one or two cases
for functions with no branch, and two files tested seed-builder derivations the plan assigns to
the backend. Both were cut — but only after checking each candidate against corollary 4 rather
than deleting to hit a number.

| verdict | files | why |
|---|---|---|
| Deleted — no branch at all | 6 | `story-content`, `hero-content`, `join-content`, `ticker-content`, `events-teaser-content`, `membership/faq-content` — array literals and template strings |
| Deleted — backend-owned rule | 2 | `seed/events` (15 cases), `seed/orders` (7) |
| **Kept** — has a real branch | 6 | `steps-content` (`index + 1` + `padStart`), `people-content` (`index % 3` + nullish fallback), `chronik-content` (`if index === 0`), `changelog-content` (sort comparator — direction is invertible), `changelog-dialog-a11y` (`unreadCount === 0` ternary), `lib/event-tint` (`switch`) |

Six of the twelve candidates turned out to have genuine branches. The shaping list was
over-eager; the rule, applied honestly, keeps them.

Also trimmed: `membership/schemas` 13 → 9 and `changelog/schemas` 6 → 2 (dropping
required-is-required cases per the Zod rule, keeping the cross-field guardian refinements, the
postal-code regex, the birth-date bounds, the icon allow-map and the ISO-date check), and
`lib/date.test.ts` 31 → 23, consolidated into one `it.each` table for the fourteen single-argument
formatters plus separate blocks for the timezone functions.

| | after pass 1 | **after pass 2** |
|---|---|---|
| Test files | 83 | **75** |
| Cases | 565 | **520** |
| Test LOC | 5 473 | **5 068** |
| Wall clock | 29.7s | **~17s** (three runs: 17.1s, 16.8s, 18.7s) |
| Cumulative import time | 47s | **23s** |

The speed gain (~12s) far exceeded the 8 files' predicted fixed cost (~4s), because the two
seed tests and the deleted content tests each pulled a large module graph — the full seed data
and MUI's `createTheme`. Import time, not assertion time, is the whole cost: assertions are
0.9s of the 14.5s website run. Four tests still import MUI runtime for a `Theme` argument
(`news-content`, `groups-content`, `people-content`, `chronik-content`) and are the remaining
lever if this ever needs to get faster.

### What the suite actually covers

Asked what the tests prove when there is no backend, the honest split across the 75 files is:

- **~32% never touches a backend** — `lib/date` (Berlin CET/CEST, DST boundaries, wall-clock
  day preservation), geometry and motion math, browser storage, URL param parsing, JSON-LD.
- **~16% is the API contract** — the Zod schemas, `api-fetch` error mapping, `apply-payload`,
  the `resolve*Source` loading/error resolvers. These matter *more* once the endpoints exist:
  they are the only thing that will catch a backend field rename, and they are what makes the
  seed→API swap one line.
- **~45% derives view state from server-shaped data** — the `*-display` files, the matcher, the
  gallery and news selectors. They survive the swap because the seed is deliberately shaped as
  the future payload.
- **~4% was placeholder-testing-itself** — now deleted.

Two things worth remembering about that split:

- **The matcher scoring (19 cases) is permanent frontend logic by design** —
  `plan/website/feature-group-matcher.md`: *"the positions are authored content per group, the
  scoring is a pure, tested function"*. The Wahl-O-Mat scale, per-group normalisation,
  tie-breaks and divide-by-zero guards all run in the browser.
- **`membership-derivation` (17 cases) tests a rule the server will own** —
  `plan/website/feature-membership-funnel.md`: *"The POST body carries no membership type and
  no fee. Both stay derived on the server"*. The frontend computes fee reduction/active and the
  fee only to show it back live in the form. Kept deliberately: a wrong preview is a
  user-visible bug, but it guards a preview, not the truth.

Where the club has not decided (**seat allocation**, **entry check** in `CONTEXT.md`)
there is no rule to test at all — which is exactly why `copy-guard.test.ts` exists: the only
assertable thing about an undecided mechanic is that no surface claims it.

### Corrections to the shaping analysis

- **The 12 `use-*.test.ts` files do not render hooks.** The shaping notes listed them as
  hook-render tests to delete. They import pure functions exported from the hook file
  (`resolveOrderSource`, `computeOverflowEdges`, `selectMatcherStepView`) and are exactly the
  pattern the rule wants. All kept.
- **`buildEvent`, `buildOrder` and `buildGroupProfiles` carry real logic**, so `seed/events`
  and `seed/orders` were trimmed rather than deleted: the sales-status derivation, the
  10%-scarcity threshold and the seed-consistency guards all survive. Only `seed/groups` and
  `seed/group-matcher` were fixture-only and deleted outright.
- **The scattered copy guards were worth keeping, but not scattered.** `EMBARGOED_MECHANICS`
  plus the per-file editorial guards ("never names a board", "never calls a membership type
  passive", "never names a group the club does not have") are not change-detectors — they
  catch invented club facts, the thing `CONTEXT.md` exists to prevent. They are now one file.

### The copy guard

`apps/website/src/test/copy-guard.test.ts` replaces the 8 sprinkled `EMBARGOED_MECHANICS`
assertions and the editorial guards that were embedded in the deleted content tests. It sweeps
named copy modules, the copy those modules *derive* per lifecycle state
(`deriveOrderFlowNotice`, `deriveTicketPanelNote`), and the messages a rejected buyer form
produces. Verified to fail on an injected `'Wähle deinen Platz im Saalplan.'` and to pass once
reverted.

Its scopes are **explicit module lists, not globs** — a first attempt at a global sweep tripped
on six false positives where the same word is ordinary German prose: `Reihe` in gallery album
text, `Kostüm` in the events FAQ, `Vorstand` in a satirical news post, `Technik`/`Showtanz` as
album subjects, and `"Kein PDF zum Ausdrucken"` in the join steps — an explicit *denial* of the
mechanic. The regexes were tightened accordingly (`Reihe` → `Sitzreihe|Reihe \d`).

### Source changes outside tests

- `src/lib/runtime-config.ts` read `window.__RUNTIME_CONFIG__` unguarded, which is the only
  thing that broke under `environment: 'node'`. `readApiBaseUrl` now goes through a
  `readRuntimeConfig` helper that returns `undefined` outside a browser. No test pragma, no DOM.

## Risks accepted

- Nothing proves the app mounts, a route resolves, or a form submits. That is the explicit
  trade: `pnpm build` + `pnpm typecheck` catch wiring breaks; the rest is caught by looking
  at the app.
- Deleted render tests are recoverable from git history if the position is revisited.

## Execution order

1. Delete the 31 UI tests + the 11 constant-only files; strip the harness and deps.
2. Switch both configs to `environment: 'node'`; fix `runtime-config`'s module-level
   `window` read.
3. Trim the 17 content/seed files and the 9 display files.
4. Fold `EMBARGOED_MECHANICS` into one sweep test.
5. Write `docs/web/TESTING.md` and update `CLAUDE.md`. Never edit a skill from a plan.
6. Measure; record the as-built numbers here.
