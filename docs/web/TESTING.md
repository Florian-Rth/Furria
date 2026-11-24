# Web Testing Conventions

This file defines how every test in `web/` is written. It is short on purpose: the policy is
one rule, two binding limits, ten corollaries, and a list of what that leaves in and out.

## The rule

> **A test asserts the return value of a pure domain function for explicit inputs. Nothing else.**

*Domain* means the rule would still be true if there were no UI at all. A pure function that
computes what a screen shows — a view model, a hub/board/tile selector, a label, tone or
variant, display sorting or grouping, layout, geometry, scroll, scrub, gesture, animation or
stage machine, player controls — is UI logic and is not tested, however pure it is. No mocks,
fakes, stubs or spies (`vi.fn`, `vi.mock`, `vi.spyOn`, `vi.stubGlobal`, fake servers, storage
or transports): a test against a fake tests the fake. If in doubt, it is UI — don't test it.

The UI is not tested. There are no component tests, no route tests, no rendering, no Testing
Library, no DOM. `vitest` runs on `environment: 'node'` with no setup file.

## The two binding limits

1. **Never test the implementation.** A test sees observable behaviour of logic through its
   public function — inputs in, result out. It never reaches into internals, never asserts
   call order, call counts or which helper ran, and never pins the structure of the code.
   A refactor that keeps behaviour must keep every test green.
2. **Never test text.** No assertion on German copy, labels, sentences or a formatted string
   whose value is its wording. Logic that *selects* between texts is tested by asserting the
   selected key, variant or structured result — never the wording. If the selection is real
   logic and the function returns the wording, restructure it to return a discriminant first
   (a `…Kind`/`…Variant` function plus a copy map) and test the discriminant; if it is not
   worth restructuring, it is not tested.

What survives is domain logic: business rules, calculations (money, stock, scoring, counts,
music/count math), date and time math, scheduling and conflict rules, boundary parsing that
coerces data, and security guards (return-to, token parsing).

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
   `deriveOrderFlowAction(1, false).kind === 'step'`, never its label string. A **formatter**
   whose output is computed — a date, a time, an amount, a session year such as `2026/27` —
   is pinned; the computed part is the subject, not surrounding words.
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
9. **A tested module is a leaf.** It imports no React, MUI, motion, React Query or router at
   runtime, and from `@furria/ui` only leaf modules without React (`@furria/ui/tokens`,
   `@furria/ui/group-tone`, `@furria/ui/theme`) or `import type`. Pure logic a hook uses lives
   in its own module; the hook imports it, the test imports it.
10. **One concept, one implementation, one test.** When the same rule exists twice (an id
   parser, a row affiliation, a motion ramp), the copies are merged into one shared module
   and that module is tested once — `lib/positive-id.ts`, `lib/person-rows.ts`,
   `internal/ramp.ts`.

## What we test

Money, stock and forecast calculations · session, season and Berlin date math · matcher
scoring · membership, age and consent rules · archive, permission and self-lockout rules ·
running-order planning and conflict rules · studio music, count, cut and choreography data
math, save plan and merge · Zod coercion and normalisation · open-redirect and token guards.

## What we never test

Rendering · routing and redirects · a11y roles and labels · MUI wiring · React Query wiring ·
React Hook Form wiring · view models and display selectors · layout, geometry, gestures,
scroll, scrub and motion maths · animation and stage machines · HTTP client plumbing ·
anything that needs a mock or fake · copy, labels and sentences · that a constant equals itself · that
placeholder seed data has N entries · that a required Zod field is required · that a screen
declares the right layers · a template string, a trim, a zero-pad or a lookup.

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

**Nothing else owns the chrome.** Chrome maths (density, handover, keyboard inset) lives in
pure modules so the components stay thin, but it is presentation and is not tested.

**Screenshots own the layout.** Neither gate can see that a correct declaration renders badly
on a real viewport, and both chrome defects that survived the build were found this way: five
filter chips wrapped to a second row inside a 44 px tool row, and the letter rail overflowed
its band on a 705 px viewport while every shot at 844 px looked right. So chrome work ends with

```bash
pnpm shot /members       # phone/desktop × light/dark → web/tools/screenshot/out
```

and the shots are looked at. This is the same sentence as *Running*'s last line, made binding
for one kind of change.

## The studio

`@furria/studio` ([ADR-0035](../adr/0035-the-studio-is-its-own-package-and-owns-its-domain-components.md))
follows the same split. Its domain — music timeline and counts, cuts and final-track
mapping, formation and movement data, the document's patches, history, save plan and run
([ADR-0036](../adr/0036-the-studio-edits-a-local-document-saved-in-the-background.md)) — is
tested as pure modules. Gestures, timeline/stage geometry, scrub, zoom, practice controls and
desk state are UI and are not.

**Devices own the feel.** Whether a drag lifts, glides and snaps right on iPhone, Pixel and
iPad Safari is not something Chromium or a test can see. Touch work ends on the devices, and
the open checks live in one list at the end of
[RFC 0003](../rfcs/0003-studio-package-and-native-touch.md#device-checks).

## Writing testable code

The rule is a constraint on the code, not just the tests. When logic is worth testing, it
must already be a pure function in a module a test can import — never inline in a component
or trapped inside a hook body. This is the same split the `frontend-work` skill requires:
extract logic into pure functions, keep hooks as thin wiring around them, keep components as
hook composition plus JSX. The pure functions a hook uses live in their own leaf module
(corollary 9); the test imports that module and never the hook file, which would load React.

If a behaviour cannot be tested under this rule, that is a signal the logic is in the wrong
place — extract it, don't reach for a renderer.

## The test runner

Each package runs vitest from its own `vitest.config.ts`, never from `vite.config.ts`: the dev
config carries the TanStack Router plugin (which regenerates `routeTree.gen.ts`), the React
plugin and the React Compiler Babel preset, none of which a pure-function test needs. The
test config holds only the `@` alias, `environment: 'node'`, `pool: 'threads'` and
`isolate: false` — pure modules share no state, so one module graph per worker is safe and
skips re-importing it per file. Nothing is stubbed or mocked.

## Running

When to run what is the Validation policy in `CLAUDE.md`; in short, affected files and touched
packages locally, full suites in CI.

```bash
cd web
pnpm --filter @furria/<pkg> test <file>   # inner loop and end of slice
pnpm --filter @furria/<pkg> typecheck     # this and pnpm build are what catch wiring breaks
pnpm test                                 # every package, ~10s — cross-cutting changes only
pnpm shot /route   # needs a dev server and the API; the only gate that sees the layout
```

`pnpm build` and `pnpm typecheck` carry the weight the deleted render tests used to: they
catch a component that does not compile, a route that does not resolve, a prop that no longer
exists. Nothing proves the app *looks* right — that is checked by looking at it.
