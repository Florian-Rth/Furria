# Clients learn about other accounts' changes through a live change feed

The club app's query cache only went stale after the user's *own* writes: every mutation names the
domain changes it causes (`DOMAIN_CHANGES` in `web/apps/club-app/src/lib/query/reads.ts`) and the
reads showing them are invalidated. A trainer's change stayed invisible to everyone else until they
reloaded or the read went stale on its own. Decided 2026-11-09.

## The decision

- **Postgres tells the API what changed.** One function `furria_notify_change()` runs
  `pg_notify('furria_changes', TG_TABLE_NAME)` from a statement-level
  `AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE` trigger on **every `AppDbContext` table that maps to
  a change** (migration `LiveChangeFeed`). Unrelated tables carry no trigger, so busy technical writes
  (logs, heartbeats, tokens) never notify.
- **Tables map to the clients' domain changes.** `ChangedTables` names, per EF entity type, the
  `DomainChange`s its writes cause (a table may cause several, e.g. `person` → `person` + `picture`),
  or declares it unrelated (tokens, logs, outbox, jobs, heartbeats). The wire names are exactly the
  club app's `DOMAIN_CHANGES`, pinned in `EnumWireNamesTests`.
- **A new table is decided, never forgotten.** Either map it in `ChangedTables` and add
  `migrationBuilder.NotifyChangesOf("<table>")` to the migration that creates it, or declare it
  unrelated and give it no trigger. `ChangeFeedCoverageTests` fails for a table that is neither, for a
  mapped table without the trigger and for an unrelated table with one.
- **One listener per API process.** `ChangeListener` holds a dedicated connection on `LISTEN
  furria_changes`, coalesces what it hears over 250 ms into one distinct set and publishes it to the
  in-process `ChangeFeed`. After it had to reconnect it publishes *everything*, because notifications
  sent while it was away are lost.
- **`GET /api/changes` streams the feed** to any signed-in account as NDJSON (bearer auth through
  `fetch`; `EventSource` cannot send a bearer token): `{"kind":"ready"}`, then per batch
  `{"kind":"changes","changes":["group","picture"]}` or `{"kind":"changes","changes":"all"}`, and
  `{"kind":"ping"}` every 20 s so the edge (60 s read timeout) keeps the line open. Unbuffered
  (`X-Accel-Buffering: no`, `Cache-Control: no-cache`), never compressed, flushed per line.
- **Clients invalidate through their existing change registry** — the same path their own writes
  take; a reconnect of the stream invalidates everything it may have missed.
- **Names only, never data.** A line says *that* a kind of thing changed, not which row or what it
  now holds, so the feed leaks nothing a member may not read; every read stays behind its own gate.

## Considered and rejected

- **EF `SaveChanges` interceptors**: miss the many `ExecuteUpdate`/`ExecuteDelete` and raw SQL
  statements, and the media worker, a separate process whose renditions finishing must reach clients
  too. Triggers catch every write, from any process, and Postgres only delivers a notification when its
  transaction commits.
- **Row ids or payloads in the feed**: would need per-reader authorization on the stream and finer
  client invalidation than the change registry offers, for little gain at club scale.
- **Polling the reads**: hits every endpoint on a timer for every open app and is still late.
- **Server-Sent Events**: `EventSource` cannot carry the bearer token; the club app already reads
  NDJSON streams.
