# Handoff: FCC / FURRIA — Club-App (internal member app)

> **Furrscher Carnevals Club e.V. ("FURRIA")** — a German *Karnevalsverein* in "Großbesenstadt", est. 1971.
> This package is the design + information handoff for the **internal Club-App**. Everything a developer needs to
> implement it — design system, data model, routes, per-feature specs — is in this README. The HTML files are the
> visual reference mocks.

---

## ⚠️ READ FIRST — How to treat these mocks (supersedes §3 "Fidelity")

These mocks are a **design direction, not a spec**. They are inspiration that mostly still
needs much work. When implementing a feature:

- **Binding:** the design *language* — tokens, colors, typography (Anton/Archivo), radii,
  elevation, the primitives and signature gestures in §5, and the conventions in §12.
  Project ruling on top: **ONE theme across all apps** (Corporate Identity) — base radius
  **14** everywhere; §5's "website cards 18px" is superseded.
- **Not binding:** everything else. Page layouts, flows, features, copy, information
  architecture — changing them is OK and **actively requested** where a better solution
  exists. Treat each mock as a notepad of ideas, not a target to pixel-copy.
- When you deviate substantially, say so and explain why — the deviation is welcome, the
  silence is not.

---

## 1. Overview

The full product is a **three-part platform**:

1. **Public website** — presents the Verein, public event calendar, ticket shop with cinema-style seat picker, news/gallery, "Mitglied werden" funnel. *(context; the landing mock here is the start of it)*
2. **Club-App (internal, members)** — **THIS handoff.** Member master-data, roles, fees & payments, event planning, live show control, drinks kitty, shop, gallery, keys.
3. **Event web-app (guests, no install)** — per-table photo upload, live photo wall, digital programme. *(context, not in scope)*

Content language is **German** (all visible UI text). Code identifiers, routes and IDs are **English**.

---

## 2. About the design files

The files in this bundle are **design references authored in HTML/React-via-Babel** — prototypes that show the intended
**look, layout and behavior**. They are **not** production code to copy verbatim. They render on an in-browser
"design canvas" (pan/zoom) using CDN React + Babel standalone, purely so we could iterate quickly.

**The task is to recreate these designs in the real app's codebase**, using its established stack and patterns.
If no codebase exists yet, recommended stack: **React + TypeScript + Vite**, a component library of your choice
(the design maps cleanly to plain CSS / CSS-modules / Tailwind), and a REST or tRPC API over the SQL schema in §7.
Later the web app is wrapped in **Capacitor** for native push, iOS live activities and home-screen widgets, so keep the
front-end a standard responsive web app.

Do **not** ship the Babel/CDN setup or the `design-canvas` / `browser-window` chrome — those are presentation
scaffolding only.

## 3. Fidelity

**High-fidelity.** Colors, typography, spacing, radii, elevation and interactions are final and intentional. Recreate
the UI faithfully with the tokens in §5. The one exception: images are placeholders (`KKPlh`, a hatched box with a
label) — wire real photos where those appear.

---

## 4. How to view the mocks

Open either HTML file in a browser (they need internet for the CDN scripts + Google Fonts):

- **`FCC Design System.html`** — the design language (foundation, color, type, form, components, icons, patterns) **plus its application**: the public **Website** (light/dark, desktop/mobile) and the interactive desktop **Club-App** (clickable nav, role switch).
- **`FCC Club-App - Feature Mocks.html`** — the built-out **feature pages**, each in its own canvas section, desktop (in a browser frame) and mobile (in a phone frame).

Pan = drag; zoom = scroll/pinch. Each framed rectangle ("artboard") is one screen.

---

## 5. Design System — "Konfetti Kinetik"

Bold editorial-newspaper DNA, festive but — in the current **"Destillat"** treatment — **calm and wertig**: soft
elevation, hairlines, dezente Akzente. Same language across Website and App.

### Typography
- **Display / headings / numbers:** **Anton** (Google Fonts) — condensed, near-uppercase. Used for headlines, big numbers, section titles, dates, the FURRIA wordmark.
- **UI / body:** **Archivo** (Google Fonts), weights 500–900. Everything else.
- Two-tone headline pattern: line 1 ink, line 2 red. A **whisper** poster shadow is allowed on a hero headline only: `text-shadow: 3px 3px 0 <ink>`.

