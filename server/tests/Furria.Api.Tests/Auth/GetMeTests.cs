using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class GetMeTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset InsideTheSession2026 = new(
        2027,
        1,
        19,
        18,
        50,
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
}
