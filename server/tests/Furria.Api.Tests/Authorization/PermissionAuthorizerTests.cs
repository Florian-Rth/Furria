using System.Net;
using FastEndpoints;
using Furria.Application.Authorization;
using Furria.Infrastructure.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Authorization;

[Collection("Api")]
public sealed class PermissionAuthorizerTests
{
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
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
    private static readonly DateOnly TheBerlinDay = new(2026, 7, 1);

    private readonly ApiTestFixture _fixture;

    public PermissionAuthorizerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Allow_When_AnOpenInhaberschaftGrantsTheKey()
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
    public async Task Should_Allow_When_TheInhaberschaftEndsToday()
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
    public async Task Should_Allow_When_TheKeyComesFromASecondRolle()
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
    public async Task Should_Allow_When_TheBootstrapAdminCalls()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheInhaberschaftHasExpired()
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
    public async Task Should_Refuse_When_TheInhaberschaftStartsTomorrow()
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
                                _fixture.Today.AddDays(1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheRolleIsArchived()
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
    public async Task Should_Refuse_When_TheRolleDoesNotHoldThatKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheAccountWasDisabledAfterItsTokenWasIssued()
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
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("ilka"), ct);

        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheInhaberschaftEndedOnTheUtcDateButBerlinIsAlreadyPastIt()
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
    public async Task Should_Allow_When_TheInhaberschaftEndsOnTheBerlinDateAheadOfTheUtcDate()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            HalfPastMidnightInBerlin,
            async () =>
            {
                var ctx = await SeededWithHoldingUntilAsync(TheBerlinDay, ct);
                var client = await ctx.Identity.ClientForAsync("ilka", ct);

                var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_Refuse_When_TheAccountBehindTheTokenNoLongerExists()
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
        await _fixture.ResetDatabaseAsync(ct);

        var (response, _) = await client.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_FailLoudly_When_TheAuthorizerIsAskedAboutASecondAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("ilka").AddAccount("nadine")),
            ct
        );

        await using var scope = _fixture.Services.CreateAsyncScope();
        var authorizer = scope.ServiceProvider.GetRequiredService<PermissionAuthorizer>();
        await authorizer.IsAffiliatedAsync(ctx.Identity.Accounts.IdOf("ilka"), ct);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            authorizer.IsAffiliatedAsync(ctx.Identity.Accounts.IdOf("nadine"), ct)
        );
    }

    [Fact]
    public async Task Should_Allow_When_ARunningMitgliedschaftImpliesTheKey()
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
    public async Task Should_Allow_When_TheRunningMitgliedschaftRuht()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("mira")
                        .AddMembership("mira-first", "mira", HeldSince2017)
                        .AddMembershipPause(
                            "mira-ruhezeit",
                            "mira-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<ClubReadProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheMitgliedschaftHasEnded()
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
    public async Task Should_Refuse_When_TheOnlyTieIsARunningZugehoerigkeit()
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
    public async Task Should_Refuse_When_TheOnlyTieIsARunningInhaberschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mira"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "notenwart",
                            "mira-notenwart",
                            "Notenwart",
                            "mira",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.GETAsync<ClubReadProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheMitgliedsAccountWasDisabled()
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
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("mira"), ct);

        var (response, _) = await client.GETAsync<ClubReadProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

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
