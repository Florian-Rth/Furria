# Backend Logging

How the API writes logs. The why is in
[ADR-0017](../adr/0017-logs-are-operational-json-on-stdout.md). The build enforces the rules marked
with an analyzer id.

## Where logs go

| Environment | `ConsoleLog:Format` | Output |
|---|---|---|
| Production (`appsettings.json`) | `Json` | One compact JSON object per line on stdout, read with `docker logs` |
| Development | `Readable` | `[12:00:00 INF] Source: message` |
| Tests (`ApiTestFixture`) | `Off` | Nothing on the console; events land in `CapturingLogSink` |

Serilog is the only pipeline. Code in `Furria.Api/Logging` picks the sink; configuration only sets
levels, under `Serilog:MinimumLevel`.

## Writing an event

- Inject `ILogger<T>` and call `_logger.LogInformation("…", args)`.
- The template is a constant string. Interpolation and concatenation fail the build (CA2254).
- Placeholders are PascalCase and name what they hold: `{AccountId}`, `{RoleId}`,
  `{MigrationCount}`. **MET010** checks this.
- No `Serilog.Log` (**MET008**; `Program.cs` alone uses it, for the bootstrap logger) and no
  `Console.Write*` (**MET009**) in production code.

## What deserves an event

Logs are for operating the system, not an audit trail.

- **Every HTTP request** writes one event:
  `HTTP {RequestMethod} {RoutePattern} responded {StatusCode} in {Elapsed:0} ms`. It also carries
  `RequestPath`, `AccountId` (when signed in) and `TraceId`. Nothing else logs requests.
- **Startup work** reports what it actually did: the migration summary, and each repair the
  bootstrap-admin seeder made.
- **Authentication and security**: login succeeded or failed (with a `LoginFailureReason`),
  logout, lockout, refresh-token replay, and refreshes refused for disabled accounts.
- **States that were handled but not expected**, at Warning.
- A plain CRUD write logs nothing. The request event already says who called which route.

## Levels

| Level | Use |
|---|---|
| Information | Normal operation: requests, startup summaries, logins, logouts |
| Warning | Security-relevant or unexpected but handled: replay, lockout, refresh on a disabled account |
| Error | Only unhandled exceptions: a 500 request event carrying the exception |
| Fatal | The host failed to start or crashed |

## Personal data

An event may carry **ids and email**, nothing else personal. Names, phone numbers, addresses,
birth dates, free-text bodies, passwords, tokens and hashes never enter a log. MET010 rejects
placeholders whose names end in such a word (`FirstName`, `Phone`, `Street`, `BirthDate`, `Body`,
`Password`, `Token`, `Hash`, …).

## Operating it

- **Find the log behind a 500.** The client gets a problem body `{ …, "traceId": "…" }`. Run:
  `docker logs furria-api-1 | jq 'select(.["@tr"] == "<traceId>")'`
- **See the SQL again.** EF's `Database.Command` and `Database.Connection` categories are muted
  (`Fatal`). Unmute them per deploy without rebuilding:
  `Serilog__MinimumLevel__Override__Microsoft.EntityFrameworkCore.Database.Command=Information`
- **Retention.** The compose example rotates the API's logs (`json-file`, 5 × 10 MB).

## Testing an event

`ApiTestFixture.Logs` is the `CapturingLogSink`. Mark before you act, then assert on the template
and properties, never on the rendered text:

```csharp
var mark = _fixture.Logs.Mark();

await Post(ctx.Identity.EmailOf("alice"));

var written = Assert.Single(_fixture.Logs.Written("Login succeeded for account {AccountId}", mark));
Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), written.ScalarOf("AccountId"));
```

The sink is never cleared. It is one host singleton for the whole collection, so always scope a
query with a mark, or with a property only your test can produce, such as a seeded id or a
`TraceId`.
