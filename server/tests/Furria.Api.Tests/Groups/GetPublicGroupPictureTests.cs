using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GetPublicGroupPictureTests : IClassFixture<ApiTestFixture>
{
    private static readonly byte[] MediumRendition = [4, 8, 15, 16, 23, 42];

    private readonly ApiTestFixture _fixture;

    public GetPublicGroupPictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeThePicture_When_TheGroupIsShownPublicly()
    {
        var ct = TestContext.Current.CancellationToken;
        await TanzgardeWithPictureAsync(ct);

        var response = await _fixture.CreateClient().GetAsync(await MediumPictureUrlAsync(), ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
        Assert.True(response.Headers.CacheControl?.Private);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await TanzgardeWithPictureAsync(ct);
        var url = await MediumPictureUrlAsync();
        var managing = await ctx.Identity.ManagingLoginClientAsync(ct);
        await managing.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") }
        );

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<SeededContext> TanzgardeWithPictureAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var pictureId = await PictureSteps.RenderedGroupPictureAsync(
            _fixture,
            await ctx.Identity.ManagingLoginClientAsync(ct),
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ct
        );
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Medium, MediumRendition, ct);
        return ctx;
    }

    private async Task<string> MediumPictureUrlAsync()
    {
        var (_, list) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGroups, GetPublicGroupsResponse>();
        return Assert.Single(list.Groups).Picture!.MediumUrl;
    }
}
