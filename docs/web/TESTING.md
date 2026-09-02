# Web Testing Conventions

This file defines how every test in `web/` is written. It is short on purpose: the policy is
one rule, six corollaries, and a list of what that leaves in and out.

## The rule

> **A test asserts the return value of a pure function for explicit inputs. Nothing else.**

The UI is not tested. There are no component tests, no route tests, no rendering, no Testing
Library, no DOM. `vitest` runs on `environment: 'node'` with no setup file.

## Why

Measured on the suite this policy replaced (124 files, 1021 cases, **4m01s**):

| | cost per case |
|---|---|
| A render case driving `userEvent` | ~2.2s |
| A pure-function case | ~0.002s |

Twelve render files accounted for 92% of the runtime. The worst single file — a form render
that typed into six fields — cost 66s on its own. `userEvent.setup({ delay: null })` was
measured and made no difference: the cost is MUI re-rendering the form on every keystroke, so
no knob fixes it. Deleting UI tests took the suite to **~30s**.

The second cost is not time. Around 350 cases asserted module constants, German copy or
placeholder seed data, so every copy edit broke a test. For an agent that means a
read-fix-rerun cycle per edit instead of an edit. Those tests are deleted too — not for
speed, but so the suite only fails when behaviour is wrong.

## Corollaries

1. **No `*.test.tsx` exists.** No `@testing-library/*`, no `renderHook`, no DOM assertions.
   These packages are not installed; do not add them.
2. **Never assert a module constant.** If the subject of the assertion is an exported `const`
   — copy, a label, a list, a `SEEDED_*` fixture — delete the test. TypeScript already
   guarantees its shape.
3. **Never assert German copy.** Assert the decision, not the wording:
   `deriveOrderFlowAction(1, false).kind === 'step'`, never its label string. The exception is
   a **formatter**, whose output is computed rather than written — `formatLongDate`,
   `deriveReadingTime`, `deriveSalesStatusLabel`. Pin those.
4. **Don't test a function with no branch.** If the body has no conditional, loop, arithmetic
   or date math (a bare template string such as `buildEventHref`) — there is nothing to get wrong
   that the type system misses. The test is noise.
5. **Fixtures are literals, built in the test.** Import a `SEEDED_*` fixture only when a
   literal is genuinely impractical, and never as the subject of the assertion.
6. **Never test a rule the plan assigns to the backend.** The seed builders in
   `src/lib/seed/` derive values the API will own — `buildEvent` computes `salesStatus` from
   the presale window, `buildOrder` multiplies out a total. `plan/website/events/foundation-events-data.md`
   states outright that `salesStatus` is *"a backend-owned lifecycle enum"* and that the
   `almostSoldOut` threshold is *"a placeholder constant … the backend will own the real
   rule"*. Testing a placeholder against itself proves nothing and dies with the seed. The
   display functions that *consume* the derived value are tested; the builder that fakes it is
   not.
7. **One test file per module, `it.each` over branches.** Files carry a fixed cost of roughly
   half a second in module loading; cases are effectively free. Prefer more cases in fewer
   files.

## What we test

Date, money and session formatting · sales-status and capacity derivation · the order-flow
step machine · matcher scoring, progress and exclusion · membership derivation from a birth
date · form payload building and search-param parsing · Zod coercion and normalisation ·
storage read/write helpers · geometry, layout and motion math · the copy guard (below).

## What we never test

Rendering · routing and redirects · a11y roles and labels · MUI wiring · React Query wiring ·
React Hook Form wiring · that a constant equals itself · that placeholder seed data has N
entries · that a required Zod field is required.

## Writing testable code

The rule is a constraint on the code, not just the tests. When logic is worth testing, it
must already be a pure function in a module a test can import — never inline in a component
or trapped inside a hook body. This is the same split the `frontend-work` skill requires:
extract logic into pure functions, keep hooks as thin wiring around them, keep components as
hook composition plus JSX. A hook file may export the pure functions it uses (see
`use-order-source.ts`, `use-matcher-progress.ts`); the test imports those directly and never
renders the hook.

If a behaviour cannot be tested under this rule, that is a signal the logic is in the wrong
place — extract it, don't reach for a renderer.

## The copy guard

`apps/website/src/test/copy-guard.test.ts` is the one sanctioned exception to corollary 2. It
sweeps named copy modules for facts the club has **not decided** — seat plans, payment
methods, QR codes, an Abendkasse, a Vorstand framing, a `passiv` Mitgliedschaft, a Gruppe that
does not exist — and also checks the copy those modules *derive* per lifecycle state, plus the
messages a rejected buyer form produces.

It passes when copy changes and fails only when a forbidden fact appears, which is why it does
not violate the rule's intent. Its scopes are explicit module lists, not globs: a pattern that
is forbidden in the Karten copy (`Reihe 3`) may be ordinary German prose elsewhere. Add a
module to a scope deliberately; never widen a scope to silence a failure.

## Running

```bash
cd web
pnpm test          # every package, ~30s
pnpm typecheck     # this and pnpm build are what catch wiring breaks
```

`pnpm build` and `pnpm typecheck` carry the weight the deleted render tests used to: they
catch a component that does not compile, a route that does not resolve, a prop that no longer
exists. Nothing proves the app *looks* right — that is checked by looking at it.
