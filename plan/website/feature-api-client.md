---
title: API-Client
slug: api-client
type: foundation
status: building
mock: -
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

The website's data layer: how it talks to the **one backend API** that serves all apps. The website
is a read-mostly consumer of **public endpoints** (events, news, gallery, live ticket scarcity) plus
a few writes (ticket checkout, membership application). Centralising this keeps fetching, caching,
and error/loading states consistent across features.

## Scope / Slices

- P0 scaffold: base fetch helper + env config + query-client defaults + the boundary-validation rule.
- Public **read** endpoints: events, news, gallery, scarcity — **deferred (need the Club-App
  backend)**; added when those live-data features land.
- **Write** paths: ticket checkout, membership application.
- Shared loading / error / empty conventions.

## Decisions

**Resolved (in code — supersedes the earlier "TanStack Query vs. fetch wrapper" question):**

- **Data layer: TanStack Query** — already installed and provided in `__root`.
- **Client-side fetching** — static-first, no SSR ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md));
  live data is fetched in the browser.
- Consumes the backend's documented API (OpenAPI/Swagger is exposed).
- Website uses **public** endpoints only; no member/auth-gated data.

**P0 scaffold:**

- **Shared `apiFetch` helper** (`src/lib/api/`): base URL from env, JSON handling, and the "request
  never reached the API" normalization — generalized out of the existing `preview-access/api.ts`
  pattern. Feature APIs compose on top of it.
- **Env config:** `VITE_API_BASE_URL`; dev keeps the existing `/api` → `:5100` Vite proxy (relative base).
- **Query-client defaults:** real `staleTime` / `retry` / `refetchOnWindowFocus: false` (marketing
  site) instead of a bare `new QueryClient()`.
- **Boundary validation:** every response **Zod-parsed at the edge** (the convention `preview-access`
  already sets). This is the standing rule. *As built (P0):* `apiFetch` takes a **mandatory Zod
  schema parameter**, so boundary parsing is enforced by construction; HTTP failures surface as
  `ApiError` (with status), unreachable-API as `RequestBlockedError`.
- **No domain data in P0:** event/news/etc. shapes are undefined and will change — build **no**
  event-specific types, schemas, or mock endpoints yet. Static (pre-backend) sections use
  **static placeholder content**, not a fake API.

**P6 (2026-07-29) — the first write, and the "build as if it already fetched" pattern:**

- **First write endpoint from the public site:** `POST /api/membership-applications`
  ([ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md)). `apiFetch` needs no
  change — it already takes a method, a JSON body and a mandatory schema.
- **Standing pattern for backend-bound features.** A feature whose data is *destined* for the API is
  built as if it already fetched it: Zod schemas, React Query hooks in the feature's `api.ts`, and
  **real loading/error paths from day one**. Only the `queryFn` differs — it resolves from a
  **deletable seed module** (`src/lib/seed/`, shaped byte-for-byte like the future payload and
  Zod-parsed at that boundary) instead of calling `apiFetch`. The swap is one line per query.
  Precedent for parsing local content: P4's `changelog.json`.
- **This does not overturn P0's "no fake API".** The seed is not a mock endpoint or a fixture pile:
  it is the payload contract, in one deletable place, consumed through the same hooks the real
  endpoint will feed. A feature whose data will *never* come from the backend (page copy) still uses
  plain typed constants.
- **Async has an SEO cost.** Fetched content is not prerenderable
  ([ADR-0003](../../docs/adr/0003-website-rendering-strategy.md)), so choose per surface:
  interactive, non-indexable UI may fetch; indexable body content stays synchronous. P6 splits
  exactly there — the Jeck-Check fetches, `/club`'s group list reads the same seed synchronously.

**Deferred:**

- **OpenAPI codegen decision → deferred** (first real public endpoint; needs the Club-App backend):
  generate types — or types+Zod via
  `@hey-api/openapi-ts` / `orval` — vs. hand-written Zod. Cross-cutting and likely an **ADR** then;
  premature to choose with zero real endpoints.
- Caching / revalidation for live scarcity (needs to feel live) — deferred (needs the Club-App backend).

## Done When

- A feature can fetch public data through one client with consistent loading/error handling.
- Environment config selects the right API base URL.

## References

- Backend API + Swagger/OpenAPI (`server/`, commit "expose swagger/openapi docs for the api").
- Existing pattern: `web/apps/website/src/features/preview-access/api.ts`.
