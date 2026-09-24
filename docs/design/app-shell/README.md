# Handoff: FURRIA Club-App — App-Shell & Übersicht (Layout D)

The navigation shell and start page of the internal Club-App, in light and dark, mobile and
desktop. It replaces the CA-P0 shell (dark sidebar + card grid). The designer's own notes are
kept verbatim in [`HANDOFF.md`](HANDOFF.md) and [`HANDOFF-CHANGES.md`](HANDOFF-CHANGES.md);
this file records **how we ruled on it** while building the shell on 2026-09-08.

> **Read `docs/design/README.md` → "READ FIRST" first.** The design *language* is binding;
> layouts, flows, features and copy are inspiration, not spec.

## What the mock contains

`preview.html` renders six frames: mobile light (3 states), mobile dark (3 states), desktop
light, desktop dark. It needs internet for CDN React + Google Fonts, so serve the folder over
HTTP rather than opening the file directly.

| File | Content |
|---|---|
| `src/fcc-app-shell-d.jsx` | `LayoutD` (mobile), `LayoutDDesk` (desktop), `DCurtain`, `DMenuButton`, `DNavList`, `DTask`, `DWeek`, `DSec`, `DChip` |
| `src/fcc-ds-shell.jsx` | Prototype tokens `T`, icon set `Ic`, club-app primitives |
| `src/fcc-theme.jsx` | Shared brand layer |
| `src/fcc-shared.jsx` | Phone frame, status bar, home indicator. **Do not port** |
| `src/fcc-logos.jsx` | Coat-of-arms / broom vectors. Not used by this shell |

## The two ideas we took

1. **The stage is about the person.** A dark band greets the member by name and carries what
   the app needs *from them*, over a light sheet holding the page body. It is the login screen's
   stage pattern carried into the app.
2. **Navigation is a curtain, not a tab bar.** On mobile a floating pill names the current
   section and opens a full-screen dark poster menu; on desktop the same list is pinned as a
   permanent left rail. Both are built.

## Rulings

**Only the shell was built (2026-09-08).** Every content section the mock shows is a data claim
the platform cannot make yet: the stage tasks need B7/B9, `Deine Woche` and `Dein Auftritt` need
B7, `Neu im Verein` needs B8. Nothing was mocked, so the stage carries the greeting and the date
only — no task list, no quiet state, no bell, no badges, no red dot on the pill. Each returns
with the phase that gives it real data.

**The Übersicht sheet is deliberately empty** until B7 lands. The Person/membership detail
CA-P0 put on `/` moved behind the curtain's avatar to `/profile`, where it uses the mock's own
section-header + hairline-row language.

**The nav carries seven entries, six of them inert.** The mock listed ten destinations; the
club ruled on them:

| Mock entry | Ruling |
|---|---|
| `Übersicht` | Real, live |
| `Live-Regie` | **Real domain** — now B13, term in `CONTEXT.md` |
| `Klamotten` | **Real domain** — now B14, term in `CONTEXT.md` |
| `Spielplan`, `Meine Auftritte` | Not new areas — member-facing views over **B7**; the nav names **Veranstaltungen** once instead of twice |
| `Bierliste`, `Schlüssel` | **Invented by the designer.** Not planned, not in the nav |
| `Mitglieder`, `Beitrag`, `Galerie` | Real — already B2, B9, B11 |

The six unbuilt entries render as inert `<span>`s, not links: they are visible so the menu reads
as designed, but **no dead route exists**, which is what CA-P0's "no placeholders" rule was
protecting.

## The second pass (`HANDOFF-CHANGES.md`, applied 2026-09-08)

**Light and dark are no longer mixed.** Stage, Vorhang and rail are *light* in light mode;
separation comes from tone steps, hairlines and the stage's shadow, not from a dark block. The
floating menu pill stays dark ink + cream in both modes — it is a button, not a surface.

**The tone scale inverted, platform-wide.** The cream `#FBF4E6` was the ground; it is now the
*surface*, and `#FDFCFA` is the ground. This changed `kkTokens.color.light` / `.dark`, so **the
public website repainted too** — approved deliberately rather than scoping a second light palette
to the Club-App, which would have drifted. Nothing in either app hardcodes a colour (audited:
zero literal hex outside `tokens.ts`), so every surface followed the palette.

