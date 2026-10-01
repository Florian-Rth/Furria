---
status: agreed 2026-10-01 — L1 next
scope: the MVP that goes live on 11.11.2026 — club app (web) and public website
shaped_with: Florian, 2026-10-01
supersedes: for this launch only — CLAUDE.md "Nothing ships publicly until the whole platform is
  done" and the website plans' "the site never goes live half-built"
  (plan/website/events/master-plan.md, plan/website/events/page-event-detail.md)
---

# Launch — 11.11.2026

The club app and the website go live together on **Wednesday, 11.11.2026**. The club app must give
members a good first set of features and generate the data the website reads. Everything else
follows in season order after launch.

---

## The ruling: cut scope, never quality

- **The MVP is a subset of features, each built in its final form.** CLAUDE.md's "no temp versions"
  rule stands unchanged; only "nothing ships until everything is done" is lifted for this launch.
- **A feature that is not in the MVP is absent** — removed from navigation and routing, never a
  stub, a "bald" teaser or a disabled button pointing at it.
- **An early state of a final model is not an interim version.** An event whose `salesStatus` is
  `announced` or `presaleScheduled` is the event page in its final form, before sales open.
- **When time runs short, a phase is dropped whole, never thinned.** L6 is the designated drop.

---

## Where we start (2026-10-01)

- **Club app:** club hub, calendar with RSVP, announcements, groups and group hubs, members
  directory, profile, club management, accounts and invitations — built (CA-P0…P8). **Start is an
  empty watermark.** Bottom nav is a placeholder (`Übersicht · Verein · Mehr`).
- **Website:** every page built, almost all on seeds or constants. The only real public read is
  `GET /api/public/groups`; `/join/apply` posts to an endpoint that does not exist. Gated by the
  preview password.
- **Production:** no backups; migrations run on start without one; in-memory mail queue lost on
  restart (and Watchtower restarts on every image); CD ships `:latest` without waiting for CI; no
  TLS proxy and no `ForwardedHeaders` (per-IP limits see one IP); no rate limit on login;
  `/health` does not touch the DB.

---

## The order of work

Each phase gets its own plan file, shaped when it is reached.

| # | Phase | Why here |
|---|---|---|
| **L1** | **Production foundation** — TLS reverse proxy, `ForwardedHeaders`, CD gated on CI with pinned versions and rollback, nightly + pre-migration backups (off-site), durable mail outbox, DB-aware health check, login/refresh rate limit, production CORS | Everything after it is tested on production. **The board starts entering real data as soon as it lands**, in parallel with the build. |
| **L2** | **CA-P9 — Start hub** — my next dates, responses I still owe, new announcements, my groups, the to-do item contract (open invitations, eligible persons without email). The final **default** destination set: Start · Verein · Kalender · Gruppen · Mehr | The first screen every member sees. The default set is final design ("what a new account starts with"); pinning adds to it later. |
| **L3** | **CA-P10 — Membership applications end to end** — ADR-0004's `POST /api/membership-applications` with captcha, rate limit and retention rule; mail to the board; a to-do on Start; *accept* issues person + invitation through `AccountAccessService` | The website plan forbids leaving it last ("a live funnel that cannot submit is worse than none"). Club-app data the website needs. |
| **L4** | **Public read API + website wiring** — public club record (founded year, contact, socials, member and group counts), public board (respecting `PortraitIsPublic`), groups payload aligned with the website, ticker from the session | Retires `FOUNDING_YEAR`, `MEMBER_COUNT_PLACEHOLDER`, `GROUP_COUNT_PLACEHOLDER` and the placeholder contact — and the hero/`/club` group-count mismatch. |
| **L5** | **Events, public face** — an event as a published calendar entry with teaser, description, price, venue and `salesStatus`; the club app publishes its key facts; website `/events` reads them (current session only) | The season's dates are what members and guests want first. The order flow stays out until presale. |
| **L6** | **Media store + news** — uploads (portraits, news images), news posts authored in the club app, website `/news` and the landing teaser | Last before launch work: a media store is the biggest new infrastructure. **Designated drop:** if behind, `/news` is absent at launch. |
| **L7** | **Website launch (website P7)** — prerender, SEO, sitemap, `robots.txt`, remove the preview gate and tester changelog, `/satzung`, real legal texts, absent routes removed | Pure launch work, last. |
| **L8** | **Rollout** — pilot group in the club app, device checks (CA-P8 S7 passkey on Android, S10 invitation link from Gmail), freeze, bulk invitations, go live | Invitations rehearsed on real people before 180 receive them. |

---

## Live at launch

**Website:** `/`, `/club`, `/events` + `/events/:slug` (no ordering), `/join` + `/join/apply`,
`/news` (if L6 lands), `/imprint`, `/privacy`, `/satzung`.

**Absent at launch:** `/gallery` (blocked on photo consent), `/events/exchange`,
`/events/:slug/order`, `/orders/*`.

**Club app:** delivered as the **web app only**. Native stores follow after launch.

---

## After launch, in season order

1. **Online ticket presale** — orders, Stripe, AGB, `/orders` — target **early December**.
   Carries the open club questions: entry check, seat allocation, ticket terms.
2. **Event planner with running order and live direction** — before the first session.
3. **Drinks till.**
4. **Fees and ledger.**
5. **Wardrobe.**
6. Global search · pinning · gallery and member photo library · iOS and store releases.

---

## Off the code path — Florian

Started now; they have lead times the code does not.

- Member data into the registry (method is Florian's call).
- Domain and DNS; SMTP provider with SPF, DKIM and DMARC.
- Impressum, Datenschutz (now covering the app, accounts and applications), Satzung.
- Real content: the season's events with dates and prices, club story and chronicle, hero photo,
  Jeck-Check questions — **without real questions the Jeck-Check is absent at launch.**
