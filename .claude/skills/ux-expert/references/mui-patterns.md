# MUI Patterns — Picking the Right Component for the Job

MUI gives you a big toolbox. The senior move is knowing which tool to pick — not memorizing every prop, but knowing the *job* each component is designed for.

## The "container for an action" decision

This is the single most-confused area in MUI. Teams reach for `Dialog` because it's familiar, when other components fit better.

| Component | Use when... | Don't use when... |
|---|---|---|
| `Dialog` | A focused, modal decision blocks the user from continuing. Confirmation, simple data entry (≤5 fields), critical errors. | The form is long. The user needs context from the page behind. The action isn't blocking. |
| `Drawer` (right or bottom) | Editing a record while keeping list context. Filters. Settings panels that are heavier than a popover. | The thing inside is one short decision (use Dialog). |
| `Popover` / `Menu` | Lightweight contextual choices, anchored to a trigger. Action menus, filter pickers, kebab menus. | The user needs to fill out a form. |
| `Snackbar` | Brief, non-blocking confirmation or single-action recovery (Undo). | The user needs to make a decision. The message is critical. |
| `Alert` (inline) | Persistent contextual messages within page flow. Banners, form-level errors. | A single transient action confirmation (use Snackbar). |
| New page / route | Multi-step flows. Forms over ~6 fields. Anything the user might link to or refresh. | A truly modal moment. |

**Heuristic:** If you reach for `Dialog` for a 12-field form, stop. That's a page or a Drawer.

## Buttons (and the variant question)

MUI button variants map to M3 emphasis:
- `variant="contained"` → M3 Filled — *the* primary action
- `variant="contained" color="secondary"` or custom → M3 Filled Tonal
- `variant="outlined"` → M3 Outlined
- `variant="text"` → M3 Text

Other action triggers:
- `IconButton` — tap-target size matters (≥40×40 visual, with 24px icon)
- `Fab` — single most-important action on a screen, floating; mostly mobile
- `ToggleButton` / `ToggleButtonGroup` — for selection state, not actions
- `Chip` (with `onClick` or `onDelete`) — filters, tags, removable selections

**Common pitfall:** Using `Button` when `Chip` is the right metaphor (e.g., active filters), or using `Chip` when `ToggleButton` is right (e.g., view-mode switcher).

## Forms

**TextField is the workhorse.** Use `variant="outlined"` (the M3-aligned default) unless you have a reason. Filled is fine in dense forms.

- Always provide a `label`. Never use `placeholder` as a label substitute — placeholders disappear on focus and fail accessibility.
- Use `helperText` for hints and validation messages. Set `error={true}` for invalid state — the helper text becomes the error message.
- For required fields, prefer marking *optional* fields if most are required, or vice versa. The asterisk-everywhere pattern adds noise.
- `FormControl` + `InputLabel` + `Select` for selects with proper labels.
- `Autocomplete` for any selection from > ~7 options. It's almost always better than a long `Select`.
- Group related fields with `FormGroup` and `FormLabel`, not just visual proximity.
- Keep one column of fields when the form is for sequential data entry. Two columns only when fields are independent and the user scans rather than reads.

**Common pitfall:** A 30-field form on one page with no grouping, no progressive disclosure, no save-as-you-go. Break it up — `Stepper`, sections with `Accordion`, or a multi-page wizard.

## Tables and data grids

- `Table` — small datasets, fully custom rendering, no virtualization needed.
- `DataGrid` (free) — sorting, filtering, pagination out of the box, up to ~100k rows.
- `DataGridPro` / `Premium` — virtualization, row grouping, pivoting, Excel-like features.