| Role | light | dark | token |
|---|---|---|---|
| Chrome (stage, rail, curtain) | `#FFFFFF` | `#0E0B0A` | `kkTokens.chrome.*.base` |
| Ground (body, sheet) | `#FDFCFA` | `#161110` | `background.default` |
| Surface (cards) | `#FBF4E6` | `#1E1817` | `background.paper` |

**The stage is a raised header:** the `168deg` gradient, a downward shadow, and a z-index above
the sheet. In light mode the sheet loses its top radius and shadow — it is the body, not an
overlaid sheet; in dark it keeps `22px 22px 0 0`.

**Content blocks sit on cards** — surface colour, `1.5px` hairline, radius 16 (`KkPanel`), with
the section header outside the card. `/profile` uses this; `Deine Woche` and the rest inherit it
when B7 lands.

**The login screen was included, against the handoff's own exemption.** `HANDOFF-CHANGES.md`
keeps the login stage dark next to the light form; the club ruled on 2026-09-08 that it follows
the same rule, so `KkBrandStage` now uses the chrome gradient and a hairline against the pane.
Its drifting glows dim in light mode (`0.11` / `0.09`) and keep their old strength in dark.

**The stage is the page's header, not the shell's.** It was briefly built as chrome wrapping every
route, which put "MOIN, ‹Name›." above `/profile` — the greeting, the date and the tasks are the
Übersicht's *content*. Corrected 2026-09-08: the shell owns only the `FURRIA · SESSION` masthead
(mobile; the rail carries it on desktop) and renders a container inside the stage; each page
portals its own header in through `AppPageHeader`. Übersicht sends the greeting, `/profile` sends
a `PageTitle`. Detail pages will send a title plus their own back affordance.

**No app bar, deliberately.** The floating pill already names the current section and opens the
menu — the handoff calls it "breadcrumb and menu trigger in one" — so a top bar would repeat the
title, repeat the menu, and spend the vertical space this design deliberately gives to content.
Desktop needs none either: the rail is permanent chrome. "Up" on future detail pages belongs in
that page's own header, where it exists only when there is somewhere to go back to.

**Deviations from the spec worth knowing:**

- **`theme.applyStyles('dark', …)` is the mode switch**, because `colorSchemeSelector: 'data'`
  emits `data-light` / `data-dark` and makes `applyStyles` key off an **ancestor**. That is what
  lets a surface carry different light and dark values. The corollary: a component that sets
  `data-dark` on *itself* can never resolve `applyStyles('dark')` from its own attribute — which
  is why the forced-dark trick was dropped from the stage, rail and curtain entirely.
- **`borderRadius` in `sx` is a multiplier of `theme.shape.borderRadius` (14), not pixels.**
  Pass `` `${kkTokens.radius.card}px` ``. A bare `16` renders as 224px; on a pill or a circle it
  clamps and looks correct by accident, which is how three of these survived unnoticed.
- **The desktop breakpoint is 900 px**, the repo's existing `desktop` token, not the mock's
  ~1100 px. The mock's own note governs: the desktop layout is the wide breakpoint of one app.
- **Icons are MUI Outlined**, per the mock's "replace with the codebase's icon library if one
  exists".
- **No `Einstellungen` page exists**, so the curtain's footer entry is rendered disabled next to
  a working `Abmelden`.
- **Dark mode follows the OS** already; the manual override the mock puts in Einstellungen waits
  for that page.

## Contradictions that must not reach the codebase

| Mock | Ruling |
|---|---|
| `Anna Brunner`, `Tanzgarde`, `30 €`, `48 €`, `1. Prunksitzung` | Sample data. Never ship it — the app shows the signed-in member or nothing |
| `Tanzgarde · Aktiv` under the avatar | Group needs B3. The identity line shows the membership type alone until then |
| `SESSION 2025/26` hardcoded | Computed by `sessionAt` — sessions roll on 11.11. and are numbered from 1971 |
| Badges (`3`, `48 €`, `offen`, `42 neu`) and the pill's red dot | Data claims with no backend. Omitted |
