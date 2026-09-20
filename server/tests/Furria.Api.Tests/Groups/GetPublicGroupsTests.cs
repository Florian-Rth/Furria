using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetPublicGroupsTests
{
    private const string PublicGroupsRoute = "/api/public/groups";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetPublicGroupsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheGruppeWithItsOpenness_When_AnAnonymousCallerReadsTheList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup(
                            "tanzgarde",
                            "Tanzgarde",
                            "Die Garde tanzt seit 1971.",
                            isRecruiting: true
                        )
                        .AddGroup("elferrat", "Elferrat", "Der Elferrat führt durch die Sitzung.")
                ),
            ct
        );

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGroups, GetPublicGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.Groups.Count);
        var tanzgarde = result.Groups[1];
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.Equal("Die Garde tanzt seit 1971.", tanzgarde.Description);
        Assert.True(tanzgarde.IsRecruiting);
        Assert.False(result.Groups[0].IsRecruiting);
    }

    [Fact]
    public async Task Should_CarryTheList_When_TheCallerIsSignedInButNotAffiliated()
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
        var (response, result) = await client.GETAsync<GetPublicGroups, GetPublicGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
    }

    [Fact]
    public async Task Should_OmitTheGruppe_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
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

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGroups, GetPublicGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
    }

    [Fact]
    public async Task Should_SortTheGruppenAsGerman_When_TheVerzeichnisIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("zwergengarde", "Zwergengarde")
                        .AddGroup("archiv", "Archiv & Chronik")
                        .AddGroup("aeltestenrat", "Ältestenrat")
                ),
            ct
        );

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGroups, GetPublicGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ältestenrat", "Archiv & Chronik", "Zwergengarde"],
            result.Groups.Select(group => group.Name)
        );
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheListIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", "Die Garde tanzt seit 1971.")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin("paula-tanzgarde-admin", "tanzgarde", "paula")
                    ),
            ct
        );

        var payload = await _fixture.CreateClient().GetStringAsync(PublicGroupsRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var tanzgarde = document.RootElement.GetProperty("groups").EnumerateArray().Single();
        Assert.Equal(
            ["groupId", "name", "description", "isRecruiting", "groupKindName", "tone"],
            tanzgarde.EnumerateObject().Select(field => field.Name)
        );
    }
}
