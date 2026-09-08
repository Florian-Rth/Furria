# Handoff: FCC Club-App — App Shell & Übersicht (Layout D)

## Overview
The **navigation shell and start page** of the internal FURRIA club app (member app of the Furrscher Carnevals Club e.V.), in light and dark, mobile and desktop. This replaces the current shell (dark sidebar + card grid).

Two ideas carry the design:

1. **The stage is about the person, not the club calendar.** The top area is dark, greets the member by name, and then lists only **what the app needs from them** — a missing Zusage, an unpaid Beitrag, crates on their tab — each row with its action attached. Event dates are not headline material: members know when the Prunksitzung is. When nothing is open, the stage collapses to a single green "Alles erledigt." line and the content below takes over. **Both states must be implemented; the quiet one is the common case.**
2. **Navigation is a curtain, not a tab bar.** On mobile there are no tabs. A floating pill sits centred at the bottom edge, always thumb-reachable, and shows the **current section name** (it reads ÜBERSICHT here, BIERLISTE on that page) — so it is breadcrumb and menu trigger in one. Tapping it opens a full-screen dark poster menu with all destinations in Anton caps. On desktop the same list is **pinned as a permanent left rail** (no floating button), because a wide screen has no reason to hide navigation.

All visible copy is **German**; routes, props and ids are **English**.

## About the Design Files
The files in this bundle are **design references written as HTML/JSX prototypes** — they define look, spacing, states and behaviour. They are **not production code to copy**. Re-implement these screens in the target codebase with its own framework, component library and styling approach. (The app is planned as a **web app first, later wrapped in Capacitor** — so treat the mobile layout as the primary target and the desktop layout as the wide breakpoint of the same app, not a separate product.)

The prototypes use React with inline style objects and two global bags (`window.T` tokens, `window.Ic` icons) purely for prototyping convenience. In production put the tokens where the codebase already keeps them (CSS variables, Tailwind theme, token file).

## Fidelity
**High fidelity** on colours, type, spacing, radii and the state logic. Intentionally loose: the phone bezel/status bar/home indicator (that is the OS), the sample data, and the exact confetti/glow placement (a radial glow behind the stage, positioned by eye).

---

## Screens / Views

### 1. Übersicht — mobile (`/`)

Two stacked areas, no scroll container nesting: the **stage** scrolls away with the page, the **sheet** is the page body.

**Stage** — background `#15110E` (light mode) / `#0E0B0A` (dark), `padding: 6px 20px 20px`, text cream. Behind it a red glow: `radial-gradient(closest-side, rgba(225,29,42,0.26), rgba(225,29,42,0))`, 340 × 320 px, `top: -120px; right: -70px`.
- **Top row:** `FURRIA` (Anton 17 px, `letter-spacing: 1.2px`, `rgba(251,244,230,0.85)`) · spacer · `SESSION 2025/26` (Archivo 900, 10 px, `letter-spacing: 1.8px`, `rgba(251,244,230,0.38)`) · bell icon 19 px with a 7 px red dot when notifications exist.
- **Greeting:** `MOIN, ANNA.` — Anton **33 px**, cream, `margin-top: 22px`. Below it one line, Archivo 600, 13.5 px, `rgba(251,244,230,0.55)`: `Samstag, 6. September · drei Sachen brauchen dich.` (quiet variant: `… · nichts offen, nichts zu bestätigen.`)
- **Task list** (only when something is open), `margin-top: 20px`, separated by `1px solid rgba(251,244,230,0.11)` top and between rows. Per row (`padding: 13px 0`): eyebrow (Archivo 900, 10 px, `letter-spacing: 1.8px`, `rgba(251,244,230,0.42)`), title (Archivo 800, 15 px, cream, `margin-top: 5px`), and a **pill action button** on the right (Archivo 900, 12.5 px, `padding: 9px 15px`, `border-radius: 30px`, `white-space: nowrap`). Three tones:
  - `gold` — background `#F4B400`, text `#1A1411` → used for the thing only this member can answer (`Bin dabei`)
  - `red` — background `#E11D2A`, text `#fff` → money owed (`Bezahlen`)
  - `ghost` — background `rgba(251,244,230,0.14)`, text cream → lower urgency (`Ausgleichen`)
