using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GetManagedGroupsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetManagedGroupsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheArchivedGroup_When_TheKeyHolderReadsTheList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "kindergarde",
                        "Kindergarde",
                        "Aufgeloest.",
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroups,
            GetManagedGroupsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var kindergarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), kindergarde.GroupId);
        Assert.Equal(ArchivedIn2021, kindergarde.ArchivedOn);
    }

    [Fact]
    public async Task Should_CountOnlyRunningGroupMemberships_When_TheGroupHasHistory()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("tom", "Tom", "Kartenkäufer")
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
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership("tom-tanzgarde", "tanzgarde", "tom", JoinsIn2030)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroups,
            GetManagedGroupsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(1, tanzgarde.MemberCount);
    }

    [Fact]
    public async Task Should_CarryTheGroupKindsWithTheirGroupCount_When_TheListIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("garde", "Garde")
                        .AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                        .AddGroup("tanzgarde", "Tanzgarde", groupKindAlias: "garde")
                        .AddGroup("kindergarde", "Kindergarde", groupKindAlias: "garde")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroups,
            GetManagedGroupsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(["Garde", "Spielmannszug"], result.Kinds.Select(kind => kind.Name));
        var garde = result.Kinds.First();
        Assert.Equal(ctx.Groups.GroupKinds.IdOf("garde"), garde.GroupKindId);
        Assert.Equal(2, garde.GroupCount);
        Assert.Null(garde.ArchivedOn);
        var zug = result.Kinds.Last();
        Assert.Equal(ArchivedIn2021, zug.ArchivedOn);
        Assert.Equal(0, zug.GroupCount);
    }
}
