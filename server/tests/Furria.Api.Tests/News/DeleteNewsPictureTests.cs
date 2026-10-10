using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class DeleteNewsPictureTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public DeleteNewsPictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteThePicture_When_ItIsRemovedFromADraft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var pictureId = await NewsPictureSteps.UploadAsync(client, draftId, ct);
        var original = await _fixture.MediaFileOfAsync(pictureId, MediaRendition.Original, ct);

        var response = await RemoveAsync(client, draftId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.NewsPost(draftId)
            .ToShowPicture(null)
            .MediaItem(pictureId)
            .ToBeGone()
            .AssertAsync(ct);
        Assert.False(File.Exists(original));
    }

    [Fact]
    public async Task Should_RemoveItFromTheWorkingCopyOnly_When_ThePostIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var liveId = ctx.News.Posts.IdOf("live");
        var livePictureId = await NewsPictureSteps.LivePictureAsync(client, liveId, ct);

        var response = await RemoveAsync(client, liveId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.NewsPost(liveId)
            .ToShowPicture(livePictureId)
            .NewsPost(liveId)
            .ToHavePendingPicture(null)
            .AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> RemoveAsync(HttpClient client, int newsPostId) =>
        client.DELETEAsync<DeleteNewsPicture, DeleteNewsPictureRequest>(
            new() { NewsPostId = newsPostId }
        );

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .WithNewsEditor()
                .News(news =>
                    news.AddNewsPost("draft", "Gardetanz")
                        .AddNewsPost(
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
