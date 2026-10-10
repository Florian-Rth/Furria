using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class DeleteNewsPostByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Withdrawn = new(2025, 12, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public DeleteNewsPostByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("draft")]
    [InlineData("withdrawn")]
    public async Task Should_DeleteItForGood_When_ItIsNotOnTheWebsite(string alias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var postId = ctx.News.Posts.IdOf(alias);

        var response = await DeleteAsync(client, postId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.NewsPost(postId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_FreeItsAddress_When_AWithdrawnPostIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var successorId = ctx.News.Posts.IdOf("successor");
        await DeleteAsync(client, ctx.News.Posts.IdOf("withdrawn"));

        await client.POSTAsync<PublishNewsPost, PublishNewsPostRequest>(
            new() { NewsPostId = successorId }
        );

        await ctx
            .Expected.NewsPost(successorId)
            .ToBePublished(_fixture.TimeProvider.GetUtcNow(), "das-motto-steht")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAndKeepIt_When_ItIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var liveId = ctx.News.Posts.IdOf("live");

        var response = await DeleteAsync(client, liveId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.NewsPost(liveId).ToBePublished(Proclaimed, "live").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteItsPictureWithIt_When_ThePostIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var pictureId = await NewsPictureSteps.UploadAsync(client, draftId, ct);
        var original = await _fixture.MediaFileOfAsync(pictureId, MediaRendition.Original, ct);

        await DeleteAsync(client, draftId);

        await ctx.Expected.MediaItem(pictureId).ToBeGone().AssertAsync(ct);
        Assert.False(File.Exists(original));
    }

    private static Task<HttpResponseMessage> DeleteAsync(HttpClient client, int newsPostId) =>
        client.DELETEAsync<DeleteNewsPostById, DeleteNewsPostByIdRequest>(
            new() { NewsPostId = newsPostId }
        );

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder.News(news =>
                news.AddNewsPost("draft", "Entwurf")
                    .AddNewsPost(
                        "withdrawn",
                        "Das Motto steht",
                        publishedAt: Proclaimed,
                        slug: "das-motto-steht",
                        withdrawnAt: Withdrawn
                    )
                    .AddNewsPost("live", "Live", publishedAt: Proclaimed, slug: "live")
                    .AddNewsPost(
                        "successor",
                        "Das Motto steht",
                        "Vorspann",
                        "Text",
                        NewsCategory.Session
                    )
            );
}
