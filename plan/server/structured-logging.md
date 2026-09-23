---
title: Structured logging (Backend)
slug: server-structured-logging
route: —
type: foundation
status: built
depends-on: [server-identity-foundation]
adrs: [0017, 0005, 0001]
---

## What & Why

The backend has no logging of its own: there is no `ILogger` anywhere in `src/`. A fresh start
prints around 300 lines of EF Core SQL, plus a misleading `fail:` from the probe of
`__ef_migrations_history`. Requests, logins and 500s leave no trace. This plan builds one Serilog
pipeline, used everywhere through `ILogger<T>`. It writes JSON to stdout in production and one
readable line per event in development. The rules are in ADR-0017.

## Decisions (grilled 2026-09-24)

| Topic | Decision |
|---|---|
| Sink | JSON to stdout only (`docker logs`), no log server |
| Library | Serilog (`Serilog.AspNetCore`) as the only pipeline |
| Call site | `ILogger<T>` injected, ad-hoc `LogInformation(...)` calls, no `[LoggerMessage]` |
| Enforcement | CA2254 → error, plus Furria analyzers MET008+ |
| EF SQL | `Microsoft.EntityFrameworkCore.Database.Command: None` everywhere; opt in through config |
| Startup | Own summary events; EF's `Migrations` category → Warning |
| Requests | One completion event per request |
| Exceptions | `IExceptionHandler` → ProblemDetails with TraceId; the exception rides on the request event |
| PII | IDs + email only |
| Coverage | Operational + security events, no per-write events (not an audit trail) |
| Config | Pipeline in code, levels in `Serilog:MinimumLevel`, two-stage init |
| Tests | Security, startup and 500-path events asserted through a capturing sink |
| Levels | See the event catalogue below |

## Scope / Slices

### 1. Pipeline (Api)

- `Directory.Packages.props`: add `Serilog.AspNetCore`. It brings Console, Formatting.Compact,
  Settings.Configuration and Extensions.Hosting.
- `Program.cs`, two-stage init: a bootstrap logger (console) wraps host build and run in
  `try/catch/finally`. `Log.Fatal` on a crash (for example the signing-key check), then
  `Log.CloseAndFlush()`.
- A `Furria.Api/Logging/` extension `AddFurriaLogging(builder)` calls
  `Services.AddSerilog((services, lc) => …)`:
  - `ReadFrom.Configuration` handles levels only. `ReadFrom.Services` picks up registered sinks
    (the test hook). Enrichers: `Enrich.FromLogContext`.
  - The environment picks the sink: Development gets a coloured single-line console with template
    `[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}`.
    Production gets `RenderedCompactJsonFormatter` to stdout. Testing gets no console (see
    slice 6).
  - Keep `preserveStaticLogger: true` so several `WebApplicationFactory` hosts in one test
    process don't hit a frozen bootstrap logger. Verify with a test.
- `appsettings.json` replaces the `Logging` section with `Serilog:MinimumLevel`:
  `Default: Information`. Overrides: `Microsoft.AspNetCore: Warning`,
  `Microsoft.EntityFrameworkCore.Database.Command: None`,
  `Microsoft.EntityFrameworkCore.Migrations: Warning`,
  `Microsoft.AspNetCore.Diagnostics.ExceptionHandlerMiddleware: None` (duplicate of the request
  event), `Microsoft.AspNetCore.Server.Kestrel: Warning`.
- `FastEndpoints.StartupTimer` stays at Information. It is one useful line.

### 2. Request event (Api)

- `UseSerilogRequestLogging` sits first in the pipeline, before CORS and auth.
- Template: `HTTP {RequestMethod} {RoutePattern} responded {StatusCode} in {Elapsed:0} ms`.
  - `RoutePattern` is the endpoint's raw route template, so no IDs are in the message. It falls
    back to `RequestPath` for unmatched routes.
  - `EnrichDiagnosticContext` adds `AccountId` when the caller is signed in (from the claims
    principal extension) and `RequestPath`.
  - `TraceId` and `SpanId` come from `Activity.Current`.
- Level: Error on an exception or status ≥ 500, otherwise Information (the Serilog default).

### 3. Exceptions (Api)

- `Furria.Api/Errors/UnhandledExceptionHandler : IExceptionHandler`:
  - It calls `IDiagnosticContext.SetException(ex)`, so the exception lands on the request event.
  - It answers 500 with `application/problem+json`: `{ type, title, status: 500, traceId }`. There
    is no message or stack in the body, in any environment.
- Register it with `AddExceptionHandler<…>()` + `AddProblemDetails()`, and call
  `UseExceptionHandler()` right after the request logging.

### 4. Startup events (Infrastructure)

- `DatabaseMigrator` diffs pending migrations before and after `MigrateAsync` and times the run:
  - `Applied {MigrationCount} migrations from {FirstMigration} to {LastMigration} in {ElapsedMs} ms`
    (Information)
  - `Database schema up to date at {CurrentMigration}` (Information)
- `BootstrapAdminSeeder` logs what it actually did (Information):
  - `Bootstrap admin not configured, seeding skipped`
  - `Bootstrap admin account {AccountId} created for {Email}`
  - `Bootstrap admin account {AccountId} re-enabled`
  - `Admin role {RoleId} created`
  - `Admin role {RoleId} restored from archive`
  - `Admin role {RoleId} granted {MissingPermissionCount} missing permissions`
  - `Admin role {RoleId} handed back to bootstrap person {PersonId}`
  - It logs nothing when everything was already in place.
- The hosted-service failure path (seeding throws) is left to the host's Fatal.

### 5. Security events (Infrastructure: `AccountService`, `RefreshTokenService`)

