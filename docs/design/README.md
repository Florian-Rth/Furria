# Handoff: FCC / FURRIA — Club-App (internal member app)

> **Furrscher Carnevals Club e.V. ("FURRIA")** — a German carnival club in "Großbesenstadt", est. 1971.
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

Bold editorial-newspaper DNA, festive but — in the current **"Distilled"** treatment — **calm and high-quality**: soft
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

- **(A) Membership type** — exactly **one** per member: active / passive / youth / honorary. Drives the yearly fee (≈ **30 €**, **15 €** for children/youth).
- **(B) Groups** — **many-to-many**, fully CRUD + archivable, any size (dance guard, men's ballet, Council of Eleven, marching band, …). The user picks a display title.
- **(C) Offices** — grant **targeted** admin rights. **There is no all-access "board" super-role.**

### Offices (fixed, rights-bearing set — NOT freely created)
- **Unique (always exactly these):** president (m/f), children's president, managing director, secretary, finance, drinks warden.
- **Per-group:** trainer / group leader.
- **Multi:** photographer, clothing.
- **Technical:** **Admin** (separate from elected roles).

**Assignment & hierarchy:** you assign an office to a person **only in member management** (member detail), and only
**hierarchically** — you must hold an office of at least equal rank to grant it. **Exception:** trainer/group leader is
conferred by setting someone as a group's trainer in `/groups`, which **auto-grants trainer rights scoped to that one
group** (manage its members, add trainers, edit its calendar entries). The **rights-per-office matrix** is configured on
the **admin-only `/roles` (offices & rights)** page.

**Member ≠ account.** Everyone is in the member DB; an app login is **optional** and 1:1-linked. Onboarding is
**invite-only** via a one-time token (link OR printed QR/code for email-less members). Inviters: managing director,
president, admin. Photo-consent is captured at signup. Login = username/email + password (reset via email
or admin reset link).

**Visibility default:** members see almost everything **read-only**; only personal/financial data + edit rights are
gated by roles.

---

## 7. Database model

Full DBML in **`FCC-Schema.txt`** (paste into dbdiagram.io to visualize). Summary:

- **`person`** — master data (name, contact, address). The root everything hangs off. `membership`/`account` are 1:1 to it.
- **`membership`** — one per person; `type` (`active`/`youth`/`honorary`), `status`, `started_at`/`ended_at`.
- **`account`** — optional 1:1 login (username, email, password_hash, status, last_login_at).
- **`invitation`** — one-time onboarding token (`token`, `invited_by`, `expires_at`, `accepted_at`).
- **`group_category`**, **`group`** (archivable via `archived_at`), **`group_membership`** (m:n person↔group, `is_trainer` flag).
- **`permission`** (key/name/area), **`role`** (= office; `key`, `parent_id` for hierarchy, `is_unique`), **`role_permission`** (m:n matrix), **`role_assignment`** (person↔role, `assigned_by`).

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

- **Member management** (`/members/manage`, `fcc-ds-members.jsx`) — master data; assign roles (hierarchical) + groups (m:n). The root all else hangs off.
- **Groups** (`/groups`, `fcc-ds-groups.jsx`) — create/edit/archive (privileged: managing director/president/admin); set a group's trainer (auto-grants scoped trainer rights). Everyone else read-only.
- **Offices & rights** (`/roles`, `fcc-ds-roles.jsx`, **admin-only**) — curated rights-per-role matrix.
- **Fees & till / payments** (`/fees`, `fcc-ds-fees.jsx`) — yearly fees tiered by membership type. **Ledger is the source of truth; payment is pluggable** (ledger-only / **Stripe** / **PayPal**). One payment system bundles **fee · shop · drinks till · ticket purchases** (no donations). Member side is **light**: an "open balance" note on the overview → a focused one-tap pay flow (Stripe card / PayPal), **no** personal finance dashboard. Finance-office page: income by category, open vs. paid, members by type, annual cash report CSV/PDF. **Receipts / expenses** tab (outflow): member submits an expense (receipt photo, amount, category, event, note) → finance approves → marks **"reimbursed in cash"** → auto-booked into the same ledger → **cash report = income − expenses = balance**.
- **Event planner** (`/events`, `fcc-ds-events.jsx` + `fcc-ds-program.jsx`) — **a status/task hub, NOT a linear stepper.** An event opens to task cards with status (open / in progress / done), tackled in **any order**: (a) **Key facts** (name/date/location/motto → published immediately so the public site can advertise), (b) **Presale/ticketing** (quota/price/presale window, sale by channel, member pre-orders, fast offline-ticket entry; **live remaining-ticket scarcity feeds the public site as marketing**), (c) **Advertising** (auto-generate shareable material from event data + brand: Instagram Story/Post, flyer A6, WhatsApp status; live brand-composed poster + share/download), (d) **Hall planning** (reuses the seating-plan editor, informed by sold tickets), (e) **Programme/running order** (below).
- **Automatic running order (programme algorithm)** (`fcc-ds-program.jsx`) — computes the best running order. **Objective: maximise change-time** for performers in multiple groups (avoid back-to-back). **Not fully automatic** — optimise around inputs: (a) pinned acts at fixed positions, (b) hints (earlier/later/opener/finale), (c) category tags (dance, carnival speech, show, guest act…) to avoid clustering, (d) other weighted factors. Present best order; planner locks/nudges and re-runs. The human stays in control; the app does the combinatorics.
- **Seating-plan editor** (`/seating`, `fcc-ds-seating.jsx`) — mobile-first drag&drop hall planner (pointer events). **Primary object = table row** (N×80cm banquet tables butted into a row; chairs auto-placed on the long sides; moved/rotated/resized as one batch; single table = row of length 1). Add by choosing length + landscape/portrait; inspector changes length live, rotates, toggles head seats; a table-row block helper drops parallel rows. Two modes (plan tables / set up hall), 10cm snap + meter ruler, stage/bar/entrance/pillar/escape-route obstacles, live capacity HUD (seats/target 350). **Build generic — reused as the public ticket-shop seat map.**
- **Live direction** (`/live`, `fcc-ds-live.jsx`) — runs the planned order **live**. `PageLive` operator cockpit + `MLive` performer view + lock-screen push. Current act advances down the list; **last-second changes propagate in real time**; performers get a **push when up next** ("you're up next"), scoped to the performing group. The bridge between plan and evening. *(Rename placeholder: "live direction" is good.)*
- **Beer list & drinks till** (`/drinks` + `/drinks/inventory`, `fcc-ds-drinks.jsx`) — season starts with ~2 pallets of beer (club/one person pays). Any member can **sponsor crates for the round**. Digitises today's cash-on-paper pain: crate **stock + low-stock warning, digital tally list, per-person balance, who's paid/open**. Member buys crates, pays open balance via the drinks warden's PayPal link **or** cash — **payment is always confirmed by the drinks warden** (status "reported → awaiting confirmation"). Top-3 + own-rank scoreboard (no amounts). Drinks warden: till/stock/open stats, **"money received"** reconcile flow, participant list, **pallet reconciliation** card (app dictates how many crates to move to the paid side). 12 €/crate, 80 at season start. Participation is a **per-user flag**.
- **Wardrobe shop** (`/shop` + `/shop/manage`, `fcc-ds-shop.jsx` + `fcc-ds-shop-manage.jsx`) — permanent range + seasonal **bulk order**. Member browses, picks a size, orders & pays **direct (Stripe/PayPal) OR cash (office confirms)**, tracks "my orders". The clothing office gets an **auto-consolidated supplier list** (X× size L …, CSV/PDF/send), **hand-out tracking** (tick off who picked up) + open cash, and a range tab. Products: softshell/fleece jacket, polo, scarf, beanie, jester's cap (men/women).
- **Key management** (`/keys`) — a registry: editable key types (sports hall, clubroom, hall storeroom, clubroom storeroom) → who holds each. **Visible to all members** so they know whom to ask. **Not an office.**
- **Training planner / schedule** (`/schedule`) — **one shared calendar** for everyone; trainers edit in place. No private/personal calendar.
- **Member photo library** (`/gallery`) — members upload/view event photos; gated by photo-consent.
- **Overview** (`/`, dynamic personalised home) — *(to refine)* each member sees what's relevant to them: their open balance, next training/event, when their group is on stage, pushes. Role-aware. The glue.

---

## 10. Money model (summary)
- **Ledger is source of truth; payment methods are pluggable.** Member-facing: **Stripe (card) + PayPal**. One payment system bundles fee, shop, drinks till, ticket purchases.
- **Fees** yearly, tiered by membership type. Member pays an open balance one-tap; controlling lives on `/fees`.
- **Reimbursements (expenses)** stay **cash** (paid out by the treasurer) — the app tracks & books them so the cash report is complete.
- **Drinks till** — one till under the drinks warden; payments always confirmed by the drinks warden.

---

## 11. File manifest (in this bundle)

**Entry HTML (open these):**
- `FCC Design System.html` — design language + Website + interactive App.
- `FCC Club-App - Feature Mocks.html` — all feature pages, desktop + mobile.

**Data:** `FCC-Schema.txt` (DBML).

**Shared / brand:** `fcc-theme.jsx` (KK brand: `KK` light/dark palette, `KKBroom, KKSeal, KKTicker, KKConfetti, KKMastheadBar, KKProgramCard, KKFooter, KKPlh` photo placeholder), `fcc-logos.jsx` (coat-of-arms vectors), `fcc-shared.jsx` (`PhoneFrame, StatusBar, HomeIndicator`).

**App design system:** `fcc-ds-shell.jsx` (**tokens `T`, icons `Ic`, primitives `Card/Chip/Btn/Avatar/Eyebrow/Title/Progress`, `NAVCONFIG`, `AppShell`**), `fcc-ds-docs.jsx` (the documentation panels), `fcc-ds-pages.jsx` (`renderFccPage` + `PAGEMETA` dispatcher), `fcc-ds-mobile.jsx` (mobile app + bottom-nav).

**Public website:** `fcc-ds-landing.jsx` (`BestV({mode, device})` — the current "Distilled" landing, light/dark, desktop/mobile). `mobile-hero.html` + `mobile-hero-handoff.md` — dedicated **mobile** hero redesign handoff (see that file's own READ FIRST); source of record `fcc-ds-landing.jsx` → `BestMobileHero`/`BestMobile`.

**Per-page website bundles** (each a self-contained folder with its own `preview.html`, `src/` and **README — read that README first**, it records what was adopted and what was rejected for that page):
- `club-page/` — the club page (`/club`), built in P3.
- `news-page/` — news list + article + landing teaser (`/news`), built in P4.
- `gallery-page/` — the gallery: album index + album + lightbox (`/gallery`), P5. Its README was written by the team; the bundle arrived without one.

**Feature pages:** `fcc-ds-members.jsx`, `fcc-ds-groups.jsx`, `fcc-ds-roles.jsx`, `fcc-ds-events.jsx`, `fcc-ds-seating.jsx`, `fcc-ds-program.jsx`, `fcc-ds-fees.jsx`, `fcc-ds-live.jsx`, `fcc-ds-drinks.jsx`, `fcc-ds-shop.jsx`, `fcc-ds-shop-manage.jsx`.

**Canvas scaffolding (presentation only — do not port):** `design-canvas.jsx`, `browser-window.jsx`, `fcc-app-mocks.jsx`.

---

## 12. Non-negotiable conventions (carry into the codebase)
- **Compose the system, don't extend it.** Use the tokens + primitives. No new colors, fonts, radii, shadows.
- **The carnival call is "Gross - Furria!"** — never "Helau" or "Alaaf" in any copy. This is local law.
- **Routes/IDs/props = English. Visible text = German.**
- Red is **accent/action only — never body text.**
- Soft elevation is the default; the hard offset-shadow is a rare single-hero accent.
- Anton for display/numbers, Archivo for UI/body.
- Web-app first; keep it Capacitor-wrappable (native push, iOS live activities, widgets later).
