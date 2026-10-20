using Furria.Core.Media;
using Furria.Core.News;
using Furria.Infrastructure.Public;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Public;

public sealed class PublicFaceTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Published = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Withdrawn = new(2026, 1, 6, 9, 0, 0, TimeSpan.Zero);
    private static readonly DateOnly LongAgo = new(2020, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PublicFaceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowOnlyEventsThatAreNotYetOver_When_TheWebsiteReadsEvents()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("saal", "Bürgerhaus")
                        .AddEvent("ahead", "Kinderball", now.AddDays(30), "saal")
                        .AddEvent(
                            "running",
                            "Prunksitzung",
                            now.AddHours(-1),
                            "saal",
                            endsAt: now.AddHours(1)
                        )
                        .AddEvent("just-begun", "Weiberfastnacht", now.AddHours(-2), "saal")
                        .AddEvent("long-begun", "Frühschoppen", now.AddHours(-4), "saal")
                        .AddEvent(
                            "over",
                            "Altweiber",
                            now.AddDays(-30),
                            "saal",
                            endsAt: now.AddDays(-30).AddHours(5)
                        )
                ),
            ct
        );

        var shown = await ShownAsync(face => face.Events.Select(row => row.CalendarEntryId), ct);

        Assert.Equal(IdsOf(ctx.Club.Events, "ahead", "running", "just-begun"), shown);
    }

    [Fact]
    public async Task Should_LeaveOutEventsInPreparation_When_TheWebsiteReadsEvents()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("saal", "Bürgerhaus")
                        .AddEvent("published", "Kinderball", now.AddDays(30), "saal")
                        .AddEvent(
                            "in-preparation",
                            "Prunksitzung",
                            now.AddDays(40),
                            "saal",
                            unpublished: true
                        )
                ),
            ct
        );

        var shown = await ShownAsync(face => face.Events.Select(row => row.CalendarEntryId), ct);

        Assert.Equal(IdsOf(ctx.Club.Events, "published"), shown);
    }

    [Fact]
    public async Task Should_ShowOnlyGroupsThatAreNotArchived_When_TheWebsiteReadsGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("garde", "Stadtgarde")
                        .AddGroup("alt", "Altherren", archivedOn: new DateOnly(2024, 6, 30))
                ),
            ct
        );

        var shown = await ShownAsync(face => face.Groups.Select(group => group.Id), ct);

        Assert.Equal(IdsOf(ctx.Groups.Groups, "garde"), shown);
    }

    [Fact]
    public async Task Should_ShowOnlyPublishedAlbumsOutsideTheBin_When_TheWebsiteReadsAlbums()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var shown = await ShownAsync(face => face.Albums.Select(album => album.Id), ct);

        Assert.Equal(IdsOf(ctx.Gallery.Albums, "published"), shown);
    }

    [Fact]
    public async Task Should_ShowOnlyReadySelectedPhotosOfPublishedAlbums_When_TheWebsiteReadsPhotos()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);

        var shown = await ShownAsync(face => face.SelectedPhotos.Select(item => item.Id), ct);

        Assert.Equal(IdsOf(ctx.Gallery.Items, "selected"), shown);
    }

    [Fact]
    public async Task Should_ShowOnlyLivePosts_When_TheWebsiteReadsNews()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.News(news =>
                    news.AddNewsPost(
                            "live",
                            "Motto verkündet",
                            "Vorspann",
                            "Text",
                            NewsCategory.Session,
                            publishedAt: Published,
                            slug: "motto-verkuendet"
                        )
                        .AddNewsPost("draft", "Entwurf", "Vorspann", "Text", NewsCategory.Club)
                        .AddNewsPost(
                            "withdrawn",
                            "Zurückgezogen",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            publishedAt: Published,
                            slug: "zurueckgezogen",
                            withdrawnAt: Withdrawn
                        )
                        .AddNewsPost(
                            "uncategorized",
                            "Ohne Kategorie",
                            "Vorspann",
                            "Text",
                            publishedAt: Published,
                            slug: "ohne-kategorie"
                        )
                ),
            ct
        );

        var shown = await ShownAsync(face => face.NewsPosts.Select(post => post.Id), ct);

        Assert.Equal(IdsOf(ctx.News.Posts, "live"), shown);
    }

    [Fact]
    public async Task Should_ShowOnlyRunningSeatsInPublicOffices_When_TheWebsiteReadsTheBoard()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Becker")
                            .AddPerson("kai", "Kai", "Klein")
                            .AddPerson("emil", "Emil", "Ernst")
                            .AddPerson("nina", "Nina", "Neu")
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesidentin", "Präsidentin", 1, isPublic: true)
                            .AddBoardOffice("kasse", "Kasse", 2)
                            .AddBoardSeat("paula-seat", "praesidentin", "paula", LongAgo)
                            .AddBoardSeat("kai-seat", "kasse", "kai", LongAgo)
                            .AddBoardSeat(
                                "emil-seat",
                                "praesidentin",
                                "emil",
                                LongAgo,
                                today.AddDays(-1)
                            )
                            .AddBoardSeat("nina-seat", "praesidentin", "nina", today.AddDays(1))
                    ),
            ct
        );

        var shown = await ShownAsync(face => face.BoardSeats.Select(seat => seat.Id), ct);

        Assert.Equal(IdsOf(ctx.Club.BoardSeats, "paula-seat"), shown);
    }

    private async Task<IReadOnlyList<int>> ShownAsync(
        Func<PublicFace, IQueryable<int>> shown,
        CancellationToken ct
    )
    {
        await using var scope = _fixture.Services.CreateAsyncScope();
        var face = scope.ServiceProvider.GetRequiredService<PublicFace>();
        return [.. (await shown(face).ToListAsync(ct)).Order()];
    }

    private static IReadOnlyList<int> IdsOf(AliasRegistry<int> registry, params string[] aliases) =>
        [.. aliases.Select(registry.IdOf).Order()];

    private static Action<SeedContextBuilder> Gallery() =>
        builder =>
            builder.Gallery(gallery =>
                gallery
                    .AddAlbum(
                        "published",
                        "Prunksitzung",
                        sessionStartYear: 2025,
                        publishedAt: Published
                    )
                    .AddAlbum("unpublished", "Probe", sessionStartYear: 2025)
                    .AddAlbum(
                        "binned",
                        "Weg",
                        sessionStartYear: 2025,
                        publishedAt: Published,
                        binnedAt: Withdrawn
                    )
                    .AddGalleryItem("selected", albumAlias: "published", selectionPosition: 1)
                    .AddGalleryItem("unselected", albumAlias: "published")
                    .AddGalleryItem(
                        "processing",
                        albumAlias: "published",
                        selectionPosition: 3,
                        state: MediaItemState.Processing
                    )
                    .AddGalleryItem(
                        "in-unpublished",
                        albumAlias: "unpublished",
                        selectionPosition: 1
                    )
                    .AddGalleryItem("in-binned", albumAlias: "binned", selectionPosition: 1)
            );
}
