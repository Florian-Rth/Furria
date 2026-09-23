# Logs are operational, written as JSON to stdout through Serilog

The backend logged nothing of its own. A fresh start printed some 300 lines of EF Core SQL,
including a misleading `fail:` from the migration-history probe, and there was no request or
security trail at all. Decided with Florian on 2026-09-24.

## The decision

**Serilog is the only log pipeline; code writes through `ILogger<T>` with ad-hoc calls.**
Production writes compact JSON to stdout and is read with `docker logs`. There is no log server,
because a single Compose host running a club platform does not justify one. Message templates must
be constant strings: CA2254 is raised to an error, and Furria analyzers (MET008+) ban
`Serilog.Log`, `Console.Write*` and non-PascalCase placeholders in production code. We chose
ad-hoc calls over `[LoggerMessage]` source generation because of the low ceremony. Structure is
still enforced at the template level.

**Logs are for operating the system, not an audit trail.** Beyond one event per HTTP request
(route pattern, status, elapsed time, AccountId, TraceId, and the exception on a 500), only three
things write their own events: startup work, authentication and security, and states that were
handled but not expected. A CRUD write adds nothing, because the request event already records
who called which route. If the club ever needs an audit trail, it becomes data in the database,
never grepped logs.

**A log event may carry IDs and email, nothing else personal.** Names, phone numbers, addresses,
birth dates, free-text bodies, passwords, tokens and hashes never enter a log. Email is allowed
because it is the login identifier (ADR-0005), and failed-login triage needs it.

## Consequences

- EF Core's `Database.Command` and `Database.Connection` categories are muted (`Fatal`, since
  Serilog has no `None`) in every environment. They printed the whole schema on a fresh start
  and a misleading error from EF's own existence probes. Real query or connection failures still
  surface as the exception on the request event or the host's Fatal. SQL is switched back on per
  deploy through `Serilog__MinimumLevel__Override__…`, without rebuilding.
- Clients get a ProblemDetails body on a 500 that carries only the TraceId. The TraceId is the
  key to find the matching Error event in `docker logs`.
