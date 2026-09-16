# Handoff: Personen &amp; Gruppen (FCC / FURRIA Club-App, Block 2)

## Overview
This bundle covers the **people-and-groups half of the internal member app** of the *Furrscher Carnevals Club e.V.* (FCC, brand name **FURRIA**), a German carnival club with ~150 affiliated people.

Eleven screens in five areas:

1. **Verzeichnis** (read-only for every logged-in member) — `Mitglieder` list, `Person` detail.
2. **Gruppen** (read-only) — `Gruppen` showcase, `Gruppe` detail.
3. **Gruppen-Hub** — one hub per group a person belongs to, with the *same* screen becoming writable for that group's admins.
4. **Mein Profil** — one new setting: "Meine Kontaktdaten für Mitglieder sichtbar".
5. **Verwaltung** (right-gated) — `Personenverwaltung`, `Person bearbeiten` (dated facts), `Gruppenverwaltung`, `Rollen & Rechte`.

Every list has a loading and an empty state; every destructive write has a confirmation **dialog** (desktop) / **bottom sheet** (mobile).

UI language is **German**. Routes, ids, props, component names are **English**.

## About the Design Files
The files in `design/` are **design references written as HTML + React (Babel-in-browser)**. They are prototypes that show intended look, structure, copy and behaviour — **not production code to copy**. They are not wired to data, have no routing, and use inline styles because they render on a design canvas.

The task is to **recreate these designs in the target codebase's own environment**, using its established framework, component library, styling approach, state management and data layer. If no environment exists yet, pick the appropriate stack for a small club web app (the product direction is: **web app first, later wrapped in Capacitor** for native push / iOS live activities / home-screen widgets) and implement there.

Open `design/FCC Club-App - Personen und Gruppen.html` in a browser to see all 44 artboards on a pannable canvas (drag to pan, scroll to zoom). Needs an internet connection (React, Babel and Google Fonts load from CDN).

## Fidelity
**High-fidelity.** Colours, typography, spacing, borders, radii and copy are final and come from the club's existing "Konfetti Kinetik" design system (this bundle is its **light, app-side dialect**, identical to the already-approved `FCC Club-App - Mocks` Layout D). Recreate pixel-close.

Two caveats:
- Photos are **placeholders** (dashed box, diagonal hatch, monospace caption). Real images come later from the gallery feature.
- All people, groups, phone numbers and addresses are **invented sample data**.

Mocks are drawn at a fixed **1400 px desktop** width (inside a browser-chrome frame) and **400 × 858 px mobile** (inside a phone frame). See *Responsive behaviour*.

---

# Design tokens

Everything below is used verbatim in the mocks. Source of truth in code: `design/fcc-ds-shell.jsx` (`window.T`) and the local palette `PGP` at the top of `design/fcc-pg-kit.jsx`.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#1A1411` | All body and heading text, dark buttons, sidebar rail on dark screens |
| `sub` | `rgba(26,20,17,0.60)` | Secondary text |
| `faint` | `rgba(26,20,17,0.40)` | Eyebrows, meta, captions, disabled |
| `red` | `#E11D2A` | **Action and accent only — never body text.** Primary buttons, section markers, active nav, "Amt"/role labels, destructive actions |
| `redDk` | `#B3101C` | Red hover |
| `gold` | `#F4B400` | Festive accent, warnings, "sucht Verstärkung", honorary member seal, `ruht` |
| `goldText` | `#9a7200` | Gold chip text (contrast) |
| `green` | `#2E9E5B` | ok / paid / `aktiv` / switch on |
| `blue` | `#2F6DA8` | info; the "hat Schlüssel" marker and "sensibel" right marker |
| `cream` | `#FBF4E6` | Card fill on app screens, text on ink |
| `bg` | `#FDFCFA` | Page background |
| `stage` | `#FFFFFF` | Header ("Bühne") base, master-detail panels, dialogs |
| `line` | `rgba(26,20,17,0.12)` | Hairline border, 1.5px |
| `line2` | `rgba(26,20,17,0.07)` | Row separators inside white areas |
| `cardLine` | `rgba(26,20,17,0.08)` | Row separators inside cream cards |
| canvas backdrop | `#f0eee9` | Design-canvas only, not part of the app |

Gradients / glows (header only):
- `stageBg`: `linear-gradient(168deg, #FFFFFF 0%, #FFFDF8 46%, #FDF6E9 100%)`
- red glow: absolutely-positioned `radial-gradient(closest-side, rgba(225,29,42,0.10), rgba(225,29,42,0))`, 520×440, `top:-170px; right:-40px` (desktop) / 320×300, `top:-120px; right:-70px` (mobile)
- gold glow (sidebar top): `radial-gradient(closest-side, rgba(244,180,0,0.16), rgba(244,180,0,0))`, 420×340, centred, `top:-70px`

Chip palette (`Chip` in `fcc-ds-shell.jsx`) — `[foreground, background]`:

```
red     #E11D2A  rgba(225,29,42,0.10)
gold    #9a7200  rgba(244,180,0,0.16)
green   #2E9E5B  rgba(46,158,91,0.13)
ink     #1A1411  rgba(26,20,17,0.08)
blue    #2F6DA8  rgba(47,109,168,0.12)
neutral sub      rgba(26,20,17,0.06)
```

## Typography

Two families, loaded from Google Fonts:
`Anton` (single weight) and `Archivo` (500, 600, 700, 800, 900).

- **Anton** — display: page titles, card titles, numbers, nav items, section labels, role names. Always set with `letter-spacing: 0.4–1.8px`, `line-height: 1`, and written **UPPERCASE in the content** (not via `text-transform`, except nav).
- **Archivo** — everything else. Weights: 600 body, 700 dense meta, 800 row titles / labels, 900 eyebrows and buttons.

Scale as used (px):

