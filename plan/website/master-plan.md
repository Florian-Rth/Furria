# Website — Master Plan

The public website of the Furrscher Carnevals Club e.V. ("FURRIA"). One of three apps
served by the single backend (`server/`); this plan covers **only** the public website
(`web/apps/website`).

---

## How this plan works

- **Master plan (this file)** is the dashboard. It holds the feature index and the phases.
  It is the entry point: to know whether a feature exists, look at the index; to know what
  ships next, look at the phases.
- **Feature files** (`feature-*.md`) are durable **intent** documents — what a feature is,
  why, the decisions already made, open questions, and "done when" outcomes. They may name
  patterns and big architectural choices. **No code, ever.** They are evergreen: they
  describe the whole capability and outlive any single phase.
- **Phases** are shippable milestones. A phase links to the features it advances and states
  the **slice** it delivers this phase (many-to-many: one feature can be touched by several
  phases). Phases carry status; feature slices are checkboxes.
- **Decisions:** feature-scoped decisions live in the feature file. Cross-cutting,
  hard-to-reverse decisions become an **ADR** (`docs/adr/`) and the feature file links to it
  — never restate an ADR.
- **Glossary:** domain terms live in `CONTEXT.md` only. This plan uses them, never redefines
  them.
- **Where the "how" goes:** concrete implementation detail (component breakdown, tasks, API
  shapes) is volatile and belongs to the moment of building — the PR or a throwaway working
  doc — **not** these files.

**Feature status** (frontmatter `status`): `idea` → `shaping` → `ready` → `building` → `shipped`.

---

## Overview

A responsive, German-language marketing + ticketing site in the "Konfetti Kinetik" brand.
Guiding constraints (all binding):

- **Web-app first, Capacitor-wrappable** later (native push, widgets) — keep it a standard
  responsive web app.
- **ONE theme across all apps** (Corporate Identity), consumed from `@furria/ui`. No new
  colors, fonts, radii, shadows. Light + dark.
- **Routes/IDs/props = English. Visible text = German.**
- **Narrenruf is "Gross - Furria!"** — never Helau/Alaaf.
- One backend API serves all apps; the website consumes **public read endpoints** only.

**References:** [`CONTEXT.md`](../../CONTEXT.md) · [design handoff](../../docs/design/README.md)
(READ FIRST governs mock usage) · [`docs/adr/`](../../docs/adr/).

---

## Feature index

| Feature | Type | Status | Purpose |
|---|---|---|---|
| [Site-Shell](feature-site-shell.md) | foundation | idea | Masthead nav, footer, theming, layout, `@furria/ui` wiring |
| [API-Client](feature-api-client.md) | foundation | idea | Data layer to the backend public read endpoints |
| [SEO & Meta](feature-seo-meta.md) | foundation | idea | Meta tags, Open Graph / social-share cards |
| [Ticker](feature-ticker.md) | foundation | idea | Flat red/gold marquee signature chrome |
| [Landing](feature-landing.md) | capability | idea | Home page — composes the blocks below |
| [Landing-Hero](feature-landing-hero.md) | capability | idea | Identity centerpiece: headline, CTAs, stats, hero photo |
| [Programm-Teaser](feature-program-teaser.md) | capability | idea | Home "DAS PROGRAMM" upcoming-events section |
| [Mitmachen-Band](feature-mitmachen-band.md) | capability | idea | Home recruit CTA → membership funnel |
| [Verein](feature-about-verein.md) | capability | idea | Verein story, Ämter, Gruppen showcase |
| [Veranstaltungskalender](feature-event-calendar.md) | capability | idea | Public event list/calendar + detail |
| [Ticket-Shop](feature-ticket-shop.md) | capability | idea | Browse ticketed events, checkout, payment |
| [Aktuelles](feature-news.md) | capability | idea | News posts (list + detail) |
| [Bildergalerie](feature-gallery.md) | capability | idea | Public event photo gallery |
| [Mitglied werden](feature-membership-funnel.md) | capability | idea | Membership info + application funnel |

---

## Phases

### P0 — Shell & theme
**Status:** planned
Deployable, branded empty shell: nav + footer + light/dark, `@furria/ui` wired, the app
builds and deploys.

- [ ] [Site-Shell](feature-site-shell.md) — masthead nav, footer, theming, layout, routing
- [ ] [API-Client](feature-api-client.md) — scaffold + config (no endpoints yet)
- [ ] [SEO & Meta](feature-seo-meta.md) — base document head, favicon, defaults

### P1 — Landing hero
**Status:** planned
The home page's identity centerpiece is live (static content).

- [ ] [Landing](feature-landing.md) — page skeleton + block composition/order
- [ ] [Landing-Hero](feature-landing-hero.md) — full hero block (static copy/stats)
- [ ] [Ticker](feature-ticker.md) — marquee under the hero

### P2 — Landing complete
**Status:** planned
The full landing page reads end-to-end (still static/placeholder data).

- [ ] [Programm-Teaser](feature-program-teaser.md) — 3 upcoming cards, placeholder data
- [ ] [Mitmachen-Band](feature-mitmachen-band.md) — recruit CTA band

### P3 — Verein
**Status:** planned
`/verein` live.

- [ ] [Verein](feature-about-verein.md) — story, Ämter, Gruppen showcase (static content)

### P4 — News
**Status:** planned
`/aktuelles` live — the marketing site is content-complete.

- [ ] [Aktuelles](feature-news.md) — list + detail

### P5 — Events (real data)
**Status:** planned
Public calendar live; the home page shows real upcoming events + live ticket scarcity.

- [ ] [API-Client](feature-api-client.md) — real public event endpoints
- [ ] [Veranstaltungskalender](feature-event-calendar.md) — list/calendar + detail
- [ ] [Programm-Teaser](feature-program-teaser.md) — wire to live API + scarcity badge
- [ ] [Landing-Hero](feature-landing-hero.md) — wire stats to live API

### P6 — Ticketing
**Status:** planned
Buy a ticket online. *Depends on backend ticketing domain (not yet schema'd — see design §7).*

- [ ] [Ticket-Shop](feature-ticket-shop.md) — browse, checkout, Stripe/PayPal, confirmation

### P7 — Gallery
**Status:** planned

- [ ] [Bildergalerie](feature-gallery.md) — public event photos

### P8 — Membership funnel
**Status:** planned

- [ ] [Mitglied werden](feature-membership-funnel.md) — info + application
- [ ] [Mitmachen-Band](feature-mitmachen-band.md) — wire CTA to the funnel
