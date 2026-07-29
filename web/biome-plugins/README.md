# Biome Plugins

Custom lint rules as [GritQL plugins](https://biomejs.dev/linter/plugins). Registered via the
`plugins` array in `web/biome.json`; they run with `pnpm lint` and in the editor.

**Suppression is never allowed.** No `biome-ignore`, no lowered severity, no rule turned off to get
a file through — fix the code. If a rule is genuinely wrong, narrow the rule itself so the honest
case stops matching, and record why here.

Only reach for a plugin when no built-in rule covers the case — see "Enforced by built-in rules"
below.

## `useStackOverFlexBox.grit`

Flags a MUI `Box` that turns itself into a flex container instead of using `Stack`.

Caught: `<Box sx={{ display: 'flex' }} />`, `sx={[{ display: 'flex' }, sx]}`,
`sx={(theme) => ({ display: 'flex' })}`, `<Box display="flex" />`.

Not caught (by design): responsive toggles like `sx={{ display: { xs: 'flex', md: 'block' } }}`,
`display: 'inline-flex'`, non-`Box` components (`sx={{ display: 'flex' }}` on `DialogContent`,
`Grid`, `Card` etc. is the documented exception), and an `sx` object hoisted into a module constant
— GritQL matches syntax, not values.

## `useGridTwelveColumns.grit`

Flags `columns={…}` on MUI `Grid`. The 12-column base is fixed; approximate ratios with `size`
spans.

## `noManualMemoization.grit`

Flags `useMemo`, `useCallback`, `memo` and `React.memo`. React Compiler is enabled, so hand-written
memoization is banned.

## `noUnknownType.grit`

Flags `unknown` in every type position — annotations, generic arguments, and `as unknown` casts.
Validate at the boundary with a Zod schema instead. `any` is covered by the built-in
`suspicious/noExplicitAny` (raised to `error`), so the two together ban `any`, `unknown`, `as any`
and `as unknown as T`.

It matches the TS type node `TsUnknownType()`, so `z.unknown()` and identifiers named `unknown` are
not false positives.

## Enforced by built-in rules (no plugin needed)

Configured in `web/biome.json`:

| Rule | Enforces |
| --- | --- |
| `style/noRestrictedImports` | default imports from `@mui/material/<Component>`, never the barrel |
| `style/noRestrictedImports` (per-directory `overrides`) | dependency flow `lib/components → features → routes`; test files are exempt |
| `style/noDefaultExport` | no default exports (`*.config.ts` exempt) |
| `style/useBlockStatements` | curly braces on every branch |
| `style/useImportType` | `import type` for type-only imports |
| `style/noRestrictedGlobals` | no `crypto.randomUUID()` |
| `suspicious/noExplicitAny` (error) | no `any` |
| `style/noNonNullAssertion` | no `!` non-null assertions |
| `correctness/noNestedComponentDefinitions` | one component per file |
| `nursery/noFloatingPromises` | `void`-prefix fire-and-forget promises |

## GritQL notes

- Biome CST node patterns work and are more precise than snippets: `TsUnknownType()`, `TsAnyType()`.
- JSX attribute values must be matched as `columns={$v}`; bare `columns=$v` never matches.
- Named import clauses are not matchable (`import { $names } from $src` only matches default
  imports) — use `style/noRestrictedImports` for import bans.
- `contains … as $x` reports only the first match per node, so expect one diagnostic per element.
- Biome formats `.grit` files, so run `pnpm lint` after editing one.