| Role | Font | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Page title desktop | Anton | 40 | — | `PgDesk` header |
| Page title mobile | Anton | 30–34 | — | |
| Card / role title | Anton | 30–34 | — | Role detail header |
| Section label | Anton | 13–16 | — | ls 1.4–1.6, with red square + rule |
| Nav item | Anton | 17 | — | ls 0.5, uppercase |
| Stat number | Anton | 26 | — | above an 10px eyebrow |
| "seit" year | Anton | 15–17 | — | right-aligned in rows |
| Eyebrow | Archivo | 10–11 | 900 | ls 1.6–1.8, uppercase, `faint` |
| Row title | Archivo | 13–14.5 | 800 | |
| Body | Archivo | 12.5–13.5 | 600 | line-height 1.45 |
| Meta / caption | Archivo | 11–12 | 600–700 | `faint` |
| Chip | Archivo | 9.5–11 | 800 | |
| Button | Archivo | 13 (sm) / 14.5 | 800 | |
| Placeholder caption | monospace | 9.5 | — | ls 0.4, `faint` |

Minimum text size in the mocks is 9.5px (only for the monospace placeholder captions and the smallest chips); nothing functional sits below 11px.

## Spacing, radii, elevation

- Spacing rhythm: **6 / 8 / 10 / 12 / 14 / 18 / 22 / 26 / 28 / 32** px. Section gap desktop 26–28, grid gap 18–32.
- Desktop content padding `28px 36px`; header padding `24px 36px`; sidebar padding `24px 22px 20px`.
- Mobile: header `4px 18px 18px`, body `16px 18px 84px` (the 84px keeps content clear of the floating nav pill).
- Radii: **cards 16**, panels/dialogs 20, inner boxes 12–14, chips/buttons/pills 30–40 (fully round), icon tiles 7–9, avatars full.
- **Two elevation languages** (carry this over):
  1. *App soft* — `1.5px solid line` hairline border, shadow `0 1px 2px rgba(26,20,17,0.05)` or none. Default for everything in this bundle.
  2. *Plakat hard* — `Npx Npx 0 ink` offset shadow, no blur. **Not used in this bundle** (it belongs to the public website and hero elements). Do not introduce it here.
- Header lift: `box-shadow: 0 10px 26px rgba(26,20,17,0.07)` under the "Bühne".
- Dialog shadow: `0 30px 80px rgba(26,20,17,0.34)`; bottom sheet: `0 -10px 40px rgba(26,20,17,0.18)`.
- Scrim: `rgba(26,20,17,0.42)` + `backdrop-filter: blur(1.5px)` for dialogs, `rgba(26,20,17,0.34)` for sheets.

## Recurring patterns

**Editorial section header** (`PgSec`) — the signature of the whole system:
`9×9px red square` · `gap 9` · Anton 13 ls 1.6 label · `flex:1` hairline rule (`1.5px`, `line2`) to the edge · optional right-hand meta or small ghost button. Bottom margin 12.

**Card** (`PgCd`) — `background: cream`, `1.5px solid cardLine`, `radius 16`, padding `4px 16px` when it holds hairline-separated rows (the rows supply their own vertical padding), otherwise `14–22px`.

**Row with "seit"** (`PgSinceRow`) — 30px round icon tile (`rgba(26,20,17,0.05)`, red-tinted when the row is a role), title 14/800, optional 11.5 meta, right column: 9px eyebrow "seit" + Anton 15–17 year.

**Stat** (`PgStat`) — eyebrow 10/900 + Anton 26 number + optional 11.5 caption. Used in header action slots.

**Confetti flecks** (`PgFlecks`) — five 7×9px rectangles in red / gold / blue, `opacity 0.4–0.5`, rotated −34…+24°, absolutely positioned in the header, floating with a 7s `translate + rotate` loop. Respect `prefers-reduced-motion` (the mock only animates when motion is allowed). This is the only decoration; keep it this quiet.

**Honorary seal** (`PgSeal`) — gold filled circle with an ink star glyph, 13–26px, optionally followed by `EHRENMITGLIED` in 11/900 `#8a6600`.

**Key marker** (`PgKey`) — 24px round `rgba(47,109,168,0.12)` tile with a blue key icon. Reserved for the later Schlüssel-Register; already rendered in the member list, person header and person management table.

**Photo placeholder** (`PgBilder`) — `1.5px dashed rgba(26,20,17,0.18)`, radius 12, `repeating-linear-gradient(135deg, rgba(26,20,17,0.045) 0 7px, transparent 7px 14px)`, centred monospace caption (`SITZUNG 24/25`, `UMZUG 23/24`, …), plus one 11.5 `faint` line of explanation underneath.

**Switch** (`PgSw`) — 46×27 pill, `radius 20`; off `rgba(26,20,17,0.16)`, on `green`; 21px white knob with `0 1px 3px rgba(0,0,0,0.25)`, 3px inset, `transition: background .2s`.

**Icons** — 24×24 stroke set in `fcc-ds-shell.jsx` (`Ic`), `stroke-width 1.85–2.6`, round caps and joins. Names used here: `home, users, grid, key, euro, star, image, settings, calendar, clock, search, plus, check, chevron, chevdown, bolt, logout, bell, beer, shirt`.

---

# App chrome

## Desktop shell (`PgDesk`, 1400×N)
```
┌───────────────┬────────────────────────────────────────────┐
│ rail 292px    │ Bühne (header)                             │
│ #FFFFFF       │  stageBg + red glow + confetti flecks      │
│ 1.5px right   │  eyebrow · Anton 40 title · 14 sub         │
│ border        │  right: stats / primary actions            │
│               ├────────────────────────────────────────────┤
│ FURRIA        │ content, padding 28/36, bg #FDFCFA         │
│ nav groups    │                                            │
│ user footer   │                                            │
└───────────────┴────────────────────────────────────────────┘
```
- Rail: wordmark `FURRIA` (Anton 26) + `CLUB-APP · SESSION 2025/26` (9/900, ls 2.2, faint). Nav grouped by 9/900 ls-2 headers: **MEIN BEREICH** (Übersicht, Meine Auftritte, Mein Profil) · **VEREIN** (Spielplan, Mitglieder, Gruppen, Galerie, Bierliste) · **MEINE GRUPPEN** (one entry per group the user belongs to) · **VERWALTUNG** (Personenverwaltung, Gruppenverwaltung, Rollen & Rechte, Beiträge & Kasse — each gated by the corresponding right). Items: 16px icon + Anton 17 uppercase; active = red icon + ink label, inactive = faint icon + `sub` label. Footer: 34px avatar, name 13/800, `Tanzgarde · Aktiv` 11/600 faint, logout icon.
- The header ("Bühne") is the only place with a gradient, a glow and confetti.
- `dialog` slot renders modals **inside** the shell (`position: absolute; inset: 0`).

