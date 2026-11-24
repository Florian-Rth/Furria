using System.Net;
using Furria.Api.Tests.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class WebsitePictureUploadTests : IClassFixture<ApiTestFixture>
{
    private const string Hero = "landing.hero";
    private const int PictureLength = 4096;

    private readonly ApiTestFixture _fixture;

    public WebsitePictureUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveTheOtherPositionsOfTheSlotAlone_When_OnePositionIsFilled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var firstId = await WebsitePictureSteps.UploadAsync(client, "gallery.stack", 1, 1.4, ct);

        var secondId = await WebsitePictureSteps.UploadAsync(client, "gallery.stack", 2, 0.8, ct);

        await ctx
            .Expected.WebsitePicture("gallery.stack", 1)
            .ToBeFilledBy(firstId, 1.4)
            .WebsitePicture("gallery.stack", 2)
            .ToBeFilledBy(secondId, 0.8)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheCallerMayNotPublishTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ClientForAsync("max", ct);

        var response = await CreateAsync(client, TusUploadSteps.WebsiteOwner(Hero, 1), "1.4", ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_AnotherOwnerNamesAnAspect()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await CreateAsync(client, TusUploadSteps.GalleryOwner, "1.4", ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static Task<HttpResponseMessage> CreateAsync(
        HttpClient client,
        string owner,
        string? aspect,
        CancellationToken ct
    ) =>
        TusUploadSteps.CreateAsync(
            client,
            owner,
            "buehne.jpg",
            PictureLength,
            crop: null,
            ct,
            aspect: aspect
        );

    private static Action<SeedContextBuilder> Publisher() =>
        builder => builder.WithGalleryPublisher().Identity(identity => identity.AddAccount("max"));
}
