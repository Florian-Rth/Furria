# Handoff: FCC Mobile Landing — Hero Section

## Overview
The public FCC ("FURRIA") landing page hero, redesigned for **mobile**. It's an immersive, magazine-cover style hero: a full-bleed event photo runs behind a transparent status bar + masthead nav, a gradient scrim keeps the overlay legible, and a giant condensed headline sits on the photo's lower edge. The functional block (tagline, CTAs, stats) and a scrolling ticker follow directly beneath in the cream area.

This replaces the previous mobile hero (a scaled-down copy of the desktop split). It keeps the brand DNA (Anton display type, red/gold/cream palette, editorial masthead) but is purpose-built for a phone screen.

## About the Design Files
`mobile-hero.html` is a **design reference created in HTML + React (via inline Babel)** — a prototype showing the intended look and behavior. It is **not production code to copy directly**. The task is to **recreate this design in your target codebase** (this product is planned as a web-app first, later wrapped in Capacitor) using its established framework, component patterns, and styling approach. If no environment exists yet, pick the most appropriate stack and implement there.

The `PhoneFrame`, `HomeIndicator`, and `StatusBar` in the file are **prototype chrome** to simulate a phone — do NOT build those; your real app runs inside the actual device viewport with the OS status bar. Build only the `MobileHero` component and the `HeroFollow` block beneath it.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, and layout are final. Recreate pixel-accurately using your codebase's libraries. The only placeholder is the hero background image (see Assets).

## Screens / Views

### Mobile Hero (single view, top of the landing page)
- **Purpose**: First impression for a phone visitor — communicate the club + the headline event, and drive to Tickets / Programm.
- **Layout** (design width **400px**, i.e. a standard phone viewport; scales fluidly — use responsive units, not fixed 400):
  - **Hero band**: `position: relative`, fixed **height 566px**, `overflow: hidden`. Three stacked layers:
    1. Full-bleed background image (`position: absolute; inset: 0`).
    2. Gradient scrim (`position: absolute; inset: 0`).
    3. Content column (`position: relative; height: 100%; display: flex; flex-direction: column`).
  - **Content column** top→bottom: status bar → masthead nav → flexible spacer (`flex: 1`) → headline block pinned to the bottom.
  - **Below the hero** (in page background / cream): the follow block, then a full-bleed ticker.

## Components

### 1. Background photo layer
- `position: absolute; inset: 0`, fills the 566px hero.
- In production: a single edge-to-edge `<img>` (`object-fit: cover; width/height: 100%`) of the garde on stage. In the mock it's a diagonal striped placeholder labelled `garde-auf-der-bühne`.

### 2. Legibility scrim
- `position: absolute; inset: 0`.
- `background: linear-gradient(to bottom, rgba(20,15,12,0.58) 0%, rgba(20,15,12,0.12) 19%, rgba(20,15,12,0.12) 42%, rgba(20,15,12,0.72) 76%, rgba(20,15,12,0.94) 100%)`.
- Darker at the very top (nav legibility) and heavily darker at the bottom (headline legibility). This is a **fixed dark scrim regardless of light/dark mode** — it always sits over a photo.

### 3. Status bar (prototype chrome — replace with OS status bar)
- Height 50px, white tint (`color: #fff`) so it reads over the photo.
- In your app: just ensure the OS status bar / notch area uses **light content** over this hero.

### 4. Masthead nav (transparent, over photo)
- Container: `display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 3px 20px 0`.
- **Left — hamburger**: 3 stacked bars, each `width 22px; height 2.4px; border-radius 2px; background #fff; gap 4px`.
- **Center — wordmark** "FURRIA": Anton, `font-size 23px; letter-spacing 1.5px; color #fff`.
- **Right — Tickets button**: `background #fff; color = red (mode red)`; Archivo `font-weight 800; font-size 12.5px; padding 8px 15px; border-radius 40px; border none`.

### 5. Headline block (pinned bottom of hero)
- Wrapper `padding: 0 22px 28px`.
- **Eyebrow**: `display: inline-flex; align-items: center; gap 8px; font-weight 800; font-size 11px; letter-spacing 2.2px; color #fff; margin-bottom 13px`. Text: `★ SESSION 2026 · ERÖFFNUNG 11.11.` — the leading `★` star is colored **gold** (`c.gold`), the rest white.
- **H1**: Anton, `font-size 84px; line-height 0.8; letter-spacing 0.5px; margin 0; text-shadow 0 4px 34px rgba(0,0,0,0.5)`.
  - Line 1 `GROSS` — color `#fff`.
  - Line 2 `FURRIA!` — color **red** (`c.red`).
  - Two lines separated by a `<br>`.

### 6. Follow block (cream area, directly under hero) — `HeroFollow`
- Wrapper `padding: 22px 22px 6px`.
- **Tagline** `<p>`: `font-size 15.5px; font-weight 500; line-height 1.5; color = sub`. Copy: “Der Furrscher Carnevals Club lädt die **Großbesenstadt** zur fünften Jahreszeit — gebunden mit Herz, seit 1971.” (the word *Großbesenstadt* is `font-weight 700; color = ink`).
- **CTA row**: `display: flex; align-items: center; gap 12px; margin-top 18px`.
  - Primary "Tickets sichern →": red fill, white text, Archivo 800, `font-size 15px`, `padding 14px 24px`, `border-radius 50px`, `box-shadow 0 4px 14px rgba(26,20,17,0.12)`.
  - Secondary "Programm": ghost — transparent, `border 2px solid rgba(26,20,17,0.2)`, ink text, Archivo 700, `font-size 13px`, `padding 12px ~20px`, `border-radius 50px`.
