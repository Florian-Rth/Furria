using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class GetPublicWebsitePicturesTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetPublicWebsitePicturesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryRenderedPictureByItsStableSlotUrls_When_TheWebsiteLoads()
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
        await _fixture.CropMediaItemDirectlyAsync(
            heroId,
            new MediaCrop
            {
                Left = 0,
                Top = 0.15,
                Width = 1,
                Height = 0.5714,
            },
            ct
        );
        await client.PUTAsync<PutWebsitePictureAlt, PutWebsitePictureAltRequest>(
            new()
            {
                SlotKey = "landing.hero",
                Position = 1,
                Alt = "Die Garde auf der Bühne",
            }
        );
        await WebsitePictureSteps.UploadAsync(client, "club.story", 1, 1.4, ct);

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicWebsitePictures, GetPublicWebsitePicturesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var hero = Assert.Single(result.Pictures);
        Assert.Equal(
            ("landing.hero", 1, 800, 571, "Die Garde auf der Bühne"),
            (hero.Slot, hero.Position, hero.Width, hero.Height, hero.Alt)
        );
        Assert.Equal(
            (
                "/api/public/website-pictures/landing.hero/1/small",
                "/api/public/website-pictures/landing.hero/1/medium",
                "/api/public/website-pictures/landing.hero/1/large"
            ),
            (hero.SmallUrl, hero.MediumUrl, hero.LargeUrl)
        );
    }
}
