using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class PostEventPictureFromGalleryTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);
    private static readonly PictureCrop BannerCut = new(0, 0.25, 1, 0.5);
    private static readonly byte[] GalleryOriginal = MediaSamples.Jpeg(4096);

    private readonly ApiTestFixture _fixture;

    public PostEventPictureFromGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CopyThePhotoIntoTheEventsOwnPicture_When_TheKeeperPicksItFromTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GalaAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var photoId = await GalleryPhotoAsync(ctx, "gala-photo", ct);

        var (response, picked) = await PickAsync(client, eventId, photoId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(photoId, picked.MediaItemId);
        await ctx
            .Expected.Event(eventId)
            .ToShowPicture(picked.MediaItemId)
            .MediaItem(picked.MediaItemId)
            .ToBeOwnedBy(MediaOwner.Event(eventId))
            .MediaItem(picked.MediaItemId)
            .ToBeCroppedTo(BannerCut)
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
    public async Task Should_DeleteTheFormerPicture_When_APickReplacesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GalaAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var formerId = await EventPictureSteps.RenderedAsync(_fixture, client, eventId, ct);
        var photoId = await GalleryPhotoAsync(ctx, "gala-photo", ct);

        var (_, picked) = await PickAsync(client, eventId, photoId);

        await ctx
            .Expected.Event(eventId)
            .ToShowPicture(picked.MediaItemId)
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
        var ctx = await _fixture.BuildAsync(GalaAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var photoId = await GalleryPhotoAsync(ctx, alias, ct);

        var (response, _) = await PickAsync(client, eventId, photoId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.Event(eventId).ToShowPicture(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseThePick_When_ThePhotosOriginalIsMissing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GalaAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var eventId = ctx.Club.Events.IdOf(EventPictureSeeds.Gala);
        var photoId = ctx.Gallery.Items.IdOf("gala-photo");

        var (response, _) = await PickAsync(client, eventId, photoId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.Event(eventId)
            .ToShowPicture(null)
            .MediaItems()
            .ToHaveCount(3)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheIdNamesACalendarEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GalaAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(EventPictureSeeds.Keeper, ct);
        var photoId = await GalleryPhotoAsync(ctx, "gala-photo", ct);

        var (response, _) = await PickAsync(
            client,
            ctx.Club.CalendarEntries.IdOf(EventPictureSeeds.Meeting),
            photoId
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.MediaItems().ToHaveCount(3).AssertAsync(ct);
    }

    private async Task<int> GalleryPhotoAsync(SeededContext ctx, string alias, CancellationToken ct)
    {
        var photoId = ctx.Gallery.Items.IdOf(alias);
        await _fixture.PlaceRenditionAsync(photoId, MediaRendition.Original, GalleryOriginal, ct);
        return photoId;
    }

    private static Task<TestResult<PostEventPictureFromGalleryResponse>> PickAsync(
        HttpClient client,
        int eventId,
        int galleryItemId
    ) =>
        client.POSTAsync<
            PostEventPictureFromGallery,
            PostEventPictureFromGalleryRequest,
            PostEventPictureFromGalleryResponse
        >(
            new()
            {
                EventId = eventId,
                GalleryItemId = galleryItemId,
                Left = BannerCut.Left,
                Top = BannerCut.Top,
                Width = BannerCut.Width,
                Height = BannerCut.Height,
            }
        );

    private static Action<SeedContextBuilder> GalaAndGallery() =>
        EventPictureSeeds.GalaWithKeeper(gallery =>
            gallery
                .AddAlbum("gala", "Galasitzung", sessionStartYear: 2025)
                .AddGalleryItem("gala-photo", albumAlias: "gala")
                .AddGalleryItem("binned-photo", albumAlias: "gala", binnedAt: Binned)
                .AddGalleryItem("inbox-photo")
        );
}
