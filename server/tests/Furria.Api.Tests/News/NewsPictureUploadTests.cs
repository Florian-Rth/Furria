using System.Net;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class NewsPictureUploadTests : IClassFixture<ApiTestFixture>
{
    private const int PictureLength = 4096;

    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public NewsPictureUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_GoIntoTheWorkingCopyAndLeaveTheLivePictureAlone_When_ThePostIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var liveId = ctx.News.Posts.IdOf("live");
        var livePictureId = await NewsPictureSteps.LivePictureAsync(client, liveId, ct);

        var pictureId = await NewsPictureSteps.UploadAsync(client, liveId, ct);

        await ctx
            .Expected.NewsPost(liveId)
            .ToShowPicture(livePictureId)
            .NewsPost(liveId)
            .ToHavePendingPicture(pictureId)
            .NewsPost(liveId)
            .ToHavePendingChanges("Prunksitzung", "Text")
            .MediaItem(livePictureId)
            .ToBeOwnedBy(MediaOwner.NewsPost(liveId))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheCallerMayNotManageNews()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ClientForAsync("max", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.NewsPostOwner(ctx.News.Posts.IdOf("draft")),
            "banner.jpg",
            PictureLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .WithNewsEditor()
                .Identity(identity => identity.AddAccount("max"))
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