**Common pitfalls:**
- Putting 30 columns in a table because "we have the data." If users need to scroll horizontally, you've lost them. Pick the 5-7 columns that matter; let users add more via column visibility.
- No empty state. A table with `No rows` and nothing else is a missed opportunity. Tell the user *why* (no data yet? filtered out?) and offer a path forward (add the first item, clear filters).
- No loading skeleton. Use `loading` prop or a `Skeleton` row pattern.
- Action columns with three icon buttons per row and no labels. Use a row-hover affordance or a kebab menu (`IconButton` with `MoreVertIcon` + `Menu`).

## Navigation

- `AppBar` + `Toolbar` — top nav. Keep it slim, one row of actions.
- `Drawer` (left, persistent or temporary) — primary navigation in app shells. Persistent on desktop, temporary on mobile.
- `BottomNavigation` — mobile primary nav, 3-5 destinations max.
- `Tabs` — for switching between views of the *same* thing (e.g., Overview / Activity / Settings on a customer detail page). Not for primary navigation.
- `Breadcrumbs` — when hierarchy is deep enough that the user benefits from seeing it. Skip them on flat IA.

**Common pitfall:** Using `Tabs` as primary nav for unrelated sections. Tabs imply "different facets of the same thing." If they're really separate destinations, use side nav.

## Feedback components — picking the right one

| Need | Use |
|---|---|
| "We saved your changes" (transient, non-critical) | `Snackbar` with `Alert severity="success"` |
| "Couldn't save — your session expired" (recoverable) | `Snackbar` with action button, or inline `Alert` |
| "Stripe is down — payments are failing" (page-level) | `Alert` banner at top of page or in `AppBar` |
| "Are you sure you want to delete this?" (blocking) | `Dialog` with destructive button |
| "Loading data" | `Skeleton` (preferred) or `CircularProgress` only when shape is unknown |
| "Processing your file..." (long, indeterminate) | `LinearProgress` with descriptive text |
| "Empty list" | Custom empty state with illustration + CTA — not just text |

## Theme customization — where to draw the line

MUI's theme system is powerful. Use it. But:

**Do customize:**
- Color palette (your brand)
- Typography (your fonts and scale)
- Shape (border radius scale)
- Component default props (e.g., all `Button`s default to `disableElevation`)
- Component default variants and sizes

**Be careful customizing:**
- Component internals via `styleOverrides` — fine for tokens, slippery for behavior.
- Spacing scale — MUI defaults to 8px base, which works for almost everyone.

**Don't:**
- Re-implement components from scratch when a prop or slot would do.
- Override accessibility primitives (focus rings, ARIA attributes) without strong reason.
- Apply `sx` prop styling that contradicts the theme — that's how design systems die.

## A few specific MUI gotchas worth knowing

- **`Dialog` has `disableEscapeKeyDown` and `disableBackdropClick` (now via `onClose` reason).** Don't disable Esc unless the action is genuinely irreversible — it breaks "user control and freedom."
- **`Tooltip` requires the child to forward refs.** Wrapping a custom component without `forwardRef` gives you a confusing console warning.
- **`Select` vs `Autocomplete`:** Autocomplete handles search, multi-select, async loading, free-solo. Select is fine for ≤7 known options.
- **`Grid` vs `Stack` vs CSS Grid:** Stack for one-dimensional layouts (most things). Grid (MUI) for responsive 12-column. Native CSS Grid (via `sx` or `Box`) for actual 2D layouts. Don't reach for `Grid` when `Stack` would do.
- **Theme breakpoints:** `xs`, `sm`, `md`, `lg`, `xl` — design mobile-first, layer on desktop. `useMediaQuery` for JS-driven responsiveness, but prefer CSS-driven where possible.

## When the user shows you MUI code

If a user shows you a component, scan for these tells:
- Hardcoded hex colors → flag as token violation
- `sx={{ fontSize: 14 }}` → should be a `Typography` variant
- Multiple `contained` buttons → primary action is unclear
- Long `Dialog` content → wrong container
- `placeholder` without `label` → accessibility issue
- No `aria-label` on icon-only `IconButton` → screen reader fail
- `onClick` on a `div` → should be a `Button` or `IconButton`
