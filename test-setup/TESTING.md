# Backend Testing Conventions

Drop this file into the new repo (e.g. `docs/TESTING.md` or the test project README). It defines
how every backend test is written. The MET001–MET007 analyzers enforce most of it at build time —
a violation is a compile error, not a review comment.

## Principles

- **Real infrastructure, no mocks.** Every integration test runs against real Postgres in a
  Testcontainer, through the real HTTP pipeline with real auth. Mocking frameworks (Moq,
  NSubstitute) and EF InMemory are banned.
- **Test observable behaviour, not interactions.** Assert what the system did (rows, responses,
  published messages) — never that "method X was called".
- **One canonical arrange/assert layer.** Tests seed through a declarative builder and assert
  through DB-level reads — never by touching a `DbContext` in the test body.
- **Only write tests for real scenarios.** No tests that merely validate implementation details.

## The shape of a test

```csharp
[Collection("Api")]                       // shares the one Postgres container per assembly
public sealed class PutWidgetStatusTests
{
    private readonly ApiTestFixture _fixture;
    public PutWidgetStatusTests(ApiTestFixture fixture) => _fixture = fixture;

    [Fact]
    public async Task Should_SetClosedAt_When_ResolvingWidget()
    {
        // Arrange — declarative seeding against string aliases, committed before Act
        var ctx = await _fixture.BuildAsync(b => b
            .Identity(i => i.AddUser("operator", Permissions.Widgets.Write))
            .Widgets(w => w.AddOpen("widget-1", assignee: "operator")));

        var widgetId = ctx.Widgets.IdOf("widget-1");

        // Act — one raw, explicit HTTP call; the client carries a locally minted JWT
        var (response, _) = await ctx.Identity.ClientFor("operator")
            .PUTAsync<PutWidgetStatus, PutWidgetStatusRequest, PutWidgetStatusResponse>(
                new() { Id = widgetId, Status = WidgetStatus.Resolved });

        // Assert — status code on the response, everything else via DB-level Expected reads
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected
            .Widget(widgetId).ToHaveStatus(WidgetStatus.Resolved)
            .Outbox().ToHaveNoMessages<WidgetResolved>()
            .AssertAsync();
    }
}
```

## The rules (analyzer-enforced)

| Id | Rule |
|----|------|
| MET001 | No mocking framework — owned `Fake*`/`Capturing*` doubles only. |
| MET002 | No EF Core InMemory — every test runs against real Postgres. |
| MET003 | Test methods are named `Should_<Expected>_When_<Scenario>`. |
| MET004 | A class injecting `ApiTestFixture` carries `[Collection("Api")]`. |
| MET005 | No `DbContext` in a test body — seed via the builder, assert via `Expected`. |
| MET006 | Production code never reads `DateTime.Now/UtcNow` — inject `TimeProvider`. |
| MET007 | Every alias passed to `IdOf`/`ClientFor`/`NameOf` is declared by an `Add*("alias")` call in the same class (`[SeedsAliases]` opts out when a helper in another class seeds). |

## Rules the compiler can't check

- **Never hardcode ids.** The reset keeps identity sequences climbing, so the first row in a
  class is *not* id 1 — by design. Resolve ids via `ctx.X.IdOf("alias")` or from the Act response.
- **Never wait wall-clock time.** No `Task.Delay` pacing, no fixed sleeps. Wait on conditions via
  `Polling.WaitUntilAsync(predicate, timeout)`; control time by advancing the injected
  `FakeTimeProvider`.
- **Status code from the response; state from the database.** Don't assert state by making more
  HTTP calls.
- **Use the typed test client** (e.g. FastEndpoints' `PUTAsync<TEndpoint,TReq,TRes>`), not raw
  `HttpClient` string URLs.

## The pieces and their contracts

Build these once, in this order; grow them only when a test needs it (YAGNI applies to test
infra too).

1. **`ApiTestFixture`** — `WebApplicationFactory<Program>` + one `Testcontainers.PostgreSql`
   container per assembly, shared via `[CollectionDefinition("Api")]`. On init: start container,
   run EF migrations, run the identity seeder, snapshot the baseline. In `ConfigureWebHost`:
   repoint every DbContext at the container; replace the message-bus seam with `FakeMessageBus`
   and `TimeProvider` with a `FakeTimeProvider` started at real "now". Exposes
   `BuildAsync(Action<TestContextBuilder>)` — the single seed entry point (reset → record →
   materialize → return a `TestContext`).
2. **`DatabaseResetService`** (shipped, drop-in) — owned reset instead of Respawn: one
   `TRUNCATE … CASCADE` over the EF-model table list, **without** `RESTART IDENTITY`, then
   re-inserts the snapshotted identity singletons in the same transaction. Milliseconds per reset.
3. **Seed builder** — `TestContextBuilder` is a pure accumulator: one fluent section per bounded
   context, sub-builders record `Add*("alias", …)` intent, and a materializer inserts everything
   in dependency order (one `SaveChanges` per layer) before Act. The materializer uniquifies
   names behind aliases (`$"{alias}-{guid}"`) so unique indexes never collide. Add a sub-builder
   **per bounded context, not per entity**, and only when a test needs to seed it; no multi-entity
   convenience methods until 3+ tests would benefit.
4. **Identity shortcut** — `AddUser("alice", …permissions)` inserts the user row directly (no
   UserManager, no password hashing); a `JwtMinter` signs tokens locally, mirroring the
   production token service exactly (same signer, key, claim shape), so
   `ctx.Identity.ClientFor("alice")` returns an `HttpClient` that clears the real auth pipeline.
5. **`Expected` DSL** — `ctx.Expected.Widget(id).ToHaveStatus(…)` enqueues deferred reads; one
   `AssertAsync()` runs the chain. Every read uses a fresh DI scope + `AsNoTracking`, filtered by
   the id from Act. `Outbox()` asserts against `FakeMessageBus`, not the DB.
6. **Owned doubles** — a `Doubles/` folder is the only home for test doubles, each one reviewed:
   - Real infra exists → use real infra (never fake a `DbContext`).
   - In-house seam → an owned double is fine (e.g. `FakeMessageBus` for your own `IMessageBus`).
   - A fault the real dependency can't produce on demand → a small curated fake.
   - Doubles are behavioural, not interaction-recording.
