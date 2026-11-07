using System.Net;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Website.WebsitePageHeadSteps;

namespace Furria.Api.Tests.Website;

public sealed class GetGalleryPageHeadTests : IClassFixture<ApiTestFixture>
{
    private const string Kind = "gallery";

    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGalleryPageHeadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowTheFirstPhotoAbsolutelyAndCountThePhotos_When_TheAlbumHasNoText()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);
        var albumId = ctx.Gallery.Albums.IdOf("gala");

        var (status, html) = await PageHeadAsync(_fixture, Kind, albumId.ToString());

        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Contains(Meta("og:url", $"{Origin}/gallery/{albumId}-prunksitzung"), html);
        Assert.Contains("<title data-page-head>Prunksitzung 2025/26 · FURRIA</title>", html);
        Assert.Contains(
            Meta(
                "og:description",
                "2 Fotos: Prunksitzung, 14. Februar 2026 · 67. Session 2025/26."
            ),
            html
        );
        Assert.Contains(
            $"property=\"og:image\" content=\"{Origin}/api/public/gallery/pictures/"
                + $"{ctx.Gallery.Items.IdOf("finale")}/large",
            html
        );
        Assert.Contains(Meta("og:image:alt", "Prunksitzung"), html);
    }

    [Fact]
    public async Task Should_AnswerAnEmptyNotFound_When_TheAlbumIsNotPublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var (status, html) = await PageHeadAsync(
            _fixture,
            Kind,
            $"{ctx.Gallery.Albums.IdOf("draft")}-probe"
        );

        Assert.Equal(HttpStatusCode.NotFound, status);
        Assert.Empty(html);
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
                            publishedAt: Published
                        )
                        .AddGalleryItem("opening", albumAlias: "gala", selectionPosition: 2)
                        .AddGalleryItem("finale", albumAlias: "gala", selectionPosition: 1)
                        .AddAlbum("draft", "Probe", sessionStartYear: 2025)
                        .AddGalleryItem("draft-chosen", albumAlias: "draft", selectionPosition: 1)
                );
}