### Color tokens (light)
| token | hex | use |
|---|---|---|
| `bg` | `#FBF4E6` | cream page background |
| `panel` | `#FFFFFF` | cards / surfaces |
| `panel2` | `#FBF8F1` | secondary surface |
| `ink` | `#1A1411` | primary text / lines |
| `sub` | `rgba(26,20,17,0.60)` | secondary text |
| `faint` | `rgba(26,20,17,0.40)` | tertiary text |
| `red` | `#E11D2A` | **accent / action only — never body text** |
| `redDk` | `#B3101C` | pressed/hover red, dark-mode offset |
| `gold` | `#F4B400` | festive accent (seal, ticker stars, avatars) |
| `green` | `#2E9E5B` | status ok / paid |
| `blue` | `#2F6DA8` | status info |
| `line` | `rgba(26,20,17,0.12)` | hairline borders |
| `line2` | `rgba(26,20,17,0.07)` | faintest divider |
| sidebar `sideBg` | `#171210` | app dark sidebar |

**Dark mode (Website)**: `bg #15110E`, `ink #FBF4E6`, `red #FF3B47`, `gold #FFC42E`, `paper #221B16`, lines in cream alpha. (See `KK.dark` in `fcc-theme.jsx`.)

Status semantics: **green = ok/paid**, **gold = warning**, **red = danger/action**, **blue = info**.

### Form
- **Radius:** app base `14px`; cards on the website `18px`; **buttons are pills** (`borderRadius: 50`); chips `20px`.
- **Elevation — soft is the standard (Website *and* App):**
  - card rest: `0 1px 2px rgba(26,20,17,0.05)` (app) / `0 6px 20px rgba(26,20,17,0.08)` (website)
  - raised/photo: `0 12px 32px` … `0 22px 48px rgba(26,20,17,0.12–0.16)`
  - hairline border `1–1.5px solid line` on every surface.
- **Hard offset-shadow** (`4–5px 4–5px 0 ink`, `2px` ink contour) is now only a **rare accent** for a single hero element (e.g. a red "Held-Banner") — **not** the default. In dark mode the offset uses gold/red instead of ink.

### Signature gestures
- **Crossed-broom mark** (`KKBroom`) — the coat-of-arms. Used as the logo lockup with the **FURRIA** wordmark, and as a large **faint background watermark** (~5% opacity ink) to fill negative space.
- **Editorial section header:** red square + Anton label + hairline rule running to the edge.
- **Masthead nav** (newspaper kopf): top meta strip → row of `nav-links —— FURRIA —— flanks` with Login + red **Tickets** pill.
- **Ticker:** flat red bar, Anton text, gold `✶` separators, marquee scroll (no skew).
- **11.11 seal** (`KKSeal`): gold disc, ink dashed ring, "11.11 / ERÖFFNUNG".
- **Confetti** (`KKConfetti`): deterministic scattered chips, used **sparingly** (≤13 in a hero), never over a reading column.

### Components (see `fcc-ds-shell.jsx` → `window.T`, `Ic`, and primitives)
`Card`, `Chip` (tones: red/gold/green/ink/blue/neutral), `Btn` (primary / ghost / sm, optional icon), `Avatar`,
`Eyebrow`, `Title`, `Progress`. Icon set `Ic` is a 24×24 stroke set (`home, calendar, clock, star, image, beer,
shirt, users, grid, chart, settings, broadcast, bell, search, plus, trash, refresh, check, chevron, chevdown, pin,
key, euro, upload, bolt, logout`). App chrome: `AppShell` (top strip + dark role-aware sidebar + topbar).

---

## 6. Identity model (LOCKED)

A person's identity has **three independent layers** — do not collapse them:

- **(A) Mitgliedschaftsart** — exactly **one** per member: `Aktiv` / `Passiv` / `Jugend` / `Ehren`. Drives the yearly Beitrag (≈ **30 €**, **15 €** for Kind/Jugend).
- **(B) Gruppen** — **many-to-many**, fully CRUD + archivable, any size (Tanzgarde, Männerballett, Elferrat, Spielmannszug, …). The user picks a display title.
- **(C) Ämter (offices)** — grant **targeted** admin rights. **There is no all-access "Vorstand" super-role.**

