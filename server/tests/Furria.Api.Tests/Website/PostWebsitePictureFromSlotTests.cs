using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class PostWebsitePictureFromSlotTests : IClassFixture<ApiTestFixture>
{
    private const double Portrait = 4.0 / 5;

    private static readonly PictureCrop PortraitCut = new(0.3, 0, 0.5, 1);
    private static readonly byte[] HeroOriginal = MediaSamples.Jpeg(2048);

    private readonly ApiTestFixture _fixture;

    public PostWebsitePictureFromSlotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CopyTheOtherSlotsOriginalWithANewCutAndItsAltText_When_ThePublisherUsesTheSamePhoto()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var heroId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "landing.hero",
            1,
            ct
        );
        await _fixture.PlaceRenditionAsync(heroId, MediaRendition.Original, HeroOriginal, ct);
        await client.PUTAsync<PutWebsitePictureAlt, PutWebsitePictureAltRequest>(
            new()
            {
                SlotKey = "landing.hero",
                Position = 1,
                Alt = "Die Garde auf der Bühne",
            }
        );

        var (response, copied) = await CopyAsync(client, "landing.hero");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(heroId, copied.MediaItemId);
        await ctx
            .Expected.WebsitePicture("landing.heroPhone", 1)
            .ToBeFilledBy(copied.MediaItemId, Portrait, "Die Garde auf der Bühne")
            .MediaItem(copied.MediaItemId)
            .ToBeCroppedTo(PortraitCut)
            .WebsitePicture("landing.hero", 1)
            .ToBeFilledBy(heroId, WebsitePictureSteps.Landscape, "Die Garde auf der Bühne")
            .AssertAsync(ct);
        Assert.Equal(
            HeroOriginal,
            await File.ReadAllBytesAsync(
                await _fixture.MediaFileOfAsync(copied.MediaItemId, MediaRendition.Original, ct),
                ct
            )
        );
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheOtherSlotIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var (response, _) = await CopyAsync(client, "landing.hero");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.WebsitePicture("landing.heroPhone", 1).ToBeEmpty().AssertAsync(ct);
    }

    private static Task<TestResult<PostWebsitePictureFromSlotResponse>> CopyAsync(
        HttpClient client,
        string sourceSlotKey
    ) =>
        client.POSTAsync<
            PostWebsitePictureFromSlot,
            PostWebsitePictureFromSlotRequest,
            PostWebsitePictureFromSlotResponse
        >(
            new()
            {
                SlotKey = "landing.heroPhone",
                Position = 1,
                SourceSlotKey = sourceSlotKey,
                SourcePosition = 1,
                Left = PortraitCut.Left,
                Top = PortraitCut.Top,
                Width = PortraitCut.Width,
                Height = PortraitCut.Height,
                Aspect = Portrait,
            }
        );
}