- **Quiet state** replaces the list: `margin-top: 22px`, `border-top: 1px solid rgba(251,244,230,0.11)`, `padding-top: 18px`; a 34 px circle `rgba(46,158,91,0.22)` with a check icon in `#5FD08D`, then `Alles erledigt.` (Archivo 800, 15 px, cream) + `Beitrag bezahlt · Bierliste ausgeglichen · Training zugesagt` (12.5 px, `rgba(251,244,230,0.45)`).

**Sheet** — the light body: background `#FBF4E6` (dark: `#161110`), `border-radius: 22px 22px 0 0`, `box-shadow: 0 -10px 30px rgba(0,0,0,0.26)` (dark: `…0.5`), `padding: 18px 20px 76px`. **The 76 px bottom padding is required** so content never ends underneath the floating button.
- **Section header pattern** (system-wide): 9 × 9 px red square · Anton 13 px `letter-spacing: 1.6px` label · hairline `1.5px` rule to the edge. Used for `Deine Woche` and `Dein Auftritt`.
- **Deine Woche** — rows separated by `1.5px` hairlines, `padding: 12px 0`, `gap: 13px`: a 38 px date block (weekday eyebrow, red on the next entry / faint otherwise; Anton 18 px day number), a vertical hairline, title (Archivo 800, 14 px) + detail (12.5 px, sub), and a status chip right (`Zusage fehlt` gold · `freiwillig` neutral · `zugesagt` green).
- **Dein Auftritt** — one row, not a card: `1. Prunksitzung · Sa 23.01.` (Archivo 800, 14.5 px) + `Platz 6 von 14 · Bühne ca. 20:40 · Reihenfolge noch nicht final` (12.5 px, sub) + chevron.

**Floating menu button** — `position: absolute; left/right: 0; bottom: 0`, centred, `padding: 26px 0 14px`, with a fade behind it: `linear-gradient(to top, <sheet bg> 46%, transparent)`; the container is `pointer-events: none`, the pill itself `auto`.
Pill: background `#1A1411` (dark mode `#2A2220` + `1px solid rgba(251,244,230,0.16)`), `padding: 13px 20px 13px 17px`, `border-radius: 40px`, `box-shadow: 0 8px 22px rgba(26,20,17,0.30)`. Contents: a 3-bar mark (three 17 × 2.4 px bars, `gap: 3.5px` — **top bar red `#E11D2A`**, others cream), the current section in Anton 15 px caps `letter-spacing: 1.4px`, and a 6 px red dot (live/notification indicator).

### 2. Vorhang (navigation overlay) — mobile

Full-screen, `background: #15110E` (dark: `#0E0B0A`), `z-index` above everything except the status bar, `padding: 50px 22px 22px`. A gold glow at the top: `radial-gradient(closest-side, rgba(244,180,0,0.14), transparent)`, 460 × 400 px, `top: -80px`, centred.
- **Header:** avatar (34 px, gold, Anton initials) + name (Archivo 800, 13.5 px cream) / `Tanzgarde · Aktiv` (11.5 px, `rgba(251,244,230,0.45)`) · spacer · close button (34 px circle, `1.5px solid rgba(251,244,230,0.25)`, 15 px × mark).
- **Destination list**, vertically centred, `padding: 8px 0` per row, `1px solid rgba(251,244,230,0.08)` between rows: 17 px icon (red `#E11D2A` on the active entry, else `rgba(251,244,230,0.45)`) · **Anton 23 px caps** label (cream active / `rgba(251,244,230,0.8)`) · spacer · badge. Badges are gold `#F4B400` Archivo 900 10.5 px text (`3`, `48 €`, `offen`, `42 neu`) or, for a running event, an 8 px red dot.
  Order: `Übersicht · Meine Auftritte · Spielplan · Live-Regie · Bierliste · Beitrag · Mitglieder · Galerie · Klamotten · Schlüssel`.