### Ämter (fixed, rights-bearing set — NOT freely created)
- **Unique (always exactly these):** Präsident, Präsidentin, Kinderpräsident/in, Geschäftsführer, Schriftführer, Finanzen, Getränkewart.
- **Per-group:** Trainer / Gruppenleiter.
- **Multi:** Fotograf, Kleidung.
- **Technical:** **Admin** (separate from elected roles).

**Assignment & hierarchy:** you assign an Amt to a person **only in Mitglieder-Management** (member detail), and only
**hierarchically** — you must hold an Amt of at least equal rank to grant it. **Exception:** Trainer/Gruppenleiter is
conferred by setting someone as a group's trainer in `/groups`, which **auto-grants Trainer rights scoped to that one
group** (manage its members, add trainers, edit its calendar entries). The **rights-per-Amt matrix** is configured on
the **Admin-only `/roles` (Ämter & Rechte)** page.

**Mitglied ≠ Account.** Everyone is in the member DB; an app login is **optional** and 1:1-linked. Onboarding is
**invite-only** via a one-time token (link OR printed QR/code for email-less members). Inviters: Geschäftsführer,
Präsident, Präsidentin, Admin. Photo-consent is captured at signup. Login = username/email + password (reset via email
or admin reset link).

**Visibility default:** members see almost everything **read-only**; only personal/financial data + edit rights are
gated by Ämter.

---

## 7. Database model

Full DBML in **`FCC-Schema.txt`** (paste into dbdiagram.io to visualize). Summary:

- **`person`** — master data (name, contact, address). The root everything hangs off. `membership`/`account` are 1:1 to it.
- **`membership`** — one per person; `type` (`active`/`youth`/`honorary`), `status`, `started_at`/`ended_at`.
- **`account`** — optional 1:1 login (username, email, password_hash, status, last_login_at).
- **`invitation`** — one-time onboarding token (`token`, `invited_by`, `expires_at`, `accepted_at`).
- **`group_category`**, **`group`** (archivable via `archived_at`), **`group_membership`** (m:n person↔group, `is_trainer` flag).
- **`permission`** (key/name/area), **`role`** (= Amt; `key`, `parent_id` for hierarchy, `is_unique`), **`role_permission`** (m:n matrix), **`role_assignment`** (person↔role, `assigned_by`).

> The schema currently covers identity/roles/groups. Extend it for the feature domains below (fees/ledger, events,
> ticketing, seating, program, drinks kitty, shop orders, gallery, keys) following the same conventions.

---

## 8. Route tree (English routes; German labels)

No `/admin` prefix — a permission guard handles visibility. 
Route tree has to be worked out. The paths that are visible in the mocks are not final. Even the pages and its contents that the mocks show, are not final. They are just ideas how it could look like and they act as a notepad, to remember features that we need / could build.

---

## 9. Feature specs (what each must do) + where the mock lives

All mocks use only the design-system primitives. Desktop bodies live in the named module and are dispatched by
`renderFccPage(id, {role, go})` (+ `PAGEMETA`) in `fcc-ds-pages.jsx`; mobile equivalents in `fcc-ds-mobile.jsx`;
nav + gating in `NAVCONFIG` (`fcc-ds-shell.jsx`).

