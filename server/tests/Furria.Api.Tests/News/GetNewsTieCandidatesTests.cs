using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetNewsTieCandidatesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Shown = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetNewsTieCandidatesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferOnlyPublishedEventsAndAlbumsOnTheWebsite_When_TheWriterTiesThePost()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetNewsTieCandidates,
            GetNewsTieCandidatesResponse
        >();

        Assert.Equal(["Prunksitzung", "Sessionseröffnung"], result.Events.Select(tie => tie.Title));
        Assert.Equal(["Prunksitzung"], result.Albums.Select(album => album.Title));
    }

    private static Action<SeedContextBuilder> Club() =>
        builder =>
            builder
                .Club(club =>
                    club.AddVenue("saal", "Bürgerhaus")
                        .AddEvent("gala", "Prunksitzung", Gala, "saal", endsAt: Gala.AddHours(5))
                        .AddEvent("opening", "Sessionseröffnung", Gala.AddMonths(-3), "saal")
                        .AddEvent(
                            "in-preparation",
                            "Kappenabend",
                            Gala.AddDays(7),
                            "saal",
                            unpublished: true
                        )
                        .AddCalendarEntry("probe", "Probe", Gala.AddDays(-2))
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "shown",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Shown
                        )
                        .AddAlbum("hidden", "Probe", sessionStartYear: 2025)
                        .AddAlbum(
                            "binned",
                            "Weg",
                            sessionStartYear: 2025,
                            publishedAt: Shown,
                            binnedAt: Shown
                        )
                        .AddGalleryItem("second", albumAlias: "shown", selectionPosition: 2)
                        .AddGalleryItem("first", albumAlias: "shown", selectionPosition: 1)
                        .AddGalleryItem("loose", albumAlias: "shown")
                );
}
