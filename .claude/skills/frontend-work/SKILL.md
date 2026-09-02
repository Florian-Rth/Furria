---
name: frontend-work
description: Mandatory rules for all React/TypeScript frontend work. Invoke before writing, planning or modifying any React or TypeScript frontend code.
---

## Rules

### Components
- Declare all components as `FC<Props>` with named exports
- Use arrow functions exclusively — never use `function` keyword
- Define exactly one component per file — no exceptions (compound parts each get their own file); nested definitions are lint-enforced
- Never use default exports — lint-enforced
- Never hardcode layout sx props (margin, padding) inside components — parent controls positioning via `sx` prop
- Extract all business logic into custom hooks — component bodies contain only hook composition and JSX rendering, never data fetching, transformations, or complex state management inline
- Never put logic in JSX — no calls, conditionals, string building or inline handlers; hoist them into named consts in the component body, a pure function, or a hook
- Static copy is a plain module constant or inline JSX text, never a hook — a hook that only returns a frozen constant is banned
- Never fetch in components — all data fetching goes through React Query hooks

### Composition (the Compound Kit)
- Build every multi-part component as a compound kit, never a monolith
- Split parts one-per-file into three never-mixed kinds: logic (context + hooks), layout (slots: children + positional sx only), UI (presentational)
- Place parts under `internal/{layout,ui,logic}`; create `logic/` only when 3+ parts share runtime state
- Assemble the compound in one `ComponentName.tsx` of only imports plus one `Object.assign` attaching parts as dot-members off the layout root; define no component there
- Let only the root mount fixed decoration; never let a layout slot render its own UI — compose UI into slots at the call site
- Split a kit-consuming, fixed-props component into its own file; never put it in the assembly file
- Add a compound context only at 3+ shared consumers; a lone live consumer uses its React Query hook directly
- Keep one context per compound in `*-context.ts` with a hook that throws outside its provider
- Extract complex operations into `use-*-operations.ts` hooks, pass result via context

### MUI
- Use an existing MUI component before hand-rolling with `Box` + `sx`
- Use MUI `Grid` (12-column `container`/`size`) for multi-column layouts; approximate ratios with spans, never a custom `columns` base or magic spans — the `columns` prop is lint-enforced
- Use `Stack` instead of `Box` with `display: flex` — lint-enforced
- Exception: use `sx={{ display: 'flex' }}` on MUI containers (DialogContent, etc.) to avoid extra wrapper divs
- Put Stack layout props (`alignItems`, `justifyContent`, `spacing`) in `sx`, not as component props — only `direction` is allowed as a prop
- Always use default imports from MUI, never named imports — lint-enforced
- Never set `overflow: hidden` unless explicitly told to
- Use theme tokens exclusively — never hardcode px values, colors, or spacing
- Always source colors so they switch with the color scheme; never read a bare palette value that bakes one mode
- When a MUI X TreeItem label needs an offset outline, box-shadow, or any overflowing visual (e.g. a drag-over highlight), render it via the TreeItem `slots.label` slot — never the `label` prop: the default label slot is `overflow: hidden` and clips anything drawn outside the box

### TypeScript
- Zero `any` and `unknown` tolerance — everything must be strictly typed; lint-enforced, including `as any` / `as unknown as`
- All function parameters and return types must be explicitly typed
- Exception: return types on React components are implicit
- Never cast API responses with `as unknown as` or raw type assertions — always validate with Zod schemas
- Never use non-null assertions (`!`) — narrow the type or handle the absent case; lint-enforced
- Use `import type` for type-only imports — lint-enforced

### React
- React Compiler is enabled — `useMemo`, `useCallback`, `React.memo` are banned — lint-enforced
- Always use curly braces on all if/else branches, even single-line — lint-enforced
- Never use `crypto.randomUUID()` — use incrementing counter or `Date.now() + Math.random()`; lint-enforced
- Prefix fire-and-forget promises with `void` — lint-enforced
- When state must reset in response to a prop change, use a render-phase update: track the previous prop value with useState, compare during render, and call setState synchronously — never use useEffect for this, as it causes an extra commit-phase render and a visible flicker

### Validation
- Validate all API responses at the boundary with Zod `.parse()`
- Types are inferred from Zod schemas via `z.infer<>`, never manually defined
- Schemas live in a `schemas.ts` with their `z.infer<>` types exported right beside them; a separate `types.ts` exists only for shared types that have no schema
- Form schemas end with `...FormSchema`, form types end with `...Form`

### Code Style
- Biome for linting and formatting — not Prettier, not ESLint
- Zero warnings policy — treat all lint and TypeScript warnings as errors
- Many rules here are machine-enforced by Biome — suppression is NEVER allowed; never add a `biome-ignore`, never weaken or disable a rule to make code pass; fix the code instead
- Never use deprecated APIs from any library — migrate to replacements immediately
- Never write code comments — make the code itself read like the comment through naming and extraction; the only allowed comment-syntax lines are functional directives (triple-slash references, @ts-expect-error) — never `biome-ignore`

### Testing
- Never test the UI — no component tests, no route tests, no rendering, no DOM
- Never write a `*.test.tsx`; never use `renderHook`
- Never add a rendering or DOM test library
- Assert only the return value of a pure function for explicit inputs
- Never assert a module constant
- Never assert user-facing copy; assert the decision behind it
- Assert a formatter's output
- Never test a function without a conditional, loop, arithmetic or date math
- Never test a rule another layer owns
- Test schema coercion and normalisation only, never that a required field is required
- Build every fixture as a literal inside the test
- Extract logic into pure functions and test those directly
- One test file per module, co-located; `it.each` over branches
