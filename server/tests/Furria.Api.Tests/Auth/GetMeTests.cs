using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class GetMeTests
{
    private static readonly DateOnly BirthDate = new(1996, 4, 3);

    private readonly ApiTestFixture _fixture;

    public GetMeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReportAktiv_When_ThePersonHoldsARunningMitgliedschaft()
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
        Assert.Equal("Alice", result.Person.FirstName);
        Assert.Equal(MembershipState.Active, result.Membership.State);
        Assert.Equal(joinedOn, result.Membership.MemberSince);
        Assert.Equal(joinedOn, result.Membership.CurrentStartedOn);
        Assert.Null(result.Membership.CurrentEndedOn);
    }

    [Fact]
    public async Task Should_ReportKeinMitglied_When_ThePersonNeverHeldAMitgliedschaft()
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
        Assert.Equal(ctx.Identity.People.IdOf("alice"), result.Person.Id);
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("alice"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportKeinMitglied_When_TheOnlyMitgliedschaftStartsTomorrow()
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
    public async Task Should_ReportBeendet_When_EveryMitgliedschaftHasEnded()
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
    public async Task Should_ReportRuht_When_ARuhezeitCoversTheRunningSession()
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
    public async Task Should_IgnoreARuhezeit_When_ItBelongsToAnEndedMitgliedschaft()
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
    public async Task Should_ReturnTheOwnStammdaten_When_ThePersonHasThem()
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
        Assert.Equal("0171 1234567", result.Person.Phone);
        Assert.Equal("Marktplatz 1", result.Person.Street);
        Assert.Equal("04680", result.Person.Zip);
        Assert.Equal("Colditz", result.Person.City);
        Assert.Equal(BirthDate, result.Person.BirthDate);
        Assert.True(result.Person.ContactVisibleToMembers);
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
    public async Task Should_ReportTheHeldKeys_When_ThePersonHoldsTwoRollen()
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
    public async Task Should_ReportNoKeys_When_TheOnlyInhaberschaftHasExpired()
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
    public async Task Should_ReportAffiliated_When_ThePersonOnlyHoldsAnOpenZugehoerigkeit()
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
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture.CreateClient().GETAsync<GetMe, GetMeResponse>();

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
        _fixture.TimeProvider.Advance(TimeSpan.FromMinutes(16));

        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
