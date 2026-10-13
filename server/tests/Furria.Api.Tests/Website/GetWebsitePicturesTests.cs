using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class GetWebsitePicturesTests : IClassFixture<ApiTestFixture>
{
    private static readonly byte[] SmallRendition = [7, 5, 7, 5];

    private readonly ApiTestFixture _fixture;

    public GetWebsitePicturesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryFilledPositionWithItsAspectAltAndEditor_When_ThePublisherOpensThem()
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
        var stackId = await WebsitePictureSteps.UploadAsync(client, "gallery.stack", 2, 0.8, ct);
        await client.PUTAsync<PutWebsitePictureAlt, PutWebsitePictureAltRequest>(
            new()
            {
                SlotKey = "landing.hero",
                Position = 1,
                Alt = "Die Garde auf der Bühne",
            }
        );

        var (response, result) = await client.GETAsync<
            GetWebsitePictures,
            GetWebsitePicturesResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ("gallery.stack", 2, stackId, 0.8, null),
                (
                    "landing.hero",
                    1,
                    heroId,
                    WebsitePictureSteps.Landscape,
                    "Die Garde auf der Bühne"
                ),
            ],
            result.Pictures.Select(picture =>
                (picture.Slot, picture.Position, picture.MediaItemId, picture.Aspect, picture.Alt)
            )
        );
        var hero = result.Pictures[1];
        Assert.Equal(MediaItemState.Ready, hero.Picture.State);
        Assert.NotNull(hero.Picture.Picture);
        Assert.NotNull(hero.Picture.UncroppedUrl);
        Assert.Equal("Paula", hero.UpdatedBy?.FirstName);
        Assert.Null(result.Pictures[0].Picture.Picture);
    }

    [Fact]
    public async Task Should_FlagAPictureAsStalled_When_NoWorkerTookUpItsRenderingForMinutes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        await WebsitePictureSteps.UploadAsync(client, "landing.hero", 1, 1.4, ct);

        GetWebsitePicturesResponse? later = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(3),
            async () =>
                (_, later) = await client.GETAsync<GetWebsitePictures, GetWebsitePicturesResponse>()
        );

        var picture = later!.Pictures.Single().Picture;
        Assert.Equal(MediaItemState.Processing, picture.State);
        Assert.True(picture.IsStalled);
    }

    [Fact]
    public async Task Should_NotFlagAWaitingPictureAsStalled_When_TheWorkerIsBusyWithAnother()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        await WebsitePictureSteps.UploadAsync(client, "landing.hero", 1, 1.4, ct);
        await WebsitePictureSteps.UploadAsync(client, "gallery.stack", 2, 0.8, ct);
        Assert.True(await _fixture.ClaimMediaJobAsync(MediaKind.Photo, ct));

        GetWebsitePicturesResponse? later = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(3),
            async () =>
                (_, later) = await client.GETAsync<GetWebsitePictures, GetWebsitePicturesResponse>()
        );

        Assert.All(later!.Pictures, position => Assert.False(position.Picture.IsStalled));
    }

    [Fact]
    public async Task Should_ServeTheListedRendition_When_ItsSignedUrlIsFetched()
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
        await _fixture.PlaceRenditionAsync(heroId, MediaRendition.Small, SmallRendition, ct);
        var (_, result) = await client.GETAsync<GetWebsitePictures, GetWebsitePicturesResponse>();

        var rendition = await _fixture
            .CreateClient()
            .GetAsync(result.Pictures.Single().Picture.Picture!.SmallUrl, ct);

        Assert.Equal(HttpStatusCode.OK, rendition.StatusCode);
        Assert.Equal(SmallRendition, await rendition.Content.ReadAsByteArrayAsync(ct));
    }
}
