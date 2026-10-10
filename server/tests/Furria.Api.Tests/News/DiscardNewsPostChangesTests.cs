using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class DiscardNewsPostChangesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public DiscardNewsPostChangesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DropThePendingChangesAndKeepTheLiveVersion_When_TheyAreDiscarded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var editedId = ctx.News.Posts.IdOf("edited");

        var response = await client.DELETEAsync<
            DiscardNewsPostChanges,
            DiscardNewsPostChangesRequest
        >(new() { NewsPostId = editedId });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.NewsPost(editedId)
            .ToHaveNoPendingChanges()
            .NewsPost(editedId)
            .ToRead("Gardetanz", "Vorspann", "Text", NewsCategory.Groups)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteThePendingPictureAndKeepTheLiveOne_When_TheChangesAreDiscarded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var postId = ctx.News.Posts.IdOf("pictured");
        var livePictureId = await NewsPictureSteps.LivePictureAsync(client, postId, ct);
        var pendingPictureId = await NewsPictureSteps.UploadAsync(client, postId, ct);

        await client.DELETEAsync<DiscardNewsPostChanges, DiscardNewsPostChangesRequest>(
            new() { NewsPostId = postId }
        );

        await ctx
            .Expected.NewsPost(postId)
            .ToShowPicture(livePictureId)
            .NewsPost(postId)
            .ToHaveNoPendingChanges()
            .MediaItem(pendingPictureId)
            .ToBeGone()
            .AssertAsync(ct);
    }

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder.News(news =>
                news.AddNewsPost(
                        "edited",
                        "Gardetanz",
                        "Vorspann",
                        "Text",
                        NewsCategory.Groups,
                        publishedAt: Proclaimed
                    )
                    .AddPendingChanges("edited", "Verworfen", "Vorspann", "Verworfener Text")
                    .AddNewsPost(
                        "pictured",
                        "Mit Bild",
                        "Vorspann",
                        "Text",
                        NewsCategory.Club,
                        publishedAt: Proclaimed
                    )
            );
}
