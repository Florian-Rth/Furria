# Web Testing Conventions

This file defines how every test in `web/` is written. It is short on purpose: the policy is
one rule, eight corollaries, and a list of what that leaves in and out.

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
8. **Never test chrome — declare it and compile it.** A screen declares its layers to
   `KkScreen`; it renders no bar, no navigation, no tool row, no action bar of its own. What a
   screen kind may and may not declare is a union in `KkShell/screen-declaration.ts`, so a
   forbidden layer is a type error, not a failing assertion. See *The shell* below.

## What we test

Date, money and session formatting · sales-status and capacity derivation · the order-flow
step machine · matcher scoring, progress and exclusion · membership derivation from a birth
date · form payload building and search-param parsing · Zod coercion and normalisation ·
storage read/write helpers · geometry, layout and motion math · the shell's chrome maths
(below) · the copy guard (below).

## What we never test

Rendering · routing and redirects · a11y roles and labels · MUI wiring · React Query wiring ·
React Hook Form wiring · that a constant equals itself · that placeholder seed data has N
entries · that a required Zod field is required · that a screen declares the right layers.

## The shell

The club-app runs on one declarative mobile shell ([ADR-0009](../adr/0009-club-app-runs-on-one-declarative-mobile-shell.md)).
It moved every piece of chrome out of the pages, and that split its correctness across three
gates — none of which is a render test.

**The compiler owns the declaration.** `KkScreenProps` is a union over screen kind, so the
handoff's layer table and its prohibitions are type errors: `action` is `never` on a `list`,
`section` is `never` on anything that may carry an action bar (which is how navigation and
action bar are kept apart structurally rather than by a runtime check), `actions` narrows to a
single entry while a screen is searching, and a `fullscreen` screen cannot omit its `origin`.
There is nothing to assert here that `pnpm typecheck` does not already prove, and a test that
mounted a screen to check which layers appeared would be asserting the type system.

**Pure modules own the maths.** Every value the chrome animates or measures is computed by a
module a test imports directly, never inside a component:

| Module | Answers |
|---|---|
| `internal/chrome-density.ts` | `chromeDensityAt(scrollOffset, motion)` → 0…1, and `chromeMaterialAt(density)` → tint, blur, hairline and shadow at that density, both schemes |
| `KkShell/internal/logic/handover.ts` | `handoverAt(scrollOffset, motion)` → the header's fade and drift against the bar title's rise |
| `KkShell/internal/logic/keyboard-inset.ts` | `keyboardInsetOf(metrics)` → the occluded pixels, `0` below the threshold |
| `KkShell/internal/logic/action-bar-height.ts` | `actionBarHeightOf(action)` → the card height, which is also the track's foot clearance |
| `lib/use-letter-position.ts` | `hasPassedTheToolbar(clearance)` → whether a letter divider has taken the chrome line |

`motion` is the argument that makes reduced motion testable: under
`prefers-reduced-motion` the shell passes `'instant'` and both ramps collapse to their end
states, which is an assertion, not a screenshot.

**Screenshots own the layout.** Neither gate can see that a correct declaration renders badly
on a real viewport, and both chrome defects that survived the build were found this way: five
filter chips wrapped to a second row inside a 44 px tool row, and the letter rail overflowed
its band on a 705 px viewport while every shot at 844 px looked right. So chrome work ends with

```bash
pnpm shot /members       # phone/desktop × light/dark → web/tools/screenshot/out
```

and the shots are looked at. This is the same sentence as *Running*'s last line, made binding
for one kind of change.

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
methods, QR codes, door sales, a board framing, a `passive` membership, a group that
does not exist — and also checks the copy those modules *derive* per lifecycle state, plus the
messages a rejected buyer form produces.

It passes when copy changes and fails only when a forbidden fact appears, which is why it does
not violate the rule's intent. Its scopes are explicit module lists, not globs: a pattern that
is forbidden in the ticket copy (`Reihe 3`) may be ordinary German prose elsewhere. Add a
module to a scope deliberately; never widen a scope to silence a failure.

## Running

```bash
cd web
pnpm test          # every package, ~30s
pnpm typecheck     # this and pnpm build are what catch wiring breaks
pnpm shot /route   # needs a dev server and the API; the only gate that sees the layout
```

`pnpm build` and `pnpm typecheck` carry the weight the deleted render tests used to: they
catch a component that does not compile, a route that does not resolve, a prop that no longer
exists. Nothing proves the app *looks* right — that is checked by looking at it.