- **Footer:** hairline, then settings icon + `Einstellungen` + logout icon.

**Open question left for the client:** once the Amt-gated admin pages exist, this flat list should probably be grouped (`Mein Bereich` / `Verein` / `Verwaltung`) with small caps group labels. Implement it flat first; grouping is additive.

### 3. Übersicht — desktop (≥ ~1100 px)

Same content, three regions:
- **Left rail, `flex: 0 0 316px`** — the curtain, pinned. Background `#15110E` / `#0E0B0A`, `padding: 26px 24px 22px`, gold glow at the top. Head: `FURRIA` Anton 26 px + `CLUB-APP · SESSION 2025/26` (Archivo 900, 9 px, `letter-spacing: 2.2px`). Then the **same destination list** at Anton **20 px**, `padding: 6px 0` per row. Footer: avatar + name + `Tanzgarde · Aktiv` + logout icon above a hairline. **No floating button on desktop.**
- **Stage band** — `padding: 24px 40px 28px`, dark, red glow 520 × 460 px at `top: -160px; right: -40px`. Left a fixed `340px` column with the greeting (Anton **46 px**) + date line (14.5 px); right the tasks as **three equal cards** side by side (`gap: 14px`): background `rgba(251,244,230,0.05)`, `1px solid rgba(251,244,230,0.12)`, `border-radius: 14px`, `padding: 15px 16px`, eyebrow + title + the same pill action, action `margin-top: 14px`. Quiet state: the single green "Alles erledigt." row fills that space.
- **Body** — `padding: 30px 40px`, `display: grid`, `grid-template-columns: minmax(0,1.35fr) minmax(0,1fr)`, `gap: 34px`, `align-content: start`. Left: `Deine Woche`. Right: `Dein Auftritt` and `Neu im Verein` (`gap: 26px`) — a hairline-separated feed of three items, title 13.5 px + source/age 12 px faint + chevron. **`Neu im Verein` is desktop-only for now** (deliberate: the mobile stage must stay short); if it moves to mobile it belongs at the bottom of the sheet, never in the stage.

---

