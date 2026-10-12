using System.Net;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Core.Website;
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
    public async Task Should_FillThePositionAtItsAspect_When_APublisherUploadsAPhotoForIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var pictureId = await WebsitePictureSteps.UploadAsync(
            client,
            Hero,
            1,
            WebsitePictureSteps.Landscape,
            ct
        );

        await ctx
            .Expected.WebsitePicture(Hero, 1)
            .ToBeFilledBy(pictureId, WebsitePictureSteps.Landscape)
            .WebsitePicture(Hero, 1)
            .ToBeUpdatedBy(ctx.Identity.People.IdOf(WebsitePictureSeeds.Publisher))
            .MediaItem(pictureId)
            .ToBeOwnedBy(MediaOwner.Website(new PictureSlotPosition(Hero, 1)))
            .MediaItem(pictureId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteTheFormerPicture_When_AFilledPositionGetsANewOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var formerId = await WebsitePictureSteps.UploadAsync(client, Hero, 1, 1.5, ct);

        var pictureId = await WebsitePictureSteps.UploadAsync(
            client,
            Hero,
            1,
            WebsitePictureSteps.Landscape,
            ct
        );

        await ctx
            .Expected.WebsitePicture(Hero, 1)
            .ToBeFilledBy(pictureId, WebsitePictureSteps.Landscape)
            .MediaItem(formerId)
            .ToBeGone()
            .AssertAsync(ct);
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

    [Theory]
    [InlineData(null)]
    [InlineData("0")]
    [InlineData("vierzehn")]
    [InlineData("12")]
    public async Task Should_RefuseTheUpload_When_ItCarriesNoUsableAspect(string? aspect)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var response = await CreateAsync(client, TusUploadSteps.WebsiteOwner(Hero, 1), aspect, ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("website:hero:1")]
    [InlineData("website:Landing.hero:1")]
    [InlineData("website:landing.hero:0")]
    [InlineData("website:landing.hero:25")]
    [InlineData("website:landing.hero")]
    public async Task Should_RefuseTheUpload_When_TheSlotIsMalformed(string owner)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Publisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var response = await CreateAsync(client, owner, "1.4", ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