## Mobile shell (`PgMob`, 400×858)
iOS-ish frame: status bar (50px), header on `stageBg` with lift, scrolling body, **floating nav pill** bottom-centre, home indicator.
- Header row: 32px round back button (`1.5px line` border, chevron-left) + eyebrow (breadcrumb) + optional right slot. Then Anton 30–34 title, then page-specific head content (search, chips, avatar row).
- Body: `padding: 16px 18px 84px`, `display:flex; flex-direction:column; gap:16`, scroll hidden (`.fcc-scroll`).
- **Nav pill** (`PgPill`): ink background, cream text, `radius 40`, padding `13px 20px 13px 17px`, shadow `0 8px 22px rgba(26,20,17,0.26)`; a 3-line "hamburger" whose **top line is red**, then the current page name in Anton 15 ls 1.4, then a 6px red dot. Sits above a `linear-gradient(to top, bg 46%, transparent)` fade. Tapping it opens the "Vorhang" (full-screen nav) — already built in the approved Layout D mocks (`fcc-app-shell-d.jsx`), not repeated here.

Mobile screens are one scroll surface; the mocks show the visible ~660px. Two deep pages ship as *two* artboards ("oben" / "weiter unten") to document what sits below the fold.

---

# Domain model

Implement this exactly; the screens depend on it.

**Person** — the registry entry. Any combination of the following may be true:
- has a **Mitgliedschaft** with a state *derived* from dated facts: `aktiv` · `ruht` · `beendet` (plus "no membership at all"),
- is an **Ehrenmitglied** (an honour that runs *alongside* the membership, granted in a session),
- belongs to one or more **Gruppen** (m:n, each with "in der Gruppe seit"),
- holds one or more **Rollen** (each with "seit").

A person in a group **need not be a Mitglied** (example: Elif Kaya, trainer of the Kindergarde). There is **no "Vorstand" catch-all role** — rights hang on roles only.

**Mitgliedschaftsart**: `Aktiv` (~30 €/yr) · `Passiv` · `Jugend` (~15 €/yr) · `Ehren`.

**Dated facts** on a person (all with Beginn / optional Ende, open-ended allowed):
- membership periods (`Aktiv 01.09.2017 – offen`, `Jugend 2014 – 2017`),
- **Ruhezeiten** — always **whole sessions** (`2025/26 – offen`), with an internal reason (`Studium`, `Schule`, `Ausbildung`, `Elternzeit`, `Krankheit`, free text). Publicly only "ruht" is shown,
- **Ehrenmitgliedschaft** (`verliehen in Session 2018/19`),
- **Beitragsermäßigungen** (reason + span of sessions; `minderjährig` is derived from the birth date automatically).

**Gruppe** — name, description (max 400 chars in the mock), openness flag `sucht Verstärkung`, founding year, `archived` + end year. Members m:n with "seit".

**Gruppen-Admin** — a per-group responsibility with a **free-text Funktion label** (Trainerin, Sprecher, Kommandantin, Betreuerin …). The label is decoration; the rights come from the role. A Gruppen-Admin **need not belong to the group**. Being a group's admin grants management rights **scoped to that one group** (members, description, openness, later its calendar entries).

**Contact visibility** — phone / email / address are **hidden from other members unless the person opts in** (default **off**). Holders of the right *"Kontaktdaten aller Personen sehen"* always see them. The UI must make the difference honest: hidden data never looks like missing data (see *Kontakt block*, below).

**Rollen** (12 in the sample data) with a `kind`:
- `basis` — **Mitglied**: everybody with app access has it automatically, read-only, cannot be assigned or edited.
- `gewählt` — Präsidentin, Präsident, Kinderpräsident (each **exactly once**), Geschäftsführer, Schriftführerin, Finanzen.
- `ernannt` — Getränkewart, Fotografin, Kleidung, Bühnentechnik (several holders allowed).
- `technisch` — **Admin**: carries every right and cannot remove rights from itself.

**Rights catalogue** — a flat, **growing** list of 26 rights in 7 logical groups. One right = one thing you may do, each with a German plain-language description. Never a read/write/delete matrix. Full data in `design/fcc-pg-kit.jsx` (`RIGHTGROUPS`); groups and ids:

| Group | Rights (id) |
| --- | --- |
| Personen & Mitgliedschaft | `p_view` (Grundrecht), `p_detail` (sensibel), `p_edit`, `p_member`, `p_ehren`, `p_del` (unwiderruflich) |
| Gruppen | `g_manage`, `g_members`, `g_admins` |
| Rollen & Rechte | `r_manage`, `r_rights` (sensibel), `r_assign` |
| Beiträge & Kasse | `m_view` (sensibel), `m_book`, `m_expense`, `m_drinks` |
| Veranstaltungen | `e_manage`, `e_program`, `e_seating`, `e_live`, `e_tickets` |
| Inhalte & Außenauftritt | `c_gallery`, `c_news`, `c_shop` |
| Verein | `k_keys`, `s_settings` (sensibel) |

Right flags: `base` (implicit for everyone, shown locked), `sens` (privacy-relevant → blue "sensibel" chip), `danger` (irreversible → red "unwiderruflich" chip).

## Routes

```
/members                 Mitglieder (read-only list)
/members/:person         Person
/groups                  Gruppen (showcase)
/groups/:group           Gruppe
/my/groups/:group        Gruppen-Hub (member view; admin view = same route, more affordances)
/profile                 Mein Profil
/persons                 Personenverwaltung          right p_view + p_edit
/persons/:person/edit    Person bearbeiten           right p_edit / p_member
/groups/manage           Gruppenverwaltung           right g_manage
/roles                   Rollen & Rechte             right r_rights
```
No `/admin` prefix — a permission guard decides visibility.

