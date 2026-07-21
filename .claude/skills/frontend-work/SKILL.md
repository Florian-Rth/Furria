---
name: frontend-work
description: Mandatory rules for all React/TypeScript frontend work. Invoke before writing, planning or modifying any code in the web/ directory.
---

## Rules

### Components
- Declare all components as `FC<Props>` with named exports
- Use arrow functions exclusively — never use `function` keyword
- One component per file
- Never use default exports
- Never hardcode layout sx props (margin, padding) inside components — parent controls positioning via `sx` prop
- Extract all business logic into custom hooks — component bodies contain only hook composition and JSX rendering, never data fetching, transformations, or complex state management inline
- Static copy is a plain module constant or inline JSX text, never a hook — a hook that only returns a frozen constant is banned
- Never fetch in components — all data fetching goes through React Query hooks in the feature's `api.ts`

### Composition
- Compound composition is mandatory — every component is built with it, not just considered
- Strict separation into three kinds of parts, never mixed in one component: **logic** (hooks/context), **layout** (structural components with slots, no business logic), **UI** (presentational pieces that consume context/props)
- Build compound components in three layers in this order: (1) layout components with slots, (2) dedicated hooks or context for logic, (3) UI pieces that consume the context
- Use Context to eliminate prop drilling when 3+ props are threaded through children
- Use `Object.assign()` for compound component namespaces
- One context per component group, co-located in `*-context.ts`
- Context hook always throws if used outside provider
- Extract complex operations into `use-*-operations.ts` hooks, pass result via context

### MUI
- Use `Stack` instead of `Box` with `display: flex`
- Exception: use `sx={{ display: 'flex' }}` on MUI containers (DialogContent, etc.) to avoid extra wrapper divs
- Put Stack layout props (`alignItems`, `justifyContent`, `spacing`) in `sx`, not as component props — only `direction` is allowed as a prop
- Always use default imports from MUI, never named imports
- Use theme tokens exclusively — never hardcode px values, colors, or spacing
- When a MUI X TreeItem label needs an offset outline, box-shadow, or any overflowing visual (e.g. a drag-over highlight), render it via the TreeItem `slots.label` slot — never the `label` prop: the default label slot is `overflow: hidden` and clips anything drawn outside the box

### TypeScript
- Zero `any` and `unknown` tolerance — everything must be strictly typed
- All function parameters and return types must be explicitly typed
- Exception: return types on React components are implicit
- Never cast API responses with `as unknown as` or raw type assertions — always validate with Zod schemas
- Use `import type` for type-only imports

### React
- React Compiler is enabled — `useMemo`, `useCallback`, `React.memo` are banned
- Always use curly braces on all if/else branches, even single-line
- Never use `crypto.randomUUID()` — use incrementing counter or `Date.now() + Math.random()`
- Prefix fire-and-forget promises with `void`
- When state must reset in response to a prop change, use a render-phase update: track the previous prop value with useState, compare during render, and call setState synchronously — never use useEffect for this, as it causes an extra commit-phase render and a visible flicker

### Validation
- Validate all API responses at the boundary with Zod `.parse()`
- Types are inferred from Zod schemas via `z.infer<>`, never manually defined
- Schemas live in feature `schemas.ts` with their `z.infer<>` types exported right beside them; a separate `types.ts` exists only for shared types that have no schema
- Form schemas end with `...FormSchema`, form types end with `...Form`

### Code Style
- Biome for linting and formatting — not Prettier, not ESLint
- Zero warnings policy — treat all lint and TypeScript warnings as errors
- Never use deprecated APIs from any library — migrate to replacements immediately
- Never write code comments — make the code itself read like the comment through naming and extraction; the only allowed comment-syntax lines are functional directives (triple-slash references, biome-ignore, @ts-expect-error)

### Testing
- Vitest + Testing Library
- Main components must have unit tests — skip only when tests would just validate mocks
- Render components through `renderWithProviders` from `@/test/render` — never hand-roll provider wrappers in test files
- Co-locate test files with source
- Extract logic from hooks into pure functions and test those directly — never test by rendering mocked data through the UI and asserting the mock's values come back out

## Project Patterns

### Architecture
- `web/` is a pnpm workspace: deployable apps in `apps/*`, shared code in `packages/*`
- Shared packages (e.g. `@furria/ui`) are consumed as raw TypeScript source via `workspace:*` — no per-package build step
- The theme and shared primitives live in `packages/ui` — apps never define their own tokens
- ONE theme for all apps (Corporate Identity) — no per-app theme variants; base radius is 14 everywhere
- The theme is mounted only via `KkThemeProvider` from `@furria/ui` — app roots and `renderWithProviders` both use it
- Feature-based modules in `src/features/<name>/` with barrel exports via `index.ts`
- Dependency flow is unidirectional: `src/{lib,components,styles}` → `features` → `routes`
- Features never import from other features
- Routes compose features together
- All imports use `@/` path alias

### Feature Module Structure
- Each feature contains `index.ts` (barrel) plus only the parts it actually needs: `schemas.ts`, `api.ts`, `components/`, `hooks/` — never empty ceremony files
- External code imports only through the barrel file
- Internal files within a feature import freely from each other

### Data Fetching
- TanStack Query for all server state
- Each feature has `api.ts` with query hooks and query key objects
- React Context for UI state only, never for server data
- React Hook Form + Zod resolver for forms

### Component Structure
- Main components: a single `ComponentName.tsx`; give it a folder only when it has `internal/` parts — never a per-component `index.tsx` barrel (the feature `index.ts` is the only barrel)
- Internal components: in `internal/` subfolder, scoped to main component
- Tests only for main components, not internal ones
- Co-located: `ComponentName.test.tsx`

### Naming
- Component files: PascalCase — Hook files: kebab-case with `use-` prefix
- Zod schemas: PascalCase with `Schema` suffix
- Query keys: camelCase object
- Backend `...Dto` maps to frontend type without suffix

### Language
- German-only UI, no i18n framework (ADR-0002) — visible text is German, written directly in components
- Code identifiers, routes, IDs, props: English — always
- Never use internal domain terminology in user-facing copy — write self-explanatory German copy from terms the UI already teaches the user; internal terms stay in code and schema fields

### Layout & Dialogs
- Content pages use `PageLayout` from `@furria/ui`: `PageLayout` + `PageLayout.Header` + `PageLayout.Content`; full-bleed pages (hero/teaser) own their layout instead
- `dialogManager` / `snackbarManager` do not exist yet — build them when the second dialog/snackbar appears; until then use MUI `Dialog` directly
