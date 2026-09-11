using System.Net;
using FastEndpoints;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Authorization;

[Collection("Api")]
public sealed class GroupAccessTests
{
    private const int NoSuchGroupOffset = 1_000;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GroupAccessTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Allow_When_TheCallerIsOnlyTheGruppenAdmin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "nadine-kindergarde",
                                "kindergarde",
                                "nadine",
                                "Trainerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("nadine", ct);
        var (response, result) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
    }

    [Fact]
    public async Task Should_ReportNotAdmin_When_TheCallerOnlyBelongsToTheGruppe()
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
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.ViewerIsAdmin);
    }

    [Fact]
    public async Task Should_Allow_When_TheGruppeIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2021
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Should_Allow_When_TheGruppenAdminschaftEndsToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "nadine-kindergarde",
                                "kindergarde",
                                "nadine",
                                "Trainerin",
                                JoinedIn2017,
                                _fixture.Today
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("nadine", ct);
        var (response, result) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
    }

    [Fact]
    public async Task Should_Refuse_When_TheCallerBelongsToAnotherGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheZugehoerigkeitHasEnded()
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
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheGruppenAdminschaftHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "nadine-kindergarde",
                                "kindergarde",
                                "nadine",
                                "Trainerin",
                                JoinedIn2017,
                                _fixture.Today.AddDays(-1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("nadine", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheZugehoerigkeitStartsTomorrow()
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
                                _fixture.Today.AddDays(1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheGruppenAdminschaftStartsTomorrow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "nadine-kindergarde",
                                "kindergarde",
                                "nadine",
                                "Trainerin",
                                _fixture.Today.AddDays(1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("nadine", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheCallerOnlyHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
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
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheGruppeDoesNotExist()
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
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await client.GETAsync<
            GroupAccessProbe,
            GroupAccessProbeRequest,
            GroupAccessProbeResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") + NoSuchGroupOffset });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GroupAccessProbe, GroupAccessProbeRequest, GroupAccessProbeResponse>(
                new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
