using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartAnnouncementAddOnsTests : IClassFixture<ApiTestFixture>
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

    public GetStartAnnouncementAddOnsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveOutClosedAddOns_When_ClosedByHandByTheirTimeOrByTheAnnouncement()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddAnnouncement(
                                "aktuell",
                                "karin",
                                "Helfer",
                                "Bitte eintragen.",
                                TuesdayEvening.AddDays(-2),
                                attendance: new AnnouncementAttendanceIntent(
                                    ClosedAt: TuesdayEvening.AddHours(-1)
                                )
                            )
                            .AddAnnouncementPoll(
                                "von-hand",
                                "aktuell",
                                "Termin?",
                                ["Freitag", "Samstag"],
                                closedAt: TuesdayEvening.AddHours(-2)
                            )
                            .AddAnnouncementSignUpList(
                                "abgelaufen",
                                "aktuell",
                                "Theke",
                                signUpUntil: TuesdayEvening.AddMinutes(-5)
                            )
                            .AddAnnouncementPoll(
                                "offen",
                                "aktuell",
                                "Farbe?",
                                ["Rot", "Weiß"],
                                position: 3
                            )
                            .AddAnnouncement(
                                "abgehängt",
                                "karin",
                                "Altes Treffen",
                                "Wer kommt?",
                                TuesdayEvening.AddDays(-5),
                                validUntil: Yesterday,
                                attendance: new AnnouncementAttendanceIntent()
                            ),
                    ct
                );

                var start = await StartOfAsync(ctx, "lena");

                var aktuell = Assert.Single(AnnouncementAddOnsOf(start));
                Assert.Equal(ctx.Club.Announcements.IdOf("aktuell"), aktuell.AnnouncementId);
                Assert.Null(aktuell.Attendance);
                Assert.Equal(
                    [ctx.Club.Polls.IdOf("offen")],
                    aktuell.OpenPolls.Select(poll => poll.PollId)
                );
                Assert.Empty(aktuell.OpenSignUpLists);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnnouncementAddOns_When_HerMembershipIsPaused()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    OwedSommerfest,
                    ct,
                    identity =>
                        identity.AddMembershipPause(
                            "lena-pause",
                            "lena-member",
                            ClubSession.YearOf(Today)
                        )
                );

                Assert.Empty(AnnouncementAddOnsOf(await StartOfAsync(ctx, "lena")));
            }
        );
    }

    [Fact]
    public async Task Should_ListATakenOverAddOnOnlyUnderItsEntry_When_TheAnnouncementBorrowsIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(
                    club =>
                        club.AddCalendarEntry(
                                "stammtisch",
                                "Stammtisch",
                                TuesdayEvening.AddDays(2),
                                audience: CalendarEntryAudience.Club
                            )
                            .AddCalendarPoll("getraenke", "stammtisch", "Bier?", ["Ja", "Nein"])
                            .AddAnnouncement(
                                "hinweis",
                                "karin",
                                "Stammtisch",
                                "Siehe Kalender.",
                                TuesdayEvening.AddDays(-1)
                            )
                            .AddAnnouncementLoan(
                                "hinweis",
                                "stammtisch",
                                AnnouncementAddOnKind.Poll,
                                "getraenke",
                                position: 0
                            ),
                    ct
                );

                var start = await StartOfAsync(ctx, "lena");

                Assert.Empty(AnnouncementAddOnsOf(start));
                var entry = Assert.Single(EntriesOf(start));
                Assert.Equal(
                    [ctx.Club.Polls.IdOf("getraenke")],
                    entry.OpenPolls.Select(poll => poll.PollId)
                );
            }
        );
    }

    private static void OwedSommerfest(ClubSeedBuilder club) =>
        club.AddAnnouncement(
            "sommerfest",
            "karin",
            "Sommerfest",
            "Wer kommt?",
            TuesdayEvening.AddDays(-2),
            attendance: new AnnouncementAttendanceIntent()
        );

    private static StartPanelDto? CalendarPanelOf(GetStartResponse start) =>
        start.Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.Calendar);

    private static IReadOnlyList<StartAnnouncementAddOnsDto> AnnouncementAddOnsOf(
        GetStartResponse start
    ) => CalendarPanelOf(start)?.AnnouncementAddOns ?? [];

    private static IReadOnlyList<StartEntryDto> EntriesOf(GetStartResponse start) =>
        CalendarPanelOf(start)?.Entries ?? [];

    private static async Task<GetStartResponse> StartOfAsync(SeededContext ctx, string personAlias)
    {
        var client = await ctx.Identity.ClientForAsync(
            personAlias,
            TestContext.Current.CancellationToken
        );
        var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return start;
    }

    private Task<SeededContext> BuildClubAsync(
        Action<ClubSeedBuilder> arrangeBoard,
        CancellationToken ct,
        Action<IdentitySeedBuilder>? arrangePeople = null
    ) =>
        _fixture.BuildAsync(
            builder =>
            {
                builder
                    .Identity(identity =>
                    {
                        identity
                            .AddPerson("lena", "Lena", "Garde")
                            .AddAccount("lena")
                            .AddMembership("lena-member", "lena", JoinedIn2015)
                            .AddPerson("karin", "Karin", "Aushang")
                            .AddAccount("karin")
                            .AddMembership("karin-member", "karin", JoinedIn2015)
                            .AddPerson("kevin", "Kevin", "Ballett")
                            .AddAccount("kevin");
                        arrangePeople?.Invoke(identity);
                    })
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
