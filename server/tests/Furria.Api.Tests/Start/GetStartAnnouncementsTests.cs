using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartAnnouncementsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly Yesterday = new(2027, 1, 18);
    private static readonly DateOnly Today = new(2027, 1, 19);

    private static readonly DateTimeOffset TuesdayEvening = new(
        2027,
        1,
        19,
        18,
        50,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetStartAnnouncementsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListAnAnnouncement_When_ItWasPublishedAfterHerLastVisit()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                            "busfahrt",
                            "karin",
                            "Busfahrt zum Rosenmontagsumzug",
                            "Abfahrt 9 Uhr am Markt.",
                            TuesdayEvening.AddDays(-1)
                        ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);
                await MarkSeenAsync(client, TuesdayEvening.AddDays(-3));

                var start = await StartOfAsync(client);

                var announcement = Assert.Single(AnnouncementsOf(start));
                Assert.Equal(ctx.Club.Announcements.IdOf("busfahrt"), announcement.AnnouncementId);
                Assert.Equal("Busfahrt zum Rosenmontagsumzug", announcement.Title);
                Assert.Equal("Abfahrt 9 Uhr am Markt.", announcement.Body);
                Assert.Equal(TuesdayEvening.AddDays(-1), announcement.PublishedAt);
                Assert.NotNull(announcement.Author);
                Assert.Equal(ctx.Identity.People.IdOf("karin"), announcement.Author.PersonId);
                Assert.Equal("Karin", announcement.Author.FirstName);
                Assert.Equal("Aushang", announcement.Author.LastName);
                Assert.Null(announcement.Author.OfficeName);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnAnnouncement_When_SheSawTheBoardAfterItWasPublished()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                                "gelesen",
                                "karin",
                                "Kartenvorverkauf",
                                "Ab Samstag.",
                                TuesdayEvening.AddDays(-2)
                            )
                            .AddAnnouncement(
                                "neu",
                                "karin",
                                "Sessionsorden sind da",
                                "Abholung im Vereinsraum.",
                                TuesdayEvening.AddHours(-1)
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);
                await MarkSeenAsync(client, TuesdayEvening.AddDays(-1));

                var start = await StartOfAsync(client);

                Assert.Equal(
                    [ctx.Club.Announcements.IdOf("neu")],
                    AnnouncementsOf(start).Select(announcement => announcement.AnnouncementId)
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnAnnouncement_When_ItWasPublishedMoreThanSixtyDaysAgo()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                                "alt",
                                "karin",
                                "Helfer fürs Sommerfest",
                                "Bitte melden.",
                                TuesdayEvening.AddDays(-61)
                            )
                            .AddAnnouncement(
                                "noch-frisch",
                                "karin",
                                "Jahreshauptversammlung",
                                "Einladung folgt.",
                                TuesdayEvening.AddDays(-59)
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);

                var start = await StartOfAsync(client);

                Assert.Equal(
                    [ctx.Club.Announcements.IdOf("noch-frisch")],
                    AnnouncementsOf(start).Select(announcement => announcement.AnnouncementId)
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnAnnouncement_When_ItsValidUntilHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                                "abgelaufen",
                                "karin",
                                "Probe fällt aus",
                                "Gestern keine Probe.",
                                TuesdayEvening.AddDays(-3),
                                Yesterday
                            )
                            .AddAnnouncement(
                                "heute-gueltig",
                                "karin",
                                "Halle heute zu",
                                "Heute keine Halle.",
                                TuesdayEvening.AddDays(-3),
                                Today
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);

                var start = await StartOfAsync(client);

                Assert.Equal(
                    [ctx.Club.Announcements.IdOf("heute-gueltig")],
                    AnnouncementsOf(start).Select(announcement => announcement.AnnouncementId)
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnAnnouncement_When_SheWroteIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                            "eigener",
                            "lena",
                            "Mitfahrgelegenheit",
                            "Zwei Plätze frei.",
                            TuesdayEvening.AddDays(-1)
                        ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);

                var start = await StartOfAsync(client);

                Assert.Empty(AnnouncementsOf(start));
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnnouncements_When_TheViewerHoldsNoClubRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                            "busfahrt",
                            "karin",
                            "Busfahrt zum Rosenmontagsumzug",
                            "Abfahrt 9 Uhr am Markt.",
                            TuesdayEvening.AddDays(-1)
                        ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("kevin", ct);

                var start = await StartOfAsync(client);

                Assert.True(start.ViewerIsActiveInClub);
                Assert.Empty(AnnouncementsOf(start));
            }
        );
    }

    [Fact]
    public async Task Should_NameTheAuthorsOffice_When_TheAuthorHoldsABoardSeat()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat("frank-praesident", "praesident", "frank", JoinedIn2015)
                            .AddAnnouncement(
                                "orden",
                                "frank",
                                "Sessionsorden sind da",
                                "Abholung im Vereinsraum.",
                                TuesdayEvening.AddDays(-1)
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);

                var start = await StartOfAsync(client);

                var announcement = Assert.Single(AnnouncementsOf(start));
                Assert.NotNull(announcement.Author);
                Assert.Equal(ctx.Identity.People.IdOf("frank"), announcement.Author.PersonId);
                Assert.Equal("Präsident", announcement.Author.OfficeName);
            }
        );
    }

    private static IReadOnlyList<StartAnnouncementDto> AnnouncementsOf(GetStartResponse start) =>
        start
            .Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.Announcements)
            ?.Announcements
        ?? [];

    private static async Task<GetStartResponse> StartOfAsync(HttpClient client)
    {
        var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return start;
    }

    private static async Task MarkSeenAsync(HttpClient client, DateTimeOffset seenUpTo)
    {
        var (response, _) = await client.PUTAsync<
            PutMyLastSeenAnnouncement,
            PutMyLastSeenAnnouncementRequest,
            EmptyResponse
        >(new PutMyLastSeenAnnouncementRequest { SeenUpTo = seenUpTo });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private Task<SeededContext> BuildClubAsync(
        Action<ClubSeedBuilder> arrangeBoard,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
            {
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("lena", "Lena", "Garde")
                            .AddAccount("lena")
                            .AddMembership("lena-member", "lena", JoinedIn2015)
                            .AddPerson("karin", "Karin", "Aushang")
                            .AddMembership("karin-member", "karin", JoinedIn2015)
                            .AddPerson("frank", "Frank", "Präsident")
                            .AddMembership("frank-member", "frank", JoinedIn2015)
                            .AddPerson("kevin", "Kevin", "Ballett")
                            .AddAccount("kevin")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("maennerballett", "Männerballett")
                            .AddGroupMembership(
                                "kevin-maennerballett",
                                "maennerballett",
                                "kevin",
                                JoinedIn2015
                            )
                    );
                builder.Club(arrangeBoard);
            },
            ct
        );
}
