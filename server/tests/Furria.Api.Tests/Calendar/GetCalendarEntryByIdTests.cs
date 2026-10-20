using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class GetCalendarEntryByIdTests : IClassFixture<ApiTestFixture>
{
    private const string ClubMeeting = "Vereinssitzung";
    private const string LastSessionsParade = "Rosenmontagsumzug 2026";
    private const string NextSummerFestival = "Sommerfest 2028";
    private const string DanceGuardTraining = "Training der Tanzgarde";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheMeeting = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtLastSessionsParade = new(
        2026,
        2,
        16,
        11,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtNextSummerFestival = new(
        2028,
        7,
        1,
        15,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetCalendarEntryByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("parade", LastSessionsParade)]
    [InlineData("festival", NextSummerFestival)]
    public async Task Should_CarryTheEntry_When_ItLiesOutsideTheUpcomingWindow(
        string alias,
        string title
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf(alias),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(title, result.Entry.Title);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheViewersAnswer_When_SheHasAlreadyAnswered()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "bea",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.Equal(AttendanceAnswer.Yes, result.Entry.ViewerAnswer);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheGroupInternalEntry_When_TheCallerBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, result) = await ReadAsync(
                    ctx,
                    "bea",
                    ctx.Club.CalendarEntries.IdOf("garde-training"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(DanceGuardTraining, result.Entry.Title);
            }
        );
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheGroupInternalEntryIsHiddenFromTheCaller()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, _) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("garde-training"),
                    ct
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheEventIsStillInPreparation()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, _) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.Events.IdOf("in-preparation"),
                    ct
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    private static void WholeClub(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("alice", "Alice", "Muster")
            .AddAccount("alice")
            .AddMembership("alice-first", "alice", JoinedIn2017)
            .AddPerson("bea", "Bea", "Garde")
            .AddAccount("bea")
            .AddMembership("bea-first", "bea", JoinedIn2017);

    private Task<SeededContext> BuildCalendarAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                AtTheTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "club-meeting",
                                ClubMeeting,
                                AtTheMeeting,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "parade",
                                LastSessionsParade,
                                AtLastSessionsParade,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Public
                            )
                            .AddCalendarEntry("festival", NextSummerFestival, AtNextSummerFestival)
                            .AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent(
                                "in-preparation",
                                "Kappenabend",
                                AtTheMeeting.AddDays(1),
                                "buergerhaus",
                                unpublished: true
                            )
                            .AddAttendanceResponse(
                                "bea-says-yes",
                                "club-meeting",
                                "bea",
                                AttendanceAnswer.Yes
                            )
                    ),
            ct
        );

    private static async Task<TestResult<GetCalendarEntryByIdResponse>> ReadAsync(
        SeededContext ctx,
        string alias,
        int calendarEntryId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);

        return await client.GETAsync<
            GetCalendarEntryById,
            GetCalendarEntryByIdRequest,
            GetCalendarEntryByIdResponse
        >(new GetCalendarEntryByIdRequest { CalendarEntryId = calendarEntryId });
    }
}
