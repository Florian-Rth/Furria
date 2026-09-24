# Handoff: FURRIA — News page („Neuigkeiten", public website)

## Overview
Public news section for the website of the **Furrscher Carnevals Club e.V. (FCC / „FURRIA")**, a German carnival club. Two routes:

- `/news` — list page: one **lead post** + a compact chronological list of the rest.
- `/news/:slug` — article page: one post, shareable link, 3 follow-up posts.

Plus one reusable block: a **landing-page teaser** with the 3 newest posts.

**Scope is deliberately minimal.** This is *not* a blog: no tag filters, no author pages, no comments, no pagination, no search, no RSS. The club board maintains it alongside everything else, so roughly 10 posts a year is the realistic volume. Do not add blog machinery. The only concession to volume is a single "Archiv <Session>" button.

All visible copy is **German**. Routes, ids, props, component names are **English**.

## About the Design Files
The files in `src/` are **design references created in HTML/JSX** — prototypes of the intended look and behaviour, not production code to copy directly. They are plain browser-Babel scripts that write their exports onto `window`, with all styling as inline style objects. That is a prototyping convention, not an architecture recommendation.

**The task is to recreate these designs in the target codebase's existing environment** (React/Next, Vue, Astro, whatever the FURRIA website ends up being) using its established patterns — real CSS/Tailwind/CSS-modules instead of inline style objects, real routing instead of the internal `useState` view switch, real components instead of `window.*` globals. If no environment exists yet, pick the most appropriate one; a static-site framework with a small CMS is a good fit for this feature's volume.

Open `preview.html` in a browser to see the designs (toolbar switches Desktop/Mobile, Hell/Dunkel, Liste/Artikel/Landing-Teaser).

## Fidelity
**High-fidelity.** Colours, typography, spacing, borders and shadows are final and come from the club's „Konfetti Kinetik" design system. Recreate pixel-close. Photos are placeholders (diagonal-striped boxes with a monospace label) — the client supplies real images.

Desktop mocks are drawn at **1300 px** content width, mobile at **400 px** (inside a phone frame). Both are fixed-canvas mocks; see *Responsive behaviour* for the intended in-between behaviour.

---

## Design Tokens

The design system ships a light and a dark theme (`window.KK.light` / `window.KK.dark` in `src/fcc-theme.jsx`). Every colour in the news page is read from that token object — no literals beyond the ones listed here.

| Token | Light | Dark |
|---|---|---|
| `bg` (page) | `#FBF4E6` cream | `#15110E` |
| `ink` (text/borders) | `#1A1411` | `#FBF4E6` |
| `paper` (cards) | `#FFFFFF` | `#221B16` |
| `red` (accent/action) | `#E11D2A` | `#FF3B47` |
| `redDk` (hover) | `#B3101C` | `#E11D2A` |
| `gold` (festive accent) | `#F4B400` | `#FFC42E` |
| `sub` (secondary text) | `rgba(26,20,17,0.62)` | `rgba(251,244,230,0.6)` |
| `line` (hairline) | `rgba(26,20,17,0.14)` | `rgba(251,244,230,0.16)` |
| `onRed` (text on red) | `#FFFFFF` | `#FFFFFF` |

Plus one derived value used by this page — the **inverted panel** (`nPanel()` in the source): on light it is just `bg`/`ink`; on dark it deepens to `bg #0C0806`, `fg #FBF4E6`, `sub rgba(251,244,230,0.62)` so dark mode stays dark instead of flipping to cream.

**Red is accent and action only — never body text.**

### Typography
Two Google fonts: `Anton` (display: headlines, dates, numerals — condensed, effectively uppercase) and `Archivo` (UI/body, weights 500–900).

| Role | Font | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Page title `NEUIGKEITEN` (desktop) | Anton | 74 | — | 0.88 | 0.4 |
| Page title (mobile) | Anton | 42 | — | 0.90 | — |
| Eyebrow (`AUS DEM VEREIN · SESSION 2026/27`) | Archivo | 13 | 900 | — | 3 |
| Lead headline (lead post, desktop) | Anton | 48 | — | 0.94 | 0.3 |
| Lead headline (mobile) | Anton | 28 | — | 0.96 | — |
| List-row headline (desktop) | Anton | 30 | — | 0.96 | 0.2 |
| List-row headline (mobile) | Anton | 19 | — | 1.0 | — |
| List-row date rail | Anton | 30 | — | 0.90 | — |
| Article H1 (desktop) | Anton | 62 | — | 0.93 | 0.3 |
| Article H1 (mobile) | Anton | 34 | — | 0.94 | — |
| Article lead paragraph | Anton | 25 / 17 mob | — | 1.24 / 1.28 | — |
| Article body | Archivo | 18 / 14.5 mob | 500 | 1.72 / 1.70 | — |
| Teaser/list body copy | Archivo | 15 / 13 | 500 | 1.55 | — |
| Category label | Archivo | 11 (10 in rows, 9–9.5 mob) | 900 | — | 1.4 |
| Section-rule label | Anton | 20 | — | — | 1 |
| Meta / date next to label | Archivo | 12–13 | 700 | — | 0.4 |
| Buttons | Archivo | 13.5–15 | 800–900 | — | — |

Body text uses `text-wrap: pretty`.

### Spacing / geometry
- **Border radius: 0 everywhere.** No rounded corners on this page. (The one exception in the system is the round "Tickets" pill in the mobile bar, `border-radius: 40px` — that comes from the shared header.)
- Desktop page padding: `64px` left/right. Mobile: `22px`.
- Section rhythm (desktop): `38–54px` between blocks, `56px` before the closing ink band.
- Article measure: `max-width: 820px` centred (incl. the 64px padding), i.e. ~692px text column.
- Hairline separators: `1.5px solid line`. Heavy rules: `3px solid ink` (desktop under the page head), `2.5px` on mobile.
- Card borders: `2px solid ink` for the lead post/hero, `1.5px solid line` for quiet cards and thumbnails.

### Two elevation languages (important)
1. **Soft/quiet** — hairline `1.5px` border, no shadow. Used for list thumbnails, the "mehr" cards, teaser cards 2–3.
2. **Hard "poster" offset shadow** — `Npx Npx 0 <colour>`, no blur. This is the loud one: **exactly ONE element per screen may use it.**
   - List page → the lead post: `2px solid ink` + `12px 12px 0 red` (mobile `8px 8px 0 red`).
   - Article page → the hero image: `2px solid ink` + `10px 10px 0 <post tint>` (mobile `7px`).
   - Landing teaser → the first of the three cards: `6px 6px 0 red`.
   - Also allowed on small floating chrome: the „Mitglied werden" button in the article's closing band (`5px 5px 0 <panel fg>`).

### Category tints
Four fixed categories, label-only (no filter UI). Each post carries a `tint` used for its label chip, thumbnail placeholder tint, hero shadow and the typographic fallback background:

| Kategorie | tint token | Chip bg / text |
|---|---|---|
| `Session` | `red` | red / white |
| `Erfolge` | `gold` | gold / **ink** (gold needs dark text) |
| `Verein` | `red` or `ink` | that colour / white |
| `Gruppen` | `ink` | ink / white |

Chip: solid background, `padding: 3px 9px`, Archivo 900, 11px, `letter-spacing: 1.4`, uppercase, square corners.

---

## Screens / Views

### 1. List page — `/news`

**Purpose:** a visitor scans what's new in the club and opens one post.

**Layout (desktop, 1300px):**
1. **Masthead bar** — the shared site header (`KKMastheadBar`, newspaper style, the header *is* the nav, no bottom divider). Reuse the site's existing header component.
2. **Page head** — `padding: 46px 64px 0`, flex row, `align-items: flex-end`, `justify-content: space-between`, gap 40.
   - Left: eyebrow `AUS DEM VEREIN · SESSION 2026/27` (red) + H1 `NEUIGKEITEN`.
   - Right: one intro sentence, `max-width: 380px`, `sub` colour, 16/1.55, `padding-bottom: 8px`.
   - Copy: „Was im Verein passiert, steht hier. Kein Blog, keine tägliche Kolumne — nur das, was die Großbesenstadt wissen sollte."
3. **Heavy rule** — `3px` ink, `margin: 30px 64px 0`.
4. **Lead post** (whole card is one button) — `padding: 38px 64px 0`; grid `1.15fr 1fr`, no gap; `2px solid ink`, `box-shadow: 12px 12px 0 red`, background `paper`.
   - Left: image, height **392px**. Overlaid flag top-left, flush to the corner: `AUFMACHER`, red bg, `onRed` text, Anton 15, `letter-spacing 1.6`, `padding: 7px 14px`.
   - Right: `padding: 34px 38px 32px`, column flex. Category chip + date (`sub`, 700/13) → H2 (Anton 48/0.94, `margin-top: 18px`) → teaser (17/1.6, `sub`) → pushed to the bottom (`margin-top: auto`, `padding-top: 26px`): „Ganzen Beitrag lesen →" (red, 900/15) and „2 Min. Lesezeit" (`sub`, 600/12.5).
5. **Section rule** — `WEITERE MELDUNGEN`: red 14×14 square + Anton 20 label + `1.5px line` rule stretching to the right edge, `margin-bottom: 22px`. (This red-square + Anton-label + hairline pattern is the system's standard section header — reuse it.)
6. **List rows** — one button per post, grid `92px 1fr 168px`, gap 26, `align-items: center`, `padding: 22px 4px`, `border-top: 1.5px line` on every row **except the first**, transparent background.
   - Col 1: short date `12.07.` in Anton 30, **red**.
   - Col 2: chip (10px) + full date (`sub` 700/12) on a row with gap 12, `margin-bottom: 8px`; headline Anton 30/0.96; teaser 15/1.55 `sub`, `margin-top: 7px`, `max-width: 640px`.
   - Col 3: thumbnail, height **104px**, `1.5px solid line`, no shadow. If the post has no photo → typographic fallback (below).
7. **List footer** — `border-top: 1.5px line`, `padding-top: 26px`, space-between: „Das war alles aus dieser Session. Ältere Meldungen liegen im Archiv." (14/600, `sub`) and an outline button „Archiv 2025/26" (`1.5px solid ink`, transparent, 14/800, `padding: 11px 20px`).
8. **Closing ink band** — full-bleed inverted panel, `padding: 34px 64px`, `margin-top: 56px`, space-between: eyebrow `NICHTS VERPASSEN` (red, 11.5/900, ls 2) + Anton 34 „ALLE TERMINE DER SESSION"; right an outline button in panel-fg „Zum Programm →" (`2px` border, 15/800, `padding: 14px 26px`). Purpose: news is not the calendar — push people to `/schedule`.
9. **Footer** — the shared dark site footer (`KKFooter`).

Total rendered height at 1300px: **2216px**.

**Mobile (400px):** same order, single column. Page head 22px padding, H1 42px, `2.5px` rule. Lead post becomes a stacked card (image 172px, then text) with `8px 8px 0 red`. Rows become grid `1fr 78px` (text | 72px thumbnail), teaser truncated to ~72 characters + `…`. Archiv button full width. Ink band stacked with the button below.

### 2. Article page — `/news/:slug`

**Purpose:** read one post; share it.

**Layout (desktop):** masthead → centred `max-width: 820px` column (`padding: 38px 64px 0`):
1. Back link „← Alle Neuigkeiten" — red, 800/14, no border/background.
2. `margin-top: 24px`: category chip + `18. Juli 2026 · von Franz-Josef Besen` (`sub`, 700/13).
3. H1 Anton 62/0.93, `margin-top: 16px`.
4. Lead paragraph in **Anton 25/1.24, colour `sub`** — the display font used as a deck, not Archivo.
5. **Hero** (`margin: 32px auto 0`) — `2px solid ink` + `10px 10px 0 <tint>`, image height **368px**; caption under it: „Foto: Vereinsarchiv · Platzhalter" (12/600 `sub`, `margin-top: 9px`).
6. **Body** — paragraphs 18/1.72 in `ink`, `20px` between them. Inline `<b>` allowed for emphasis (motto, dates) at weight ~700.
7. **Share row** — `margin-top: 34px`, `padding-top: 24px`, `border-top: 1.5px line`. Label `TEILEN` (900/10.5, ls 1.4, `sub`) + primary „WhatsApp" (red bg, `onRed`, `1.5px solid red`, 13.5/800, `padding: 10px 18px`) + secondary „Link kopieren" (transparent, `1.5px solid line`, ink text).
8. **`MEHR AUS DEM VEREIN`** — section rule + 3-column grid, gap 20. Quiet cards: `1.5px solid line`, `paper` bg, image 132px, then `padding: 16px 18px 18px` with `KATEGORIE · 12.07.` (900/10, ls 1.2, in the tint — **ink when the tint is gold**) and Anton 21/1 headline.
9. **Closing band** — inverted panel, `MITMACHEN` + Anton 34 „WERDE TEIL VON FURRIA", right: red primary button „Mitglied werden →" with `5px 5px 0 <panel fg>`.
10. Footer.

Total rendered height: **2416px**.

**Mobile:** single column, 22px padding. H1 34px, lead Anton 17/1.28, hero 200px with `7px` shadow, body 14.5/1.70. „MEHR" shows **2** posts as horizontal cards (`78px` thumb | text, `1.5px line`, `padding: 10px`).

### 3. Landing-page teaser (block, not a page)

Drop-in block for the homepage, intended **above the „Mitmachen" band**.

- `padding: 52px 64px` (mobile `26px 22px`), page `bg`.
- Header row: red 14×14 square + Anton 34 „AUS DEM VEREIN"; right „Alle News →" (red, 900/14, `white-space: nowrap`).
- Grid `repeat(3, 1fr)` gap 20 (mobile: single column, gap 12).
- Card 1 is the emphasised one: `2px solid ink` + `6px 6px 0 red`. Cards 2–3: `1.5px solid line`, no shadow.
- Each card: image 150px (mobile 120px) or typographic fallback → `padding: 18px 20px 20px` → chip + short date → Anton 24/1 headline → teaser truncated to ~90 chars + `…` (13/1.5 `sub`).
- Height at 1300px: **491px**.

### Photo placeholders and the typographic fallback

Two things a developer must not confuse:

1. **Placeholder graphics** (`KKPlh` in the design system) — diagonal-striped boxes with a lowercase monospace label (`motto-56-session`, `foto`). These are **mock stand-ins for real photos** and disappear in production.
2. **Typographic "poster" fallback** (`NewsPoster`) — a **real production feature**. Posts often have no photo. Instead of an empty box, render a solid block in the post's tint, with a faded club-broom watermark at 16% opacity in the top-right (`KKBroom`, ~95% of the block height), and the **category name in Anton, bottom-left** (desktop hero 54px, list thumb 22px, teaser card 30px, mobile thumb 13–14px), `padding: 22px` (14px small). Text colour: white, or **ink on gold**. It must be impossible for a post to look broken because the board had no picture.

---

## Interactions & Behaviour

- **Navigation:** the lead post card, every list row and every „mehr" card is a full-area link to `/news/:slug`. In the prototype these are `<button>`s flipping local state; in production they must be real `<a href>` — the shareable URL is the whole point of having a detail page.
- Back link returns to `/news`.
- **Share:** „WhatsApp" → `https://wa.me/?text=<encoded title + URL>` (or the Web Share API on mobile, falling back to the wa.me link). „Link kopieren" → `navigator.clipboard.writeText(location.href)` plus a short confirmation (the mock does not draw one — use the site's existing toast/inline-confirm pattern; a 2s label swap to „Link kopiert ✓" is enough).
- **Hover states** (not captured in the static mocks — implement per the system):
  - List row: background lifts to `paper`, the headline goes `red`. Keep the row height stable (no border/size change).
  - Lead post / cards: shadow offset grows ~2px and the card translates `-2px, -2px` in `120ms ease-out`, so the "poster" shadow reads as a lift.
  - Buttons: primary red → `redDk`; outline → border and text to `red`.
  - All transitions `120–160ms ease-out`. Respect `prefers-reduced-motion` (the site already gates its marquee/float animations behind it).
- **Focus:** every card link needs a visible focus ring — `2px` `red` outline with `2px` offset, square. Do not remove outlines; the whole page is a set of large link targets.
- **Empty state** (a brand-new club season with 0 posts): show the page head, the heavy rule, and one quiet hairline panel with „Noch keine Meldungen in dieser Session." + a link to the Archiv. No illustration.
- **Archiv:** a single button, one page per session listing titles + dates only. No filters, no infinite scroll.
- **Loading:** if the target framework renders client-side, use hairline skeleton blocks matching the row grid — never spinners.

### Responsive behaviour
The mocks are fixed-canvas at 1300 and 400. Intended in-between behaviour:
- ≥1100px: as drawn; side padding may grow, content capped ~1300px centred.
- 700–1100px: Lead post stacks (image on top, text below, full width); list rows keep the `date | text | thumb` grid but the thumb shrinks to ~120px; „mehr" grid → 2 columns; teaser → 2 columns with card 1 spanning both.
- <700px: the mobile layout described above; thumbnails 72px; drop the date rail into the meta line.
- Type: scale the Anton display sizes down roughly linearly between the two drawn ends (`clamp()` is fine); never take the article body below **16px**, and keep tap targets ≥44px.

## State Management

Minimal. The prototype keeps `cur` (the open post id, `null` = list) in `useState` only because it has no router. In production:

- Routing replaces that state entirely: `/news` and `/news/:slug`.
- List page data: `posts[]` sorted by date desc; `posts[0]` is the lead post (there is **no** manual "featured" flag in the design — newest wins; add a flag only if the client asks).
- Article page: the post by slug + `posts.filter(p => p.slug !== current).slice(0, 3)` for „mehr".
- Local UI state: the copy-link confirmation flag. Nothing else.

### Content model (per post)
| Field | Type | Notes |
|---|---|---|
| `slug` | string | URL id, e.g. `motto-56` |
| `title` | string | German, no length cap in the design but 2 lines look best |
| `category` | enum | `Session` \| `Erfolge` \| `Verein` \| `Gruppen` (fixed set, drives the tint) |
| `date` | date | rendered twice: long („18. Juli 2026") and short („18.07.") |
| `teaser` | string | 1–2 sentences; truncated to ~72 chars on mobile rows, ~90 in the teaser block |
| `body` | rich text | paragraphs + inline bold; that is all the design supports |
| `image` | optional | **may be null** → typographic fallback |
| `author` | optional | falls back to „Vorstand" |
| `readingTime` | derived | „2 Min. Lesezeit" on the lead post only |

Locale: German date formatting (`de-DE`), Central European time.

### Editing side (out of scope here)
Publishing is done by the club board from the internal club app; that admin UI is **not part of this handoff**. Whatever backs it, the public side only needs the fields above.

## Assets
- **Fonts:** Google Fonts — `Anton` (400) and `Archivo` (500,600,700,800,900). Loaded via `<link>` in the prototype; in production self-host or use the framework's font pipeline.
- **`KKBroom`** — the club's broom mark, an inline SVG in `src/fcc-theme.jsx`. Used as the watermark inside the typographic fallback. Take it from there (or from the site's existing icon set).
- **Photos:** none real. All image areas are placeholders; the client supplies photos. Labels in the mocks (`motto-56-session`, `foto`, `portrait`) indicate what belongs there.
- No icon font, no icon library — the only glyphs used are `→`, `←`, `·`, `✓`.

## Files
| File | What it is |
|---|---|
| `preview.html` | Runnable preview of everything in this bundle (Desktop/Mobile, Hell/Dunkel, Liste/Artikel/Landing-Teaser). Open in a browser. |
| `src/fcc-ds-news.jsx` | **The news design itself** — `NewsPage({mode, device, view})`, `NewsTeaser({mode, device})`, the `NEWS` sample content, `NewsPoster` (typographic fallback), `NewsKat` (category chip), `NewsRule` (section header), `NewsShare`. |
| `src/fcc-theme.jsx` | Design-system brand layer: the `KK` light/dark tokens, `KKMastheadBar` (site header), `KKFooter`, `KKBroom`, `KKPlh` (placeholder), `KKConfetti`, `KKSeal`. |
| `src/fcc-shared.jsx` | Mock-only phone frame (`PhoneFrame`, `StatusBar`, `HomeIndicator`) — presentation chrome for the mobile mocks, **do not port**. |
| `src/fcc-logos.jsx` | Club coat-of-arms / logo vectors used by the header and footer. |

Sample content in `NEWS` is realistic placeholder copy in the club's voice (motto announcement, dance-group result, call for helpers, rehearsal change, AGM, kids' performance). Two of the six posts intentionally have `img: false` so the typographic fallback is visible in both the list and the teaser.

## Explicitly out of scope — do not build
Tag/category filters · search · pagination or infinite scroll · comments · author pages · related-posts algorithm (it is just „the 3 next newest") · newsletter signup · RSS unless asked · social embeds · a second featured slot.