---

# Screens

Artboard ids in brackets refer to `design/FCC Club-App - Personen und Gruppen.html`.

## 1 · Mitglieder — `/members` (read-only)

**Purpose:** find and scan ~150 affiliated people. No write actions anywhere.

**Mobile** [`mem-m`] — header: eyebrow `VEREIN`, no back button, count `152` in Anton 15 faint on the right; title `MITGLIEDER`; then a **search field** (white, `1.5px line`, `radius 30`, padding `10px 16px`, search icon + placeholder "Name, Gruppe oder Amt") and a horizontally scrolling **filter chip row** (`Alle 152` active, `Aktiv 134`, `Ehrenmitglied 6`, `Nach Gruppe`, `Mit Amt`). Active chip = ink fill, cream text; inactive = transparent with `1.5px line` border, `sub` text; 12/800, padding `6px 12px`, radius 30.

Body is one flat list with **sticky-feeling letter dividers** (Anton 15 red letter + hairline rule, padding `14px 0 4px`), grouped by **surname** initial. Row (`PgPersonRow`, padding `11px 0`, `1.5px line2` top border between rows):
- 38px avatar — `#F3EADA` fill, `1.5px rgba(26,20,17,0.10)` border, Anton initials; **gold fill for honorary members**,
- name 14.5/800 (ellipsis), inline honorary seal (14px) and key marker (11px) if applicable,
- second line 12/700: role name in **red**, then ` · `, then the person's groups in `faint`; if neither, italic `keine Gruppe` — an honest "nothing here" instead of an empty cell,
- right: state chip (`aktiv` green with dot, `ruht` gold with dot, `beendet` neutral, `kein Mitglied` neutral), small variant 10/800.

**Loading** [`mem-m-load`] — 7 skeleton rows: 38px circle + 52%/13 bar + 34%/10 bar + 54×20 pill, all `linear-gradient(90deg, rgba(26,20,17,0.07), rgba(26,20,17,0.12) 50%, rgba(26,20,17,0.07))`, `background-size: 200% 100%`, animated `pg-shim` 1.4s linear infinite.

**Empty** [`mem-m-empty`] — centred: 52px round `rgba(26,20,17,0.05)` tile with a faint icon, Anton 19 `NIEMAND GEFUNDEN`, 13 `sub` copy naming the query ("Kein Name, keine Gruppe und kein Amt passt zu „Schmidtke“. Vielleicht anders geschrieben?"), max-width 300, optional action button.

**Desktop** [`mem-d`, 1400×1150] — header sub explains the read-only contract: *"152 Personen sind aktuell mit dem FCC verbunden. Alles hier ist Ansicht — geändert wird in der Personenverwaltung."* Header action slot: 330px search.
Content grid `minmax(0,1fr) 250px`, gap 28:
- **Left** — wrapping filter chips, then one cream card acting as a table. Column head row (`10/900` eyebrows, `1.5px cardLine` bottom border): `Person 246px · Gruppen flex · Ämter 190px · Marker 96px · Status 84px`. Rows padding `9px 0`, 32px avatar + name 13.5/800 + `Mitglied seit 2014` 11 faint; groups as `ink` chips, roles as `red` chips, markers = seal / key / `—`, state chip. Footer row centred: *"… 140 weitere · scrollen oder Buchstabe wählen"*.
- **Right column** — three cream cards: **A–Z register** (25×25 round cells, Anton 13; letters without people at `rgba(26,20,17,0.22)`, current letter on `rgba(225,29,42,0.10)`), **"Der Verein in Zahlen"** (three stats 134 / 12 / 6 + a note that 6 people take part without being members), and a note explaining the reserved key marker.

## 2 · Person — `/members/:person` (read-only)

**Mobile** [`per-m` opted in, `per-m-hidden` not opted in] — header: eyebrow `MITGLIEDER`, 58px avatar next to the name **split over two Anton 30 lines** (first name / surname), then a wrapping chip row: state, `Ehrenmitglied` (gold), each role (red), `Schlüssel` (blue).
Body cards, each under an editorial section header:
- **Im Verein** — key/value rows (`PgKV`: label 12.5 faint left, value 13/800 right, `1.5px cardLine` between): `Mitglied seit`, `Mitgliedschaft`, and for honorary members `Ehrenmitglied · verliehen 2018/19`.
- **Gruppen** — one `PgSinceRow` per group with the year.
- **Ämter** — same rows, red icon tile, `key` icon.
- **Kontakt** — see below.

**Desktop** [`per-d`, `per-d-amt`, `per-d-kein`; 1400×860] — title = full name in Anton 40, sub line carries "Mitglied seit …" / "Ohne Mitgliedschaft — in der Kindergarde als Trainerin" plus the honorary session; header actions: state chip, gold seal with `EHRENMITGLIED`, key marker. Two equal columns: left **Gruppen** + **Ämter** (rows carry a second line: "Zugehörigkeit läuft", "gewählt auf der Jahreshauptversammlung"; a person in no group gets the empty state *"IN KEINER GRUPPE — X ist Mitglied, tanzt und spielt aber in keiner Gruppe mit."*), right **Mitgliedschaft** key/values + **Kontakt**.

### Kontakt block — three states (`PgContact`)
1. **Opted in** — plain cream card, three key/value rows (Telefon, E-Mail, Adresse).
2. **Not opted in** — white card with a **dashed** `rgba(26,20,17,0.18)` border: 30px round icon tile, title 13.5/800 *"Kontaktdaten sind hinterlegt, aber nicht freigegeben"*, 12.5 `sub` explanation *"<Vorname> hat die Anzeige für Mitglieder ausgeschaltet. Das ist eine Einstellung, keine Lücke — frag im Zweifel eine Gruppen-Admin."*, then three labelled 34×8 **dotted bars** (`repeating-linear-gradient(90deg, rgba(26,20,17,0.18) 0 3px, transparent 3px 6px)`) each with `privat` in 10.5/800. This is the "hidden ≠ missing" rule made visual.
3. **Not opted in, but I hold `p_detail`** [`per-d-amt`] — the normal data card **plus** a top strip with a blue key icon and 11.5/800 blue text *"Du siehst das über dein Amt — für andere Mitglieder ist es verborgen"*.

