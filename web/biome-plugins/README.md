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

## `noDesignSx.grit`

**Club-App only** (registered in the `apps/club-app/**` override, not in the root `plugins`
array). Flags design-bearing declarations inside an `sx` or `style` prop, so a Club-App page that
needs a styled thing cannot inline it and must add it to `@furria/ui` instead
([ADR-0007](../../docs/adr/0007-furria-ui-owns-every-visible-component.md)).

Banned keys: `color`, `backgroundColor`, `bgcolor`, `borderRadius`, `boxShadow`, every `font*`
key and every `border*` key. Banned values anywhere inside the object: raw hex colours
(`'#E11D2A'`, `"#fff"`) and raw px literals (`'12px'`).

Layout stays free: `m*`, `p*`, `gap`, `width`, `height`, `min/maxWidth`, `display`, `flex*`,
`alignItems`, `justifyContent`, `gridTemplate*`, `position`, `top/right/bottom/left`, `zIndex`,
`overflow`.

Caught: `sx={{ color: 'red' }}`, `sx={{ bgcolor: '#E11D2A' }}`, `sx={{ fontWeight: 900 }}`,
`sx={{ borderRadius: 14 }}`, `sx={{ boxShadow: '0 1px 2px black' }}`, `sx={{ padding: '12px' }}`,
the array form `sx={[{ m: 1 }, { color: 'red' }]}`, the callback form
`sx={(theme) => ({ backgroundColor: … })}`, nested selectors like `'&:hover': { color: … }`, and
the `style={{ color: 'red' }}` escape hatch.

Not caught (by design): an `sx` object hoisted into a module constant, template literals like
`` `${n}px` ``, and `rem`/`em`/`rgb()`/`hsl()` values. GritQL matches syntax, not values. The
`border.*` regex also flags `borderCollapse` and `font.*` flags every `font*` key; that is
intended bluntness, not a bug.

Only the Club-App is scoped: `apps/website/**` and `packages/ui/**` keep their `sx` colours, and
`@furria/ui` is where those colours belong.

## Enforced by built-in rules (no plugin needed)

Configured in `web/biome.json`:

| Rule | Enforces |
| --- | --- |
| `style/noRestrictedImports` | default imports from `@mui/material/<Component>`, never the barrel |
| `style/noRestrictedImports` (per-directory `overrides`) | dependency flow `lib/components → features → routes`; test files are exempt |
| `style/noRestrictedImports` (`apps/club-app/**` `overrides`) | Club-App imports only `Stack`, `Grid` and `Box` from `@mui/material`; `@mui/icons-material` is banned outright (icons come from `KkIcon`) |
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
- Regex groups must be non-capturing. A capture group inside `r"…"` binds a Grit variable, the
  plugin then fails at runtime with an INFO-level `regex pattern matched N variables, but
  expected 0`, matches nothing and `pnpm lint` still passes. Always write `(?:…)`.
- String literals are matched with the CST node `JsStringLiteralExpression()` plus a regex on its
  source text, quotes included (`r"^['\"]…['\"]$"`). `string()`, `string(fragment=$f)` and a
  metavariable inside quotes (`` `'$f'` ``) do not compile or never match.
- A `.grit` compile failure surfaces as `Error(s) during loading of plugins: Failed to compile the
  Grit plugin` with no location, so add one deliberate violation and verify the diagnostic fires
  before trusting a new plugin.
- Biome's default `--max-diagnostics` is 20, which silently truncates a verification run with many
  violations. Pass `--max-diagnostics=500` when checking a plugin.
- Per-override rule options **replace** the root options, they do not merge, so every Club-App
  override restates the full `paths` and `patterns` list. `plugins` arrays do accumulate across
  matching overrides. The root-level `{ "path": …, "includes": … }` plugin form produced zero
  diagnostics in Biome 2.5.4; register a scoped plugin through an override's `plugins` array.