## Interactions & Behavior
- **Task actions act in place.** `Bin dabei` sets the Zusage and the row leaves the stage (the calendar entry's chip below flips to `zugesagt`). `Bezahlen` opens the focused pay flow (`/fees` member side). `Ausgleichen` opens the Bierliste settle flow. When the last task is resolved, the stage animates into the quiet state — do not leave an empty task container.
- **Task ranking** is by *who can only be answered by this member* first (Zusagen), then money owed by age, then soft items. Cap the stage at **three** tasks; a fourth becomes a `+2 weitere` row that opens a task list. Never scroll the stage.
- **Curtain** opens from the floating pill (also allow a swipe-up from the pill), closes via the × button, backdrop-free (it is opaque), and on Escape / back-gesture. Animate as a curtain: slide/fade in over ~260 ms, `cubic-bezier(.2,.8,.25,1)`; the destination rows may stagger ~20 ms each.
- **The pill label is the current route's title** and must update on navigation; the red dot shows when a live event is running or notifications are unread.
- Desktop rail: active entry keeps the red icon + cream label treatment; hover raises the label to cream.
- **Dark mode** follows the OS preference (`prefers-color-scheme`) with a manual override in Einstellungen. Layout is identical between modes — only the palette changes.
- `prefers-reduced-motion`: no curtain slide (instant), no confetti drift.

## State Management
- `tasks: Task[]` — derived server-side per member (`{id, kind: 'rsvp'|'payment'|'drinks', eyebrow, title, action, tone, route}`); the stage renders `tasks.slice(0,3)`; `tasks.length === 0` → quiet state.
- `curtainOpen: boolean` (mobile only), `currentRoute` (feeds the pill label and the active nav entry), `unread: boolean`.
- `week: CalendarEntry[]` (next ~7 days, with the member's Zusage status), `myNextShow`, `feed: FeedItem[]` (desktop).
- `theme: 'system' | 'light' | 'dark'`.

## Design Tokens
| token | light | dark |
|---|---|---|
| stage | `#15110E` | `#0E0B0A` |
| body / sheet | `#FBF4E6` | `#161110` |
| card / panel | `#FFFFFF` | `#1E1817` (cards on stage: `rgba(251,244,230,0.05)`) |
| text | `#1A1411` | `#FBF4E6` |
| text sub | `rgba(26,20,17,0.6)` | `rgba(251,244,230,0.58)` |
| text faint | `rgba(26,20,17,0.4)` | `rgba(251,244,230,0.40)` |
| hairline | `rgba(26,20,17,0.12)` | `rgba(251,244,230,0.14)` |
| hairline soft | `rgba(26,20,17,0.07)` | `rgba(251,244,230,0.08)` |
| red (accent / action only) | `#E11D2A` | same |
| gold (festive accent) | `#F4B400` | same |
| green (ok / paid) | `#2E9E5B` | `#5FD08D` on dark |
| chip red | `#E11D2A` on `rgba(225,29,42,0.10)` | `#FF7A82` on `rgba(225,29,42,0.20)` |
| chip gold | `#9a7200` on `rgba(244,180,0,0.16)` | `#FFD36B` on `rgba(244,180,0,0.18)` |
| chip green | `#2E9E5B` on `rgba(46,158,91,0.13)` | `#6FD79B` on `rgba(46,158,91,0.20)` |
| chip neutral | `rgba(26,20,17,0.6)` on `rgba(26,20,17,0.06)` | `rgba(251,244,230,0.7)` on `rgba(251,244,230,0.10)` |
| radii | sheet top 22 · card 14 · pill/button 40 · chip 20 | same |
| display font | **Anton** — greeting, nav labels, day numbers, section labels | |
| UI font | **Archivo** 600–900 — everything else | |
| type scale | 10 · 11 · 12 · 12.5 · 13 · 13.5 · 14 · 14.5 · 15 · 17 · 18 · 20 · 23 · 26 · 33 · 46 | |
| easing | `cubic-bezier(.2,.8,.25,1)` | |

Rules from the design system: **red is accent and action only, never body text**; gold is the festive accent; two elevation languages exist (soft hairline + tiny shadow for app surfaces, hard offset shadow `Npx Npx 0 ink` for one "Plakat" hero element per screen — this shell deliberately uses **no** hard shadow, the dark stage is the hero). Do not introduce new colours, fonts or radii.

## Assets
None. Type, rectangles, hairlines, two radial gradients and the stroke icon set. Fonts: Anton + Archivo (Google Fonts). The icon set in `src/fcc-ds-shell.jsx` (`Ic`) is a 24 × 24 stroke set — replace with the codebase's icon library if one exists, matching stroke weight ~1.85–2.

Sample data (`Anna Brunner`, `Tanzgarde`, 30 € Beitrag, 48 € Bierliste, `1. Prunksitzung`) is placeholder.

## Files
- `app-shell.html` — open in a browser: mobile light (3 states), mobile dark (3 states), desktop light, desktop dark. Tap the floating pill to open the curtain.
- `src/fcc-app-shell-d.jsx` — the design source. Exports `LayoutD({open, quiet, dark})` (mobile) and `LayoutDDesk({dark, quiet})`; internals worth reading: `dpal(dark)` (the two palettes), `DTask` (stage task row / wide card), `DCurtain`, `DMenuButton`, `DNavList`, `DWeek`, `DSec` (section header pattern), `DChip`.
- `src/fcc-ds-shell.jsx` — tokens (`window.T`), icon set (`Ic`) and the club-app primitives.
- `src/fcc-theme.jsx` — brand layer (`window.KK`).
- `src/fcc-shared.jsx` — prototype phone frame, status bar, home indicator (**prototype chrome only, do not implement**).
- `src/fcc-logos.jsx` — coat-of-arms / broom vectors (not used by this shell).