## 3 · Gruppen — `/groups` (read-only)

**Purpose:** a showcase of the club's units, not a table.

**Group card** (`PgGroupCard`) — cream card: Anton 23 (mobile) / 27 (desktop) name, eyebrow `seit 1974` (+ `· archiviert 2019`), and the **member count in Anton 28–34 red** at top right. Description 13 `sub`. Footer: overlapping avatar stack (26px, `-10px` margin, `0 0 0 2.5px cream` ring), "18 Personen", and on the right either `sucht Verstärkung` (gold chip with dot) or `Team komplett` (neutral) — archived cards show `archiviert` and render at `opacity .72`.

**Mobile** [`grps-m`] — title `GRUPPEN`, count 7, sub *"Sieben Einheiten, eine Session. Drei suchen gerade Verstärkung."*, then the cards stacked. Loading [`grps-m-load`]: two card skeletons (title bar, two text bars, one pill).

**Desktop** [`grps-d`, 1400×1215] — header stats: Gruppen 7 · Sucht Verstärkung 3 · Personen in Gruppen 93. Section "Aktive Gruppen" → `repeat(3, minmax(0,1fr))`, gap 18. Section "Ruhende Gruppen" → same grid below.

## 4 · Gruppe — `/groups/:group` (read-only)

**Mobile** [`grp-m` top, `grp-m-low` below the fold] — Anton 34 name, chip row (openness, `18 Personen`, `seit 1974`), description card, **Gruppen-Admins** (avatar, name 13.5/800, **Funktion in red 11.5/800**, `· kein Mitglied` in faint where true, right-aligned "seit" year), **Mitglieder · 18** (rows with "seit", "ruht diese Session" as second line, footer "16 weitere"), and the reserved **Bilder** area (3 placeholders, 78px tall).

**Desktop** [`grp-d`, 1400×1000] — header stats + openness tag; grid `1.25fr 1fr`: left the member list (32px avatar, function/role second line, state chip, "seit" column) and the **Bilder** row (4 placeholders, 128px); right **Gruppen-Admins** (with the note *"Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen."*) and a **Mitmachen** card (Anton 20 `WIR SUCHEN VERSTÄRKUNG`, training time, primary button "Bei Anna melden").

## 5 / 6 · Gruppen-Hub — member and admin

Same route, same layout, same components. Admin rights add affordances **in place** — no separate admin UI.

**Member, mobile** [`hub-m`, `hub-m-low`] — eyebrow `MEINE GRUPPEN`; description, admins, members, then the two reserved areas: **Termine** (white dashed card, calendar icon, *"Kommt mit dem Spielplan — Training, Proben und Auftritte der Tanzgarde. Phase 2."*) and **Bilder**.

**Admin, mobile** [`hub-m-adm`, `hub-m-adm-low`] — additionally: `Gruppen-Admin` red chip in the header, "Beschreibung ändern" ghost button in the description card, a white **openness card** with switch (*"Sucht Verstärkung / Steht dann öffentlich auf der Gruppen-Seite"*), and `+ Admin` / `+ Mitglied` ghost buttons in the two section headers; member rows gain a chevron.

**Member, desktop** [`hub-d`, 1400×1080] — eyebrow *"Meine Gruppen · du tanzt hier mit"*; left: members with "seit" + Termine + Bilder; right: **Deine Zugehörigkeit** (in der Gruppe seit / Funktion / Gruppen-Admin) and a short "Kurz gesagt" card.

**Admin, desktop** [`hub-d-adm`, 1400×1345] — eyebrow *"du bist Gruppen-Admin"*, header primary button "Mitglied aufnehmen". Member rows gain `Datum` and a red-outlined `Beenden` button; section headers gain `+ Mitglied` / `+ Admin`; the right column carries a **Gruppe pflegen** card: description textarea (white, `1.5px line`, radius 12, with a 1.5×15px red caret) + counter *"Steht auf der öffentlichen Gruppen-Seite. 208 von 400 Zeichen."* + Speichern, hairline, then the openness row with switch. Below it a "Wer erreicht wen" card. The Termine placeholder text changes to *"Du wirst sie hier direkt anlegen können."*

### Write flows
- **Mitglied aufnehmen** [`hub-m-add` sheet, `hub-d-add` dialog] — kicker `TANZGARDE`, Anton 22 title, explanation that people who aren't in the registry must be created in Personenverwaltung first; a person search with two result rows (avatar, name, current groups, red `+`); a date field `In der Gruppe seit` prefilled `01.09.2026` with quick chips `Heute` / `Saisonstart 01.09.` / `Datum wählen` and the hint that the date will show in the group list and the profile. Buttons: `Abbrechen` ghost / `Aufnehmen` red.
- **Gruppen-Admin ernennen** [`hub-m-adm2`] — person field (with the honest note "Kein Mitglied — geht trotzdem."), **Funktion** free-text with suggestion chips (Trainerin, Sprecher, Kommandantin, Betreuerin, Eigene …) and the note *"Nur ein Etikett für die Anzeige. Die Rechte hängen an der Gruppen-Admin-Rolle, nicht am Wort."*, plus `Amt seit`.
- **Zugehörigkeit beenden** [`hub-m-conf` sheet, `hub-d-conf` dialog] — see *Confirmation dialogs*.

## 7 · Mein Profil — the new setting

