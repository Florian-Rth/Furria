using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetPublicGalleryTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Parade = new(2026, 2, 16, 13, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetPublicGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListOnlyPublishedAlbumsBySessionNewestFirst_When_AVisitorAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGallery, GetPublicGalleryResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [(2025, 67), (2024, (int?)null)],
            result.Sessions.Select(session => (session.SessionStartYear, session.SessionNumber))
        );
        Assert.Equal(
            [
                [ctx.Gallery.Albums.IdOf("gala"), ctx.Gallery.Albums.IdOf("parade")],
                [ctx.Gallery.Albums.IdOf("old")],
            ],
            result.Sessions.Select(session => session.Albums.Select(album => album.AlbumId))
        );
    }

    [Fact]
    public async Task Should_CountAndCoverAnAlbumFromItsPublicSelection_When_AVisitorAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var (_, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGallery, GetPublicGalleryResponse>();

        var albums = result.Sessions.SelectMany(session => session.Albums).ToList();
        var gala = albums.Single(album => album.AlbumId == ctx.Gallery.Albums.IdOf("gala"));
        var parade = albums.Single(album => album.AlbumId == ctx.Gallery.Albums.IdOf("parade"));
        Assert.Equal(
            (2, Gala, ctx.Gallery.Items.IdOf("gala-second")),
            (gala.PhotoCount, gala.EntryStartsAt, gala.Cover.MediaItemId)
        );
        Assert.Equal(
            (1, (DateTimeOffset?)null, ctx.Gallery.Items.IdOf("parade-chosen")),
            (parade.PhotoCount, parade.EntryStartsAt, parade.Cover.MediaItemId)
        );
        Assert.StartsWith("/api/public/gallery/photos/", gala.Cover.MediumUrl);
    }

    private static Action<SeedContextBuilder> Gallery() =>
        builder =>
            builder
                .Club(club =>
                    club.AddSession("2025", 2025, number: 67)
                        .AddCalendarEntry("gala", "Prunksitzung", Gala)
                        .AddCalendarEntry("parade", "Umzug", Parade)
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "gala",
                            "Prunksitzung",
                            calendarEntryAlias: "gala",
                            publishedAt: Published,
                            coverItemAlias: "gala-unselected"
                        )
                        .AddGalleryItem("gala-unselected", albumAlias: "gala")
                        .AddGalleryItem("gala-first", albumAlias: "gala", selectionPosition: 2)
                        .AddGalleryItem("gala-second", albumAlias: "gala", selectionPosition: 1)
                        .AddGalleryItem(
                            "gala-video",
                            albumAlias: "gala",
                            kind: MediaKind.Video,
                            capturedAt: Gala
                        )
                        .AddAlbum(
                            "parade",
                            "Umzug",
                            sessionStartYear: 2025,
                            publishedAt: Published,
                            coverItemAlias: "parade-chosen"
                        )
                        .AddGalleryItem("parade-chosen", albumAlias: "parade", selectionPosition: 1)
                        .AddAlbum(
                            "old",
                            "Ordensfest",
                            sessionStartYear: 2024,
                            publishedAt: Published
                        )
                        .AddGalleryItem("old-chosen", albumAlias: "old", selectionPosition: 1)
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