- **Mitglieder-Management** (`/members/manage`, `fcc-ds-members.jsx`) — master data; assign Ämter (hierarchical) + groups (m:n). The root all else hangs off.
- **Gruppen** (`/groups`, `fcc-ds-groups.jsx`) — create/edit/archive (privileged: GF/Präsident/in/Admin); set a group's Trainer (auto-grants scoped Trainer rights). Everyone else read-only.
- **Ämter & Rechte** (`/roles`, `fcc-ds-roles.jsx`, **Admin-only**) — curated rights-per-Amt matrix.
- **Beiträge & Kasse / Zahlungen** (`/fees`, `fcc-ds-fees.jsx`) — yearly fees tiered by Mitgliedschaftsart. **Ledger is the source of truth; payment is pluggable** (Ledger-only / **Stripe** / **PayPal**). One payment system bundles **Beitrag · Shop · Getränkekasse · Ticket-Einkäufe** (no Spenden). Member side is **light**: an "offen"-Hinweis on Übersicht → a focused one-tap pay-flow (Stripe card / PayPal), **no** personal finance dashboard. Amt-Finanzen page: income by category, offen-vs-bezahlt, members by type, Jahres-Kassenbericht CSV/PDF. **Belegverwaltung / Auslagen** tab (outflow): member submits an expense (Beleg photo, amount, category, event, note) → Finanzen genehmigt → marks **"bar erstattet"** → auto-booked into the same ledger → **Kassenbericht = Einnahmen − Ausgaben = Saldo**.
- **Veranstaltungsplaner** (`/events`, `fcc-ds-events.jsx` + `fcc-ds-program.jsx`) — **a status/task hub, NOT a linear stepper.** An event opens to task cards with status (offen/in Arbeit/erledigt), tackled in **any order**: (a) **Eckdaten** (name/date/location/motto → published immediately so the public site can advertise), (b) **Vorverkauf/Ticketing** (Kontingent/Preis/VVK-Fenster, sale by channel, member pre-orders, fast offline-ticket entry; **live remaining-ticket scarcity feeds the public site as marketing**), (c) **Werbung** (auto-generate shareable material from event data + brand: Instagram Story/Post, Flyer A6, WhatsApp-Status; live brand-composed poster + share/download), (d) **Saalplanung** (reuses the Saalplan-Editor, informed by sold tickets), (e) **Programm/Reihenfolge** (below).
- **Auto-Reihenfolge (Programm-Algorithmus)** (`fcc-ds-program.jsx`) — computes the best running order. **Objective: maximise change-time** for performers in multiple groups (avoid back-to-back). **Not fully automatic** — optimise around inputs: (a) pinned acts at fixed positions, (b) hints (earlier/later/opener/finale), (c) category tags (Tanz, Büttenrede, Show, Gastauftritt…) to avoid clustering, (d) other weighted factors. Present best order; planner locks/nudges and re-runs. The human stays in control; the app does the combinatorics.
- **Saalplan-Editor** (`/seating`, `fcc-ds-seating.jsx`) — mobile-first drag&drop hall planner (pointer events). **Primary object = Tischreihe** (N×80cm banquet tables butted into a row; chairs auto-placed on the long sides; moved/rotated/resized as one batch; single table = Reihe of length 1). Add by choosing Länge + Quer/Hoch; inspector changes Länge live, dreht, toggles Kopfplätze; Tischreihen-Block helper drops parallel rows. Two modes (Tische planen / Saal einrichten), 10cm snap + meter ruler, Bühne/Bar/Eingang/Säule/Fluchtweg obstacles, live Kapazität-HUD (Plätze/Ziel 350). **Build generic — reused as the public ticket-shop seat map.**
- **Live-Regie** (`/live`, `fcc-ds-live.jsx`) — runs the planned order **live**. `PageLive` operator cockpit + `MLive` performer view + lock-screen push. Current act advances down the list; **last-second changes propagate in real time**; performers get a **push when up next** ("du bist als nächstes dran"), scoped to the performing group. The bridge between plan and evening. *(Rename placeholder: "Live-Regie" is good.)*
- **Bierliste & Getränkekasse** (`/drinks` + `/drinks/inventory`, `fcc-ds-drinks.jsx`) — season starts with ~2 pallets of beer (club/one person pays). Any member can **sponsor crates for the round**. Digitises today's cash-on-paper pain: crate **stock + low-stock warning, digital Strichliste, per-person balance, who's paid/open**. Member buys crates, pays open balance via the Getränkewart's PayPal link **or** cash — **payment is always Getränkewart-confirmed** (status "gemeldet → wartet auf Bestätigung"). Top-3 + own-rank scoreboard (no amounts). Getränkewart: Kasse/Bestand/offen stats, **"Geld erhalten"** reconcile flow, Teilnehmerliste, **Palettenabgleich** card (app dictates how many crates to move to the paid side). 12 €/Kiste, 80 at season start. Participation is a **per-user flag**.
- **Klamotten-Shop** (`/shop` + `/shop/manage`, `fcc-ds-shop.jsx` + `fcc-ds-shop-manage.jsx`) — Dauer-Sortiment + seasonal **Sammelbestellung**. Member browses, picks Größe, orders & pays **direct (Stripe/PayPal) OR bar (Amt confirms)**, tracks "Meine Bestellungen". Amt Kleidung gets an **auto-consolidated supplier list** (X× Gr. L …, CSV/PDF/send), **Ausgabe-Tracking** (abhaken wer abgeholt hat) + bar-offen, and a Sortiment tab. Products: Softshell-/Fleece-Jacke, Polo, Schal, Mütze, Narrenkappe (Herren/Damen).
- **Schlüssel-Management** (`/keys`) — a registry: editable key-types (Sporthalle, Vereinsraum, Lager Halle, Lager Vereinsraum) → who holds each. **Visible to all members** so they know whom to ask. **Not an Amt.**
- **Trainingsplaner / Spielplan** (`/schedule`) — **one shared calendar** for everyone; trainers edit in place. No private/personal calendar.
- **Bildergalerie** (`/gallery`) — members upload/view event photos; gated by photo-consent.
- **Übersicht** (`/`, dynamic personalised home) — *(to refine)* each member sees what's relevant to them: their open balance, next training/event, when their group is on stage, pushes. Role-aware. The glue.