| Level | Template |
|---|---|
| Information | `Login succeeded for account {AccountId}` |
| Information | `Login failed for {Email}: {LoginFailureReason}`, where the reason is `UnknownAccount`, `WrongPassword`, `Disabled` or `LockedOut` |
| Information | `Account {AccountId} logged out` |
| Warning | `Refresh token replay for account {AccountId}, family {TokenFamilyId} revoked` |
| Warning | `Refresh on disabled account {AccountId}, family {TokenFamilyId} revoked` |
| Warning | `Account {AccountId} locked out after {AccessFailedCount} failed attempts`, if lockout is enabled; verify |

403 permission denials get no event of their own, because the request event covers them.

### 6. Enforcement (Tests.Analyzers, `.editorconfig`)

- `server/.editorconfig`: `dotnet_diagnostic.CA2254.severity = error`.
- Analyzers for production code only; each has analyzer tests in `Furria.Tests.Analyzers.Tests`:
  - MET008: no `Serilog.Log.*` static API. The only allowed use is `Program.cs`, for the bootstrap
    logger, via one pragma.
  - MET009: no `Console.Write*` / `Console.Error.Write*`.
  - MET010: message-template placeholders must be PascalCase and must not name forbidden PII.
    Banned names include `*Name` (except `*UserName`?), `Phone*`, `Street`, `Zip`, `City`,
    `Birth*`, `Password*`, `*Token` (but not `TokenFamilyId`), `*Hash`, `Body`. The exact deny
    list is settled in TDD. `Email` is allowed (ADR-0017).
- The `backend-work` skill gets a short hard rule, but **only when asked**, per the memory rule
  on skill edits.

### 7. Test harness (Tests.Common)

- `Fixtures/CapturingLogSink : ILogEventSink` is thread-safe and keeps the list of events. It
  offers `Clear()` and a query by `MessageTemplate.Text` + `Properties`.
- `ApiTestFixture` registers the sink as a singleton `ILogEventSink` (picked up through
  `ReadFrom.Services`). The Testing environment writes no console output. The sink is cleared in
  `BuildAsync`, because the host singleton survives the DB reset.
- An `Expected.LogEvent(template)` expectation with `.WithProperty(name, value)`,
  `.AtLevel(level)` and `.ToHaveBeenWritten()`. There is also `Expected.NoLogEvent…` for the PII
  and denial cases. Assertions go against the template and properties, never the rendered text.
- Test files:
  - Security events: extend `Login` / `Refresh` / `Logout` tests.
  - Startup: the bootstrap-seeder events that are visible on the fixture host. The migrator is
    asserted on the first host start.
  - 500 path: this needs a throwing endpoint in the **test host only**. Register it through
    `ConfigureWebHost`, never in production code, in line with the no-dead-endpoint rule.
    Assert ProblemDetails with a traceId that equals the event's `TraceId`, the Error level and an
    attached exception.
  - Request event: route pattern (not the concrete ID), `AccountId` present for a signed-in call.

### 8. Docs

- `docs/server/LOGGING.md` gets a short how-to:
  - What deserves an event, the level ladder, placeholder naming and the PII list.
  - Switching SQL back on:
    `Serilog__MinimumLevel__Override__Microsoft.EntityFrameworkCore.Database.Command=Information`.
  - Finding a 500: `docker logs furria-api-1 | jq 'select(.TraceId=="…")'`.
- `docker-compose.example.yml`: set the Docker `json-file` log driver with `max-size` / `max-file`
  on `api`, so stdout logs don't fill the host disk.

## Order

1 → 7 (the harness is needed before the red tests) → 2 → 3 → 4 → 5 → 6 → 8. Each behaviour slice
follows TDD.

## As built (2026-09-24)

Deviations from the slices above, each deliberate:

- **Muting uses `Fatal`, not `None`.** Serilog has no `None` level. `Database.Connection` is muted
  too, because EF's existence probe on a missing database logged two fake errors.
- **The console format is configuration (`ConsoleLog:Format` = `Json` | `Readable` | `Off`), not
  an environment switch.** `appsettings.json` says `Json`, Development says `Readable`, and the
  fixture says `Off`. Production code never names the Testing environment.
- **`RoutePattern` keeps the leading slash** (`/api/groups/{groupId}`), matching `RequestPath`.
- **The request middleware gets the DI logger explicitly.** With `preserveStaticLogger: true` it
  would otherwise write to the static bootstrap logger, which `Log.CloseAndFlush` silences under
  `WebApplicationFactory`.
- **The sink is never cleared.** A `LogMark` scopes each query instead, which is what makes the
  first-start migration and Admin-role events assertable at all.
- **Refresh on a disabled account** logs `Refresh refused for disabled account {AccountId},
  session revoked`. The family id isn't on `IssuedRefreshTokenDetails`, and it isn't needed.
- **Lockout exists** (5 attempts, 15 minutes). It logs `Account {AccountId} locked out until
  {LockoutEnd}` once, on the attempt that trips it. `LoginFailureReason` also carries
  `NotAllowed`.
- **The 500 path uses a test-assembly probe** (`ThrowingProbe`), like the authorization probes.
  .NET 10 already suppresses the `ExceptionHandlerMiddleware` duplicate once `IExceptionHandler`
  handles the exception, so no override is needed. The test pins exactly one Error event per
  TraceId.

## Open points to verify while building (resolved)

- `preserveStaticLogger` against multiple test hosts (analyzer tests vs API tests).
- Whether Identity lockout is enabled at all. If not, drop the lockout event and the `LockedOut`
  reason.
- `RoutePattern` for FastEndpoints routes: the endpoint metadata must expose the raw template with
  the `api` prefix.
