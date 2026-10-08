# Production

How Furria runs in production: the homelab host, the TLS edge in front of it, how a release gets
there and how to take one back. Shaped in L1 of the launch plan
([plan/launch/l1-production-foundation.md](../../plan/launch/l1-production-foundation.md)).

## Topology

```
browser ──HTTPS──▶ edge nginx (Hetzner, outside this repo)
                     │  TLS for <club-domain> and app.<club-domain>
                     ▼  via the gateway 10.10.20.1
                  homelab 10.10.20.12, ~/furria  (docker-compose.example.yml)
                     ├─ website   :WEBSITE_PORT  ─┐  /api same-origin
                     ├─ club-app  :CLUB_APP_PORT ─┤
                     ├─ api       :8080 (internal) ◀┘
                     ├─ media-worker (no port; renditions, ADR-0024)
                     ├─ postgres  (internal)
                     └─ watchtower
```

The website lives on the `<club-domain>` apex, the club app on `app.<club-domain>`. Each serves
`/api` from its own nginx, so neither needs CORS.

## The edge contract

The edge is Florian's Hetzner nginx and is not in this repo. It must:

| What | Why |
|---|---|
| Terminate TLS for `<club-domain>` and `app.<club-domain>` (`www` redirects to the apex) | The apps' nginx speaks plain HTTP |
| Proxy the apex to `10.10.20.12:WEBSITE_PORT`, `app.` to `10.10.20.12:CLUB_APP_PORT` | |
| Set `X-Forwarded-For` (`$proxy_add_x_forwarded_for`) and `X-Forwarded-Proto` (`$scheme`) | The API's per-IP limits and the app nginx's scheme come from them |
| Reach the homelab through the gateway `EDGE_PROXY_ADDRESS` (`10.10.20.1`) | The API trusts forwarded headers only from that address and the compose network |
| Pass `/.well-known/assetlinks.json` through without redirect, on both hosts | Android App Links (`app.`) and passkeys (apex) |

The app nginx adds HSTS (`includeSubDomains`, no `preload`), the CSP and the other security
headers itself; the edge must not override them.

## Configuration

Everything comes from `.env` next to the compose file; [`.env.example`](../../.env.example) lists
every variable. The ones that matter most:

- **`CLUB_DOMAIN`** — the compose derives `ClubApp__BaseUrl` (`https://app.<domain>`, or
  `https://$CLUB_APP_HOST`) and the passkey relying party (`<domain>`) from it. The API refuses to
  start unless the club app's host lies under the relying party. **Passkeys are bound to the
  domain forever** ([ADR-0020](../adr/0020-passkeys-belong-to-the-club-domain.md)): every passkey
  made before a domain change stops working after it.
- **`WEBSITE_HOST`** — optional; the compose derives `Website__BaseUrl` (`https://<domain>`, or
  `https://$WEBSITE_HOST`). Mails to people who are not members yet — a membership
  application's confirmation — link to the website, not the club app.
- **`ALTCHA_HMAC_KEY`** — signs the proof-of-work challenges of the website's membership
  application (self-hosted Altcha, at least 32 characters). A change voids only the challenges
  of the last 10 minutes.
- **`MEDIA_SIGNING_KEY`** — signs every media URL the API hands out
  ([ADR-0025](../adr/0025-media-is-fetched-by-signed-urls.md), at least 32 characters). A change
  voids the media URLs of the last 48 hours; clients fetch fresh ones.
- **`MEDIA_PATH`** — where photos and videos live
  ([ADR-0023](../adr/0023-media-lives-under-one-mounted-path.md)); empty keeps the named volume
  `media`. Restore it together with the database, from the same point.
- **`MEDIA_WORKER_HWACCEL`** — where the media worker encodes videos: `none` (CPU, default),
  `vaapi` or `qsv` (an Intel iGPU; also map `/dev/dri` into `media-worker`, see the compose file;
  `MEDIA_WORKER_DEVICE` names the render node). Decoding, scaling and HDR tone mapping stay on the
  CPU either way. One video encodes at a time per worker; photos run beside it.
- **`EDGE_PROXY_ADDRESS`** — the API refuses to start in production without trusted proxies.
- **`ANDROID_CERT_FINGERPRINTS`** — feeds both `assetlinks.json` files and the API's accepted
  passkey origins.

## How a release reaches production

1. A push to `main` runs CI. Only when `backend` and `web` are green do the image jobs build the
   apps whose files changed.
2. Each image is pushed as `sha-<short>` (immutable). `:latest` then moves onto it — unless a newer
   commit already landed on `main`.
3. Watchtower polls Docker Hub every 5 minutes and recreates a container whose `:latest` moved.
4. The API applies pending migrations on start; its compose healthcheck (`GET /api/health`)
   turns green once they are applied. `website` and `club-app` never wait on it: their nginx
   resolves `api` per request, so the public site keeps serving while the API or the database is
   down.

**Accepted:** a release that fails to start is down until rolled back. Nothing alerts on it yet
(uptime monitoring is deferred).

## Health

`GET /api/health` → `200 {"status":"ok","version":"0.2.0+1a2b3c4"}` when the database answers
within 2 s and no migration is pending, else `503 {"status":"unavailable", …}`. The `+<sha>` is
the running commit — read it before a rollback:

```bash
curl -s https://app.<club-domain>/api/health
```

