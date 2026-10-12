using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Core.Website;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class PostWebsitePictureFromGalleryTests : IClassFixture<ApiTestFixture>
{
    private const string Story = "club.story";

    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);
    private static readonly PictureCrop LandscapeCut = new(0, 0.1, 1, 0.71);
    private static readonly byte[] GalleryOriginal = MediaSamples.Jpeg(4096);

    private readonly ApiTestFixture _fixture;

    public PostWebsitePictureFromGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CopyThePhotoIntoThePositionAtItsAspect_When_ThePublisherPicksItFromAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PublisherAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var photoId = await GalleryPhotoAsync(ctx, "gala-photo", ct);

        var (response, picked) = await PickAsync(client, photoId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(photoId, picked.MediaItemId);
        await ctx
            .Expected.WebsitePicture(Story, 1)
            .ToBeFilledBy(picked.MediaItemId, WebsitePictureSteps.Landscape)
            .WebsitePicture(Story, 1)
            .ToBeUpdatedBy(ctx.Identity.People.IdOf(WebsitePictureSeeds.Publisher))
            .MediaItem(picked.MediaItemId)
            .ToBeOwnedBy(MediaOwner.Website(new PictureSlotPosition(Story, 1)))
            .MediaItem(picked.MediaItemId)
            .ToBeCroppedTo(LandscapeCut)
            .MediaItem(picked.MediaItemId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .MediaItem(photoId)
            .ToBeOwnedBy(MediaOwner.Gallery)
            .AssertAsync(ct);
        Assert.Equal(
            GalleryOriginal,
            await File.ReadAllBytesAsync(
                await _fixture.MediaFileOfAsync(picked.MediaItemId, MediaRendition.Original, ct),
                ct
            )
        );
    }

    [Fact]
    public async Task Should_DeleteTheFormerPicture_When_AFilledPositionIsPickedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PublisherAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var formerId = await WebsitePictureSteps.RenderedAsync(_fixture, client, Story, 1, ct);
        var photoId = await GalleryPhotoAsync(ctx, "gala-photo", ct);

        var (_, picked) = await PickAsync(client, photoId);

        await ctx
            .Expected.WebsitePicture(Story, 1)
            .ToBeFilledBy(picked.MediaItemId, WebsitePictureSteps.Landscape)
            .MediaItem(formerId)
            .ToBeGone()
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("binned-photo")]
    [InlineData("inbox-photo")]
    public async Task Should_RefuseThePick_When_ThePhotoLiesInNoLiveAlbum(string alias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PublisherAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var photoId = await GalleryPhotoAsync(ctx, alias, ct);

        var (response, _) = await PickAsync(client, photoId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.WebsitePicture(Story, 1).ToBeEmpty().AssertAsync(ct);
    }

    private async Task<int> GalleryPhotoAsync(SeededContext ctx, string alias, CancellationToken ct)
    {
        var photoId = ctx.Gallery.Items.IdOf(alias);
        await _fixture.PlaceRenditionAsync(photoId, MediaRendition.Original, GalleryOriginal, ct);
        return photoId;
    }

    private static Task<TestResult<PostWebsitePictureFromGalleryResponse>> PickAsync(
        HttpClient client,
        int galleryItemId
    ) =>
        client.POSTAsync<
            PostWebsitePictureFromGallery,
            PostWebsitePictureFromGalleryRequest,
            PostWebsitePictureFromGalleryResponse
        >(
            new()
            {
                SlotKey = Story,
                Position = 1,
                GalleryItemId = galleryItemId,
                Left = LandscapeCut.Left,
                Top = LandscapeCut.Top,
                Width = LandscapeCut.Width,
                Height = LandscapeCut.Height,
                Aspect = WebsitePictureSteps.Landscape,
            }
        );

    private static Action<SeedContextBuilder> PublisherAndGallery() =>
        builder =>
            builder
                .WithGalleryPublisher()
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Galasitzung", sessionStartYear: 2025)
                        .AddGalleryItem("gala-photo", albumAlias: "gala")
                        .AddGalleryItem("binned-photo", albumAlias: "gala", binnedAt: Binned)
                        .AddGalleryItem("inbox-photo")
                );
}
