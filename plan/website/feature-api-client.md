---
title: API-Client
slug: api-client
type: foundation
status: idea
mock: -
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

The website's data layer: how it talks to the **one backend API** that serves all apps. The
website is a read-mostly consumer of **public endpoints** (events, news, gallery, live ticket
scarcity) plus a few writes (ticket checkout, membership application). Centralising this keeps
fetching, caching, and error/loading states consistent across features.

## Scope / Slices

- Client scaffold + base config (base URL per environment, typed responses).
- Public **read** endpoints: events, news, gallery, scarcity — added as their features land.
- **Write** paths: ticket checkout, membership application.
- Shared loading / error / empty conventions.

## Decisions

- Consumes the backend's documented API (OpenAPI/Swagger is exposed — see recent server work).
- Website uses **public** endpoints only; no member/auth-gated data.
- **Client-side fetching** — the site is static-first (no SSR); live data is fetched in the
  browser ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md)).

## Open Questions

- Data-fetching approach (e.g. TanStack Query vs. minimal fetch wrapper) — likely an **ADR**
  once chosen, as it is cross-cutting and hard to reverse.
- Generate a typed client from OpenAPI, or hand-write types?
- Caching / revalidation strategy for scarcity (needs to feel live).

## Done When

- A feature can fetch public data through one client with consistent loading/error handling.
- Environment config selects the right API base URL.

## References

- Backend API + Swagger/OpenAPI (`server/`, commit "expose swagger/openapi docs for the api").
- Design README §2 (REST or tRPC over the SQL schema).