## Rollback

1. Find the last good commit on `main`: `git log --first-parent --oneline main`, or the `+<sha>`
   `/api/health` reported before the bad release.
2. GitHub → Actions → **Rollback** → *Run workflow*: pick the app (`api`, `media-worker`, `website`, `club-app`)
   and enter the commit (7–40 hex characters, `sha-` prefix optional). CI builds only the apps a
   push changed, so that commit may have no image of this app: the workflow takes the newest
   image built at or before it on `main` — what production ran for that app as of that commit —
   and repoints `:latest` to it (no rebuild). The run summary names the image it chose.
3. Watchtower picks it up within 5 minutes; to skip the wait, on the host:
   `docker compose pull <service> && docker compose up -d <service>`.
4. Check `/api/health` reports the old `+<sha>`.

The rolled-back app stays there until the next green `main` that changes **that app** moves its
`:latest` forward — so fix forward before pushing more changes to it.

**A rollback across a migration has nothing to restore from**: the old API starts on the newer
schema (it sees no pending migration), but what the migration changed stays changed. Backups are
deferred out of L1.

## Media renditions

Renditions are cache (ADR-0024): the worker rebuilds them from the originals. After restoring the
media path without them, or to retry items that ended *failed*, queue them again on the host:

```bash
docker compose run --rm media-worker regenerate failed    # only the failed items
docker compose run --rm media-worker regenerate all       # every item
docker compose run --rm media-worker regenerate 42 43     # these media items
```

A failing item is retried after 1 and 10 minutes, then marked *failed* with its reason. A worker
that dies mid-job loses its claim after 5 minutes; another (or its restart) takes the item over.

## Mail

Every mail is a row in `outbox_mail`, written in the transaction that causes it. The API's
dispatcher sends due rows (woken after each commit, polling every 5 s), retries a failure after
5 s, 30 s, 2 min, 10 min, 1 h and 6 h, then abandons it. A row is deleted once sent or abandoned —
it holds the plaintext link. The trail is the log:

```bash
docker compose logs api | grep -E 'Mail .* (sent|failed|abandoned)'
```

An SMTP outage therefore delays mail; an API restart no longer loses it.

**Delivery is at least once.** The dispatcher sends while it holds the row locked in a
transaction, then deletes the row and commits. Should the database or the API go away between the
SMTP send and that commit, the row survives and the mail goes out again: a member can receive an
invitation, a reset link or a notice twice. Every link in them stays single-use, so a duplicate
never grants more than the first mail did. Each SMTP exchange is capped at 30 s, which bounds how
long a row stays locked.

## Membership applications

`POST /api/membership-applications` takes the website's form. It answers only to a solved
Altcha challenge (`GET /api/membership-applications/challenge`, valid 10 minutes, each spendable
once), within the signed-out per-IP limit and 5 applications per address in 15 minutes. Each
application mails its sender a link to confirm it; an unconfirmed one is deleted 48 hours after
it was sent, swept every 15 minutes. A confirmed application stays until it is decided. The
trail:

```bash
docker compose logs api | grep -E 'Membership application|membership applications|Altcha'
```

Spent challenges and the rate limits live in memory: an API restart forgets them, so a
challenge solved in the 10 minutes before a restart can be spent once more.

## Ticket requests

`POST /api/ticket-requests` takes the website's request for tickets to one event. The same guards
as applications: a solved Altcha challenge (`GET /api/ticket-requests/challenge`), the signed-out
per-IP limit and 5 requests per address in 15 minutes. There is no confirmation step — the guest
gets a receipt, every holder of `ticket_requests.handle` with an email a notice. A request is
taken only while its event's presale runs, it is neither sold out nor cancelled and it has not
begun. It lives until someone marks it done (*Erledigt* deletes it); one still open is deleted
the day after its evening, swept every 15 minutes. The trail:

```bash
docker compose logs api | grep -E 'Ticket request|ticket requests|Altcha'
```

## Moving the live host onto the example compose

The live `~/furria/docker-compose.yml` predates L1. Bring it onto
[`docker-compose.example.yml`](../../docker-compose.example.yml) once, with Florian on the host:

1. Diff the live file against the example; carry over only host-specific ports and secrets
   (into `.env`, not the compose file).
2. Add `CLUB_DOMAIN` (interim `florianrth.com` plus `CLUB_APP_HOST=furria-app.florianrth.com`)
   and `EDGE_PROXY_ADDRESS=10.10.20.1` to `.env`; drop `CLUB_APP_BASE_URL`.
3. Check `172.30.0.0/24` (the compose network) collides with nothing on the host
   (`ip route`, `docker network inspect`).
4. `docker compose pull && docker compose down && docker compose up -d` — `down` is needed once,
   because the default network gains a declared subnet.
5. `curl` `/api/health` on both hosts, `/.well-known/assetlinks.json` on both hosts, and log in.

Test passkeys made before this step stop working (the relying party moves to the domain).

**HSTS with `includeSubDomains`** applies to every subdomain of the host that sends it. While the
interim website runs on a `florianrth.com` host, its HSTS covers that host's subdomains for a year.

## Not covered yet

- **Backups** — pre-migration dump, nightly backups, off-site copy, restore drill (deferred out
  of L1).
- **Uptime monitoring** — nothing alerts when `/api/health` fails.
