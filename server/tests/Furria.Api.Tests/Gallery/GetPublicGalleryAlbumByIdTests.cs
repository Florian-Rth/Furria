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
        Assert.Equal($"/api/public/gallery/photos/{finale.MediaItemId}/large", finale.LargeUrl);
    }

    [Theory]
    [InlineData("draft")]
    [InlineData("binned")]
    public async Task Should_AnswerNotFound_When_TheAlbumIsNotPublic(string albumAlias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<
                GetPublicGalleryAlbumById,
                GetPublicGalleryAlbumByIdRequest,
                GetPublicGalleryAlbumByIdResponse
            >(new() { AlbumId = ctx.Gallery.Albums.IdOf(albumAlias) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
