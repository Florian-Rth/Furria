# Changes since the last handoff (App Shell / Layout D)

Deltas only. Everything else in `README.md` (structure, behavior, states, type, navigation) stays valid unchanged.

## 1. Light and dark are no longer mixed
Before, the stage and the curtain were **dark even in light mode** (`#15110E`). That was a mistake: a black block in a light app mixes two modes.

**Now:** in light mode the stage, curtain and desktop rail are **light**. Separation comes from tone steps + hairlines, not from a dark block. Dark mode is structurally unchanged (only the dark values).

Affected: all text colors, hairlines, icons, badges and the ghost button in the stage and curtain now run through the palette instead of hardcoded cream values.

| Element | before (light) | now (light) |
|---|---|---|
| Stage | `#15110E`, cream text | light gradient, text `#1A1411` |
| Curtain (mobile) | `#15110E`, Anton in cream | background `#FDFCFA`, Anton in ink, active entry red |
| Desktop rail | `#15110E` | `#FFFFFF` + `1.5px` hairline on the right |
| Badges in the curtain | Gold `#F4B400` | `#9a7200` (contrast on light) |
| Ghost action ("Ausgleichen") | `rgba(251,244,230,0.14)` / cream | `rgba(26,20,17,0.07)` / ink |
| Check circle "Alles erledigt" | `rgba(46,158,91,0.22)` / `#5FD08D` | `rgba(46,158,91,0.12)` / `#2E9E5B` |
| Red glow behind the stage | `rgba(225,29,42,0.26)` | `rgba(225,29,42,0.10)` |

**Deliberate exception:** the floating menu button stays dark ink with cream text in both modes. It is a button, not a surface — that doesn't mix the modes.

The **login screen** is exempt from this rule: there, the dark stage next to the light form is intentional.

## 2. Background and surfaces swapped
Before: cream/beige `#FBF4E6` was the **background**, cards were white.
Now reversed — the beige tone carries the **surfaces**, the ground is almost white. Three tone steps:

| Role | light | dark |
|---|---|---|
| Chrome (stage, rail) | `#FFFFFF` | `#0E0B0A` |
| Ground (body/sheet) | `#FDFCFA` | `#161110` |
| Surface (cards) | `#FBF4E6` | `#1E1817` |

**New: all content blocks sit on cards** instead of floating freely on the ground. Card = surface color + `1.5px` hairline (`rgba(26,20,17,0.08)` / `rgba(251,244,230,0.10)`) + `border-radius: 16px`, inner padding `4px 16px` for lists (the rows bring their own `padding: 12px 0`), `14px 16px` for single-line cards.
Affects: `Deine Woche`, `Dein Auftritt`, `Neu im Verein` (desktop) and the three task cards in the desktop stage.
The section headers (red square + Anton label + hairline) stay **outside** the card.

## 3. The stage is emphasized as a header area
Instead of a flat surface:
- **Gradient** light `linear-gradient(168deg, #FFFFFF 0%, #FFFDF8 46%, #FDF6E9 100%)` · dark `linear-gradient(168deg, #17100E 0%, #0E0B0A 58%)`
- **Drop shadow** downward, lifts the stage above the content: light `0 10px 26px rgba(26,20,17,0.07)` · dark `0 12px 30px rgba(0,0,0,0.45)`
- The stage sits on a higher layer than the sheet (`z-index` above the body)
- The red glow stays, top right, now subtle
- **No** colored edges or stripes (a red bottom edge and a gold edge stripe were in for a while and have been removed again)
- Padding grown slightly: mobile `6px 20px 22px`, desktop `26px 40px 30px`

In light mode the sheet **no longer** has a top radius or a shadow (`border-radius: 0`) — it is the body, not an overlaid sheet. In dark mode it keeps `22px 22px 0 0` with a shadow.

## Updated tokens
| Token | light | dark |
|---|---|---|
| Chrome / stage (base) | `#FFFFFF` | `#0E0B0A` |
| Stage gradient | `168deg, #FFFFFF → #FFFDF8 → #FDF6E9` | `168deg, #17100E → #0E0B0A` |
| Stage shadow | `0 10px 26px rgba(26,20,17,0.07)` | `0 12px 30px rgba(0,0,0,0.45)` |
| Ground | `#FDFCFA` | `#161110` |
| Surface / card | `#FBF4E6` | `#1E1817` |
| Card hairline | `rgba(26,20,17,0.08)` | `rgba(251,244,230,0.10)` |
| Hairline in the stage | `rgba(26,20,17,0.10)` | `rgba(251,244,230,0.11)` |
| Glow (stage) | `rgba(225,29,42,0.10)` | `rgba(225,29,42,0.26)` |
| Glow (curtain/rail, gold) | `rgba(244,180,0,0.16)` | `rgba(244,180,0,0.14)` |
| Card radius | `16px` | `16px` |

Red stays accent and action, never a text color. No new fonts, radii or colors outside this table.

## Implementation note
The palette lives in `src/fcc-app-shell-d.jsx` in **one** function `dpal(dark)` — both modes with identical keys. Every color-bearing element reads from it (`c.stageBg`, `c.card`, `c.sInk`, `c.ghostBg` …), nothing is hardcoded anymore. For production: set up the same keys as CSS variables under `:root` / `[data-theme="dark"]` and have the components only use the variables.

## Files
- `src/fcc-app-shell-d.jsx` — replaces the version from the last package
- `app-shell.html` — unchanged, now shows the new version (mobile light/dark, 3 states each; desktop light/dark)
