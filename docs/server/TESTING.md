# Backend Testing Conventions

This file defines how every backend test in `server/` is written. The MET001–MET007 analyzers
(`server/src/Furria.Tests.Analyzers`) enforce most of it at build time — a violation is a
compile error, not a review comment. See `docs/adr/0001-no-mocks-integration-testing.md` for
why this policy exists.

It has three parts: **the base harness**, **the arrange/assert layer that landed with the first
real entity**, and **what is still owed**. Everything in the repo has a caller; target designs
live here, not as dead code.

## Principles

- **Real infrastructure, no mocks.** Every integration test runs against real Postgres in a
  Testcontainer, through the real HTTP pipeline. Mocking frameworks (Moq, NSubstitute) and
  EF InMemory are banned.
- **Test observable behaviour, not interactions.** Assert what the system did (rows, responses,
  published messages) — never that "method X was called".
- **Only write tests for real scenarios.** No tests that merely validate implementation details.
- **YAGNI applies to test infra too.** A helper exists only once a test needs it; until then its
  contract is specced below under *Still planned*.

## The base harness

### The shape of a test

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
   singleton rows in the same transaction. Milliseconds per reset. Wired in the fixture; it
   snapshot-restores the bootstrap admin (`Person`, then `Account`) after every truncate.

### The rules (analyzer-enforced)

| Id | Rule |
|----|------|
| MET001 | No mocking framework — owned `Fake*`/`Capturing*` doubles only. |
| MET002 | No EF Core InMemory — every test runs against real Postgres. |
| MET003 | Test methods are named `Should_<Expected>_When_<Scenario>`. |
| MET004 | A class injecting `ApiTestFixture` carries `[Collection("Api")]`. |
| MET005 | No `DbContext` in a test body — seed and assert through the harness. |
| MET006 | Production code never reads `DateTime.Now/UtcNow` — inject `TimeProvider`. |
| MET007 | Every builder alias resolved by `IdOf`/`EmailOf`/`ClientFor`/`ClientForAsync`/`NameOf` is declared by an `Add*` call in the same class. |

### Rules the compiler can't check

- **Never hardcode ids.** The reset keeps identity sequences climbing, so the first row in a
  class is *not* id 1 — by design. Resolve ids from seeded context or the Act response.
- **Never wait wall-clock time.** No `Task.Delay` pacing, no fixed sleeps. Poll the expected
  condition with a timeout; control time by advancing the injected `FakeTimeProvider`.
- **Status code from the response; state from the database.** Don't assert state by making more
  HTTP calls.
