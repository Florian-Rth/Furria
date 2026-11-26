# Production

How Furria runs in production: the app host on Florian's Hetzner server, the TLS edge in front of it, how a release gets
there and how to take one back. Shaped in L1 of the launch plan
([plan/launch/l1-production-foundation.md](../../plan/launch/l1-production-foundation.md)).

## Topology

```
browser ──HTTPS──▶ edge nginx (on the Hetzner server, outside this repo)
                     │  TLS for <club-domain> and app.<club-domain>
                     ▼  via the gateway 10.10.20.1
                  app host 10.10.20.12 (VM on the same Hetzner server), ~/furria  (docker-compose.example.yml)
                     ├─ website   :WEBSITE_PORT  ─┐  /api same-origin
                     ├─ club-app  :CLUB_APP_PORT ─┤
                     ├─ api       :8080 (internal) ◀┘
                     ├─ media-worker (no port; renditions, ADR-0024)
                     ├─ waha      (no port; the club's WhatsApp bot, ADR-0042)
                     ├─ postgres  (internal)
                     └─ watchtower
```

The website lives on the `<club-domain>` apex, the club app on `app.<club-domain>`. Each serves
`/api` from its own nginx, so neither needs CORS.

## The edge contract

Everything runs on Florian's Hetzner server (EU data centre): the edge nginx and the app host, a VM on its
internal network. The edge is not in this repo. It must:

| What | Why |
|---|---|
| Terminate TLS for `<club-domain>` and `app.<club-domain>` (`www` redirects to the apex) | The apps' nginx speaks plain HTTP |
| Proxy the apex to `10.10.20.12:WEBSITE_PORT`, `app.` to `10.10.20.12:CLUB_APP_PORT` | |
| Set `X-Forwarded-For` (`$proxy_add_x_forwarded_for`) and `X-Forwarded-Proto` (`$scheme`) | The API's per-IP limits and the app nginx's scheme come from them |
| Reach the app host through the gateway `EDGE_PROXY_ADDRESS` (`10.10.20.1`) | The API trusts forwarded headers only from that address and the compose network |
| Pass `/.well-known/assetlinks.json` through without redirect, on both hosts | Android App Links (`app.`) and passkeys (apex) |
| On `app.`: `client_max_body_size 20m`, `proxy_request_buffering off`, `proxy_buffering off` | Uploads travel by tus in 16 MB chunks — nginx's default 1 MB answers 413; buffering would spool every chunk, and every original (videos up to 20 GB), video seek and album ZIP, to the edge's disk |
| Pass `Accept-Encoding` through and never compress itself — no `gzip on`, no `brotli on`, no stripping of `Content-Encoding` | The API compresses its JSON (Brotli, then Gzip) and nothing else; media is already compressed and range requests must stay byte-exact |
| Never route `/api/whatsapp/webhook` (both nginx answer it with 404 anyway) | WAHA posts its webhooks to `api:8080` inside the compose network; nothing outside may reach that route |
| Pass `Range` through and never cache `/api/media/…` or `/api/public/…` — no `proxy_cache`, no `proxy_ignore_headers Cache-Control` | Video seeking needs range requests; a public picture must 404 the moment it leaves the public face ([ADR-0025](../adr/0025-media-is-fetched-by-signed-urls.md)) |

The app nginx adds HSTS (`includeSubDomains`, no `preload`), the CSP and the other security
headers itself; the edge must not override them. Neither nginx compresses API answers: the
app nginx passes `Accept-Encoding` to the API untouched and leaves `gzip` off. The club-app
nginx streams the upload route and the media/ZIP routes the same way, so a chunk is limited and
streamed at both hops.

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
  voids the media URLs of the last 14 days; clients fetch fresh ones.
- **`PUSH_VAPID_PUBLIC_KEY` / `PUSH_VAPID_PRIVATE_KEY`** — the server's Web Push identity
  ([ADR-0036](../adr/0036-the-installed-app-is-reached-by-web-push.md)): one P-256 key pair,
  raw base64url. The compose sets `Push__Subject` to the club app's URL. The API refuses to start
  unless both keys are one pair. Make the pair once and keep it: a new pair orphans every
  subscribed device until the app's next start. Generate it on any machine with OpenSSL:

  ```bash
  openssl ecparam -genkey -name prime256v1 -noout -out vapid.pem
  openssl ec -in vapid.pem -outform DER | tail -c +8 | head -c 32 | base64 | tr '/+' '_-' | tr -d '=\n'   # PUSH_VAPID_PRIVATE_KEY
  openssl ec -in vapid.pem -pubout -outform DER | tail -c 65 | base64 | tr '/+' '_-' | tr -d '=\n'       # PUSH_VAPID_PUBLIC_KEY
  ```

  Keep `vapid.pem` with the other secrets, or delete it once the two values are in `.env`.
  Check after a release: *Mehr → Verwaltung → System → Testnachricht senden* reaches a phone that
  has *Mein Profil → Benachrichtigungen* switched on.
