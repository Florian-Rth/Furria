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
