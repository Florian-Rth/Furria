using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PostGroupTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnActiveGroupCarriesTheNameInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new() { Name = "tanzgarde", GroupKindId = null }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine Gruppe mit diesem Namen gibt es schon."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_CreateTheGroup_When_OnlyAnArchivedGroupCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "tanzgarde-retired",
                        "Tanzgarde",
                        "Die alte Garde.",
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostGroup,
            PostGroupRequest,
            PostGroupResponse
        >(new() { Name = "Tanzgarde", GroupKindId = null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Group(result.GroupId)
            .ToHaveName("Tanzgarde")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheGroupKind_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind(
                        "spielmannszug",
                        "Spielmannszug",
                        archivedOn: ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new()
            {
                Name = "Spielmannszug",
                GroupKindId = ctx.Groups.GroupKinds.IdOf("spielmannszug"),
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppenart lässt sich einer Gruppe nicht zuordnen."],
            failures[ConflictField]
        );
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
