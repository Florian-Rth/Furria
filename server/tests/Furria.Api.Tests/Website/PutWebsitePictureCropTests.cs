using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class PutWebsitePictureCropTests : IClassFixture<ApiTestFixture>
{
    private const double Portrait = 4.0 / 5;

    private static readonly PictureCrop PortraitCut = new(0.1, 0, 0.64, 1);

    private readonly ApiTestFixture _fixture;

    public PutWebsitePictureCropTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecutThePictureAtTheNewAspectAndRenderItAgain_When_ThePublisherCropsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var pictureId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "landing.hero",
            1,
            ct
        );

        var response = await CropAsync(client, "landing.hero", 1);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.WebsitePicture("landing.hero", 1)
            .ToBeFilledBy(pictureId, Portrait)
            .MediaItem(pictureId)
            .ToBeCroppedTo(PortraitCut)
            .MediaItem(pictureId)
            .ToBeIn(MediaItemState.Processing)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePositionIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var response = await CropAsync(client, "club.story", 1);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> CropAsync(
        HttpClient client,
        string slotKey,
        int position
    ) =>
        client.PUTAsync<PutWebsitePictureCrop, PutWebsitePictureCropRequest>(
            new()
            {
                SlotKey = slotKey,
                Position = position,
                Left = PortraitCut.Left,
                Top = PortraitCut.Top,
                Width = PortraitCut.Width,
                Height = PortraitCut.Height,
                Aspect = Portrait,
            }
        );
}
