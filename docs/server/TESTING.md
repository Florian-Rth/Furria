# Backend Testing Conventions

This file defines how every backend test in `server/` is written. The MET001–MET006 analyzers
(`server/src/Furria.Tests.Analyzers`) enforce most of it at build time — a violation is a
compile error, not a review comment. See `docs/adr/0001-no-mocks-integration-testing.md` for
why this policy exists.

It has two parts: **what is built today** and **what gets built with the first real entity**.
Everything in the repo has a caller; target designs live here, not as dead code.

## Principles

- **Real infrastructure, no mocks.** Every integration test runs against real Postgres in a
  Testcontainer, through the real HTTP pipeline. Mocking frameworks (Moq, NSubstitute) and
  EF InMemory are banned.
- **Test observable behaviour, not interactions.** Assert what the system did (rows, responses,
  published messages) — never that "method X was called".
- **Only write tests for real scenarios.** No tests that merely validate implementation details.
- **YAGNI applies to test infra too.** A helper exists only once a test needs it; until then its
  contract is specced below under *Planned*.

## Built today

### The shape of a test (current)

```csharp
[Collection("Api")]                       // shares the one Postgres container per assembly
public sealed class UnlockPreviewTests
{
    private readonly ApiTestFixture _fixture;

    public UnlockPreviewTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnGranted_When_PasswordIsCorrect()
    {
        var client = _fixture.CreateClient();

        var (response, result) = await client.POSTAsync<
            UnlockPreview,
            UnlockPreviewRequest,
            UnlockPreviewResponse
        >(new() { Password = ApiTestFixture.PreviewPassword });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.Granted);
    }
}
```

### The pieces

1. **`ApiTestFixture`** — `WebApplicationFactory<Program>` + one `Testcontainers.PostgreSql`
   container per assembly, shared via `[CollectionDefinition("Api")]`. On init: start container,
   run EF migrations, create the reset service. Repoints the connection string and preview
   password via the constants the production code itself uses (`AppDbContext.ConnectionName`,
   `PreviewAccessOptions.SectionName`), and swaps `TimeProvider` for a `FakeTimeProvider`
   anchored at real "now".
2. **`DatabaseResetService`** — owned reset instead of Respawn: one `TRUNCATE … CASCADE` over
   the EF-model table list, **without** `RESTART IDENTITY`, then re-inserts snapshotted
   singleton rows in the same transaction. Milliseconds per reset. Wired in the fixture; a
   guarded no-op until the first entity lands.

### The rules (analyzer-enforced)

| Id | Rule |
|----|------|
| MET001 | No mocking framework — owned `Fake*`/`Capturing*` doubles only. |
| MET002 | No EF Core InMemory — every test runs against real Postgres. |
| MET003 | Test methods are named `Should_<Expected>_When_<Scenario>`. |
| MET004 | A class injecting `ApiTestFixture` carries `[Collection("Api")]`. |
| MET005 | No `DbContext` in a test body — seed and assert through the harness. |
| MET006 | Production code never reads `DateTime.Now/UtcNow` — inject `TimeProvider`. |

### Rules the compiler can't check

- **Never hardcode ids.** The reset keeps identity sequences climbing, so the first row in a
  class is *not* id 1 — by design. Resolve ids from seeded context or the Act response.
- **Never wait wall-clock time.** No `Task.Delay` pacing, no fixed sleeps. Poll the expected
  condition with a timeout; control time by advancing the injected `FakeTimeProvider`.
- **Status code from the response; state from the database.** Don't assert state by making more
  HTTP calls.
- **Use the typed test client** (e.g. FastEndpoints' `PUTAsync<TEndpoint,TReq,TRes>`), not raw
  `HttpClient` string URLs.

## Planned — build with the first real entity

The target arrange/assert layer. Build these pieces **in this order, each with its first
consuming test**; contracts below are the design commitment. Reference implementations for
`Polling`, `AliasRegistry` and the MET007 dangling-alias analyzer existed at repo setup and
live in git history (`git log -- '**/Polling.cs'`).

### The shape of a test (target)

```csharp
[Collection("Api")]
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

### The pieces and their contracts

1. **Seed builder** — `ApiTestFixture.BuildAsync(Action<TestContextBuilder>)` becomes the
   single seed entry point (reset → record → materialize → return a `TestContext`).
   `TestContextBuilder` is a pure accumulator: one fluent section per bounded context,
   sub-builders record `Add*("alias", …)` intent, and a materializer inserts everything in
   dependency order (one `SaveChanges` per layer) before Act. The materializer uniquifies
   names behind aliases (`$"{alias}-{guid}"`) so unique indexes never collide. Add a
   sub-builder **per bounded context, not per entity**, and only when a test needs to seed it;
   no multi-entity convenience methods until 3+ tests would benefit. Alias resolution goes
   through an `AliasRegistry` that throws on unknown aliases, listing the declared ones.
2. **Identity shortcut** — `AddUser("alice", …permissions)` inserts the user row directly (no
   UserManager, no password hashing); a `JwtMinter` signs tokens locally, mirroring the
   production token service exactly (same signer, key, claim shape), so
   `ctx.Identity.ClientFor("alice")` returns an `HttpClient` that clears the real auth pipeline.
3. **`Expected` DSL** — `ctx.Expected.Widget(id).ToHaveStatus(…)` enqueues deferred reads; one
   `AssertAsync()` runs the chain. Every read uses a fresh DI scope + `AsNoTracking`, filtered by
   the id from Act. `Outbox()` asserts against `FakeMessageBus`, not the DB.
4. **Owned doubles** — a `Doubles/` folder is the only home for test doubles, each one reviewed:
   - Real infra exists → use real infra (never fake a `DbContext`).
   - In-house seam → an owned double is fine (e.g. `FakeMessageBus` for your own `IMessageBus`).
   - A fault the real dependency can't produce on demand → a small curated fake.
   - Doubles are behavioural, not interaction-recording.
5. **`Polling.WaitUntilAsync(predicate, timeout)`** — the sanctioned alternative to `Task.Delay`
   once the first asynchronous side effect (background consumer, relay broadcast) needs waiting
   on. Reads the real wall clock deliberately — the deadline must advance even when the host
   injects a frozen `FakeTimeProvider`.
6. **MET007 (dangling-alias analyzer)** — returns together with the builder: every alias passed
   to `IdOf`/`ClientFor`/`NameOf` must be declared by an `Add*("alias")` call in the same class;
   `[SeedsAliases]` opts out when a helper in another class seeds.
