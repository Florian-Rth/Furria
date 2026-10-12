using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetPublicGalleryAlbumByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);
    private static readonly TimeSpan RenderedAgainAfter = TimeSpan.FromSeconds(1);

    private readonly ApiTestFixture _fixture;

    public GetPublicGalleryAlbumByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowThePublicSelectionInItsOrder_When_TheAlbumIsPublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<
                GetPublicGalleryAlbumById,
                GetPublicGalleryAlbumByIdRequest,
                GetPublicGalleryAlbumByIdResponse
            >(new() { AlbumId = ctx.Gallery.Albums.IdOf("gala") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ("Prunksitzung", "Ein voller Saal.", (DateTimeOffset?)Gala, 2025, (int?)67),
            (
                result.Title,
                result.Description,
                result.EntryStartsAt,
                result.SessionStartYear,
                result.SessionNumber
            )
        );
        Assert.Equal(
            [
                (ctx.Gallery.Items.IdOf("finale"), "Finale"),
                (ctx.Gallery.Items.IdOf("opening"), (string?)null),
            ],
            result.Photos.Select(photo => (photo.MediaItemId, photo.Caption))
        );
        var finale = result.Photos[0];
        Assert.Equal((4000, 3000), (finale.Width, finale.Height));
        Assert.StartsWith(
            $"/api/public/gallery/pictures/{finale.MediaItemId}/large?v=",
            finale.LargeUrl
        );
    }

    [Fact]
    public async Task Should_HandOutNewUrlsForThatPhotoOnly_When_APhotoIsRenderedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);
        var finale = ctx.Gallery.Items.IdOf("finale");
        var opening = ctx.Gallery.Items.IdOf("opening");
        var albumId = ctx.Gallery.Albums.IdOf("gala");
        var before = await UrlsOfAlbumAsync(albumId);

        await _fixture.AtLaterTimeAsync(
            RenderedAgainAfter,
            () => _fixture.RenderMediaItemDirectlyAsync(finale, ct)
        );
        var after = await UrlsOfAlbumAsync(albumId);

        Assert.NotEqual(before[finale], after[finale]);
        Assert.Equal(before[opening], after[opening]);
    }

    private async Task<IReadOnlyDictionary<int, (string Small, string Large)>> UrlsOfAlbumAsync(
        int albumId
    )
    {
        var (_, result) = await _fixture
            .CreateClient()
            .GETAsync<
                GetPublicGalleryAlbumById,
                GetPublicGalleryAlbumByIdRequest,
                GetPublicGalleryAlbumByIdResponse
            >(new() { AlbumId = albumId });
        return result.Photos.ToDictionary(
            photo => photo.MediaItemId,
            photo => (photo.SmallUrl, photo.LargeUrl)
        );
    }

    private static Action<SeedContextBuilder> Gallery() =>
        builder =>
            builder
                .Club(club =>
                    club.AddSession("2025", 2025, number: 67)
                        .AddCalendarEntry("gala", "Prunksitzung", Gala)
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "gala",
                            "Prunksitzung",
                            calendarEntryAlias: "gala",
                            publishedAt: Published,
                            description: "Ein voller Saal."
                        )
                        .AddGalleryItem("opening", albumAlias: "gala", selectionPosition: 2)
                        .AddGalleryItem("unselected", albumAlias: "gala")
                        .AddGalleryItem(
                            "finale",
                            albumAlias: "gala",
                            selectionPosition: 1,
                            caption: "Finale"
                        )
                        .AddAlbum("draft", "Probe", sessionStartYear: 2025)
                        .AddGalleryItem("draft-chosen", albumAlias: "draft", selectionPosition: 1)
                        .AddAlbum(
                            "binned",
                            "Weg",
                            sessionStartYear: 2025,
                            publishedAt: Published,
                            binnedAt: Published
                        )
                        .AddGalleryItem("binned-chosen", albumAlias: "binned", selectionPosition: 1)
                );
}
