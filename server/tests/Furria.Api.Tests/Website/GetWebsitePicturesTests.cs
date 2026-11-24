using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class GetWebsitePicturesTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetWebsitePicturesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
}
