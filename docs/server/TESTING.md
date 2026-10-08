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
- **Only write tests for real scenarios.** No tests that merely validate implementation details
  — no seed-then-read-back round trips, no copies of the serializer configuration.
- **Endpoint tests cover business behaviour only.** The gates every endpoint shares are proven
  once, for every registered route, by `Authorization/EndpointConventionTests`, which reads the
  running host's endpoint metadata — a new endpoint is covered the moment it is mapped:
  - no token → `401` on every route that is not `AllowAnonymous`;
  - a caller holding every permission *except* the declared one (`RequirePermission`, or the whole
    `RequireAnyPermission` set) → `403`, and an unaffiliated caller on `RequireAffiliation` → `403`;
  - an `int` route id of `0` → `400` naming that id;
  - an unknown id on an endpoint addressed by its route ids alone (no body, no query) → `404`.

  So **never write a per-endpoint test for any of these.** Keep 403/404 tests where the *handler*
  decides — ownership, group-admin scope, in-handler gates (`EndpointGateTests.InHandlerGated`),
  archived/hidden/foreign-parent entities, an unknown id inside a request body.
- **Wire names the clients parse are pinned once.** `EnumWireNamesTests` serializes every value of
  each client-parsed enum through the host's own serializer options against one pinned line per
  enum; add an enum there when a client starts parsing it, never a per-value test.
- **YAGNI applies to test infra too.** A helper exists only once a test needs it; until then its
  contract is specced below under *Still planned*.

## Running

When to run what is the Validation policy in `CLAUDE.md`: targeted classes locally, the full
suite in CI. One class (after `dotnet build`, Docker running):

```bash
cd server
dotnet run --project tests/Furria.Api.Tests --no-build -- -class <FQN> [-class <FQN>]
```

`dotnet test -- --filter-class` from `server/` also runs the analyzer tests with zero matches and
fails; the VSTest `--filter`/`--treenode-filter` flags are ignored and run the whole suite.

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
   `PreviewAccessOptions.SectionName`), and swaps `TimeProvider` for the project-owned
   `TestClock`, anchored at real "now" truncated to the whole second and reporting UTC as its
   local zone — so nothing in the suite depends on the developer's machine time zone.
2. **`DatabaseResetService`** — owned reset instead of Respawn: one `TRUNCATE … CASCADE` over
   the EF-model table list, **without** `RESTART IDENTITY`, then re-inserts snapshotted
   singleton rows in the same transaction. Milliseconds per reset. Wired in the fixture; it
   snapshot-restores the managing login and the unheld Admin role (`Account`, `Role`,
   `RolePermission` — parents before children) after every truncate.

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
| MET008 | Production code never uses the static `Serilog.Log` — inject `ILogger<T>` (`Program.cs` bootstraps under a pragma). |
| MET009 | Production code never writes to `Console` — log through `ILogger<T>`. |
| MET010 | Log placeholders are PascalCase and name no personal data ([LOGGING.md](LOGGING.md)). |

### Rules the compiler can't check

- **Never hardcode ids.** The reset keeps identity sequences climbing, so the first row in a
  class is *not* id 1 — by design. Resolve ids from seeded context or the Act response.
- **Never wait wall-clock time.** No `Task.Delay` pacing, no fixed sleeps. Poll the expected
  condition with a timeout; control time through `_fixture.AtLaterTimeAsync(span, body)` or
  `_fixture.AtInstantAsync(instant, body)`, never by moving the shared clock by hand — both put
  it back in a `finally`.
- **Status code from the response; state from the database.** Don't assert state by making more
  HTTP calls.
