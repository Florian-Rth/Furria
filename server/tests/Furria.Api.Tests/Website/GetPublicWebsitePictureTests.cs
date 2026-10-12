using System.Net;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class GetPublicWebsitePictureTests : IClassFixture<ApiTestFixture>
{
    private const string HeroMedium = "/api/public/website-pictures/landing.hero/1/medium";

    private static readonly byte[] MediumRendition = [4, 8, 15, 16, 23, 42];

    private readonly ApiTestFixture _fixture;

    public GetPublicWebsitePictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeWhatFillsThePositionRevalidatedByItsEntityTag_When_ThePositionIsFilled()
    {
        var ct = TestContext.Current.CancellationToken;
        await FilledHeroAsync(ct);

        var response = await _fixture.CreateClient().GetAsync(HeroMedium, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
        Assert.True(response.Headers.CacheControl?.Private);
        Assert.True(response.Headers.CacheControl?.NoCache);
        Assert.NotNull(response.Headers.ETag);
    }

    [Fact]
    public async Task Should_AnswerNotModified_When_TheBrowserHoldsTheSamePicture()
    {
        var ct = TestContext.Current.CancellationToken;
        await FilledHeroAsync(ct);
        var anonymous = _fixture.CreateClient();
        var first = await anonymous.GetAsync(HeroMedium, ct);

        var again = new HttpRequestMessage(HttpMethod.Get, HeroMedium);
        again.Headers.IfNoneMatch.Add(first.Headers.ETag!);
        var response = await anonymous.SendAsync(again, ct);

        Assert.Equal(HttpStatusCode.NotModified, response.StatusCode);
    }

    [Fact]
    public async Task Should_ServeTheNewPictureUnderANewEntityTag_When_ThePositionIsRefilled()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await FilledHeroAsync(ct);
        var anonymous = _fixture.CreateClient();
        var former = (await anonymous.GetAsync(HeroMedium, ct)).Headers.ETag!;
        var pictureId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "landing.hero",
            1,
            ct
        );
        await _fixture.PlaceRenditionAsync(pictureId, MediaRendition.Medium, [1, 2, 3], ct);

        var again = new HttpRequestMessage(HttpMethod.Get, HeroMedium);
        again.Headers.IfNoneMatch.Add(former);
        var response = await anonymous.SendAsync(again, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal([1, 2, 3], await response.Content.ReadAsByteArrayAsync(ct));
        Assert.NotEqual(former, response.Headers.ETag);
    }

    [Theory]
    [InlineData("/api/public/website-pictures/landing.hero/2/medium")]
    [InlineData("/api/public/website-pictures/landing.hero/1/original")]
    [InlineData("/api/public/website-pictures/landing.hero/1/uncropped")]
    public async Task Should_AnswerNotFound_When_ThePositionIsEmptyOrTheRenditionIsNotPublic(
        string url
    )
    {
        var ct = TestContext.Current.CancellationToken;
        await FilledHeroAsync(ct);

        var response = await _fixture.CreateClient().GetAsync(url, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePictureWasNeverRendered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        await WebsitePictureSteps.UploadAsync(
            client,
            "landing.hero",
            1,
            WebsitePictureSteps.Landscape,
            ct
        );

        var response = await _fixture.CreateClient().GetAsync(HeroMedium, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<HttpClient> FilledHeroAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var heroId = await WebsitePictureSteps.RenderedAsync(
            _fixture,
            client,
            "landing.hero",
            1,
            ct
        );
        await _fixture.PlaceRenditionAsync(heroId, MediaRendition.Medium, MediumRendition, ct);
        return client;
    }
}
