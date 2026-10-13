# The app keeps its recent logs in its database

Amends [ADR-0017](0017-logs-are-operational-json-on-stdout.md). The club app gets a read-only
**System** page for admins (`system.view`): database, media processing, storage, background
tasks, mail and the log at one glance. Reading the log there needs the log somewhere the API can
query. `docker logs` is out of reach: the API has no Docker socket, and must not get one. Decided
with Florian on 2026-10-13 while shaping the System page.

## The decision

**The API and the media worker also write their logs into a `log_entry` table of the app
database. Stdout stays the source of truth; the table is a capped copy.**

- A batched Serilog sink (up to 500 events or 2 s per batch, at most 10 000 queued) copies
  Information and above with its own connection pool (`furria-log-sink`). It never logs through
  `ILogger`, so it cannot feed itself. A failed batch goes to Serilog's self-log and is dropped —
  the app never waits for or fails over its log.
- Each row keeps the message template beside the rendered message, so the page can group repeats.
- Noise stays out: EF Core and Npgsql always, `Microsoft.AspNetCore.*` and `System.Net.Http.*`
  below Warning, the per-request event below Error (a 500 is kept; every other request is not).
- **Retention:** Information 3 days, Warning and above 30 days, and never more than 100 000 rows
  (`SystemLog:RowCap`). The API purges every 15 minutes. `SystemLog:Enabled=false` turns the copy
  off without touching stdout.

## Considered options

- **Read `docker logs` through the Docker socket.** Rejected: the socket is root on the host, and a
  web-facing container must never hold it.
- **A log server (Loki, Seq, Elastic).** Rejected as in ADR-0017: one more service to run, back up
  and secure, for one club on one host.
- **Only counters (errors per hour), no messages.** Rejected: the admin needs to see *what* went
  wrong without a shell on the host.

## Consequences

- **Personal data in logs now lives in the database too, for up to 30 days.** ADR-0017 allows ids
  and the email address (a failed login names it). Erasing a person
  ([ADR-0021](0021-a-person-is-erased-never-anonymised.md)) does not reach these rows; they age out
  with the retention instead, exactly as the rotated `docker logs` files do.
- The table is in every database backup. A restore brings back the log of that moment, which is
  harmless and ages out.
- A stopped database also stops the copy. Startup failures and database outages are still only on
  stdout, which is why stdout stays the source of truth.
