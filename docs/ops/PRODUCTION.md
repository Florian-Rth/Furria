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
| On `app.`: `client_max_body_size 20m`, `proxy_request_buffering off`, `proxy_buffering off` | Uploads travel by tus in 16 MB chunks — nginx's default 1 MB answers 413; buffering would spool every chunk, and every original (videos up to 20 GB), video seek and album ZIP, to the edge's disk |
| Pass `Range` through and never cache `/api/media/…` or `/api/public/…` — no `proxy_cache`, no `proxy_ignore_headers Cache-Control` | Video seeking needs range requests; a public picture must 404 the moment it leaves the public face ([ADR-0025](../adr/0025-media-is-fetched-by-signed-urls.md)) |

The app nginx adds HSTS (`includeSubDomains`, no `preload`), the CSP and the other security
headers itself; the edge must not override them. The club-app nginx streams the upload route
and the media/ZIP routes the same way, so a chunk is limited and streamed at both hops.

The edge is the nginx plugin of OPNsense (*Services → Nginx → Configuration*). On the `/`
**Location** of the `app.` HTTP server: *Maximum Body Size* `20m`, *Request Buffering* off,
*Proxy Buffering* off, no cache path. The API sets its own size limits, so the larger body limit
for the whole host is harmless; the apex (website) needs none of it — no uploads, no large
downloads. No location of either host may set a cache path. The plugin sends `X-Forwarded-For` /
`-Proto` and passes `Range` by itself.

