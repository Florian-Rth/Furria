# Handoff: FURRIA — Termine & Karten (öffentliche Website)

Design direction for the public **Events area** (Programm, event detail, Platzwahl,
Kauf/Karte, Kartenbörse). This bundle arrived **without a README** — this file was written
by the team when the bundle was moved into the repo (2026-08-12), *before* any shaping
session had ruled on it.

> **Read `docs/design/README.md` → "READ FIRST" first.** It governs every mock in this
> repo: the design *language* (tokens, Anton/Archivo, radius 14, soft elevation) is
> binding; layouts, flows, features and copy are **inspiration, not spec**, and improving
> them is actively wanted.

## What the mock contains

Open `preview.html` in a browser (needs internet for CDN React + Google Fonts). It renders
`EventsPage({ mode, device, view, id })` with five views, faked with `useState` because the
prototype has no router: `index` (Spielplan, plus a `kalender` toggle), `detail`, `seats`
(Platzwahl/Saalplan), `karte` (paid confirmation + digital ticket), `boerse` (Kartenbörse).

| File | Content |
|---|---|
| `src/fcc-web-events.jsx` | Data + building blocks, Spielplan (list + two months), event detail |
| `src/fcc-web-tickets.jsx` | Saalplan/Platzwahl, digitale Karte, all mobile views, mock router |
| `src/fcc-web-boerse.jsx` | Kartenbörse page + the pieces wiring it into the other views |
| `src/fcc-theme.jsx`, `fcc-logos.jsx` | Shared brand layer |
| `src/fcc-shared.jsx` | Mock-only phone frame / canvas chrome — **do not port** |

## How this bundle is processed

The area is planned in [`plan/website/events/`](../../../plan/website/events/master-plan.md)
— one plan file per page, each shaped in its own grilling session. **Rulings (Adopted /
Rejected / Added by us) are recorded here, per page, during those sessions** — the
[join-page README](../join-page/README.md) is the model. None have been made yet; nothing
in this bundle is adopted by default.

## ⚠️ Known invented facts (unverified until a shaping session confirms them)

- **288 seats** in 24 table rows × 12, 62 Stehplätze, the whole hall geometry
- **12 € flat price** for every seat and every evening
- **Six events** with concrete 2027 dates, times (19:11 …), age hints and teasers
- **"Präsidentin Marlies Hoffmann"** and the private mobile **0170 55 44 21** — a plausible
  named person in an Amt with a private number, banned twice over (P5 invented-people rule,
  P6 private-mobile rule)
- **SMS notifications** with a 6-hour Vorkaufsrecht, live-updating lists, a live Ablauf on
  the evening, Wallet passes, a Shuttle nach Sondershausen, Gruppenbestellungen
- The Börse mechanics as a whole (return → waitlist → public, free swap, named tickets,
  QR invalidation) are **design fiction to confirm**, not documented club practice
