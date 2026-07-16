# Material Design 3 (M3) — Principles and Common Pitfalls

This is the system. MUI (the React library) is the most common implementation of it. Many teams use MUI components but ignore the underlying system, which produces "Material-shaped but not Material" interfaces. Learn the system, then apply it.

## The four foundations

### 1. Color (token-based, role-based)

M3 replaces hand-picked colors with **color roles** generated from a seed color. Don't think in hex codes; think in roles.

The roles you'll use most:
- `primary` / `onPrimary` — main brand action color and text/icons that sit on it
- `primaryContainer` / `onPrimaryContainer` — softer fills for less-prominent primary surfaces
- `secondary` / `tertiary` — supporting colors, used sparingly
- `surface` / `onSurface` — default backgrounds and text on them
- `surfaceContainer` (low/high/highest) — layered backgrounds for elevation without shadow
- `error` / `onError` / `errorContainer` — error states only; not "red because we like red"
- `outline` / `outlineVariant` — borders, dividers

**Common pitfall:** Teams using `primary` for everything because it looks like the brand color. M3 expects restraint — most surfaces are `surface`, primary is reserved for the *primary action*.

**Common pitfall:** Hardcoding colors that should be tokens. The whole point is dark mode and theme switching come for free.

### 2. Typography (the type scale)

M3 defines a type scale: `displayLarge`, `displayMedium`, `displaySmall`, `headlineLarge/Medium/Small`, `titleLarge/Medium/Small`, `bodyLarge/Medium/Small`, `labelLarge/Medium/Small`.

Use them by role, not size. A page title is `headlineSmall` or `titleLarge`, not "20px bold." A button is `labelLarge`. Body copy is `bodyMedium`.

**Common pitfall:** Inventing `<Typography sx={{ fontSize: 17 }}>` instead of picking a scale role. If a scale role doesn't fit, the *design* is probably off-system, not the scale.

### 3. Elevation and surfaces

M3 expresses elevation primarily through **tonal color** (lighter/darker surface containers), not just shadow. A "raised" card on a dark theme is a *lighter* surface, not a card with a heavy drop shadow.

The surface tones, low to high: `surface`, `surfaceContainerLowest`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh`, `surfaceContainerHighest`.

**Common pitfall:** Stacking shadows everywhere. M3 uses shadow sparingly — mostly for actively floating elements (FAB, menus, dialogs).

### 4. Shape

M3 uses a shape scale (extra-small, small, medium, large, extra-large, full) applied as `borderRadius`. Cards are typically medium (12px). Dialogs are large (28px in M3). Buttons in M3 are now *fully rounded* (pill-shaped) by default, not 4px.

**Common pitfall:** Mixing M2-era 4px buttons with M3-era 12px cards in the same UI. Pick one era's shape language and stay there.

## Components: the primary action rule

Every screen, dialog, or section has **one primary action**. Material expresses this with the `Filled` / `contained` button variant. Other actions are `Tonal` (filled tonal), `Outlined`, `Text`, or `Elevated`.

The hierarchy, top to bottom:
- **Filled** — the one most-likely action
- **Filled tonal** — high-emphasis but not *the* action
- **Outlined** — medium emphasis, often for secondary actions
- **Text** — low emphasis, dismissive actions ("Cancel"), tertiary navigation

**Common pitfall:** Three filled buttons side by side. Now nothing is primary. Pick one.

**Common pitfall:** Using `outlined` for "Cancel" in a dialog. M3 dialogs use `text` for dismissive and `text` or `filled` for confirming. The visual weight should match the importance.

## Spacing and the 4dp grid

Material works on a 4dp baseline grid. Most spacing values are multiples of 4 (4, 8, 12, 16, 24, 32, 48, 64). MUI's `theme.spacing(n)` maps to `n * 8` by default.

**Common pitfall:** Random spacing values (13px, 17px, 22px). Even if they look fine in isolation, they break consistency across screens.

## Motion

Material motion is **purposeful** — it tells the user where things came from and where they're going. It's not decoration.

- **Standard easing** for most transitions (`cubic-bezier(0.2, 0.0, 0, 1.0)`)
- **Emphasized easing** for entering/exiting elements
- **Durations:** short (100–200ms) for small UI, medium (200–400ms) for screens, long (400–700ms) for full-screen transitions
- Respect `prefers-reduced-motion` — kill or shorten animations for users who've opted out

**Common pitfall:** Spring/bouncy animations everywhere. M3 motion is calm and confident, not playful by default.

## States — every component has them

M3 components define explicit visual states: `enabled`, `hovered`, `focused`, `pressed`, `dragged`, `disabled`. The "state layer" (a translucent overlay on the component) is how M3 shows hover/focus/press without changing the base color.

**Common pitfall:** No focus state at all (kills keyboard accessibility). Or, a focus state that's just `outline: 1px solid blue` ignoring the component's design language.

## When to deviate

Material is opinionated. Sometimes you should override it:
- Brand expression in marketing surfaces (landing pages)
- Domain-specific patterns Material doesn't cover well (data-dense tools, code editors, design canvases)
- Platform conventions that conflict (iOS users expect iOS-shaped sheets even in Material apps)

But within a product app, fighting Material costs more than it earns. Pick your battles.

## Quick "is this Material" smell test

- Are colors coming from tokens, or hardcoded?
- Is there exactly one primary (filled) action per screen?
- Are typography choices from the scale, or ad-hoc font sizes?
- Is elevation expressed through tonal surfaces, or piles of shadows?
- Are spacing values multiples of 4?
- Do components have proper hover/focus/pressed/disabled states?

If most are "no," the team has Material components in a non-Material design. That's fine if it's intentional, but usually it means they should either commit to the system or commit to leaving it.
