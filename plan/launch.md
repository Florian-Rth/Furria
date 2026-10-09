---
status: agreed 2026-10-01 — L1, L2, L4, L5 merged; L3 built 2026-10-06 (L2 split into L2 + L3 on 2026-10-02; the to-do contract moved into L2 the same day)
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
- **When time runs short, a phase is dropped whole, never thinned.** L7 is the designated drop
  (since the split: L7b news first, then L7a along its own drop order).

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
| **L1** | **Production foundation** ([plan](launch/l1-production-foundation.md)) — club domain behind the existing TLS edge, `ForwardedHeaders`, CD gated on CI with pinned versions and rollback, durable mail outbox, DB-aware health check, login/refresh rate limit. *Backups deferred out of L1 (2026-10-01).* | Everything after it is tested on production. **The board starts entering real data as soon as it lands**, in parallel with the build. |
| **L2** | **CA-P9 — Start hub** ([plan](launch/l2-start-hub.md)) — the first screen every member sees: the split-flap greeting, her dates with responses answered in place, new Aushänge, what is new on her record, her groups' jubilees, and **the to-do contract (`ToDoService`, `ToDoKind`) with its six launch kinds** — pulled forward from L3 on 2026-10-02 | The first screen every member sees, and the one surface every later feature reports into. |
| **L3** | **Navigation** ([plan](launch/l3-navigation.md)) — the final **default** destination set (Start · Verein · Kalender · Gruppen · Mehr, renaming "Übersicht" in `app-sections.ts`), club management's To-do panel reading `ToDoService.ForAsync` with to-dos **marked seen** (added 2026-10-06), the "bald" panel removed from Mehr | The default set is final design ("what a new account starts with"); pinning adds to it later. |
| **L4** | **CA-P10 — Membership applications end to end** — ADR-0004's `POST /api/membership-applications` with captcha, rate limit and retention rule; mail to the board; a to-do on Start (`ToDoKind.ApplicationWaiting` plus one gated branch in `ToDoService.ForAsync`, one row in `StartWireNamesTests`, one value in the web's `TO_DO_KINDS` and `todo-links`); *accept* issues person + invitation through `AccountAccessService` | The website plan forbids leaving it last ("a live funnel that cannot submit is worse than none"). Club-app data the website needs. |
| **L5** | **Public read API + website wiring** — public club record (founded year, contact, socials, member and group counts), public board (respecting `PortraitIsPublic`), groups payload aligned with the website, ticker from the session | Retires `FOUNDING_YEAR`, `MEMBER_COUNT_PLACEHOLDER`, `GROUP_COUNT_PLACEHOLDER` and the placeholder contact — and the hero/`/club` group-count mismatch. |
| **L5b** | **Person archive and deletion** ([plan](launch/l5b-person-archive-and-deletion.md)) — `persons.manage` archives a person once nothing runs; the new key `persons.delete` erases one at any time ([ADR-0021](../docs/adr/0021-a-person-is-erased-never-anonymised.md)); the bootstrap admin becomes a personless managing login configured by the environment ([ADR-0022](../docs/adr/0022-the-bootstrap-admin-is-a-personless-managing-login.md)). Added 2026-10-07 | Real people are in the registry since L1, so an erasure request can arrive any day. |
| **L6** | **Events, public face** ([plan](launch/l6-public-events.md)) — an event as a calendar entry of the kind *event*, always public, kept in a new **events workbench** (`events.manage`); website `/events` reads it (current session only). No online sales at launch: an event takes **ticket requests** from the website, worked as a to-do under `ticket_requests.handle` and answered outside the app. Shaped 2026-10-07 | The season's dates are what members and guests want first. The order flow stays out until presale. |
| **L7a** | **Media store + gallery** ([plan](launch/l7a-media-store.md)) — one media store under a mounted path, a media worker for renditions, portraits and group pictures, the club app's *Galerie* hub (inbox, albums, bin, photos and videos) and published albums on the website `/gallery`. Split from L7 and shaped 2026-10-08 | A media store is the biggest new infrastructure; portraits and group pictures need it. **Drop order:** videos → gallery → core + portraits + group pictures stay. |
| **L7b** | **News** — news posts authored in the club app (images from the media store), website `/news` and the landing teaser. Not shaped yet | **Designated drop:** if behind, `/news` is absent at launch. |
| **L8** | **Website launch (website P7)** — prerender, SEO, sitemap, `robots.txt`, remove the preview gate and tester changelog, `/satzung`, real legal texts, absent routes removed | Pure launch work, last. |
| **L9** | **Rollout** — pilot group in the club app, device checks (CA-P8 S7 passkey on Android, S10 invitation link from Gmail), freeze, **true since dates entered for roles, board seats, group ties and keys** (Start reads "new" from them), bulk invitations, go live | Invitations rehearsed on real people before 180 receive them. |

---

## Live at launch

**Website:** `/`, `/club`, `/events` + `/events/:slug` (no ordering), `/join` + `/join/apply`,
`/gallery` + `/gallery/:slug` (if L7a's gallery lands), `/news` (if L7b lands), `/imprint`, `/privacy`, `/satzung`.

**Absent at launch:** `/events/exchange`,
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
6. Global search · pinning · iOS and store releases.

---

## Off the code path — Florian

Started now; they have lead times the code does not.

- Member data into the registry (method is Florian's call).
- Domain and DNS; SMTP provider with SPF, DKIM and DMARC.
- Impressum, Datenschutz (now covering the app, accounts and applications), Satzung.
- Real content: the season's events with dates and prices, club story and chronicle, hero photo,
  Jeck-Check questions — **without real questions the Jeck-Check is absent at launch.**
