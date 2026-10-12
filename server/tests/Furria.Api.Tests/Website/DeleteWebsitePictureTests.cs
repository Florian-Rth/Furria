using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class DeleteWebsitePictureTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteWebsitePictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EmptyThePositionAndDeleteItsPicture_When_ThePublisherClearsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var pictureId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "join.hero",
            1,
            ct
        );

        var response = await ClearAsync(client, "join.hero");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.WebsitePicture("join.hero", 1)
            .ToBeEmpty()
            .MediaItem(pictureId)
            .ToBeGone()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePositionIsAlreadyEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var response = await ClearAsync(client, "join.hero");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> ClearAsync(HttpClient client, string slotKey) =>
        client.DELETEAsync<DeleteWebsitePicture, DeleteWebsitePictureRequest>(
            new() { SlotKey = slotKey, Position = 1 }
        );
}