- **Use the typed test client** (e.g. FastEndpoints' `PUTAsync<TEndpoint,TReq,TRes>`), not raw
  `HttpClient` string URLs.

## Built with the first real entity (B1, identity foundation)

The arrange/assert layer landed with `Person`, `Membership`, `Account` and `RefreshToken`. Three
deviations from the design this section previously committed to, each deliberate:

- **`SeededContext`, not `TestContext`** — xunit v3 ships `Xunit.TestContext`, which every test
  already uses for `TestContext.Current.CancellationToken`. The builder is `SeedContextBuilder`.
- **`ClientForAsync`, not `ClientFor`** — there is no `JwtMinter`. An authenticated client is
  produced by logging in over the real HTTP pipeline, so the call is async. A minter that mirrors
  production is a copy that drifts: mis-wire the signing key, issuer or claim shape and every
  minted-token test still passes while every real client gets a 401. Build one only when a test
  needs a token real login cannot mint (an expired one, a foreign-signed one).
- **`Polling` and the `Doubles/` folder stay deferred** — this slice has no asynchronous side
  effect and no in-house seam that real infrastructure cannot serve. Both return with the first
  background worker / message bus, from git history (`git log -- '**/Polling.cs'`).

### The shape of a test

```csharp
[Collection("Api")]
public sealed class GetMeTests
{
    private readonly ApiTestFixture _fixture;

    public GetMeTests(ApiTestFixture fixture) => _fixture = fixture;

    [Fact]
    public async Task Should_ReportKeinMitglied_When_ThePersonNeverHeldAMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;

        // Arrange — declarative seeding against string aliases, committed before Act
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")), ct);

        // Act — the typed test client, carrying a token from a real login
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        // Assert — status code from the response, state through deferred DB reads
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.None, result.Membership.State);
        await ctx.Expected
            .MembershipsOfPerson(ctx.Identity.People.IdOf("alice")).ToHaveCount(0)
            .AssertAsync(ct);
    }
}
```

### The pieces

1. **`ApiTestFixture.BuildAsync(Action<SeedContextBuilder>)`** — the single seed entry point:
   reset → record → materialize → `SeededContext`. Touching `Services` starts the host, so the
   migrator and the bootstrap-admin seeder have both run before the reset snapshot is captured;
   the snapshot is therefore exactly `[typeof(Person), typeof(Account)]`, in that FK-safe order,
   and the admin survives every reset. Two constraints this imposes on production code: those two
   tables must keep Npgsql's default `GENERATED BY DEFAULT AS IDENTITY` keys, and neither may gain
   a computed column — the restore re-inserts every column it read.
2. **`SeedContextBuilder` / `IdentitySeedBuilder`** — pure accumulators. One sub-builder per
   bounded context, not per entity: `AddPerson`, `AddPersonContact`, `AddMembership`,
   `AddMembershipPause`, `AddFeeReduction`, `AddAccount`. `AddAccount` and `AddPersonContact`
   create the Person under the same alias unless `AddPerson` already declared it. **Every dated
   fact carries its own alias first and names its parent by alias** — `AddMembership("alice-first",
   "alice", startedOn)` — so a Person can hold several Mitgliedschaften and every id comes back
   through an MET007-protected `IdOf`. The materializer inserts Person → Membership →
   MembershipPause → FeeReduction → Account, one `SaveChanges` per layer, and uniquifies emails
   behind the alias so unique indexes never collide.
3. **`AliasRegistry`** — `ctx.Identity.People.IdOf("alice")`; an unknown alias throws listing the
   declared ones. `EmailOf` resolves the materialized unique email. One registry per entity kind:
   `People`, `Memberships`, `Pauses`, `FeeReductions`, `Accounts`.
4. **Identity shortcut** — Account rows are inserted directly, not through `UserManager`: the
   harness owns normalization and the password hash, and the hash is computed once per run and
   cached (Identity's PBKDF2 would otherwise dominate the suite). `ctx.Identity.BootstrapAdmin`
   is aliasless, because production code seeds it.
5. **`Expected` DSL** — `ctx.Expected.Account(id).ToHaveEmail(…)` enqueues deferred reads; one
   `AssertAsync(ct)` runs the chain in a fresh scope with `AsNoTracking`. Every `ToHave*` returns
   `Expected`, so chaining two assertions about one entity re-selects it. This is the only legal
   way to assert database state — MET005 bans a `DbContext` in a test body. The Mitgliedschaft
   accessors are **row**-scoped and **set**-scoped, never Person-scoped: `Expected.Membership(id)`
   (`ToHavePeriod`, `ToBeOpen`, `ToNotExist`) and `Expected.MembershipsOfPerson(personId)`
   (`ToHaveCount`, `ToHaveOpenCount`) — with several periods per Person a Person-scoped accessor is
   ambiguous.
6. **`ApiTestFixture.RunBootstrapSeederAsync`** — a host start is exactly the seeder running
   against whatever the database already holds, so this is the honest "second start".
   **`EditPersonNameDirectlyAsync`** edits one Person *through EF*, which is what makes
   `AuditTimestampInterceptor` assertable before any endpoint edits a Person.
7. **`ApiTestFixture.Today` / `.CurrentSessionYear`** — both derived **once** from the anchored
   clock at construction. Seed every Ruhezeit and Beitragsermäßigung span relative to
   `_fixture.CurrentSessionYear`, and every period relative to `_fixture.Today`; never call
   `ClubSession.YearOf` in an integration test, which would assert the implementation with the
   implementation. `ClubSession` and `ClubClock` are verified independently by the pure
   `ClubSessionTests` / `ClubClockTests` against literal dates.
8. **MET007 (dangling-alias analyzer)** — every alias passed to `IdOf`/`EmailOf`/`ClientFor`/
   `ClientForAsync`/`NameOf` must be declared by an `Add*("alias")` call in the same class;
   `[SeedsAliases]` opts out when a helper in another class seeds.

### Traps worth knowing

- **The `FakeTimeProvider` only moves forward** and is shared by the whole collection. It is safe
  to advance because JWT lifetime validation was wired to the same injected clock
  (`AccessTokenLifetime`); remove that wiring and every test which advances time starts poisoning
  the ones after it. `GetMeTests.Should_ReturnUnauthorized_When_TheAccessTokenHasExpired` is the
  guard — it goes red the moment the wiring does.
- **A Mitgliedschaft is a period, and a Person may hold several.** Two `AddMembership` calls for
  one Person just work; two *open* ones are rejected by the partial unique index
  `ix_membership_person_id_open`, which surfaces out of `BuildAsync` as a `DbUpdateException`
  wrapping a `PostgresException`. `MembershipPersistenceTests` is the guard.
- **The audit timestamps come from the injected clock, not from `now()`.**
  `AuditTimestampInterceptor` stamps `created_at` + `updated_at` on insert and `updated_at` on
  update, reading `TimeProvider` once per `SaveChanges`. The `HasDefaultValueSql("now()")` on both
  columns is only a backstop for rows written outside EF. Assert with
  `Expected.Person(id).ToHaveBeenTouchedAt(_fixture.TimeProvider.GetUtcNow())`.

## Still planned — build with their first consumer

The pieces below have no consumer yet. Contracts stay the design commitment.

1. **`Polling.WaitUntilAsync(predicate, timeout)`** — the sanctioned alternative to `Task.Delay`
   once the first asynchronous side effect (background consumer, relay broadcast) needs waiting
   on. Reads the real wall clock deliberately — the deadline must advance even when the host
   injects a frozen `FakeTimeProvider`.
2. **Owned doubles** — a `Doubles/` folder is the only home for test doubles, each one reviewed:
   - Real infra exists → use real infra (never fake a `DbContext`).
   - In-house seam → an owned double is fine (e.g. `FakeMessageBus` for your own `IMessageBus`).
   - A fault the real dependency can't produce on demand → a small curated fake.
   - Doubles are behavioural, not interaction-recording.
3. **`Expected.Outbox()`** — asserts against `FakeMessageBus`, not the DB, once messaging exists.
4. **`JwtMinter`** — only when a test needs a token real login cannot produce.
