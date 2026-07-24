# Handoff: FCC „Verein"-Seite (öffentliche Website)

## Overview
The public **Verein** page for the **Furrscher Carnevals Club (FCC / „FURRIA")**, a German
Karnevalsverein in the fictional „Großbesenstadt". It is the „About the club" page of the
public marketing website — the page a prospective member or ticket buyer lands on to learn
who the club is: hero, club story, chronicle/timeline, the season arc, the groups (Gruppen),
the people (Vorstand/faces), and a membership call-to-action.

Design direction is **„Plakat-Kapitel"**: a bold editorial broadsheet made of numbered,
full-bleed chapters (01–05) that alternate ink / cream / red backgrounds, using a hard
offset poster-shadow as the leading elevation language. This is the club's „Konfetti-Kinetik"
brand system.

Both **Desktop and Mobile** layouts and **Light and Dark** themes are included.

## About the Design Files
The files in this bundle are **design references created in HTML/React** — prototypes that
show the intended look and behavior. They are **not production code to ship as-is**.

The task is to **recreate this design in your target codebase** using its established
framework, component library, and patterns (React, Vue, Svelte, Astro, plain HTML/CSS,
etc.). If no codebase exists yet, choose the most appropriate framework for a public
marketing site and implement the design there.

The reference is written as inline-styled React components loaded via Babel-in-the-browser
(fine for a prototype, not for production). Port the **visual design, layout, copy, and
interactions** — not the Babel/inline-style delivery mechanism.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, and the two interactions (group
detail modal; theme) are final and intentional. Recreate the UI faithfully. The only
placeholders are **images** (diagonal-striped boxes with a monospace caption naming what
photo belongs there) and the club history copy (marked „Placeholder").

## How to view the reference
Open `preview.html` in a browser (it fetches React, Babel and Google Fonts from a CDN, so
it needs internet). Toolbar toggles switch Desktop/Mobile and Hell/Dunkel. Desktop design
width is **1300px**; mobile is a **400×858** phone frame (the frame is only for presentation
— build a normal responsive mobile layout, not a hardcoded 400px canvas).

---

## Design Tokens

### Colors — Light theme (`KK.light`)
| Token | Value | Use |
|---|---|---|
| `bg` | `#FBF4E6` | cream page background |
| `ink` | `#1A1411` | primary text, borders, dark chapter panels |
| `red` | `#E11D2A` | accent / action ONLY (never body text) |
| `redDk` | `#B3101C` | link hover |
| `gold` | `#F4B400` | festive accent, seal, timeline dots |
| `sub` | `rgba(26,20,17,0.62)` | secondary/muted text |
| `paper` | `#FFFFFF` | card surfaces |
| `line` | `rgba(26,20,17,0.14)` | hairline rules |
| `onRed` | `#FFFFFF` | text on red |

### Colors — Dark theme (`KK.dark`)
| Token | Value |
|---|---|
| `bg` | `#15110E` |
| `ink` | `#FBF4E6` (text/ink inverts to cream) |
| `red` | `#FF3B47` |
| `redDk` | `#E11D2A` |
| `gold` | `#FFC42E` |
| `sub` | `rgba(251,244,230,0.6)` |
| `paper` | `#221B16` |
| `line` | `rgba(251,244,230,0.16)` |
| `onRed` | `#FFFFFF` |

**Note on dark „ink" panels:** because `ink` becomes cream in dark mode, the design uses a
separate helper `v2Panel()` for the dark chapter blocks (chapters 02, 05, hero) so they stay
genuinely dark: bg `#0C0806`, fg `#FBF4E6`, sub `rgba(251,244,230,0.62)`. Replicate this — a
naive „use ink as panel bg" produces a cream panel in dark mode, which is wrong.

### Typography
- **Anton** (Google Font, single weight 400) — all display: headings, chapter numerals,
  numbers, the wordmark. Condensed, near-uppercase feel. Used with tight `line-height`
  (0.74–1.1) and small positive `letter-spacing` (0.2–4px).
- **Archivo** (Google Font, weights 500–900) — all UI/body text. Body copy is weight
  500–600; labels/eyebrows 800–900; buttons 800–900.
- Never use red for body text; red is accent/action only.

### Elevation — two languages
- **Plakat (hard):** `Npx Npx 0 <color>` — a solid offset shadow, no blur. This is the
  LEADING elevation. Helper: `v2Hard(c, n=8, col) => `${n}px ${n}px 0 ${col||c.ink}``.
  Offsets range 3–12px; shadow color is often `red` or `gold` (tinted) or `ink`.
- Cards/tiles pair the hard shadow with a **2px solid `ink` border**, `border-radius: 0`
  (everything is square-cornered — no rounded corners anywhere in this direction, except
  the round `Tickets` pill button and circular seal).

### Spacing
- Desktop section horizontal padding: **64px** (`PAD = '0 64px'`); mobile: **20–22px**.
- Vertical rhythm between chapters: **78px** top padding (desktop), 28px (mobile).
- Grid/flex gaps: chapter content 14–56px; group grid 18px; portrait wall 16px.

---

## Layout & Screens

Single scrolling page. Desktop content width 1300px. Section order top → bottom:

### 0. Masthead bar (`KKMastheadBar`)
Newspaper-style header that IS the nav (no separate logo lockup). Two rows:
- **Dateline row** (11px, 800, letter-spacing 2, `sub`): left „GROSSBESENSTADT · EST. 1971",
  center „★ DIE FÜNFTE JAHRESZEIT ★" (accent color), right „11.11.2026 · 19:11 UHR".
  Bottom hairline border.
- **Nav row:** left nav links „Verein / Programm / Galerie" → 2px flex-grow rule → centered
  masthead „Nº 128 · **FURRIA** (Anton, 54px) · SESSION 2026" → 2px rule → right „Login"
  link + red pill „Tickets" button (`border-radius: 40px`).

### 1. Hero (dark/ink panel)
- Min-height ~620px, padding `58px 64px 0`, background = dark panel (`v2Panel`).
- Faint scattered **confetti** overlay (`KKConfetti`, opacity 0.3).
- Giant outlined session numeral **„55"** — Anton 380px, `-webkit-text-stroke: 2px red`,
  transparent fill, absolutely positioned top-right, opacity 0.85, behind content.
- **Ribbon banner** rotated -8°, absolute top-left, red bg, onRed text, hard shadow:
  „SEIT 1971 · GROSSBESENSTADT".
- Content column (max 680px): red eyebrow „FURRSCHER CARNEVALS CLUB e.V. · 55. SESSION";
  H1 Anton 82px, line-height 0.88: „DIE FÜNFTE / JAHRESZEIT / **HAT EIN ZUHAUSE.**" (last
  line red); lead paragraph (19px, 500); two buttons — primary red `V2Btn` „Mitglied werden
  →" + ghost „Zum Programm".
- Bottom-right: framed photo placeholder (`session-buehne-2026`, 380px wide, 2px red border,
  12px red hard shadow) with a floating **11.11 seal** (`KKSeal`, 110px, rotated -9°) tucked
  into its top-right corner (gentle float animation).

### 2. Kapitel 01 — „EIN VEREIN MIT HERZ" (cream)
Chapter header pattern (see below), then a 2-column grid (`1fr 1.05fr`, gap 56):
- Left: framed photo placeholder (`vereinsfoto-2026`, h 380, red hard shadow).
- Right: large Anton pull-quote (38px) + body paragraph (contains the „Placeholder — echte
  Vereinsgeschichte" note) + a 4-up stat strip separated by left borders:
  `1971 gegründet · ≈180 Mitglieder · 6 Gruppen · 55. Session` (numbers Anton 40px).

### 3. Narrenruf band (full-bleed RED)
Red background, white text, faint rotated broom watermark (opacity 0.12). 2-col grid
(`0.8fr 1.2fr`): left kicker „UNSER NARRENRUF — UND NUR DIESER" + sentence („Kein „Helau".
Kein „Alaaf". … ruft **Groß**"); right giant Anton 130px, right-aligned:
„GROSS / **FURRIA!**" (second line outlined white stroke, transparent fill).

### 4. Kapitel 02 — „DIE CHRONIK" (dark/ink panel)
Vertical spine timeline: a 3px vertical rule on the left; each of 5 milestones is a
dot (`red` for the first, else `gold`; 20px, 3px ink border) + a cream card (2px border,
hard shadow tinted red/gold) containing an Anton year (52px) and title + description.
Milestones (`V2_MILESTONES`): 1971 Der erste Besen · 1979 Die erste Garde · 1988 Ein eigenes
Heim · 2004 Der große Umzug · 2021 50 Jahre FURRIA. (Mobile shows first 4.)

### 5. Kapitel 03 — „EINE SESSION" (cream)
Chapter header + intro paragraph, then a 5-column card row (`repeat(5,1fr)`, gap 14). Each
card: 2px border + hard shadow; first card is red-filled (accent), rest are paper. Anton tag
(30px), bold title, description. Season steps (`V2_SEASON`): 11.11. Die Eröffnung · Advent
Proben & Aufbau · Februar Prunksitzungen · Rosenmo. Der Umzug · Aschermi. Der Ausklang.
(Mobile stacks these vertically.)

### 6. Kapitel 04 — „UNSERE GRUPPEN" (cream)
Chapter header + a note „Aktuell 6 Gruppen — die Liste wächst…". Auto-fill grid
(`repeat(auto-fill, minmax(210px, 1fr))`, gap 18) of clickable **group tiles** (`V2GroupTile`)
— must scale to any number of groups. Each tile: 2px ink border, hard shadow tinted by the
group's accent; a striped photo placeholder (h 96) with a numbered corner badge (01, 02…);
Anton title (20px); short blurb; a meta line (member count) + „Mehr →". Mobile: 2-column
grid.

Tile → opens a **detail modal** (`V2GroupModal`, see Interactions). Groups data
(`V2_GROUPS`): each = `[title, shortBlurb, meta, tint('red'|'ink'|'gold'), fullText, leiter,
treffen]`:
- Tanzgarde · Funkenmariechen & Gardetanz · 18 Aktive · red · Leitung Sabine Wirbel ·
  Dienstags 19:00 Turnhalle
- Männerballett · Zwölf Männer, ein Tutu-Traum · 12 Aktive · ink · Uwe Fass · Mittwochs 20:00
  Vereinsheim
- Elferrat · Der närrische Rat auf der Bühne · 11 Räte · gold · Franz-Josef Besen · Nach
  Bedarf Vereinsheim
- Spielmannszug · Trommeln & Flöten für den Umzug · 22 Aktive · ink · Bernd Groß · Donnerstags
  19:30 Musikraum
- Kindergarde · Die Kleinsten ganz groß · 24 Kinder · red · Lena Kehr · Freitags 17:00
  Turnhalle
- Organisation · Getränke, Kasse & Küche · Alle Hände · gold · Uwe Fass · Nach Bedarf
(Full blurbs are in `src/fcc-ds-club-v2.jsx` → `V2_GROUPS`.)

### 7. Kapitel 05 — „MENSCHEN, DIE FURRIA SIND" (dark/ink panel)
Portrait wall: 6-column grid (gap 16). Each: framed portrait placeholder (h 180, 2px border
+ hard shadow, both tinted by role accent), red role eyebrow (10.5px, 900), Anton name
(21px). People (`V2_VORSTAND`): Präsident Franz-Josef Besen (red) · Präsidentin Marlies
Furrmann (gold) · Kinderpräsidentin Lena Kehr (ink) · Geschäftsführer Bernd Groß (gold) ·
Getränkewart Uwe Fass (ink) · Trainerin Sabine Wirbel (red). (Mobile: 2-col, first 4.)

### 8. Recruit finale (full-bleed RED, centered)
Two faint rotated broom watermarks flanking. Kicker „MITMACHEN · AB 30 € IM JAHR · KINDER
15 €"; Anton H2 84px „WERDE TEIL VON FURRIA"; lead paragraph; two buttons — white bg / red
text „Mitglied werden →" (ink hard shadow) + ghost white „Tickets & Programm".

### 9. Footer (`KKFooter`)
Always dark (`#1A1411`, cream text). Broom + FURRIA wordmark + club blurb + 3 social circles;
three link columns VEREIN / EVENTS / MITMACHEN (headings gold); bottom bar „© 2026 Furrscher
Carnevals Club" + „Impressum · Datenschutz".

### The chapter-header pattern (`V2Chapter`) — reused
Flex row, align-end, gap 22, margin-bottom 34: giant Anton chapter number in **red** (132px,
line-height 0.74) · a block with a letter-spaced eyebrow („kicker", 12.5px 900 `sub`) above an
Anton title (~54–62px) · a flex-grow **3px ink rule** running to the right edge. Mobile
version (`V2MChapter`) shrinks the numeral to 62px and title to 27px.

---

## Interactions & Behavior
- **Group tile → modal.** Clicking any group tile opens `V2GroupModal`: a centered dialog
  over a `rgba(10,7,5,0.6)` scrim. Modal = paper card, 2px ink border, big hard shadow tinted
  by the group's accent, max-width 560px (desktop) / near-full (mobile). Content: header photo
  placeholder (h 220 / 150) with an ✕ close button (top-right, hard-shadow square); meta
  eyebrow; Anton title (38 / 30px); full description paragraph; a 2-column footer LEITUNG /
  TREFFEN separated by a top hairline; a red „Mitglied werden →" button. Closes on scrim click
  or ✕. In the reference the scrim is `position:absolute` scoped to the artboard — **in
  production use a normal fixed-position overlay / your modal primitive.** State = single
  `openIdx` (index into groups, or null).
- **Theme (Hell/Dunkel).** Whole page re-themes via the `KK.light` / `KK.dark` token sets +
  the `v2Panel` dark-panel override. Wire it to your site's theme switch / `prefers-color-scheme`.
- **Animations** (`prefers-reduced-motion: no-preference` only): `fcc-float` — 6s gentle
  ±10px vertical bob, used on the seal and confetti chips. `fcc-mq` — 26s linear marquee
  (defined for the brand ticker; not used on this page but part of the system).
- **Hover states** are not elaborated in the reference (prototype). Apply your system's
  standard hover affordances: tiles/buttons should read as clickable (e.g. subtle shadow /
  translate on the hard-shadow elements, color shift on links to `redDk`).
- **Responsive:** the reference has two discrete layouts (desktop 1300px, mobile ~400px).
  Build a fluid responsive page: multi-column grids (2-col hero, 5-col season, 6-col
  portraits, auto-fill groups) should collapse to 1–2 columns on small screens; type scales
  down (see the mobile component values as the small-end targets).

## State Management
Minimal: `openIdx` (selected group index | null) for the modal, and the active `mode`
(light/dark). Everything else is static content. No data fetching in the design — but in
production the **Gruppen, Vorstand, Chronik, and Session** data should come from a CMS/DB
(the club-app's member/group data), not be hardcoded. The design is explicitly built to scale
to any number of groups (auto-fill grid).

## Assets
- **Images:** none real. Every image is a striped placeholder (`KKPlh`) captioned with what
  belongs there: `session-buehne-2026`, `vereinsfoto-2026`, per-group photos, `portrait`.
  Replace with real club photos. Photo usage is consent-gated in the club-app.
- **Logo / broom mark:** vector, in `src/fcc-logos.jsx` (`FCCBroom` and the crossed-broom
  coat-of-arms). The `KKBroom` (crossed brooms), `KKSeal` (11.11 „ERÖFFNUNG" seal), and
  `KKConfetti` are all inline SVG/CSS in `src/fcc-theme.jsx` — reuse or re-vector them.
- **Fonts:** Anton + Archivo from Google Fonts (`<link>` in `preview.html`).
- **Icons:** a small stroke icon set lives in `src/fcc-shared.jsx` (`Icon`); this page barely
  uses it.

## Files
- `preview.html` — runnable preview (toolbar: Desktop/Mobile, Hell/Dunkel).
- `src/fcc-ds-club-v2.jsx` — **the Verein page itself** (`ClubV2`, `ClubV2Desktop`,
  `ClubV2Mobile`, all sub-components + content data). Start here.
- `src/fcc-theme.jsx` — brand tokens (`KK.light`/`KK.dark`) + shared brand components
  (`KKMastheadBar`, `KKFooter`, `KKSeal`, `KKBroom`, `KKConfetti`, `KKPlh`, `KKTicker`,
  buttons). The visual source of truth.
- `src/fcc-logos.jsx` — the broom/coat-of-arms vector art (`FCCBroom`).
- `src/fcc-shared.jsx` — phone frame + status bar (mobile presentation only) + icon set.

## Conventions to preserve
- **Routes/IDs/code = English; all visible text = German.** This page's route is `/club`
  (public site). Keep the German copy verbatim.
- Compose from the brand tokens/components — **do not invent new colors, fonts, radii, or
  shadows.** Red is action/accent only, never body text. One bold hero/„Plakat" element per
  screen; don't put the hard shadow on literally everything.