- **`MEDIA_PATH`** — where photos and videos live
  ([ADR-0023](../adr/0023-media-lives-under-one-mounted-path.md)); empty keeps the named volume
  `media`. A host path must be owned by uid 1654 (the api's and worker's user). See [Media](#media).
- **`MEDIA_WORKER_HWACCEL`** — where the media worker encodes videos: `none` (CPU, default),
  `vaapi` or `qsv` (an Intel iGPU; also map `/dev/dri` into `media-worker`, see the compose file;
  `MEDIA_WORKER_DEVICE` names the render node). Decoding, scaling and HDR tone mapping stay on the
  CPU either way. One video encodes at a time per worker; photos run beside it.
- **`EDGE_PROXY_ADDRESS`** — the API refuses to start in production without trusted proxies.
- **`WAHA_API_KEY` / `WHATSAPP_WEBHOOK_HMAC_KEY`** — the key the API calls the bot with and the
  key the bot signs its webhooks with (`openssl rand -base64 48` each). See [WhatsApp](#whatsapp).
- **`CLUB_ASSISTANT_API_KEY`** — optional; the model provider's key for the club assistant.
  Empty keeps the assistant unswitchable. See [Club assistant](#club-assistant).
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

### The System page

Admins holding `system.view` see the state in the club app under *Mehr → Verwaltung → System*
(`GET /api/system/status`, `GET /api/system/logs`): database, media worker heartbeats
(`media_worker_heartbeat`, written every 15 s, a row unseen for 24 h is purged), the queue,
storage (a survey of the media path 1 minute after start, then every 6 h), the background tasks
of the running API (in memory — a restart starts them afresh), the mail outbox and the log.

The log there is a copy ([ADR-0028](../adr/0028-the-app-keeps-its-recent-logs-in-its-database.md)):
API and worker write Information and above into `log_entry`, kept 3 days (Warning and above
30 days, at most 100 000 rows). `docker compose logs` stays the full record. Both settings are
optional: `SystemLog__Enabled=false` stops the copy, `SystemLog__RowCap` changes the cap.

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

**Default: beside the API on the app host, on the CPU** (`MEDIA_WORKER_HWACCEL=none`). A video
that is already H.264 ≤ 1080p is only remuxed; any other is transcoded on the CPU — one at a time,
photos never wait behind it.

**On the iGPU VM**, when videos pile up: the worker encodes there with VA-API or QSV.

1. `MEDIA_PATH` on the app host must be a host path (above); share it to the VM (NFS) or put
   it on a NAS both mount. The VM mounts it read-write; uid 1654 must be able to write.
2. On the app host: uncomment the `postgres` `ports:` line in the compose file (the host's LAN
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

Every night the live system is backed up **off the host, encrypted, from one point**
([ADR-0044](../adr/0044-backups-go-off-site-encrypted-from-one-point.md)) into a
[restic](https://restic.net) repository on an SFTP target (a storage box). There is no copy on
the host itself: a backup there dies with the host.

### What a snapshot holds

| Path in the snapshot | What |
|---|---|
| `/backup/staged/database.dump` | `pg_dump -Fc` (uncompressed — restic compresses and deduplicates) |
| `/backup/staged/waha-sessions.tar` | the bot's session keys (volume `waha-sessions`, see [WhatsApp](#whatsapp)) |
| `/backup/staged/.env`, `docker-compose.yml` | the deployment: without `.env`'s signing, push and passkey keys a rebuilt system breaks every signed media link and push subscription |
| `/backup/originals/` | the media originals; renditions and staging are left out ([Media](#the-media-path)) |

The database and the originals come **from the same point** (ADR-0023): a database without its
originals has items whose files are gone, originals without their rows are dead weight.
[`backup.example.sh`](../../backup.example.sh) first uploads the night's new originals while
everything runs, then **stops `api` and `waha`**, dumps the database, copies the session store at
rest and takes the snapshot (only what changed since the first pass is read again), then starts
both again — seconds to a minute. The website and club app keep serving their pages meanwhile, an
upload in flight resumes afterwards, WhatsApp operations wait in the outbox.

Snapshots are kept **7 daily, 5 weekly, 12 monthly**, then pruned: deleted media and erased
persons leave the backups after 12 months at the latest. Each run ends with the target's fill
level in the log; at **80% or more** the run reports a warning — upgrade the target before it
fills (media grows 0.2–0.3 TB per season).

### Setup

On the host, as root, in the deployment's directory (`~/furria`); needs `docker`, `curl`, `flock`:

1. A key for the target, registered with it (the provider says how — for a storage box usually
   its `authorized_keys`):
   ```bash
   ssh-keygen -t ed25519 -N '' -C furria-backup -f /root/.ssh/furria-backup
   ```
2. Fill the `BACKUP_*` lines of `.env` ([`.env.example`](../../.env.example)): target host,
   port, user, path, key file, `BACKUP_RESTIC_PASSWORD` (`openssl rand -base64 48`) and optionally
   `BACKUP_PUSH_URL`. **Store the password and the target's login off the host, on paper too** —
   without the password nobody can read the backups.
3. Install the script, create the repository once and install the timer
   ([`systemd/`](../../systemd/); set the two paths in the service), then run the first backup by
   hand and read its log:
   ```bash
   cp backup.example.sh backup.sh && chmod +x backup.sh
   ./backup.sh restic init
   cp systemd/furria-backup.service systemd/furria-backup.timer /etc/systemd/system/
   systemctl daemon-reload && systemctl enable --now furria-backup.timer
   systemctl start furria-backup.service && journalctl -u furria-backup -e
   ```

The timer runs at **03:30 Berlin time**; a night the host was down is caught up after the next
boot. The first connection pins the target's host key in `BACKUP_STATE_DIR/known_hosts`; a
changed key fails every later run until that line is removed. With `BACKUP_PUSH_URL` set (an
Uptime Kuma push monitor, URL without its query string) every run reports `status=up`, or
`status=down` with the failing step — and with a fill level of 80% or more. A monitor with a
heartbeat of about 25 hours also catches a run that never starts.

### Restore

With Florian on the host, as root, in the deployment's directory. `./backup.sh restic …` runs
restic with the script's settings; `/state` is `BACKUP_STATE_DIR`:

```bash
./backup.sh restic snapshots --tag nightly                     # pick one, or use latest
./backup.sh restic restore <id> --target /state/restore
S=/var/lib/furria-backup/restore/backup                        # BACKUP_STATE_DIR/restore/backup
```

On a new host, first put Docker, the repo's `backup.example.sh` as `backup.sh` and a `.env`
holding only the `BACKUP_*` lines (password and target from the paper copy) into the
deployment's directory and restore as above; then copy the snapshot's `.env` and
`docker-compose.yml` (`$S/staged/`) over them and `docker compose up -d postgres waha` so the
volumes exist. Then:

```bash
docker compose stop api media-worker waha
docker run --rm --volumes-from "$(docker compose ps -aq waha)" -i alpine:3.22 sh -c 'rm -rf /app/.sessions/* && tar -xf - -C /app/.sessions' < $S/staged/waha-sessions.tar
docker compose exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" --force "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error' < $S/staged/database.dump
M=<the media path>   # MEDIA_PATH, or: docker volume inspect -f '{{ .Mountpoint }}' furria_media
rsync -a --delete $S/originals/ "$M/originals/" && chown -R 1654 "$M/originals"
rm -rf "$M/renditions" "$M/staging"
docker compose up -d
docker compose run --rm media-worker regenerate all
rm -rf "$S"
```

The API restarts on the restored schema and applies any newer migration itself — restore with
the image that wrote the backup, or newer. Until the worker has rebuilt an item it is
*processing*: the club app shows it as such, the website leaves the photo out. Photos are back within
minutes, videos take as long as their transcodes. Media URLs signed before the restore keep
working (same `MEDIA_SIGNING_KEY`).

**Persons erased after the snapshot come back** and nothing re-erases them — the app keeps no
list of whom it erased ([ADR-0021](../adr/0021-a-person-is-erased-never-anonymised.md)). Erase
them again by hand if the erasure is known.

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

## WhatsApp

The club's WhatsApp group is reached through a bot ([ADR-0042](../adr/0042-the-club-reaches-whatsapp-through-a-self-hosted-waha-bot.md)):
the club's own number, linked as a device to the `waha` container (WAHA, GOWS engine). The API
calls it at `http://waha:3000` with `WAHA_API_KEY`; WAHA posts `session.status`, `poll.vote`,
`poll.vote.failed`, `event.response`, `group.v2.participants` and `message` (private messages
for the club assistant) to `http://api:8080/api/whatsapp/webhook`, signed with
`WHATSAPP_WEBHOOK_HMAC_KEY`. A host whose compose file still lacks `message` in
`WHATSAPP_HOOK_EVENTS` simply never hears private messages. Neither has a
port on the host, and both app nginx answer the webhook route with 404. The image is pinned in
the compose file and never moved by Watchtower: update it by hand, after reading WAHA's changelog
for the GOWS engine, and check a vote flows back afterwards.

**Linking**, once, by an admin with the bot's phone in hand:

1. The bot's phone runs WhatsApp (or WhatsApp Business) on the club's number and is a member,
   and **admin**, of the club group — only an admin may add members.
2. *Mehr → Verwaltung → System → WhatsApp → Bot verknüpfen*, then scan the QR code in WhatsApp
   (*Einstellungen › Verknüpfte Geräte › Gerät hinzufügen*) or request a pairing code.
3. Once the state reads *Verbunden*, pick the club group under *Vereinsgruppe*. Picking a group
   switches *Vereinsgruppe verwalten* off; switch it on when members should be added.

**The session volume** `waha-sessions` holds the linked device's keys. Losing it unlinks the
bot and makes every vote on a poll posted before undecryptable: those polls then count only
the app's answers. The nightly backup copies it (with `waha` stopped for seconds) off the host; restore it
together with the database of the same snapshot, see [Backup and restore](#backup-and-restore).

**When the bot drops** — the System page reads *Getrennt*, and admins get a push. Nothing is
lost: posts, polls, replies and adds wait in the WhatsApp outbox (*System → WhatsApp-Versand*)
and go out once the session is back. Then:

- **Logged out** (the phone was offline for about two weeks, or someone removed the linked
  device): keep the phone online and link again (*Bot verknüpfen*). Same number, same group:
  nothing else to do. Votes on polls posted before keep arriving only when the session store
  survived; after a fresh link they do not.
- **Banned number** (WhatsApp refuses the number): the number is gone for good, never a
  member's. Take a new dedicated number, link it as above, have a group admin add it to the club
  group as admin, pick the group again and switch *Vereinsgruppe verwalten* back on. Polls posted
  under the old number count only the app's answers from then on. Before linking the new
  number, look at why: the bot only posts into the club group, one message at a time with a gap,
  and never writes to anyone directly — a ban despite that means WhatsApp tightened its rules,
  read WAHA's issue tracker first.
- **Rate signals** (463/475 in the log) make the dispatcher back off by itself; never re-link
  because of them.

The trail:

```bash
docker compose logs api | grep -E 'WhatsApp'
docker compose logs waha --since 1h
```

## Club assistant

Members DM the bot and the **club assistant** answers from Furria's data through a hosted LLM
([ADR-0043](../adr/0043-the-club-assistant-reads-club-data-through-an-outside-llm.md), RFC 0011):
Mistral's EU platform, reached with an OpenAI-compatible client. Only private chats from a
**WhatsApp match** to one affiliated person are answered; tools only read, as that person.

**Configuration** — the section `ClubAssistant`; only the key comes from `.env`, the rest keeps
its code defaults unless set in the compose file (`ClubAssistant__<Key>`):

| Key | Default | Meaning |
|---|---|---|
| `ApiKey` | empty | The provider's key (`CLUB_ASSISTANT_API_KEY`). Empty: no model client, the switch stays disabled with a note — a deploy never breaks a host without it. |
| `Endpoint` | `https://api.mistral.ai/v1` | OpenAI-compatible base URL. |
| `Model` | `mistral-small-2603` | Model id (Mistral Small 4, pinned). |
| `ReasoningEffort` | `none` | Sent as `reasoning_effort`: `none`, `low`, `medium`, `high`, or empty to send nothing. |
| `InputEurosPerMillion` | `0.15` | € per 1M uncached input tokens. |
| `CachedInputEurosPerMillion` | `0.015` | € per 1M cached input tokens. |
| `OutputEurosPerMillion` | `0.60` | € per 1M output tokens. |

The API refuses to start when a key is set but the endpoint is no absolute URL, the model id is
empty, the reasoning effort is unknown or a price is negative. **Prices** only meter the budget:
the defaults are Small 4's dollar list prices taken as euros (a little above the real cost); check
them against Mistral's price list whenever the model changes, or the budget lies.

**Model and thinking go together**: Small 4 accepts `none` and then answers without thinking.
Mistral Large 4 (`mistral-large-4`, 0.70 / 0.07 / 2.10) always thinks and takes only `low`,
`medium` or `high` — any other value makes every call fail with 400. Answers that still carry
thinking parts are read anyway; only the text goes out.

**Switching on**, once:

1. Create a key in Mistral's console (*La Plateforme*, EU), on an account with a spending limit
   a little above the monthly budget — a second fuse behind Furria's own.
2. Put it into `.env` as `CLUB_ASSISTANT_API_KEY`, make sure the compose file passes
   `ClubAssistant__ApiKey` to `api` and `message` is in waha's `WHATSAPP_HOOK_EVENTS` (see the
   example compose), then `docker compose up -d api waha`.
3. *Mehr → Verwaltung → System → WhatsApp → Vereinsassistent*: switch on, set the **monthly
   budget** (default 10 €) and the **questions per person and day** (default 30).
4. DM the bot from a member's phone (one whose number is in Furria) and from an unknown phone:
   the member gets an answer opened by the AI disclosure, the unknown phone the „nur
   Vereinsmitgliedern" line.

**Running it** — the budget is checked before every model call and the used amount shows in the
same panel; used up, members get a „this month I am done" line until the 1st. A provider failure
answers with a short apology and is never retried. Questions and answers are purged after 7 days;
nobody reads them in the app. The answers go out through *System → WhatsApp-Versand* in their own
lane (*Private WhatsApp-Antworten senden*), the questions are worked by *Fragen an den
Vereinsassistenten beantworten*. Switching off takes effect with the next message.

**Before a model or prompt change** run the eval: about 35 real German questions against a seeded
club, through the real model (a few cents), from `server/` after `dotnet build`:

```bash
CLUB_ASSISTANT_EVAL_API_KEY=<key> dotnet run --project tests/Furria.Api.Tests --no-build -- \
  -class Furria.Api.Tests.Assistant.ClubAssistantEvalTests -explicit only
```

Each failure prints the question, the expected facts and the answer. It never runs in CI.

**Owed on the live host** (hand-kept compose, needs approval): add `ClubAssistant__ApiKey` to
`api`'s environment and `message` to `WHATSAPP_HOOK_EVENTS`, put the key into `.env`, then the
device check above.

## Moving the live host onto the example compose

The live `~/furria/docker-compose.yml` predates L1. Bring it onto
[`docker-compose.example.yml`](../../docker-compose.example.yml) once, with Florian on the host:

1. Diff the live file against the example; carry over only host-specific ports and secrets
   (into `.env`, not the compose file).
2. Add `CLUB_DOMAIN=furrscher-carnevals-club.de` (club-app on `app.furrscher-carnevals-club.de`)
   and `EDGE_PROXY_ADDRESS=10.10.20.1` to `.env`; drop `CLUB_APP_BASE_URL`.
3. Check `172.30.0.0/24` (the compose network) collides with nothing on the host
   (`ip route`, `docker network inspect`).
4. `docker compose pull && docker compose down && docker compose up -d` — `down` is needed once,
   because the default network gains a declared subnet.
5. `curl` `/api/health` on both hosts, `/.well-known/assetlinks.json` on both hosts, and log in.

Test passkeys made before this step stop working (the relying party moves to the domain).

**HSTS with `includeSubDomains`** applies to every subdomain of the host that sends it: the website
on `furrscher-carnevals-club.de` covers `app.` and every other subdomain for a year.

## Not covered yet

- **Backups** — a dump before each migration (a release with a migration is backed up only by
  the nightly run); the weekly restore check and the live installation (RFC 0012 phases 2–3).
- **Uptime monitoring** — nothing alerts when `/api/health` fails.