**Card** (`PgVisibilityCard`) — white card:
- Title 14.5–15.5/900 **"Meine Kontaktdaten für Mitglieder sichtbar"** + `an`/`aus` chip (green/neutral), switch on the right (**off by default**).
- Explanation 12.5 `sub`: *"Ist das an, sehen alle eingeloggten Mitglieder in deinem Profil Telefonnummer, E-Mail und Adresse. Ist es aus, steht dort nur der Hinweis, dass du sie nicht freigegeben hast — deine Daten bleiben im Verein hinterlegt."*
- Hairline, then a blue-key row: *"Unabhängig davon: Wer das Recht **„Personendetails sehen"** hat — Vorstandsämter, Finanzen, Admin — sieht deine Daten immer. Das lässt sich nicht abschalten und steht so auch in der Beitrittserklärung."*
- When **off**, an extra cream inset: *"Aus heißt aus: Auch deine Gruppen-Admins müssen dich dann übers Amt oder persönlich erreichen."*

**Mobile** [`prof-m-off`, `prof-m-on`] — avatar + name in the header, the setting, then Stammdaten key/values with the note that changes go through the Schriftführerin.

**Desktop** [`prof-d-off`, `prof-d-on`; 1400×880] — grid `1.15fr 1fr`. Left: the setting card, then **"Was andere von dir sehen"** — a live preview of your own list row inside a white box; with the setting on it shows Telefon + E-Mail, with it off the dotted bar plus the quoted hint text. Right: Stammdaten (incl. Geburtsdatum, Mitglied seit) and three further switches (Fotofreigabe, Push wenn meine Gruppe dran ist, E-Mail bei neuen Terminen).

## 8 · Personenverwaltung — `/persons`

**Desktop** [`adm-p`, 1400×1315] — eyebrow names the right; sub *"Alle Personen im Register — auch ausgetretene und Leute ohne Vereinsbindung."*; header: 300px search ("Name, Adresse, E-Mail") + red **"Person anlegen"**. Filter chips: `Alle 168 · Aktiv 134 · Ruht 12 · Beendet 16 · Ohne Mitgliedschaft 6 · Ehrenmitglied 6`, right-aligned note "Sortiert nach Nachname".
Table columns: `Person 224 · Geboren 96 · Kontakt flex · Mitgliedschaft 128 · Gruppen/Ämter 148 · Status 92 · (actions) 92`. Contact cell shows mail 12/700 + phone 10.5 faint + a small neutral chip **`nicht freigegeben`** where the person hasn't opted in (managers see the data *and* the fact that members don't). Actions: ghost `Bearbeiten`. Footer: "11 von 168 Personen" + `Weitere laden`.
States: **loading** [`adm-p-load`] 9 skeleton rows; **empty** [`adm-p-empty`] *"KEIN TREFFER — Zu „Wollenschläger“ gibt es keine Person. Wenn sie neu ist, leg sie an — Name und Geburtsdatum genügen."* + primary action.

**Mobile** [`adm-p-m`] — search + filter chips, rows (avatar, name + seal, `Geburtsdatum · Art seit Jahr`, state chip, chevron) and a **54px red FAB** (`plus`, shadow `0 8px 20px rgba(225,29,42,0.35)`) above the nav pill.

## 9 · Person bearbeiten — `/persons/:person/edit`

Example person: **Paula Dietz** (member since 2017, `ruht` since session 2025/26 because of her studies).

**Desktop** [`adm-pe` list state, `adm-pe-ed` with the editor open; 1400×1120 / 1420] — header actions: state chip, ghost `Verlauf`, primary `Speichern`. Grid `1.35fr 1fr`.

**Left — the dated facts.** Four sections, each a cream card of `PgFactRow`s:
- **Mitgliedschaft** (right-hand note "Beginn und Ende, offen möglich"): `Aktiv · 30 € / Jahr` — `01.09.2017 – offen`, meta "Aufnahme beschlossen 12.08.2017", green `läuft` chip; `Jugend · 15 € / Jahr` — `2014 – 2017`, meta "Übergang mit dem 18. Geburtstag" (historic rows carry no actions); footer ghost `+ Zeitraum hinzufügen`.
- **Ruhezeiten** ("ganze Sessions") — `Studium` `2025/26 – offen`, gold accent bar, meta "angelegt von Ilka Reineke am 02.09.2026".
- **Beitragsermäßigungen** — `Studium · beitragsfrei` `2025/26 – 2027/28` (meta: Nachweis) and the automatic `Minderjährig · halber Beitrag` `2014 – 2017` ("automatisch aus dem Geburtsdatum", no actions).
- **Ehrenmitgliedschaft** — empty state row with the gold seal, "Keine Ehrenmitgliedschaft", ghost `+ Verleihen`.

`PgFactRow`: 3px rounded accent bar (ink 18% / gold / red) · title 13.5/800 + optional green `läuft` chip · 11.5 faint meta · **span in Anton 15** · ghost `Ändern` + red-outlined `Beenden`.

**The dated-fact editor** (`PgFactEditor`, shown for Ruhezeit) — white card with a **`1.5px solid red` border**, header `9px red square + Anton 19 "RUHEZEIT HINZUFÜGEN"` and the right-hand rule note *"Ruhezeiten gelten immer für ganze Sessions"*. Two fields side by side (`Von Session` = 2025/26, `Bis Session` = placeholder *"offen — bis auf Weiteres"* with chips `offen lassen / 2026/27 / 2027/28`), then `Grund` with chips (Studium, Schule, Ausbildung, Elternzeit, Krankheit, Eigener Text) and the note *"Der Grund ist intern. In ihrem Profil steht nur „ruht“."* Then a cream **consequence strip** with a gold bolt icon: *"Ab Session 2025/26 zahlt Paula keinen Beitrag und zählt nicht als aktiv. Ihre Gruppen bleiben bestehen."* Footer right-aligned: ghost `Abbrechen`, red `Ruhezeit speichern`. Field style (`PgField`): eyebrow label, cream box `1.5px cardLine` radius 12 padding `11px 14px`, value 13.5/800 or placeholder 600 faint + chevron, chips below, hint underneath.

**Right column** — Stammdaten key/values plus a row showing the member's own contact-visibility switch ("von Paula selbst gesetzt"); **Gruppen** (`nur Ansicht` chip) with the note *"Gruppen pflegen die Gruppen-Admins. Überschreiben geht in der Gruppenverwaltung."*; **Ämter** (`nur Ansicht`) with the empty state *"KEIN AMT — Ämter werden unter „Ämter & Rechte“ vergeben."*