- **Use the typed test client** (e.g. FastEndpoints' `PUTAsync<TEndpoint,TReq,TRes>`), not raw
  `HttpClient` string URLs.
- **An endpoint that gains a request DTO changes every call site.** The two-generic
  `GETAsync<TEndpoint, TResponse>()` still compiles against it and sends no query at all, so when
  `GetPersons` gained `?access=` (CA-P8 S4) every call became
  `GETAsync<GetPersons, GetPersonsRequest, GetPersonsResponse>(new GetPersonsRequest())`. Change
  them all in the same commit.

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
- **`Polling` landed with the mail queue (CA-P8 S1); the `Doubles/` folder stays deferred** —
  mail runs against a real Mailpit Testcontainer. `MailpitInbox` reads what was actually sent
  through Mailpit's HTTP API, polling with a timeout; tests filter by a unique recipient address,
  so the inbox is never cleared between tests. A `ReceivedMail` reads what a test needs out of
  the real mail: `LinkToken()` the invitation link's token, `ConfirmationCode()` the 6-digit
  *Bestätigungscode* (CA-P8 S2).

### The shape of a test

```csharp
[Collection("Api")]
public sealed class GetMeTests
{
    private readonly ApiTestFixture _fixture;

    public GetMeTests(ApiTestFixture fixture) => _fixture = fixture;

    [Fact]
    public async Task Should_ReportNoMembership_When_ThePersonNeverHeldAMembership()
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
   migrator and the managing-login seeder have both run before the reset snapshot is captured;
   the snapshot is therefore exactly `[typeof(Account), typeof(Role), typeof(RolePermission)]`,
   in that FK-safe order, and the managing login *and the Admin role* survive every reset (the
   managing login has no person — ADR-0022 — so `person` and `role_holding` start empty). Two
   constraints this imposes on production code: those three tables must keep Npgsql's default
   `GENERATED BY DEFAULT AS IDENTITY` keys — which is why `role_permission` carries a surrogate
   `int Id` instead of a composite key — and none may gain a computed column; the restore
   re-inserts every column it read, so `account.is_managing_login` round-trips as it is.
   `DatabaseResetService.CreateAsync` also takes the **retained** entity types, whose tables are
   never truncated: `[typeof(DataProtectionKey)]`. `data_protection_keys` is infrastructure — the
   host's key ring — so a reset keeps it and the tokens it protects stay readable (CA-P8).
2. **`SeedContextBuilder` / `IdentitySeedBuilder` / `GroupSeedBuilder` / `RoleSeedBuilder` /
   `ClubSeedBuilder`** —
   pure accumulators. One sub-builder per bounded context, not per entity: `builder.Identity(…)`
   takes `AddPerson`, `AddPersonContact`, `AddMembership`, `AddAdmission` (stamps a seeded
   membership as admitted: by whom, when, with or without a minor's guardian consent),
   `AddMembershipPause`,
   `AddFeeReduction`, `AddAccount`, `AddContactChange(personAlias, changedByAlias, changedAt)`
   (the last change of a person's contact details and who made it, both persons by alias),
   `AddArchive(personAlias, archivedOn, archivedByAlias)` (files her away; no
   `archivedByAlias` is an archiving by the managing login) and
   `AddMembershipApplication(alias, birthDate, …)` (a confirmed application, confirmed an hour
   before the clock's now unless `confirmedAt` says otherwise; `unconfirmed: true` leaves it
   unconfirmed — it is inserted directly, so no Altcha has to be solved); `builder.Groups(…)` takes `AddGroupKind`, `AddGroup`,
   `AddGroupMembership`, `AddGroupAdmin`; `builder.Roles(…)` takes `AddRole`,
   `AddRoleWithDetails`, `AddRoleHolding`,
   `AddRoleWithHolder`; `builder.Club(…)` takes `AddSession`, whose every argument but the alias
   and the `startYear` is optional, because a Session record is exactly as complete as the club's
   evidence, and `AddVenue`, `AddAnnouncement`, `AddKeyHolding`, `AddBoardOffice`, `AddBoardSeat`,
   `AddTrainingSlot`, `AddCalendarEntry` and `AddAttendanceResponse`.
   **Every one of them materializes.** `ClubSeedBuilder` was given its final shape in CA-P4 D1,
   ahead of the entities, and while that lasted `ClubSeedMaterializer` threw
   `NotSupportedException` for the methods that had no table yet. CA-P4 wave 2 landed the last of
   them and the refusal went with it; there is no `ClubSeedBuilderTests`. The rule it enforced
   still holds, by construction now rather than by a throw: **no `Add*` on any sub-builder is a
   declaration without an insert**, because an arrangement that is silently dropped would read as
   a green test.
   **`AddGroupKind` is inserted first inside `GroupSeedMaterializer`**, before the groups that
   name it; **`AddTrainingSlot` lives on `ClubSeedBuilder`**, not on `GroupSeedBuilder`, because a
   training slot needs both a `groupId` and a `venueId` and only `ClubSeedMaterializer` holds both.
   Its alias names the slot, its parents are named by alias (`AddTrainingSlot("garde-dienstag",
   "tanzgarde", DayOfWeek.Tuesday, new TimeOnly(19, 30), 90, venueAlias: "sporthalle")`), and
   `venueAlias` is optional — a group may state a habit without naming a hall.
   **`AddCalendarEntry` takes `participatingGroupAliases`** as its last parameter, which is how a
   test arranges participating groups.
   `AddAccount` and `AddPersonContact` create the Person under the same alias unless `AddPerson`
   already declared it. **Every dated fact carries its own alias first and names its parent by
   alias** — `AddMembership("alice-first", "alice", startedOn)` — so a Person can hold several
   memberships and every id comes back through an MET007-protected `IdOf`. `SeedMaterializer`
   opens the one scope and inserts Person → Membership → MembershipPause → FeeReduction → Account
   → GroupKind → Group → GroupMembership → GroupAdmin → Role → RolePermission → RoleHolding →
   Session → Announcement → Venue → TrainingSlot → KeyHolding → BoardOffice → BoardSeat →
   CalendarEntry → AttendanceResponse, one
   `SaveChanges` per layer, and uniquifies emails behind the alias so unique indexes never
   collide. A sub-builder records its parents by alias, not by order: `AddGroupAdmin` may name a
   group a later `AddGroup` call declares.
   **`AddRole` takes `params string[] permissionKeys` and therefore no optional parameters** — a
   description or an `archivedOn` goes through `AddRoleWithDetails`, because
   `AddRole(alias, name, description = "", …, params keys)` would silently bind the first key to
   `description` and grant nothing. `AddRoleWithHolder("gruppenpflege", "gruppenpflege-holding",
   "Gruppenpflege", "ilka", key…)` is the one-line "give this caller this key"; its holding alias
   is a literal on purpose, because MET007 collects declarations syntactically.
3. **`AliasRegistry`** — `ctx.Identity.People.IdOf("alice")`; an unknown alias throws listing the
   declared ones. `EmailOf` resolves the materialized unique email. One registry per entity kind:
   `ctx.Identity.{People, Memberships, Pauses, FeeReductions, Accounts, MembershipApplications}`,
   `ctx.Groups.{GroupKinds, Groups, GroupMemberships, GroupAdmins}`,
   `ctx.Roles.{Roles, RolePermissions, RoleHoldings}` and
   `ctx.Club.{Sessions, Venues, Announcements, KeyHoldings, BoardOffices, BoardSeats,
   TrainingSlots, CalendarEntries, AttendanceResponses}`. A `RolePermission` has no alias of its
   own — it is registered under `"{roleAlias}:{permissionKey}"`.
4. **Identity shortcut** — Account rows are inserted directly, not through `UserManager`: the
   harness owns normalization and the password hash, and the hash is computed once per run and
   cached (Identity's PBKDF2 would otherwise dominate the suite). `ctx.Identity.ManagingLogin`
   and `_fixture.AdminRoleId` are aliasless, because production code seeds both.
   **`ctx.Identity.ManagingLoginClientAsync(ct)` is how a test gets a caller holding every
   permission** — the managing login holds `FurriaPermissions.All` by itself. It has no person, so
   where it acts the actor is empty, and it is not affiliated: a test needing a person-backed or
   affiliated caller seeds one with the keys it needs.
5. **`Expected` DSL** — `ctx.Expected.Account(id).ToHaveEmail(…)` enqueues deferred reads; one
   `AssertAsync(ct)` runs the chain in a fresh scope with `AsNoTracking`. Every `ToHave*` returns
   `Expected`, so chaining two assertions about one entity re-selects it. This is the only legal
   way to assert database state — MET005 bans a `DbContext` in a test body. The membership
   accessors are **row**-scoped and **set**-scoped, never Person-scoped: `Expected.Membership(id)`
   (`ToHavePeriod`, `ToBeOpen`, `ToNotExist`, `ToRecordAdmission`) and `Expected.MembershipsOfPerson(personId)`
   (`ToHaveCount`, `ToHaveOpenCount`) — with several periods per Person a Person-scoped accessor is
   ambiguous. The role accessors follow the same split: `Expected.Role(roleId)`
   (`ToHaveName`, `ToHaveDescription`, `ToBeArchivedOn`, `ToGrantExactly`), `Expected.Roles()`
   (`ToHaveCount`), `Expected.RoleHolding(id)` (`ToHavePeriod`, `ToBeOpen`) and
   `Expected.RoleHoldingsOfPerson(personId)` (`ToHaveCount`, `ToHaveOpenCount`). So do the group
   accessors: `Expected.Group(groupId)` (`ToHaveName`, `ToHaveDescription`, `ToBeRecruiting`,
   `ToHaveGroupKind`, `ToHaveFoundedYear`, `ToHaveTone`, `ToBeArchivedOn`,
   `ToHaveBeenCreatedAt`, `ToHaveBeenTouchedAt`), `Expected.GroupMembership(id)` (`ToHavePeriod`,
   `ToBeOpen`), `Expected.GroupMembershipsOf(groupId)` (`ToHaveCount`, `ToHaveOpenCount`),
   `Expected.GroupAdmin(id)` (`ToHaveFunction`, `ToHavePeriod`) and
   `Expected.GroupAdminsOf(groupId)` (`ToHaveCount`, `ToHaveOpenCount`). The group-kind accessors
   are `Expected.GroupKind(groupKindId)` (`ToHaveName`, `ToBeArchivedOn`,
   `ToBeOpen`, `ToNotExist`) and `Expected.GroupKinds()`, whose
   `ToReadInNameOrder(names…)` pins *German name, then id* — the order the
   group kinds read in — and whose `ToCountGroupsOf(groupKindId, count)` counts the
   running groups that name it, which is what an archive action must refuse over.
   The access accessors follow the same split (CA-P8): `Expected.InvitationsOfPerson(personId)`
   (`ToHaveCount`, `ToHaveLiveCount`, `ToHaveLiveCountOn(channel, n)`),
   `Expected.LiveInvitationOfPerson(personId)` (`ToBeIssuedAs(channel, isReminder,
   issuedByPersonId)`) and `Expected.AccountEventsOfPerson(personId)`
   (`ToHaveKindsInOrder(kinds…)`, `ToHaveLatestActor(personId)`, `ToHaveNoLatestActor()` for a
   self-requested invitation). `LiveInvitationOfPerson` also takes `ToBeSelfRequested()` and
   `ToBeRecoveryIssuedBy(issuedByPersonId)`. A login-email change is asserted on
   `Expected.EmailConfirmationsOfAccount(accountId)` (`ToHaveCount`, `ToHaveLiveCount`) and
   `Expected.Account(id).ToSignInAs(email)`; the key ring on
   `Expected.DataProtectionKeys().ToHoldAKey()`. A person's contact details are
   asserted on `Expected.Person(personId)`: `ToHaveContactDetails(…)`,
   `ToHaveContactChangedBy(personId, changedAt)` and `ToHaveNoContactChange()`, her archiving on
   `ToBeArchived(archivedOn, archivedByPersonId)` and `ToNotBeArchived()`; an absorbed stray
   person on `Expected.Person(id).ToNotExist()` (and `ToExist()` for the one left untouched).
   A declined application on `Expected.MembershipApplication(id).ToNotExist()` (`ToExist()` for
   one a refused decline left alone); the table as a whole on `Expected.MembershipApplications()`
   (`ToHaveCount`, `ToHaveConfirmedCount`).
   The training rhythm and the trainings the generator writes are **set**-scoped and group-
   scoped, never slot-scoped, because a group states several habits and the endpoint replaces
   them wholesale: `Expected.TrainingSlotsOf(groupId)` (`ToHaveCount`, `ToBeEmpty`,
   `ToCarrySlot(weekday, startsAt, durationMinutes, venueId)`) and
   `Expected.TrainingsOf(groupId)` (`ToHaveCount`, `ToBeEmpty`,
   `ToCarryTraining(title, startsAt, endsAt, venueId)`, which also pins that a generated entry is
   `Kind.Training` and `Visibility.Group`). Participating groups are asserted on the entry that
   carries them, not on a set of their own: `Expected.CalendarEntry(id)`'s
   `ToCarryParticipatingGroups(groupIds…)` and `ToCarryNoParticipatingGroup()`. The Session accessor is
   `Expected.Session(sessionId)` (`ToHaveStartYear`, `ToHaveNumber`, `ToHaveMotto`,
   `ToHaveLogo`), and the venue accessor is `Expected.Venue(venueId)` (`ToHaveName`,
   `ToHaveSortOrder`, `ToHaveAddress`, `ToHaveHint`, `ToBeArchivedOn`, `ToBeOpen`,
   `ToNotExist`). The board accessors split the same way as the role ones:
   `Expected.BoardOffice(boardOfficeId)` (`ToHaveName`, `ToHaveSortOrder`, `ToImplyRole`,
   `ToImplyNoRole`, `ToBeArchivedOn`, `ToBeOpen`, `ToNotExist`),
   `Expected.BoardSeat(boardSeatId)` (`ToFillOffice`, `ToBeHeldBy`, `ToRunFrom`, `ToHavePeriod`,
   `ToBeOpen`, `ToNotExist`) and `Expected.BoardSeatsOfOffice(boardOfficeId)` (`ToHaveCount`,
   `ToHaveOpenCount`). The key-holding accessors are `Expected.KeyHolding(keyHoldingId)`
   (`ToBeHeldAt`, `ToBeHeldBy`, `ToHaveSinceOn`, `ToHaveUntilOn`, `ToHavePeriod`, `ToBeOpen`,
   `ToNotExist`) and `Expected.KeyHoldingsOfVenue(venueId)` (`ToHaveCount`, `ToHaveOpenCount`).
   `Expected.Groups().ToReadInGermanOrder(names…)` orders by the **column**, with no
   `EF.Functions.Collate` anywhere — the German ICU collation lives on `group.name` itself
   (ADR-0008), so the assertion reads what production reads. `CollationTests` owns the proof in
   both directions: the umlaut sort order, and the umlaut half of `ix_group_name_active`'s
   case-insensitive uniqueness. Both go red the moment `UseCollation` leaves the model, which is
   the whole point — the older, collate-in-the-assertion form passed against an unconfigured
   schema.
6. **`ApiTestFixture.RunManagingLoginSeederAsync`** — a host start is exactly the seeder running
   against whatever the database already holds, so this is the honest "second start"; its
   overload taking a `ManagingLoginOptions` is how a test runs the seeder under *different*
   configuration (an unconfigured environment, a re-cased, moved or foreign e-mail, a new
   password). **`SeedAccountOnAsync(host, alias)`** seeds a person-backed account on a host with
   a database of its own. **`EditPersonNameDirectlyAsync`**,
   **`EditGroupNameDirectlyAsync`** and **`EditRoleNameDirectlyAsync`** edit one row *through EF*,
   which is what makes `AuditTimestampInterceptor` assertable over `person`, `group` and `role`
   before any endpoint edits them.
7. **`ApiTestFixture.Today` / `.CurrentSessionYear`** — both read the fixture's `TestClock`
   **live**, through `ClubClock`/`ClubSession`, so they always name the day the server itself is
   reading. They are deliberately *not* frozen at construction: the clock is shared by the whole
   collection and earlier classes advance it (`RefreshTests` by 31 days), so a value captured in
   the constructor would drift a month behind the running host and
   `Should_ReportNoMembership_When_TheOnlyMembershipStartsTomorrow` would seed a date that is
   already in the past. Seed every membership pause and fee reduction span relative to
   `_fixture.CurrentSessionYear`, and every period relative to `_fixture.Today`; never call
   `ClubSession.YearOf` in an integration test, which would assert the implementation with the
   implementation. `ClubSession` and `ClubClock` are verified independently by the pure
   `ClubSessionTests` / `ClubClockTests` against literal dates.
8. **MET007 (dangling-alias analyzer)** — every alias passed to `IdOf`/`EmailOf`/`ClientFor`/
   `ClientForAsync`/`NameOf` must be declared by an `Add*("alias")` call in the same class;
   `[SeedsAliases]` opts out when a helper in another class seeds.

9. **`ApiTestFixture.Logs`** — the `CapturingLogSink`, registered as the host's only log sink
   (the console is `Off` under the fixture). `Mark()` before Act, then
   `Written(template, mark)` + `ScalarOf(property)`; assert template and properties, never the
   rendered text. The sink is never cleared — it outlives every reset — so scope every query by a
   mark or by a property only your test produces. `RunDatabaseMigratorAsync` is the honest
   "second start" for the migrator's events. Logging conventions: [LOGGING.md](LOGGING.md).
10. **The invitation toolkits** — `InvitationSteps` (`Furria.Api.Tests/Auth`) is how a test walks
   the invitation chain over the real API: `AddEligiblePerson`, `UniqueContactEmail`,
   `InviteAsync`, `InviteInPersonAsync`, `TokenOf(link)`, `LookUpAsync` / `LookUpByCodeAsync`,
   `RedeemAsync` / `RedeemByCodeAsync`, `RequestConfirmationCodeAsync` (redeems with a chosen
   login email and returns the code read from Mailpit), `SignedInClient` (a client carrying the
   session a redemption returned), `WrongConfirmationCode`, and `UnknownToken()` /
   `UnknownCode()` for credentials that match nothing. `InvitationRoundSteps`
   (`Furria.Api.Tests/Invitations`) wraps the rounds — `PreviewAsync`, `InviteAllAsync`,
   `RemindAllAsync` — and names the spans they turn on: `PastTheReminderDelay`,
   `WithinTheReminderDelay`, `PastTheMailLifetime`. `InvitationSteps` also walks the
   `accounts.manage` acts: `IssueRecoveryAsync` (the real `PostPersonAccessRecovery`; there is no
   direct fixture shortcut for a recovery) and `SetAccountDisabledAsync`; `RedeemByCodeAsync`
   takes `updateContactEmail` for a recovery that changes the login email.
11. **The signed-in and signed-out toolkits (CA-P8 wave 2)** — all in `Furria.Api.Tests/Auth`.
   `SignedOutMailSteps` drives the signed-out mail requests: `RequestAccessAsync`,
   `RequestPasswordResetAsync`, `ResetPasswordAsync`, `RequestResetAndReadItAsync` (returns the
   reset blob read from Mailpit), `ResetOf(link)`, `UnknownReset()`, `FingerprintOfAsync` (the
   status, headers and body a byte-identical answer is compared by), and the pair behind every
   *sends nothing* test, `SettleAsync` and `MailsAlreadyInAsync`. `ReceivedMail.LinkTokens()`
   reads every invitation link of a shared-inbox mail. `AccountSecuritySteps` covers her own
   login: `RequestLoginEmailChangeAsync` / `RequestLoginEmailCodeAsync`,
   `ConfirmLoginEmailAsync`, `ChangePasswordAsync`, `DeleteAccountAsync`, `RefreshAsync`,
   `LogInStatusAsync`, `ClientWith(accessToken)` and `AssertRefusedOnAsync`, with
   `LockoutThreshold`, `NoticeSubject` and `ConfirmationSubject`. `ClaimSteps` arranges and walks
   the claim-in: `AddStrayWithAccount` (a non-affiliated person with an account, on the seed
   builder), `ClaimAsync` and `GiveContactEmailAsync`, with `WrongClaimPassword`; seeded accounts
   sign in with `ApiTestFixture.SeededAccountPassword`.
12. **The passkey toolkit (CA-P8 S7)** — `SoftwareAuthenticator` (`Furria.Tests.Common/WebAuthn`)
   is a real ES256 platform authenticator in memory: `Create(creationOptions, origin)` answers a
   creation with a `none` attestation, `Assert(requestOptions, origin)` signs an assertion with
   user presence and verification, and `CredentialId` / `PasskeyId` name what it holds. No mock:
   Identity verifies every byte. `PasskeySteps` (`Furria.Api.Tests/Auth`) walks the ceremonies over
   the real endpoints — `RegisterAsync`, `CreationOptionsAsync` / `AddAsync`, `AssertAsync`
   (request options plus an assertion, returned as a `PasskeyAssertionAttempt`), `LogInAsync`,
   `RemoveAsync`, `DeleteAccountAsync` — with `WebOrigin`, `AndroidOrigin`, `ForeignOrigin`,
   `PastTheChallengeLifetime` and the notice leads; `ClaimSteps.ClaimByPasskeyAsync` claims in with
   an attempt. `Expected.PasskeysOfAccount(accountId)` (`ToHaveCount`, `ToHold`) and
   `Expected.PasskeyChallenges()` (`ToHaveCount`) read the two tables.
   `ApiTestFixture.AndroidCertFingerprint` is the one fingerprint the host accepts, so
   `AndroidOrigin` is its `android:apk-key-hash:` origin.

### Traps worth knowing

- **The `TestClock` is one singleton shared by the whole collection.** Moving it is safe because
  JWT lifetime validation was wired to the same injected clock (`AccessTokenLifetime`); remove
  that wiring and every test which moves time starts poisoning the ones after it.
  `GetMeTests.Should_ReturnUnauthorized_When_TheAccessTokenHasExpired` is the guard — it goes red
  the moment the wiring does. Move it **only** inside `AtLaterTimeAsync` / `AtInstantAsync`: a
  raw `Advance` or `SetUtcNow` in a test body leaks into every class that runs after it, which is
  what makes a suite order-dependent. `AtInstantAsync` also moves *backwards*, which is how the
  Berlin-vs-UTC midnight tests seed a literal instant.
- **A membership is a period, and a Person may hold several.** Two `AddMembership` calls for
  one Person just work; two *open* ones are rejected by the partial unique index
  `ix_membership_person_id_open`, which surfaces out of `BuildAsync` as a `DbUpdateException`
  wrapping a `PostgresException`. `MembershipPersistenceTests` is the guard.
- **The managing login holds every permission and is in no list.** It has no person, so it
  appears in no register, count or member list and passes every key gate — but no affiliation
  gate, and the seeded Admin role it leaves unheld counts as vacant.
  **Assert list contents by alias membership, never by a raw `Count`.**
- **A group admin is not a group membership and confers no affiliation.** Affiliation is
  *running membership ∨ open group membership ∨ running role holding*; a Person whose only tie
  is a `group_admin` row reads **not affiliated**, while her group-scoped gates
  (`CanAdministerGroupAsync`, `IsGroupMemberOrAdminAsync`) still pass.
  `AffiliationRequirementTests` and `GroupAccessTests` pin both halves — do not "fix" one of them.
  This is why `GET groups/{groupId}` carries **no** `Definition.RequireAffiliation()` and asks
  `IsAffiliatedAsync ∨ CanAdministerGroupAsync` in the handler instead (CA-P6): widening
  `AffiliationQuery` to count `group_admin` would silently move `/members`, `/groups`, `/calendar`
  and `GetMe.isAffiliated`. Every such in-handler gate must be named in `EndpointGateTests`'
  `InHandlerGated` list, which fails in **both** directions — a registered route with no gate and
  no entry, and an entry naming a route that no longer exists.
- **The invitation-token rate limiter is a host singleton that outlives every reset.** Its permits
  are counted per token or code, and the fixture grants `ApiTestFixture.PermitsPerInvitationToken
  = 10` of them. A literal unknown token shared between tests spends one budget for the whole
  collection and turns later tests into `429`s — draw a fresh `UnknownToken()` / `UnknownCode()`
  in every test.
- **Every limiter is a host singleton that outlives every reset** — the per-address limiter and
  the reset-mail throttle (keyed by address), and the per-account `AccountRateLimiter` (keyed by
  account id, five login-email codes per 15 minutes). Give every test its own address with
  `UniqueContactEmail`, and remember the managing login's account id survives every reset: a
  test that spends its per-account budget spends it for the whole collection.
- **A per-IP limit is proven on a host of its own, from forwarded addresses.** The fixture sets
  `RateLimits:SignedOut:PermitsPerIp` and both `RateLimits:SignIn` limits to a million so no suite
  trips them, and every test comes from the same address. A test that must exhaust a per-IP limit
  takes `_fixture.HostWithSettings(...)` — a second host on the same database with the limit
  lowered (`SignInLimitSteps.HostAllowingFewFailures` for sign-in) — disposed with `await using`,
  so its limiter dies with the test. Its clients come from
  `host.CreateClientForwardedFor("203.0.113.x")`: the fixture trusts
  `ApiTestFixture.TrustedProxyAddress`, and the test server's peer is trusted as the first hop, so
  each test is its own client. Draw an address no other test uses (TEST-NET ranges).
- **A signed-out route proves it sits on the per-IP policy through the route's metadata:**
  `PasskeySteps.RateLimitPolicyOf(fixture, route)` reads the `EnableRateLimitingAttribute` the
  endpoint's `RequireRateLimiting` left, and must equal `SignedOutRateLimiting.PerIpPolicy`. A route
  that forgets the call passes every behaviour test and only this one goes red.
- **The reset waits for the signed-out queue.** `ResetDatabaseAsync` polls
  `SignedOutMailRequestQueue.IsIdle` before truncating: a request a previous test left unanswered
  would otherwise hold locks while `TRUNCATE … CASCADE` takes them in another order, and
  PostgreSQL answers `40P01 deadlock detected` in the next test's `BuildAsync`.
- **Mail leaves through the outbox (L1 S5).** A mail is an `outbox_mail` row written in the
  transaction that causes it; the host's `MailDispatcher` sends rows in id order and deletes each
  once sent. Mailpit receives the mail before the row is gone, so a test that proves no copy of a
  link stays behind awaits `_fixture.OutboxDrainedAsync(ct)` after the mail arrived. Every host
  runs its own dispatcher — a second host (`HostWithSettings`, `HostOnDatabase`) may send a mail
  the test's act staged.
- **A test that proves *nothing was sent* needs a sentinel.** Both signed-out queues run one
  request at a time, so a sentinel account's reset request queued after the act drains
  everything before it: act, `SignedOutMailSteps.SettleAsync(fixture, sentinelLoginEmail, ct)`,
  then assert `MailsAlreadyInAsync(address)` is empty. Waiting for "no mail" by time proves
  nothing.
- **`ToBeIssuedAs` asserts an `Onboarding` invitation.** A recovery is asserted with
  `ToBeRecoveryIssuedBy(managerId)`, and a self-requested one with `ToBeSelfRequested()`.
- **An account of a non-affiliated person is claimable.** A *taken* test therefore needs an
  affiliated account (give it a membership); otherwise redemption answers `claimRequired`.
- **The managing login holds `accounts.manage`**, so it may vouch for an unknown birth date. A
  test proving the *no birth date* refusal needs a caller holding `persons.manage` alone.
- **Only `account`, `role` and `role_permission` survive a reset.**
  Everything else, the five group tables included (`group_kind`, `group`, `group_membership`,
  `group_admin`, `group_training_slot`), is truncated before every `BuildAsync`, so a
  test seeds every group and every group kind it needs and may never assume one from a neighbour.
  `data_protection_keys` is never truncated at all (retained, see *The pieces* 1).
- **`session` and `venue` start empty — in a test and in a fresh production database alike.**
  Nothing is seeded from code: a migration builds schema and nothing else, and the club's master
  data is entered through its management surface. So a test arranges every session and every venue
  it needs through `builder.Club(…)`, no value is reserved, and a hub read against a database that
  holds neither is a real shipped shape rather than a broken one — `GetClubHubTests` pins it.
- **`EndpointGateTests` proves less than its name suggests, by construction.** It enumerates
  `RouteEndpoint`s and reads their metadata; `PermissionEnforcer` is wired through FastEndpoints'
  `Endpoints.Configurator`, which reaches **FastEndpoints endpoints only**. A hand-mapped
  minimal-API route carrying `PermissionRequirement` would satisfy this guard and run
  **unenforced**; only `EndpointConventionTests`, which actually calls every route, would go red.
  Map endpoints through FastEndpoints. Anything served by middleware is not a route at all and
  neither class can see it: that is why the OpenAPI document is registered only when
  `IsDevelopment()`, pinned by `OpenApiExposureTests`. Both it and `EndpointConventionTests` use
  raw URLs instead of the typed client — there is no endpoint type to name, or the routes come
  from metadata.

- **The audit timestamps come from the injected clock, not from `now()`.**
  `AuditTimestampInterceptor` stamps `created_at` + `updated_at` on insert and `updated_at` on
  update, reading `TimeProvider` once per `SaveChanges`. The `HasDefaultValueSql("now()")` on both
  columns is only a backstop for rows written outside EF. Assert with
  `Expected.Person(id).ToHaveBeenTouchedAt(_fixture.TimeProvider.GetUtcNow())`.

## Still planned — build with their first consumer

The pieces below have no consumer yet. Contracts stay the design commitment.

1. **Owned doubles** — a `Doubles/` folder is the only home for test doubles, each one reviewed:
   - Real infra exists → use real infra (never fake a `DbContext`).
   - In-house seam → an owned double is fine (e.g. `FakeMessageBus` for your own `IMessageBus`).
   - A fault the real dependency can't produce on demand → a small curated fake.
   - Doubles are behavioural, not interaction-recording.
2. **`Expected.Outbox()`** — asserts against `FakeMessageBus`, not the DB, once messaging exists.
3. **`JwtMinter`** — only when a test needs a token real login cannot produce.
