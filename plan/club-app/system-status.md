---
status: shaped 2026-10-13
shaped_with: Florian, 2026-10-13 (decisions: own log store, `system.view`, read-only)
---

# System — the admin status page

An admin opens **System** (club app, `/system`, under *Mehr → Verwaltung*) and sees at one glance
whether the platform needs them: database, media processing, storage, regular background tasks,
mail sending and the log. **Read-only** — no actions on the page.

## Rulings

1. **Logs live in our own database** (ADR-0028, amends ADR-0017): API and media worker write
   Information+ through a batched Serilog sink into `log_entry`; stdout stays the source of truth,
   the table is a capped copy (Information 3 days, Warning+ 30 days, row cap 100 000). No Docker
   socket anywhere.
2. **Permission `system.view`** ("System einsehen"), in `FurriaPermissions.All`; the managing login
   and the seeded Admin role get it automatically (no migration for the key).
3. **Read-only.** No retry, regenerate or purge buttons.
4. **The verdict is computed on the server** (pure, unit-testable) and sent as a discriminated
   structure; the client only maps codes to German copy. If the client cannot fetch, it shows
   *Unbekannt* and dims the last data — it never stays green on old data.
5. **Visual idea — a split-flap departure board.** The hero is a full-width dark board
   (both modes) with one row per area and the verdict in large flaps; everything below is dense
   panels. The metaphor stays visual: copy is plain German, no board/railway words.
6. Showpiece motion (board rows flap in, bars ink-fill, timetable cursors slide to now, verdict
   last) plays on **every visit**; reduced motion → crossfades/static.
7. **Out of scope now** (named for later): last database backup (the backup runs as a host script
   the app cannot see), "disk full in ~N days" trend (needs daily snapshots).

## Verdict rules (server, `SystemVerdict`)

Worst firing rule wins. Levels: `ok` · `attention` · `broken`.

| Check | attention | broken |
|---|---|---|
| database | latency > 200 ms | unreachable · pending migrations > 0 |
| workers | any worker stale (last seen > 45 s) · worker release ≠ API release (build suffix after `+` ignored) | no live worker while queue non-empty |
| queue | oldest queued > 5 min | oldest queued > 30 min |
| storage | free < 15 % · survey older than 3× its cadence | free < 5 % |
| media | ≥ 1 item failed in last 24 h | — |
| logs | ≥ 1 Error in last 24 h | ≥ 20 Errors in last hour |
| services | overdue > 2× cadence · last run failed | overdue > 5× cadence · 3 failures in a row |
| mail | ≥ 1 retrying | oldest pending > 15 min |

Each fired rule becomes a reason `{ check, level, code, value? }` (codes e.g. `databaseUnreachable`,
`pendingMigrations`, `slowDatabase`, `workerStale`, `noLiveWorker`, `workerVersionMismatch`,
`queueWaiting`, `diskLow`, `storageUnmeasured`, `mediaFailed`, `errorsLogged`, `errorBurst`,
`serviceOverdue`, `serviceFailed`, `mailRetrying`, `mailStuck`).

## API contract (camelCase JSON, enums as camelCase strings)

`GET /api/system/status` (`system.view`) → `GetSystemStatusResponse`
```
checkedAt: datetime
verdict: { level, reasons: [{ check, level, code, value: number|null, subject: string|null }] }
app: { version, environment, startedAt }
database: { isReachable, latencyMs, version, sizeBytes, connections, maxConnections,
            lastMigration, pendingMigrations, tables: [{ name, sizeBytes, rowEstimate }] (top 8) }
storage: { volume: { freeBytes, totalBytes } | null,
           survey: { measuredAt, cadenceSeconds, originals: {bytes, files}, renditions: {bytes, files},
                     staging: {bytes, files} } | null }
media: { counts: [{ kind: photo|video, state: processing|ready|failed, count }], totalBytes,
         failed: [{ mediaItemId, ownerKind, fileName, reason, failedAt }] (latest 5) }
queue: { queued, running, retrying, oldestQueuedAt: datetime|null }
workers: [{ instanceId, hostName, version, hardwareAcceleration, startedAt, lastSeenAt, isAlive,
            photoMediaItemId: int|null, videoMediaItemId: int|null }]
services: [{ job, cadenceSeconds: int|null, lastRunAt|null, lastFailure: string|null,
             consecutiveFailures, nextDueAt|null }]
mail: { pending, retrying, oldestPendingAt|null }
errorsPerHour: int[24]   (oldest hour first, Error+Fatal from log_entry)
logsSince: datetime|null (oldest stored log entry)
```
`job` keys: `abandonedUploadSweep, mediaFileReaper, galleryBinPurge, mailDispatcher,
unconfirmedApplicationPurge, signedOutMailRequestWorker, logEntryPurge,
mediaStorageSurvey`.

