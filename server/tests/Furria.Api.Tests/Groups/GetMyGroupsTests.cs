using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetMyGroupsTests
{
    private const string MyGroupsRoute = "/api/my-groups";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetMyGroupsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheGroup_When_SheCurrentlyBelongsToIt()
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
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.True(tanzgarde.IsMember);
        Assert.False(tanzgarde.IsAdmin);
    }

    [Fact]
    public async Task Should_CarryTheGroup_When_SheOnlyAdministersIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "anna-kindergarde",
                                "kindergarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var kindergarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), kindergarde.GroupId);
        Assert.False(kindergarde.IsMember);
        Assert.True(kindergarde.IsAdmin);
    }

    [Fact]
    public async Task Should_NameTheGroupOnce_When_SheBelongsToItAndAdministersIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("anna-tanzgarde", "tanzgarde", "anna", JoinedIn2017)
                            .AddGroupAdmin(
                                "anna-tanzgarde-admin",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.True(tanzgarde.IsMember);
        Assert.True(tanzgarde.IsAdmin);
    }

    [Fact]
    public async Task Should_OmitTheGroup_When_HerTieEndedOrLiesAhead()
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
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "paula-kindergarde",
                                "kindergarde",
                                "paula",
                                "Trainerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership("paula-elferrat", "elferrat", "paula", JoinsIn2030)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Groups);
    }

    [Fact]
    public async Task Should_OmitTheGroup_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde", archivedOn: ArchivedIn2021)
                            .AddGroupMembership(
                                "paula-kindergarde",
                                "kindergarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Groups);
    }

    [Fact]
    public async Task Should_CarryAnEmptyList_When_TheCallerHasNoTiesAtAll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("tom"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Groups);
    }

    [Fact]
    public async Task Should_CarryOnlyHerOwnTies_When_AnotherPersonBelongsElsewhere()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership("mara-elferrat", "elferrat", "mara", JoinedIn2017)
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "mara-kindergarde",
                                "kindergarde",
                                "mara",
                                "Trainerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
    }

    [Fact]
    public async Task Should_SortTheGroupsAsGerman_When_SheBelongsToSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Groups(groups =>
                        groups
                            .AddGroup("zeltlager", "Zeltlager")
                            .AddGroupMembership(
                                "paula-zeltlager",
                                "zeltlager",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroup("aeltestenrat", "Ältestenrat")
                            .AddGroupMembership(
                                "paula-aeltestenrat",
                                "aeltestenrat",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership("paula-elferrat", "elferrat", "paula", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ältestenrat", "Elferrat", "Zeltlager"],
            result.Groups.Select(group => group.Name)
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetMyGroups, GetMyGroupsResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheListIsRead()
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
        var payload = await client.GetStringAsync(MyGroupsRoute, ct);

        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            ["groups"],
            document.RootElement.EnumerateObject().Select(field => field.Name)
        );
        var tanzgarde = document.RootElement.GetProperty("groups").EnumerateArray().Single();
        Assert.Equal(
            ["groupId", "name", "isMember", "isAdmin"],
            tanzgarde.EnumerateObject().Select(field => field.Name)
        );
    }
}