## 10 · Gruppenverwaltung — `/groups/manage`

**Desktop** [`adm-g`, 1400×950] — sub *"Die höhere Instanz: hier lässt sich jede Zugehörigkeit und jede Gruppen-Admin-Rolle überschreiben."*; header: search + red `Gruppe anlegen`. Filter chips `Alle 8 · Aktiv 7 · Archiviert 1 · Sucht Verstärkung 3 · Ohne Admin 2`.
Table: `Gruppe 210` (Anton 17 name + `seit 1974` / `· beendet 2019`), `Personen 74` (Anton 20, faint at 0), `Gruppen-Admins flex` (name 12/700 + ` · Funktion` in red; a gold **`kein Admin`** chip where none exists), `Offenheit 150`, `Status 96` (`aktiv` green dot / `archiviert` neutral), actions 168 (`Bearbeiten` + `Archivieren` red-outlined, or `Aktivieren` for archived rows). Archived rows at `opacity .66`.
Below the table: *"Archivieren löscht nichts: Die Gruppe verschwindet aus dem Verzeichnis, ihre Geschichte bleibt in den Profilen stehen."*
[`adm-g-conf`] shows the archive confirmation **dialog** over this page.

## 11 · Rollen & Rechte — `/roles` (master–detail)

The rights page is deliberately **not** a checkbox grid. It is a master–detail view: pick a role on the left, work through the rights catalogue on the right, one right per row with its description.

**Desktop** [`adm-r` Präsidentin, `adm-r-basis` the base role, `adm-r-fin` a narrow role, `adm-r-conf` with the dialog; width 1400, height 2860–2900 for the full page]

Header: eyebrow *"Verwaltung · Recht „Rechte einer Rolle ändern“"*, title `ROLLEN & RECHTE`, sub *"Der Verein legt seine Rollen selbst fest. Jede Rolle bekommt Rechte aus einem Katalog, der mit der App wächst."*, stats: Rollen 12 · Rechte im Katalog 26 · Unbesetzt 2.

Content grid `292px minmax(0,1fr)`, gap 32, `align-items: start`.

**Master (left)** — search "Rolle suchen", then roles grouped by origin with a tiny header + right-aligned hint: `GRUNDROLLE` (hat jede Person mit Zugang) · `GEWÄHLT` (Jahreshauptversammlung) · `ERNANNT` (vom Präsidium bestimmt) · `TECHNISCH` (nicht gewählt). Item: 3px red left bar when selected, Anton 17 role name, second line = holders or `unbesetzt` or `152 Personen`, right a red Anton 16 **rights count** over a `RECHTE` eyebrow. Selected item = white fill + `1.5px ink` border. Bottom: ghost `+ Rolle anlegen`.

**Detail (right)**
1. **Role header card** (white): chips (kind, `genau einmal` gold for unique roles, `mehrere möglich`, `automatisch` for the base role), Anton 34 role name, description 13.5 `sub`; actions `Umbenennen` ghost + red `+ Inhaber`. Hairline, then one of three footers:
   - base role → users icon + *"Diese Rolle wird nicht vergeben — **152 Personen** haben sie automatisch mit ihrem Zugang. Ihre Rechte sind das, was jedes Mitglied darf."*
   - has holders → `INHABER` eyebrow + holder rows (avatar, name, **role in red**, "seit" year, red-outlined `Beenden`)
   - unbesetzt → gold bolt + *"Die Rolle ist **unbesetzt**. Die Rechte sind gesetzt und greifen, sobald jemand eingetragen wird."*
2. **"RECHTE DIESER ROLLE"** section header with the count `16 von 26` on the right, plus one line of guidance: *"Jede Zeile ist eine Sache, die man tun darf. Umschalten wirkt sofort für alle Inhaber dieser Rolle."* — for Admin instead: *"Admin trägt alle Rechte. Einzelne abschalten geht nicht — dafür eine eigene Rolle anlegen."*
3. **Seven right groups.** Group header: 30px rounded icon tile (red-tinted when the role has at least one right in the group, else neutral), Anton 16 group name, 11 faint hint, hairline rule, `3 von 5` on the right. Then a cream card of right rows:
   - **row** = label 13.5/800 + optional marker chip (`sensibel` blue, `unwiderruflich` red, `Grundrecht` neutral); description 12 `sub` (max-width 560); a 108px right-aligned cross-reference column *"auch in 3 Rollen"* / *"nur hier"* / `—`; then the **switch** — or a gold `gesetzt` chip when the right is locked (base right, or Admin).

**Mobile** [`adm-r-m` list, `adm-r-m-det` one role] — the list groups roles the same way; rows show holders, a gold `frei` chip when unbesetzt, the rights count and a chevron. The detail screen intentionally shows **only what the role may do**: description, holders, then per group the granted rights with a red check tile, label and description, ending in a ghost button `Rechte ändern · 26 im Katalog` that opens the full catalogue.

---

# Confirmation dialogs

**Rule: every destructive end is confirmed in a modal.** Desktop = centred dialog; mobile = bottom sheet. Never an inline panel in a column.

Shared anatomy (`PgConfirm`):
- Scrim over the app shell (`rgba(26,20,17,0.42)` + `blur(1.5px)` for dialogs, `rgba(26,20,17,0.34)` for sheets).
- White card, `radius 20` (dialog, width 520, padding `26px 26px 22px`) or `22px 22px 0 0` (sheet, padding `22px 20px 20px`).
- Head: 34px round `rgba(225,29,42,0.10)` tile with a red bolt icon, red eyebrow (the action), Anton 20 question in caps.
- Body: one 13 `sub` paragraph that says **exactly what is lost and what survives**.
- A cream **facts table** of label/value rows (what is affected, the effective date, whether it is reversible).
- Buttons: `Abbrechen` ghost + red primary carrying the verb (`Zugehörigkeit beenden`, `Archivieren`, `Inhaberschaft beenden`). Right-aligned in dialogs, 50/50 stretched in sheets.

The three implemented cases:

| Case | Copy highlights | Facts |
| --- | --- | --- |
| Zugehörigkeit beenden [`hub-d-conf`, `hub-m-conf`] | "Sie verschwindet aus der Gruppen-Liste, bleibt aber Mitglied und behält ihre Geschichte: „Tanzgarde 2017–2026“ steht weiter in ihrem Profil." | Person · In der Gruppe seit · Ende am · Bleibt Mitglied |
| Gruppe archivieren [`adm-g-conf`] | "Die Gruppe verschwindet aus dem Verzeichnis und von der öffentlichen Gruppen-Seite. Die 9 Zugehörigkeiten werden zum gewählten Datum beendet …" | Personen betroffen · Gruppen-Admins · Ende am · Rückgängig |
| Inhaber beenden [`adm-r-conf`] | "Sie verliert sofort die 16 Rechte dieser Rolle — darunter „Kontaktdaten aller Personen sehen“ und „Gruppen-Admins ernennen“. Was sie über andere Rollen hat, bleibt." | Rolle · Im Amt seit · Ende am · Danach · Andere Rollen |

The write **forms** (Mitglied aufnehmen, Gruppen-Admin ernennen) use the same modal frame (`PgSheet`, dialog width 560) with a kicker, an Anton 22 title, an explanation, the fields, and `Abbrechen` / primary.

---

# Interactions & behaviour

- **Navigation:** person row → `/members/:person`; group card → `/groups/:group`; a group in `MEINE GRUPPEN` → the hub; role item → same route with the role selected (deep-linkable, e.g. `/roles?role=finanzen`).
- **Search:** client-side is fine at this scale; match name, group and role (the mobile placeholder promises exactly that). Debounce ~200ms, show the skeleton list only on first load, keep previous results while typing.
- **Filter chips:** single-select for the state filters, and they carry live counts. Counts must be real, not decorative.
- **Letter register (desktop):** jumps to the letter; letters without people are visibly inactive and not clickable.
- **Switches:** optimistic toggle, revert with a toast on failure. Rights toggles take effect for **all holders of the role immediately** — say so next to the list (the mock does).
- **Right-gating:** if the current user lacks a right, hide the affordance (not disable it) — except where honesty demands otherwise, e.g. the `nur Ansicht` chips on the read-only Gruppen/Ämter lists in Person bearbeiten.
- **Hidden contact data:** never render an empty field. Render state 2 of the Kontakt block.
- **Animation:** confetti flecks `translate(0,0)/rotate(0)` → `translate(4px,-8px)/rotate(14deg)` → back, 7s `ease-in-out infinite`, staggered `0.7s` per fleck, only under `prefers-reduced-motion: no-preference`. Skeleton shimmer 1.4s linear. Switch background 0.2s. Everything else static; no page transitions in the mock.
- **Responsive behaviour:** the two mocks are the two ends. The desktop rail collapses to the mobile "Vorhang" pill below ~900px; two-column detail grids become one column; tables become the mobile row list (the same data, condensed into two lines + one chip); the master–detail roles page becomes list → detail as two views. Everything except the phone frame should be fluid (`max-width`, `minmax(0,1fr)` tracks) rather than fixed.

# State
Per screen: `query`, `filter`, `loading`, `error`, `data`. Person edit: the dated-fact collections plus `editing: {kind, id} | null` for the one open editor (only one at a time). Hub: `isGroupAdmin`, plus `modal: 'addMember' | 'addAdmin' | 'endMembership' | null` with its payload. Roles: `selectedRoleId`, `rights` (a set per role), `modal`. Profile: `contactVisible`.

# Assets
None to hand over. Icons are the inline 24×24 stroke set in `fcc-ds-shell.jsx` (replace with the codebase's icon library, matching stroke width and round caps). Fonts: **Anton** and **Archivo** from Google Fonts. All photos are placeholders; the club's logo/coat of arms lives in `fcc-logos.jsx` and is **not** used on these screens (only the `FURRIA` wordmark set in Anton).

# Files

```
design/
  FCC Club-App - Personen und Gruppen.html   the canvas — open this first (44 artboards)
  fcc-pg-kit.jsx      palette PGP, primitives (PgSec/PgCd/PgAv/PgSw/PgSeal/PgKey/PgState/
                      PgSearch/PgFilters/PgStat/PgSkel/PgEmpty/PgConfirm/PgModal),
                      shells PgMob/PgDesk/PgRail, and ALL sample data +
                      the rights catalogue (RIGHTGROUPS) and roles (ROLES)
  fcc-pg-dir.jsx      screens 1–4  (Mitglieder, Person, Gruppen, Gruppe)
  fcc-pg-hub.jsx      screens 5–7  (Gruppen-Hub member/admin, write modals, Mein Profil)
  fcc-pg-admin.jsx    screens 8–10 (Personenverwaltung, Person bearbeiten, Gruppenverwaltung)
  fcc-pg-roles.jsx    screen 11    (Rollen & Rechte master–detail, desktop + mobile)
  fcc-ds-shell.jsx    design tokens `T`, icon set `Ic`, primitives Card/Chip/Btn/Avatar/…
  fcc-shared.jsx      PhoneFrame, StatusBar, HomeIndicator
  fcc-theme.jsx       brand theme + brand components (loaded, barely used here)
  fcc-logos.jsx       coat-of-arms / logo vectors
  design-canvas.jsx   the canvas harness (not part of the app)
  browser-window.jsx  desktop browser chrome for the mocks (not part of the app)
```

Loading order matters: React → ReactDOM → Babel → `design-canvas` → `browser-window` → `fcc-logos` → `fcc-shared` → `fcc-theme` → `fcc-ds-shell` → `fcc-pg-kit` → `fcc-pg-dir` → `fcc-pg-hub` → `fcc-pg-admin` → `fcc-pg-roles`.

# Naming conventions to keep
- **Routes, ids, props, components: English. Every visible string: German.**
- Never introduce a colour, font, radius or shadow that isn't in the token list.
- Red is action and accent only. One decorative flourish per screen (the confetti in the header) — no more.
- Don't invent a "Vorstand" permission. Rights come from roles, one right per capability, described in plain German.
