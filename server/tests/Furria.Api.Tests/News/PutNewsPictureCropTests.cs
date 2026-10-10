using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class PutNewsPictureCropTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly PictureCrop NewCut = new(0, 0.25, 1, 0.5);

    private readonly ApiTestFixture _fixture;

    public PutNewsPictureCropTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderThePictureAnewInTheNewCut_When_ADraftsPictureIsRecropped()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var pictureId = await RenderedAsync(
            await NewsPictureSteps.UploadAsync(client, draftId, ct),
            ct
        );

        var response = await RecropAsync(client, draftId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.NewsPost(draftId)
            .ToShowPicture(pictureId)
            .MediaItem(pictureId)
            .ToBeCroppedTo(NewCut)
            .MediaItem(pictureId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CutACopyIntoTheWorkingCopyAndLeaveTheLivePictureAlone_When_ThePostIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var liveId = ctx.News.Posts.IdOf("live");
        var livePictureId = await RenderedAsync(
            await NewsPictureSteps.LivePictureAsync(client, liveId, ct),
            ct
        );

        var response = await RecropAsync(client, liveId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var copyId = await _fixture.PendingNewsPictureOfAsync(liveId, ct);
        Assert.NotEqual(livePictureId, copyId);
        await ctx
            .Expected.NewsPost(liveId)
            .ToShowPicture(livePictureId)
            .MediaItem(livePictureId)
            .ToBeIn(MediaItemState.Ready)
            .MediaItem(copyId)
            .ToBeCroppedTo(NewCut)
            .MediaItem(copyId)
            .ToBeOwnedBy(MediaOwner.NewsPost(liveId))
            .MediaItem(copyId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
        Assert.Equal(
            await File.ReadAllBytesAsync(
                await _fixture.MediaFileOfAsync(livePictureId, MediaRendition.Original, ct),
                ct
            ),
            await File.ReadAllBytesAsync(
                await _fixture.MediaFileOfAsync(copyId, MediaRendition.Original, ct),
                ct
            )
        );
    }

    private async Task<int> RenderedAsync(int pictureId, CancellationToken ct)
    {
        await _fixture.RenderMediaItemDirectlyAsync(pictureId, ct);
        return pictureId;
    }

    private static Task<HttpResponseMessage> RecropAsync(HttpClient client, int newsPostId) =>
        client.PUTAsync<PutNewsPictureCrop, PutNewsPictureCropRequest>(
            new()
            {
                NewsPostId = newsPostId,
                Left = NewCut.Left,
                Top = NewCut.Top,
                Width = NewCut.Width,
                Height = NewCut.Height,
            }
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
