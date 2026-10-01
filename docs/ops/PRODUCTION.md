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
- **`EDGE_PROXY_ADDRESS`** — the API refuses to start in production without trusted proxies.
- **`ANDROID_CERT_FINGERPRINTS`** — feeds both `assetlinks.json` files and the API's accepted
  passkey origins.

## How a release reaches production

1. A push to `main` runs CI. Only when `backend` and `web` are green do the image jobs build the
   apps whose files changed.
2. Each image is pushed as `sha-<short>` (immutable). `:latest` then moves onto it — unless a newer
   commit already landed on `main`.
3. Watchtower polls Docker Hub every 5 minutes and recreates a container whose `:latest` moved.
4. The API applies pending migrations on start. `website` and `club-app` start only once the
   `api` healthcheck (`GET /api/health`) is green.

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
2. GitHub → Actions → **Rollback** → *Run workflow*: pick the app (`api`, `website`, `club-app`)
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

## Mail

Every mail is a row in `outbox_mail`, written in the transaction that causes it. The API's
dispatcher sends due rows (woken after each commit, polling every 5 s), retries a failure after
5 s, 30 s, 2 min, 10 min, 1 h and 6 h, then abandons it. A row is deleted once sent or abandoned —
it holds the plaintext link. The trail is the log:

```bash
docker compose logs api | grep -E 'Mail .* (sent|failed|abandoned)'
```

An SMTP outage therefore delays mail; an API restart no longer loses it.

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
