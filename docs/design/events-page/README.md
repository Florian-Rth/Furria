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
[join-page README](../join-page/README.md) is the model. Nothing in this bundle is adopted
by default.

## Rulings — Events data foundation (shaped 2026-08-13)

**Adopted**

- **One venue for everything** — confirmed real: every ticketed evening is in the
  Dorfgemeindehaus Großfurra (`EV_ORT` verified, exception to the invented-facts list).
- **The six event types** (1. + 2. Prunksitzung, Weiberfasching, Jugendfasching,
  Rentnerfasching, Kinderfasching) with their calendar-correct 2026/27 dates — the club's
  real usual season. Teasers/times/prices stay placeholder.
- **`evStatus`'s one-phrasing idea** — one label formula for all states ("N von M frei"),
  color carries the urgency.
- **Eckdaten fields**: Einlass + Beginn, age hint (as free text), teaser sentence + event
  type.

**Rejected**

- **The four-state stored `status`** (`offen · knapp · ausverkauft · bald`, stored
  redundantly next to `frei`/`kap`/`vvk`) — replaced by a backend-owned 7-state
  `salesStatus` lifecycle enum (adds `salesClosed`, `cancelled`, splits `bald` into
  `announced`/`presaleScheduled`); a seed builder derives it from counts so seed data can
  never contradict itself.
- **Flat 12 € price** (`EV_PREIS`) and the "für jeden Abend gleich, für jeden Platz
  gleich" copy — price varies per event (flat within one evening).
- **Fixed 288-seat capacity** (`kap: 288`) — capacity and the seating plan are per event;
  the hall is set up differently each time.
- **The rough end time** ("Ende ca. 2:00") — the club doesn't promise an end publicly;
  field dropped.

**Added by us**

- **Progressive publishing** — events go public at `announced` with only the core known;
  Einlass, age hint, price, capacity, VVK start may arrive later (nullable).
- **Programm narrowed to ticketed evenings only** (`CONTEXT.md`, 2026-08-13) — unticketed
  happenings (Rosenmontagsumzug) leave the website's Programm entirely.

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
