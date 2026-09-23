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

It matches three shapes:

1. An `sx={…}` or `style={…}` JSX prop.
2. An object property literally named `sx`, wherever it sits, so
   `slotProps={{ root: { sx: … } }}`, `componentsProps` and a hoisted `const props = { sx: … }`
   are covered as well.
3. A `color=` or `bgcolor=` JSX attribute on any element. MUI 9 declares no system props on `Box`,
   `Stack` and `Grid`, so `pnpm typecheck` already rejects `<Box fontWeight={900} />` and
   `<Box bgcolor="#E11D2A" />`; `color` is the one that slips past the compiler because it is a
   legacy HTML attribute, and `bgcolor` is listed with it for defence in depth.

Banned keys: `color`, `backgroundColor`, `bgcolor`, `boxShadow`, `textShadow`, `letterSpacing`,
`textTransform`, `lineHeight`, `opacity`, `filter`, `backdropFilter`, `fill`, `stroke`, plus every
`background*`, `font*`, `border*`, `outline*` and `textDecoration*` key.

Banned values, in a string **or** a template literal, anywhere inside the object: a hex colour
(`'#E11D2A'`, `` `#E11D2A` ``, `'drop-shadow(0 0 2px #000)'`), a raw dimension in `px`, `rem` or
`em` in any casing (`'12px'`, `'12PX'`, `'1.5rem'`, `` `${size}px` ``), a colour function
(`rgb()`, `rgba()`, `hsl()`, `hsla()`, `oklch()`, `oklab()`, `color-mix()`) and a bare CSS colour
name (`'red'`, `'gold'`, `'currentColor'`, …).

Layout stays free: `m*`, `p*`, `gap`, `width`, `height`, `min/maxWidth`, `display`, `flex*`,
`alignItems`, `justifyContent`, `gridTemplate*`, `position`, `top/right/bottom/left`, `zIndex`,
`overflow`.

Caught: `sx={{ color: 'red' }}`, `sx={{ bgcolor: '#E11D2A' }}`, `sx={{ fontWeight: 900 }}`,
`sx={{ borderRadius: 14 }}`, `sx={{ opacity: 0.5 }}`, `sx={{ letterSpacing: 2 }}`,
`sx={{ gap: 'rgb(225, 29, 42)' }}`, `sx={{ padding: '12px' }}`, the array form
`sx={[{ m: 1 }, { color: 'red' }]}`, the callback form `sx={(theme) => ({ backgroundColor: … })}`,
nested selectors like `'&:hover': { color: … }`, `<Box color="red" />`, and the
`style={{ color: 'red' }}` escape hatch.

Only the Club-App is scoped: `apps/website/**` and `packages/ui/**` keep their `sx` colours, and
`@furria/ui` is where those colours belong.

### Known bypasses

GritQL matches syntax, never values, so anything a Club-App file does not spell out at the `sx`
site is out of reach. These are the holes we know about and accept:

- **A hoisted style object.** `const styles = { color: 'red' }` plus `sx={styles}` is not caught,
  because the plugin never resolves the identifier. Only a property literally named `sx`
  (`const props = { sx: { color: 'red' } }`) is followed. This is the largest hole and it is
  deliberate: catching it needs type or scope resolution that a syntactic matcher does not have.
- **A value behind a variable or a call.** `sx={{ gap: spacing }}`,
  `sx={{ width: buildSize() }}` and `sx={(theme) => ({ gap: theme.spacing(2) })}` pass, since only
  the key and literal values are inspected.
- **Colour spellings outside the list.** `hwb()`, `lab()`, `lch()`, a CSS variable
  (`'var(--brand)'`) and a colour name that is not in the plugin's name list all pass.
- **A design prop on a `Kk*` component** other than `color`/`bgcolor`. The prop surface of
  `@furria/ui` is the guard there: a `Kk*` component must not expose a raw design prop.
- Emotion is not a bypass: `@emotion/**` imports are banned outright in the Club-App by
  `style/noRestrictedImports`, so a `styled.div` cannot be used to route around this plugin.

The `border.*` regex also flags `borderCollapse` and `font.*` flags every `font*` key; the value
regex also flags a `px`/`rem` dimension under a layout key such as `width: '240px'`. That is
intended bluntness: theme tokens, not raw dimensions.

## `noCustomFontSize.grit`

Flags any `fontSize` / `font-size` object key, a `font` shorthand string, and any JSX `fontSize` attribute other than
the icon literals `"small"`, `"medium"`, `"large"`, `"inherit"`. Registered for every file except
`packages/ui/src/theme.ts`, which owns the only type scale: 12 · 14 · 16 · 20 · 24 · 32 · 48 · 72px,
exposed as the typography variants `display`, `h1`–`h4`, `subtitle1/2`, `body1/2`, `caption`,
`overline`, `button` (`h5`/`h6` are disabled). Pick a variant (`variant="caption"`,
`sx={{ typography: { xs: 'h3', desktop: 'h2' } }}`); never grow the scale to fit a design. Icons are
sized with `width`/`height`.

Not caught (by design): a size smuggled in through a computed key or a CSS string — GritQL matches
syntax, not values.

## Enforced by built-in rules (no plugin needed)

Configured in `web/biome.json`:

| Rule | Enforces |
| --- | --- |
| `style/noRestrictedImports` | default imports from `@mui/material/<Component>`, never the barrel |
| `style/noRestrictedImports` (per-directory `overrides`) | dependency flow `lib/components → features → routes`; test files are exempt |
| `style/noRestrictedImports` (`apps/club-app/**` `overrides`) | Club-App imports only `Stack`, `Grid` and `Box` from `@mui/material`; `@mui/icons-material` is banned outright (icons come from `KkIcon`); `@emotion/**` is banned so no file can author CSS outside `@furria/ui` (ADR-0007). Emotion stays a dependency because MUI needs it at runtime, only the import is banned |
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
- The inline non-capturing flag group `(?i:…)` works, so a case-insensitive alternation needs no
  hand-written character classes.
- A regex is matched against the **whole** source text of the node, so a "contains anywhere" check
  must be wrapped in `[\s\S]*…[\s\S]*` rather than left unanchored.
- Beyond `TsUnknownType()`, `JsxAttribute()` and `JsTemplateExpression()` are matchable and useful:
  `JsxAttribute()` plus a regex on its source text catches an attribute by name whether its value
  is a string (`color="red"`) or an expression (`color={'red'}`), which the snippet form
  `color={$v}` cannot do.
- An object property is matchable as the snippet `` `key: $value` ``, which reaches an `sx` nested
  inside `slotProps` where a JSX-attribute pattern cannot.
- Per-override rule options **replace** the root options, they do not merge, so every Club-App
  override restates the full `paths` and `patterns` list. `plugins` arrays do accumulate across
  matching overrides. The root-level `{ "path": …, "includes": … }` plugin form produced zero
  diagnostics in Biome 2.5.4; register a scoped plugin through an override's `plugins` array.
