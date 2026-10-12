using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class TransferWebsitePictureTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public TransferWebsitePictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MoveThePictureWithItsCutAndAltText_When_AnOrphanIsTransferredToAnEmptyPosition()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var pictureId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "club.header",
            1,
            ct
        );
        await client.PUTAsync<PutWebsitePictureAlt, PutWebsitePictureAltRequest>(
            new()
            {
                SlotKey = "club.header",
                Position = 1,
                Alt = "Der Elferrat",
            }
        );

        var response = await TransferAsync(client, "club.header", "club.hero");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.WebsitePicture("club.hero", 1)
            .ToBeFilledBy(pictureId, WebsitePictureSteps.Landscape, "Der Elferrat")
            .WebsitePicture("club.header", 1)
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheTransfer_When_TheTargetPositionIsFilled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var orphanId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "club.header",
            1,
            ct
        );
        var heroId = await WebsitePictureSteps.RenderedAsync(_fixture, client, "club.hero", 1, ct);

        var response = await TransferAsync(client, "club.header", "club.hero");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.WebsitePicture("club.hero", 1)
            .ToBeFilledBy(heroId, WebsitePictureSteps.Landscape)
            .WebsitePicture("club.header", 1)
            .ToBeFilledBy(orphanId, WebsitePictureSteps.Landscape)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheSourcePositionIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var response = await TransferAsync(client, "club.header", "club.hero");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> TransferAsync(
        HttpClient client,
        string fromSlotKey,
        string toSlotKey
    ) =>
        client.POSTAsync<TransferWebsitePicture, TransferWebsitePictureRequest>(
            new()
            {
                FromSlotKey = fromSlotKey,
                FromPosition = 1,
                ToSlotKey = toSlotKey,
                ToPosition = 1,
            }
        );
}