---

## 10. Money model (summary)
- **Ledger is source of truth; payment methods are pluggable.** Member-facing: **Stripe (card) + PayPal**. One payment system bundles Beitrag, Shop, Getränkekasse, Ticket purchases.
- **Fees** yearly, tiered by Mitgliedschaftsart. Member pays an open balance one-tap; controlling lives on `/fees`.
- **Reimbursements (Auslagen)** stay **cash** (Bar vom Finanzwart) — the app tracks & books them so the Kassenbericht is complete.
- **Getränkekasse** — one kasse under the Getränkewart; payments always Getränkewart-confirmed.

---

## 11. File manifest (in this bundle)

**Entry HTML (open these):**
- `FCC Design System.html` — design language + Website + interactive App.
- `FCC Club-App - Feature Mocks.html` — all feature pages, desktop + mobile.

**Data:** `FCC-Schema.txt` (DBML).

**Shared / brand:** `fcc-theme.jsx` (KK brand: `KK` light/dark palette, `KKBroom, KKSeal, KKTicker, KKConfetti, KKMastheadBar, KKProgramCard, KKFooter, KKPlh` photo placeholder), `fcc-logos.jsx` (coat-of-arms vectors), `fcc-shared.jsx` (`PhoneFrame, StatusBar, HomeIndicator`).

**App design system:** `fcc-ds-shell.jsx` (**tokens `T`, icons `Ic`, primitives `Card/Chip/Btn/Avatar/Eyebrow/Title/Progress`, `NAVCONFIG`, `AppShell`**), `fcc-ds-docs.jsx` (the documentation panels), `fcc-ds-pages.jsx` (`renderFccPage` + `PAGEMETA` dispatcher), `fcc-ds-mobile.jsx` (mobile app + bottom-nav).

**Public website:** `fcc-ds-landing.jsx` (`BestV({mode, device})` — the current "Destillat" landing, light/dark, desktop/mobile).

**Feature pages:** `fcc-ds-members.jsx`, `fcc-ds-groups.jsx`, `fcc-ds-roles.jsx`, `fcc-ds-events.jsx`, `fcc-ds-seating.jsx`, `fcc-ds-program.jsx`, `fcc-ds-fees.jsx`, `fcc-ds-live.jsx`, `fcc-ds-drinks.jsx`, `fcc-ds-shop.jsx`, `fcc-ds-shop-manage.jsx`.

**Canvas scaffolding (presentation only — do not port):** `design-canvas.jsx`, `browser-window.jsx`, `fcc-app-mocks.jsx`.

---

## 12. Non-negotiable conventions (carry into the codebase)
- **Compose the system, don't extend it.** Use the tokens + primitives. No new colors, fonts, radii, shadows.
- **The Narrenruf is "Gross - Furria!"** — never "Helau" or "Alaaf" in any copy. This is local law.
- **Routes/IDs/props = English. Visible text = German.**
- Red is **accent/action only — never body text.**
- Soft elevation is the default; the hard offset-shadow is a rare single-hero accent.
- Anton for display/numbers, Archivo for UI/body.
- Web-app first; keep it Capacitor-wrappable (native push, iOS live activities, widgets later).
