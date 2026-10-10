using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetPublicNewsPictureTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly byte[] MediumRendition = [4, 8, 15, 16, 23, 42];

    private readonly ApiTestFixture _fixture;

    public GetPublicNewsPictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeThePicture_When_ItsPostIsPublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LivePost(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var pictureId = await RenderedAsync(
            await NewsPictureSteps.LivePictureAsync(client, ctx.News.Posts.IdOf("live"), ct),
            ct
        );

        var response = await _fixture.CreateClient().GetAsync(MediumUrlOf(pictureId), ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
        Assert.True(response.Headers.CacheControl?.Private);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePostIsWithdrawn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LivePost(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var liveId = ctx.News.Posts.IdOf("live");
        var pictureId = await RenderedAsync(
            await NewsPictureSteps.LivePictureAsync(client, liveId, ct),
            ct
        );
        await client.DELETEAsync<WithdrawNewsPost, WithdrawNewsPostRequest>(
            new() { NewsPostId = liveId }
        );

        var response = await _fixture.CreateClient().GetAsync(MediumUrlOf(pictureId), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePictureIsOnlyPending()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LivePost(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var pictureId = await RenderedAsync(
            await NewsPictureSteps.UploadAsync(client, ctx.News.Posts.IdOf("live"), ct),
            ct
        );

        var response = await _fixture.CreateClient().GetAsync(MediumUrlOf(pictureId), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<int> RenderedAsync(int pictureId, CancellationToken ct)
    {
        await _fixture.RenderMediaItemDirectlyAsync(pictureId, ct);
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Medium, MediumRendition, ct);
        return pictureId;
    }

    private static string MediumUrlOf(int pictureId) =>
        $"/api/public/news/pictures/{pictureId}/medium";

    private static Action<SeedContextBuilder> LivePost() =>
        builder =>
            builder.News(news =>
                news.AddNewsPost(
                    "live",
                    "Prunksitzung",
                    "Vorspann",
                    "Text",
                    NewsCategory.Session,
                    publishedAt: Proclaimed,
                    slug: "prunksitzung"
                )
            );
}
