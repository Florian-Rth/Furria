using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset GalaEvening = new(2026, 2, 14, 19, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset ParadeNoon = new(2026, 2, 16, 13, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset LastGala = new(2025, 3, 1, 19, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListSessionsNewestFirstAndTheirAlbumsByEntryDate_When_AMemberOpensIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddAccount("lena").AddMembership("lena-membership", "lena")
                    )
                    .Club(club =>
                        club.AddCalendarEntry("gala", "Prunksitzung", GalaEvening)
                            .AddCalendarEntry("parade", "Rosenmontagsumzug", ParadeNoon)
                            .AddCalendarEntry("last-gala", "Prunksitzung", LastGala)
                    )
                    .Gallery(gallery =>
                        gallery
                            .AddAlbum("gala-album", "Prunksitzung 2026", calendarEntryAlias: "gala")
                            .AddAlbum("parade-album", "Umzug", calendarEntryAlias: "parade")
                            .AddAlbum("last-gala-album", "Prunksitzung 2025", "last-gala")
                            .AddAlbum("archive", "Archiv Session 1985", sessionStartYear: 1985)
                            .AddAlbum("renovation", "Vereinsheim")
                            .AddAlbum("binned", "Verworfen", binnedAt: GalaEvening)
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (response, result) = await client.GETAsync<GetGallery, GetGalleryResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [2025, 2024, 1985, null],
            result.Sections.Select(section => section.SessionStartYear)
        );
        Assert.Equal(
            [
                [ctx.Gallery.Albums.IdOf("parade-album"), ctx.Gallery.Albums.IdOf("gala-album")],
                [ctx.Gallery.Albums.IdOf("last-gala-album")],
                [ctx.Gallery.Albums.IdOf("archive")],
                [ctx.Gallery.Albums.IdOf("renovation")],
            ],
            result.Sections.Select(section => section.Albums.Select(album => album.AlbumId))
        );
    }

    [Fact]
    public async Task Should_CountOnlyPlacedItemsAndSampleThemInCaptureOrder_When_AnAlbumHasItems()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddAccount("lena").AddMembership("lena-membership", "lena")
                    )
                    .Gallery(gallery =>
                        gallery
                            .AddAlbum("album", "Ordensfest", sessionStartYear: 2025)
                            .AddGalleryItem(
                                "late",
                                "lena",
                                "album",
                                capturedAt: GalaEvening.AddHours(2)
                            )
                            .AddGalleryItem("early", "lena", "album", capturedAt: GalaEvening)
                            .AddGalleryItem(
                                "clip",
                                "lena",
                                "album",
                                MediaKind.Video,
                                capturedAt: GalaEvening.AddHours(1)
                            )
                            .AddGalleryItem("binned", "lena", "album", binnedAt: GalaEvening)
                            .AddGalleryItem("unsorted", "lena")
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, result) = await client.GETAsync<GetGallery, GetGalleryResponse>();

        var album = Assert.Single(Assert.Single(result.Sections).Albums);
        Assert.Equal((2, 1), (album.Photos, album.Videos));
        Assert.Equal(
            [
                ctx.Gallery.Items.IdOf("early"),
                ctx.Gallery.Items.IdOf("clip"),
                ctx.Gallery.Items.IdOf("late"),
            ],
            album.Samples.Select(sample => sample.MediaItemId)
        );
        Assert.Equal(
            [GalaEvening, GalaEvening.AddHours(1), GalaEvening.AddHours(2)],
            album.Samples.Select(sample => sample.CapturedAt)
        );
        Assert.Equal(ctx.Gallery.Items.IdOf("early"), album.Cover?.MediaItemId);
        Assert.Equal(GalaEvening, album.Cover?.CapturedAt);
    }

    [Fact]
    public async Task Should_CoverWithTheChosenElseTheFirstSelected_When_AnAlbumHasBoth()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddAccount("lena").AddMembership("lena-membership", "lena")
                    )
                    .Gallery(gallery =>
                        gallery
                            .AddAlbum(
                                "chosen",
                                "Gewählt",
                                sessionStartYear: 2025,
                                coverItemAlias: "chosen-cover"
                            )
                            .AddGalleryItem(
                                "chosen-first",
                                "lena",
                                "chosen",
                                capturedAt: GalaEvening
                            )
                            .AddGalleryItem(
                                "chosen-cover",
                                "lena",
                                "chosen",
                                capturedAt: ParadeNoon
                            )
                            .AddAlbum("selected", "Ausgewählt", sessionStartYear: 2024)
                            .AddGalleryItem(
                                "selected-first",
                                "lena",
                                "selected",
                                capturedAt: GalaEvening
                            )
                            .AddGalleryItem(
                                "selected-second",
                                "lena",
                                "selected",
                                capturedAt: ParadeNoon,
                                selectionPosition: 1
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, result) = await client.GETAsync<GetGallery, GetGalleryResponse>();

        var covers = result
            .Sections.SelectMany(section => section.Albums)
            .ToDictionary(album => album.AlbumId, album => album.Cover?.MediaItemId);
        Assert.Equal(
            ctx.Gallery.Items.IdOf("chosen-cover"),
            covers[ctx.Gallery.Albums.IdOf("chosen")]
        );
        Assert.Equal(
            ctx.Gallery.Items.IdOf("selected-second"),
            covers[ctx.Gallery.Albums.IdOf("selected")]
        );
    }
}