`GET /api/system/logs?source=api|mediaWorker&minimumLevel=information|warning|error&search=&before=&take=`
→ `{ entries: [{ id, loggedAt, source, instance, level: information|warning|error|fatal, category,
template, message, exception: string|null }], nextBefore: long|null }` — newest first, keyset on id,
take 1–200 (default 100), `search` matches message or category (case-insensitive).

## Backend design (see pitch in session; key points)

- `log_entry` (id bigint identity, logged_at, source, instance, level, category, template, message
  ≤2000, exception ≤8000, trace_id) + indexes `(logged_at)`, `(source, level, id desc)`.
  `DatabaseLogSink : IBatchedLogEventSink` with its own `NpgsqlDataSource` (never EF/ILogger →
  no recursion), failures → SelfLog, batch dropped. Noise filter: EF Core + Npgsql always,
  `Microsoft.AspNetCore.*`/`System.Net.Http.*` below Warning, request logging below Error.
- `media_worker_heartbeat` (instance_id uuid PK, host_name, version, hardware_acceleration,
  started_at, last_seen_at, photo_media_item_id, video_media_item_id); `MediaWorkerBeat` upserts
  every 15 s, deletes its row on graceful stop; alive ≤ 45 s; rows unseen 24 h are purged.
- `BackgroundRuns` in-memory singleton; every API hosted service records each run
  (`startedAt, cadence, failure`) in its public run method. `HostStart` singleton for startedAt.
- `MediaStorageSurvey` (API hosted service, 1 min after start then every 6 h) → `MediaStorageSnapshot`
  singleton; `DriveInfo` free/total read live.
- DB facts via constant SQL with 2 s timeouts (pg_database_size, pg_stat_user_tables ⨝ pg_class,
  pg_stat_activity count, max_connections, server_version, applied/pending migrations).
- Endpoints in `Endpoints/Operations/` (`GetSystemStatus`, `GetSystemLogs`), services
  `SystemStatusService`, `SystemLogService`; pure `SystemVerdict`.
- One migration `SystemStatus`. ADR-0028. No new *required* config (all optional with defaults).

## Frontend design

- Route `/system`, section in `MANAGE_SECTIONS` ("System", `permissionKeys: [systemView]`),
  `PERMISSION_KEYS.systemView`, role permission copy "System einsehen" / "Zustand von Datenbank,
  Medienverarbeitung, Speicher und Protokoll sehen."
- Polling: status every 10 s, log head every 15 s (only a "n neue" pill, list never shifts);
  pause while tab hidden, refetch on return.
- Sections (phone one column; desktop: board full width, then left column sections, right column
  sticky log): **Lage** (board) · **Bilder & Videos verarbeiten** · **Speicher** ·
  **Regelmäßige Aufgaben** · **Datenbank** · **Mailversand** · **Protokoll** · footer **Programm**.
- New `@furria/ui` parts: `KkFlapBoard` (hero board), `KkFillGauge` (stacked storage bar with
  hatched free part + end cap colour), `KkRankBars` (ranked hairline bars), `KkSlotStrip`
  (queue squares: running/queued/retrying, +n overflow), `KkHeartbeat` (pulse line per worker,
  alive/stale/gone), `KkTimetable` + row (track last run → next due with a live now-cursor),
  `KkTeleprinter` (log strip: level tick, time, source chip, message, foldable exception,
  grouped repeats "×37 · 14:02–14:31", load older).
- Log grouping (consecutive same template+category+source) and verdict/service copy mapping are
  pure functions with tests.

## Slices

| # | Slice | State |
|---|---|---|
| S1 | Backend: permission, log store + sink + purge, heartbeat, run registry, storage survey, DB facts, verdict, both endpoints, migration, ADR-0028, tests | built 2026-10-13 (uncommitted); `database` facts nullable when unreachable; `outbox_mail.enqueued_at` added |
| S2 | `@furria/ui`: the seven new parts | built 2026-10-13 (uncommitted); plus `KkFlapGrid`, `KkReadout` (section panel) |
| S3 | Club app: permission key + copy, section + route, feature (schemas, queries with polling, copy, grouping, page) | built 2026-10-13 (uncommitted), not yet validated |
| S4 | Wrap-up: browser check phone/desktop light/dark, full validation | |