Check after a change: an upload of a phone video in the gallery's *Entwicklerbad* finishes, and
`curl -sI -H 'Range: bytes=0-1' '<a media URL from the app>'` answers `206`.

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
  `media`. A host path must be owned by uid 1654 (the api's and worker's user). See [Media](#media).
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

**A rollback across a migration does not undo it**: the old API starts on the newer schema (it
sees no pending migration), but what the migration changed stays changed. The only way back is
[restoring](#backup-and-restore) the last backup before the release — losing everything written
since.

## Media

### The media path

One path holds every byte ([ADR-0023](../adr/0023-media-lives-under-one-mounted-path.md)), mounted
at `/media` in `api` and `media-worker`:

| Directory | What | Backup |
|---|---|---|
| `originals/` | Every upload as it arrived, written once, never changed; deleted with its item | **Yes** — with the database |
| `renditions/` | WebP sizes, video MP4, posters ([ADR-0024](../adr/0024-a-media-worker-makes-renditions-off-the-api.md)) | No — the worker rebuilds them |
| `staging/` | tus uploads in flight; abandoned ones are swept after 24 h | No |

Size: originals grow ~0.2–0.3 TB per season; renditions add roughly a tenth; staging holds at
most a day's unfinished uploads. `staging/` and `originals/` must be one file system — finishing
an upload is a rename. Any mount works (volume, NAS share, an S3 bucket mounted as a file
system), as long as `api` and every worker see the same files. To move from the named volume to a
host path: stop `api` and `media-worker`, copy the volume's content there (`docker volume inspect
furria_media` names it), `chown -R 1654`, set `MEDIA_PATH`, `docker compose up -d`.

### Where the media worker runs

**Default: beside the API on the homelab host, on the CPU** (`MEDIA_WORKER_HWACCEL=none`). A video
that is already H.264 ≤ 1080p is only remuxed; any other is transcoded on the CPU — one at a time,
photos never wait behind it.

**On the iGPU VM**, when videos pile up: the worker encodes there with VA-API or QSV.

1. `MEDIA_PATH` on the homelab host must be a host path (above); share it to the VM (NFS) or put
   it on a NAS both mount. The VM mounts it read-write; uid 1654 must be able to write.
2. On the homelab host: uncomment the `postgres` `ports:` line in the compose file (the host's LAN
   address only), set `MEDIA_WORKER_REPLICAS=0`, `docker compose up -d`. Allow `5432/tcp` from the
   VM alone.
3. On the VM, a compose of its own beside a `.env` (same `DOCKERHUB_USERNAME`, `POSTGRES_*`):

   ```yaml
   name: furria-media
   services:
     media-worker:
       image: ${DOCKERHUB_USERNAME}/furria-media-worker:latest
       restart: unless-stopped
       environment:
         ConnectionStrings__AppDb: Host=10.10.20.12;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
         Media__RootPath: /media
         MediaWorker__HardwareAcceleration: vaapi          # or qsv
         MediaWorker__HardwareDevice: /dev/dri/renderD128
       volumes:
         - /mnt/furria-media:/media                        # the shared media path
       devices:
         - /dev/dri:/dev/dri
       group_add:
         - "${MEDIA_WORKER_RENDER_GID}"                    # stat -c %g /dev/dri/renderD128
       stop_grace_period: 30s
       labels:
         com.centurylinklabs.watchtower.enable: "true"
     watchtower:
       image: containrrr/watchtower:1.7.1
       restart: unless-stopped
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
       command: --interval 300 --label-enable --cleanup
   ```

4. Upload a phone video; `docker compose logs media-worker` on the VM shows it encoded with the
   chosen acceleration.

Several workers may share the queue (each claims its own jobs), so a worker on both hosts also
works — but then the CPU one takes videos too. A worker that cannot reach the database or the
path stops nothing: uploads still succeed and wait in *processing*.

### Rebuilding renditions

Renditions are cache (ADR-0024): the worker rebuilds them from the originals. After restoring the
media path without them, or to retry items that ended *failed*, queue them again on the host:

```bash
docker compose run --rm media-worker regenerate failed    # only the failed items
docker compose run --rm media-worker regenerate all       # every item
docker compose run --rm media-worker regenerate 42 43     # these media items
```

A failing item is retried after 1 and 10 minutes, then marked *failed* with its reason. A worker
that dies mid-job loses its claim after 5 minutes; another (or its restart) takes the item over.

## Backup and restore

The database and the media originals are backed up **together, from the same point**
(ADR-0023): a database without its originals has items whose files are gone, originals without
their database rows are dead weight. Renditions and staging are left out.

[`backup.example.sh`](../../backup.example.sh) does it, on the host beside the compose file, as
root (it reads the media path; needs `rsync`):

```bash
cp backup.example.sh backup.sh && chmod +x backup.sh
BACKUP_DIR=/mnt/backup/furria ./backup.sh
# root's crontab, nightly:
30 3 * * * cd /home/<user>/furria && BACKUP_DIR=/mnt/backup/furria ./backup.sh >> backup.log 2>&1
```

Each run is a snapshot `$BACKUP_DIR/<UTC time>/` with `database.dump` (`pg_dump -Fc`) and
`originals/`. It copies the originals while everything runs, then **stops `api`** for the dump
and a last pass over the originals (only what changed since the first pass), then starts it
again — the website and club app keep serving their pages meanwhile, an upload in flight resumes
afterwards. Unchanged originals are hard links into the previous snapshot, so a snapshot costs
only the night's new uploads. `BACKUP_KEEP` (default 14) snapshots are kept. Put `BACKUP_DIR` on
another disk than the media path; a copy off the host is the operator's (`rsync -aH` of
`BACKUP_DIR` keeps the hard links).

**Restore** a snapshot `S`, with Florian on the host:

```bash
docker compose stop api media-worker
docker compose exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" --force "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error' < S/database.dump
M=<the media path>   # MEDIA_PATH, or: docker volume inspect -f '{{ .Mountpoint }}' furria_media
rsync -a --delete S/originals/ "$M/originals/"
rm -rf "$M/renditions" "$M/staging"
docker compose up -d
docker compose run --rm media-worker regenerate all
```

The API restarts on the restored schema and applies any newer migration itself — restore with
the image that wrote the backup, or newer. Until the worker has rebuilt an item it is
*processing*: the club app shows it as such, the website leaves the photo out. Photos are back within
minutes, videos take as long as their transcodes. Media URLs signed before the restore keep
working (same `MEDIA_SIGNING_KEY`).

Drill it once before launch and after a change to the media path: restore the latest snapshot
into a scratch compose project (`name: furria-restore`, other ports, its own volumes) and open a
gallery album.

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

- **Backups** — a dump before each migration (a release with a migration is backed up only by
  the nightly run), the copy off the host, alerting on a failed run.
- **Uptime monitoring** — nothing alerts when `/api/health` fails.
