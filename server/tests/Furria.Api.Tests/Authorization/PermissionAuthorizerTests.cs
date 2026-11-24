using System.Net;
using FastEndpoints;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Authorization;

public sealed class PermissionAuthorizerTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly SeatedIn2023 = new(2023, 3, 1);
    private static readonly DateTimeOffset HalfPastMidnightInBerlin = new(
        2026,
        6,
        30,
        22,
        30,
        0,
        TimeSpan.Zero
    );
    private static readonly DateOnly TheBerlinDayBefore = new(2026, 6, 30);

    private readonly ApiTestFixture _fixture;

    public PermissionAuthorizerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Allow_When_AnOpenRoleHoldingGrantsTheKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "ilka-personenpflege",
                            "Personenpflege",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Allow_When_TheRoleHoldingEndsToday()
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
                                HeldSince2017,
                                _fixture.Today
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Allow_When_TheManagingLoginCalls()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheRoleHoldingHasExpired()
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
                                HeldSince2017,
                                _fixture.Today.AddDays(-1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheRoleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "personenpflege",
                                "Personenpflege",
                                "Aufgeloest.",
                                ArchivedIn2021,
                                FurriaPermissions.PersonsManage
                            )
                            .AddRoleHolding(
                                "ilka-personenpflege",
                                "personenpflege",
                                "ilka",
                                HeldSince2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheRoleHoldingEndedOnTheUtcDateButBerlinIsAlreadyPastIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            HalfPastMidnightInBerlin,
            async () =>
            {
                var ctx = await SeededWithHoldingUntilAsync(TheBerlinDayBefore, ct);
                var client = await ctx.Identity.ClientForAsync("ilka", ct);

                var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_Allow_When_ARunningMembershipImpliesTheKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("mira").AddMembership("mira-first", "mira", HeldSince2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<ClubReadProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheMembershipHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("mira")
                        .AddMembership(
                            "mira-first",
                            "mira",
                            HeldSince2017,
                            _fixture.Today.AddDays(-1)
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<ClubReadProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheOnlyTieIsARunningGroupMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mira"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mira-tanzgarde", "tanzgarde", "mira")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<ClubReadProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_GrantTheImpliedRole_When_ABoardSeatIsRunning()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatedAsync(SeatedIn2023, untilOn: null, ct);

        var client = await ctx.Identity.ClientForAsync("nadine", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_GrantNoKeys_When_TheBoardSeatHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatedAsync(SeatedIn2023, _fixture.Today.AddDays(-1), ct);

        var client = await ctx.Identity.ClientForAsync("nadine", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Allow_When_ARunningBeerListEnrollmentImpliesTheTakeKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("mira")
                            .AddMembership("mira-first", "mira", HeldSince2017)
                    )
                    .BeerList(beerList => beerList.AddBeerListEnrollment("mira-bier", "mira")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<BeerListTakeProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheBeerListManagerIsNotEnrolled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mira"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "getraenkewart",
                            "mira-getraenkewart",
                            "Getränkewart",
                            "mira",
                            FurriaPermissions.BeerListManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<BeerListTakeProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private Task<SeededContext> SeatedAsync(
        DateOnly sinceOn,
        DateOnly? untilOn,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Roles(roles =>
                        roles.AddRole(
                            "personenpflege",
                            "Personenpflege",
                            FurriaPermissions.PersonsManage
                        )
                    )
                    .Club(club =>
                        club.AddBoardOffice(
                                "praesident",
                                "Präsident",
                                impliedRoleAlias: "personenpflege"
                            )
                            .AddBoardSeat(
                                "nadine-praesident",
                                "praesident",
                                "nadine",
                                sinceOn,
                                untilOn
                            )
                    ),
            ct
        );

    private Task<SeededContext> SeededWithHoldingUntilAsync(
        DateOnly untilOn,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
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
                                HeldSince2017,
                                untilOn
                            )
                    ),
            ct
        );
}