- **Stats strip**: `display: flex; gap 14px; margin-top 22px; padding-top 18px; border-top 1px solid line`. Three equal columns (`flex: 1`), each: big number in Anton `font-size 28px; line-height 1; color = red`; label below Archivo `font-size 11px; font-weight 600; color = sub; margin-top 2px`.
  - `180+` / Mitglieder · `12` / Garden · `1971` / gegründet.

### 7. Ticker (full-bleed, under the follow block)
- `margin-top 22px`. Red bar (`background = red`), `padding 9.75px 0` (≈ fontSize·0.65 top/bottom), `overflow hidden`.
- Content scrolls right→left infinitely: Anton `font-size 15px; letter-spacing 1.5px; color #fff`, repeated `GROSS FURRIA ✶ GROSSBESENSTADT ✶ SESSION 2026 ✶` with each `✶` in **gold**.
- Animation: `@keyframes { from translateX(0) to translateX(-50%) }`, `26s linear infinite`. Duplicate the run so the loop is seamless. Respect `prefers-reduced-motion`.

## Interactions & Behavior
- **Hamburger** → opens the site nav drawer (nav destinations: Verein · Programm · Galerie · Login · Tickets).
- **Tickets** (nav button + primary CTA) → ticket shop / pre-sale.
- **Programm** (secondary CTA) → event calendar.
- **Ticker**: continuous horizontal marquee, `26s`, pauses under `prefers-reduced-motion: reduce`.
- No hover states needed (touch); provide standard pressed/active feedback per platform.
- **Scroll**: the whole screen scrolls; the hero is the first thing in the scroll flow (no sticky/parallax required, though a subtle parallax on the photo is a nice-to-have).

## State Management
Static presentational hero. Data that should come from the backend (not hardcoded) when wired up:
- Session label + opening date (`SESSION 2026 · ERÖFFNUNG 11.11.`).
- Hero image (per-session asset).
- Stats (`180+`, `12`, `1971`).
- Ticket / Programm link targets.
No local component state beyond the nav drawer open/closed.

## Design Tokens

### Colors — Light mode
| Token | Value | Use |
|---|---|---|
| bg | `#FBF4E6` | page background (cream) |
| ink | `#1A1411` | primary text |
| red | `#E11D2A` | accent / action / FURRIA! |
| gold | `#F4B400` | festive accent (star, ticker ✶) — accents only |
| sub | `rgba(26,20,17,0.62)` | secondary text |
| paper | `#FFFFFF` | card / surface |
| onRed | `#FFFFFF` | text on red |
| line | `rgba(26,20,17,0.14)` | hairline dividers |

### Colors — Dark mode
| Token | Value |
|---|---|
| bg | `#15110E` |
| ink | `#FBF4E6` |
| red | `#FF3B47` |
| gold | `#FFC42E` |
| sub | `rgba(251,244,230,0.6)` |
| paper | `#221B16` |
| onRed | `#FFFFFF` |
| line | `rgba(251,244,230,0.16)` |

The hero **scrim + status bar + nav + headline whites are the same in both modes** (they sit over a photo). Only the follow block / ticker / page background switch with mode. `FURRIA!` and stat numbers use `red` (which brightens in dark mode); the `★` and ticker `✶` use `gold`.

### Typography
- **Anton** (Google Font) — display: wordmark, H1 headline, stat numbers, ticker. Condensed, uppercase feel. Used at `line-height 0.8` for the big H1.
- **Archivo** (Google Font, weights 500–900) — all UI/body text: eyebrow, buttons, tagline, labels.

### Spacing / radius / shadow
- Hero height **566px**; horizontal gutters **20–22px**.
- Pill radius **40–50px**; button soft shadow `0 4px 14px rgba(26,20,17,0.12)`.
- Headline shadow `0 4px 34px rgba(0,0,0,0.5)`.
- Hairline dividers `1px solid` the `line` token.

## Assets
- **Hero background photo** — the one real image. Placeholder label: `garde-auf-der-bühne` (garde/dancers on stage). Supply a high-res landscape crop that reads well when darkened; it must look good behind the bottom-heavy scrim. No other raster assets.
- **Icons** are inline SVG / CSS (hamburger bars, status-bar glyphs); the ★ / ✶ are text glyphs.
- Fonts loaded from Google Fonts (Anton + Archivo).

## Files
- `mobile-hero.html` — self-contained, runnable prototype (light + dark side by side). Open in a browser to see the target. The `MobileHero` and `HeroFollow` functions are the deliverable; `PhoneFrame`/`StatusBar`/`HomeIndicator` are prototype chrome only.

### Source of record (in the main design project, for reference)
- `fcc-ds-landing.jsx` → `BestMobileHero` (the hero) and `BestMobile` (the full page incl. follow block, ticker, program, recruit band, footer).
- `fcc-theme.jsx` → `KK` theme tokens + shared brand components.
- `fcc-shared.jsx` → `StatusBar`, `PhoneFrame`, `HomeIndicator`.
