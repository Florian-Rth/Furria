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
