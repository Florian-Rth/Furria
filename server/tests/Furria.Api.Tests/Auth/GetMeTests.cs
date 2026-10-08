using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class GetMeTests
{
    private static readonly DateOnly BirthDate = new(1996, 4, 3);
    private static readonly TimeSpan PastTheAccessTokenLifetime = TimeSpan.FromMinutes(16);

    private static readonly DateTimeOffset InsideTheSession2026 = new(
        2027,
        1,
        19,
        18,
        50,
        0,
        TimeSpan.Zero
    );

    private static readonly DateTimeOffset JustPastMidnightInBerlin = new(
        2026,
        11,
        10,
        23,
        30,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetMeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReportActive_When_ThePersonHoldsARunningMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var joinedOn = _fixture.Today.AddYears(-5);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", joinedOn)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), result.AccountId);
        Assert.Equal("Alice", result.Person?.FirstName);
        Assert.Equal(MembershipState.Active, result.Membership.State);
        Assert.Equal(joinedOn, result.Membership.MemberSince);
        Assert.Equal(joinedOn, result.Membership.CurrentStartedOn);
        Assert.Null(result.Membership.CurrentEndedOn);
    }

    [Fact]
    public async Task Should_ListHerPasskeysOldestFirst_When_SheAddedSome()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        using var phone = new SoftwareAuthenticator();
        using var laptop = new SoftwareAuthenticator();
        var first = await PasskeySteps.RegisterAsync(client, phone, "Handy");
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () => await PasskeySteps.RegisterAsync(client, laptop, "Laptop")
        );

        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Collection(
            result.Passkeys,
            passkey =>
            {
                Assert.Equal(phone.PasskeyId, passkey.Id);
                Assert.Equal("Handy", passkey.Name);
                Assert.Equal(first.AddedAt, passkey.AddedAt);
            },
            passkey =>
            {
                Assert.Equal(laptop.PasskeyId, passkey.Id);
                Assert.Equal("Laptop", passkey.Name);
            }
        );
    }

    [Fact]
    public async Task Should_ListNoPasskey_When_SheHasNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (_, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Empty(result.Passkeys);
    }

    [Fact]
    public async Task Should_ReportNoMember_When_ThePersonNeverHeldAMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.None, result.Membership.State);
        Assert.Null(result.Membership.MemberSince);
        Assert.Null(result.Membership.CurrentStartedOn);
        Assert.Equal(ctx.Identity.People.IdOf("alice"), result.Person?.Id);
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("alice"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportNoMember_When_TheOnlyMembershipStartsTomorrow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", _fixture.Today.AddDays(1))
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.None, result.Membership.State);
        Assert.Null(result.Membership.MemberSince);
    }

    [Fact]
    public async Task Should_ReportEnded_When_EveryMembershipHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddMembership(
                            "alice-first",
                            "alice",
                            _fixture.Today.AddYears(-5),
                            _fixture.Today.AddYears(-1)
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Ended, result.Membership.State);
        Assert.Equal(_fixture.Today.AddYears(-5), result.Membership.MemberSince);
        Assert.Null(result.Membership.CurrentStartedOn);
    }

    [Fact]
    public async Task Should_ReportPaused_When_AMembershipPauseCoversTheRunningSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", _fixture.Today.AddYears(-5))
                        .AddMembershipPause(
                            "alice-ruhezeit",
                            "alice-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Paused, result.Membership.State);
    }

    [Fact]
    public async Task Should_IgnoreAMembershipPause_When_ItBelongsToAnEndedMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddMembership(
                            "alice-first",
                            "alice",
                            _fixture.Today.AddYears(-9),
                            _fixture.Today.AddYears(-5)
                        )
                        .AddMembership("alice-second", "alice", _fixture.Today.AddYears(-2))
                        .AddMembershipPause(
                            "alice-ruhezeit",
                            "alice-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Active, result.Membership.State);
        Assert.Equal(_fixture.Today.AddYears(-9), result.Membership.MemberSince);
        Assert.Equal(_fixture.Today.AddYears(-2), result.Membership.CurrentStartedOn);
    }

    [Fact]
    public async Task Should_ReturnTheOwnMasterData_When_ThePersonHasThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddPersonContact(
                            "alice",
                            phone: "0171 1234567",
                            street: "Marktplatz 1",
                            zip: "04680",
                            city: "Colditz",
                            contactVisibleToMembers: true,
                            birthDate: BirthDate
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("0171 1234567", result.Person?.Phone);
        Assert.Equal("Marktplatz 1", result.Person?.Street);
        Assert.Equal("04680", result.Person?.Zip);
        Assert.Equal("Colditz", result.Person?.City);
        Assert.Equal(BirthDate, result.Person?.BirthDate);
        Assert.True(result.Person?.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_ShowWhoLastChangedHerContactDetails_When_AManagerChangedThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var changedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddContactChange("alice", "anna", changedAt)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var change = Assert.IsType<MeContactChangeDto>(result.Person?.ContactChange);
        Assert.Equal(changedAt, change.At);
        Assert.NotNull(change.ChangedBy);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), change.ChangedBy.PersonId);
        Assert.Equal("Anna", change.ChangedBy.FirstName);
        Assert.Equal("Kessler", change.ChangedBy.LastName);
    }

    [Fact]
    public async Task Should_ShowTheContactChangeNamingNobody_When_TheEditorWasDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var changedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddContactChange("alice", "anna", changedAt)
                ),
            ct
        );
        await _fixture.DeletePersonDirectlyAsync(ctx.Identity.People.IdOf("anna"), ct);

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var change = Assert.IsType<MeContactChangeDto>(result.Person?.ContactChange);
        Assert.Equal(changedAt, change.At);
        Assert.Null(change.ChangedBy);
    }

    [Fact]
    public async Task Should_ShowNoContactChange_When_HerContactDetailsWereNeverChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Person);
        Assert.Null(result.Person.ContactChange);
    }

    [Fact]
    public async Task Should_WriteCamelCaseStringsAndIsoDates_When_TheChainReachesTheWire()
    {
        var ct = TestContext.Current.CancellationToken;
        var joinedOn = new DateOnly(2017, 9, 1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddMembership("alice-first", "alice", joinedOn)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();
        var payload = await response.Content.ReadAsStringAsync(ct);

        Assert.Contains("\"state\":\"active\"", payload, StringComparison.Ordinal);
        Assert.Contains("\"memberSince\":\"2017-09-01\"", payload, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_ReportTheHeldKeys_When_ThePersonHoldsTwoRoles()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "gruppenpflege",
                                "ilka-gruppenpflege",
                                "Gruppenpflege",
                                "ilka",
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleWithHolder(
                                "personenpflege",
                                "ilka-personenpflege",
                                "Personenpflege",
                                "ilka",
                                FurriaPermissions.PersonsManage,
                                FurriaPermissions.PersonsReadDetails
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                FurriaPermissions.GroupsManage,
                FurriaPermissions.PersonsManage,
                FurriaPermissions.PersonsReadDetails,
            ],
            result.PermissionKeys
        );
    }

    [Fact]
    public async Task Should_ReportOneEntry_When_TwoRolesGrantTheSamePermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "gruppenpflege",
                                "ilka-gruppenpflege",
                                "Gruppenpflege",
                                "ilka",
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleWithHolder(
                                "vorstand",
                                "ilka-vorstand",
                                "Vorstand",
                                "ilka",
                                FurriaPermissions.GroupsManage,
                                FurriaPermissions.PersonsManage
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [FurriaPermissions.GroupsManage, FurriaPermissions.PersonsManage],
            result.PermissionKeys
        );
    }

    [Fact]
    public async Task Should_ReportNoKeys_When_TheOnlyRoleHoldingHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRole(
                                "personenpflege",
                                "Personenpflege",
                                FurriaPermissions.PersonsManage
                            )
                            .AddRoleHolding(
                                "ilka-personenpflege",
                                "personenpflege",
                                "ilka",
                                _fixture.Today.AddYears(-2),
                                _fixture.Today.AddDays(-1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.PermissionKeys);
    }

    [Fact]
    public async Task Should_ReportAffiliated_When_ThePersonOnlyHoldsAnOpenGroupMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                _fixture.Today.AddYears(-3)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.IsAffiliated);
        Assert.Equal(MembershipState.None, result.Membership.State);
    }

    [Fact]
    public async Task Should_ReportNoPersonButEveryKey_When_TheManagingLoginAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ApiTestFixture.ManagingLoginEmail, result.Email);
        Assert.Null(result.Person);
        Assert.Equal(MembershipState.None, result.Membership.State);
        Assert.False(result.IsAffiliated);
        Assert.Equal(
            FurriaPermissions.All.Order(StringComparer.Ordinal),
            result.PermissionKeys.Order(StringComparer.Ordinal)
        );
        Assert.Empty(result.Passkeys);
        Assert.Null(result.AppSince);
    }

    [Fact]
    public async Task Should_ReportNotAffiliated_When_ThePersonHoldsNoTieAtAll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("gast")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("gast", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.IsAffiliated);
    }

    [Fact]
    public async Task Should_ReturnAppSince_When_SheRedeemedAnInvitation()
    {
        var ct = TestContext.Current.CancellationToken;
        var bertaEmail = InvitationSteps.UniqueContactEmail("berta");

        await _fixture.AtInstantAsync(
            JustPastMidnightInBerlin,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder.Identity(identity =>
                            identity.AddEligiblePerson("berta", "Berta", bertaEmail, _fixture.Today)
                        ),
                    ct
                );
                var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
                var issued = await InvitationSteps.InviteInPersonAsync(
                    manager,
                    ctx.Identity.People.IdOf("berta")
                );
                var (_, redemption) = await InvitationSteps.RedeemAsync(
                    _fixture.CreateClient(),
                    InvitationSteps.TokenOf(issued.Link)
                );
                var berta = InvitationSteps.SignedInClient(_fixture, redemption);

                var (response, result) = await berta.GETAsync<GetMe, GetMeResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(new DateOnly(2026, 11, 11), result.AppSince);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNoAppSince_When_TheAccountWasSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.AppSince);
    }

    [Fact]
    public async Task Should_ReturnTheSessionOrdinal_When_SheHoldsARunningMembership()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession2026,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder.Identity(identity =>
                            identity
                                .AddAccount("lena")
                                .AddMembership("lena-first", "lena", new DateOnly(2015, 11, 20))
                                .AddMembershipPause("lena-ruhezeit", "lena-first", 2019, 2019)
                        ),
                    ct
                );

                var client = await ctx.Identity.ClientForAsync("lena", ct);
                var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var relevantSession = Assert.IsType<MeRelevantSessionDto>(
                    result.Membership.RelevantSession
                );
                Assert.Equal(2026, relevantSession.StartYear);
                Assert.Equal(11, relevantSession.Ordinal);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNoSessionOrdinal_When_SheHoldsNoMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("gast")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("gast", ct);
        var (response, result) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.Membership.RelevantSession);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccountWasDisabledAfterItsTokenWasIssued()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("alice"), ct);

        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccountBehindTheTokenNoLongerExists()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        await _fixture.ResetDatabaseAsync(ct);

        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccessTokenHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        await _fixture.AtLaterTimeAsync(
            PastTheAccessTokenLifetime,
            async () =>
            {
                var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccessTokenSignatureIsTampered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );

        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", Tamper(session.AccessToken));

        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static string Tamper(string accessToken) =>
        accessToken[..^1] + (accessToken[^1] == 'A' ? 'B' : 'A');
}
