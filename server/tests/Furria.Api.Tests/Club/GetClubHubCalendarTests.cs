using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class GetClubHubCalendarTests
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset StartedAnHourAgo = new(
        2027,
        1,
        15,
        11,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset EndsThisAfternoon = new(
        2027,
        1,
        15,
        15,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset StartedTwoHoursAgo = new(
        2027,
        1,
        15,
        10,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset StartedBeforeDawn = new(
        2027,
        1,
        15,
        5,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset Tomorrow = new(2027, 1, 16, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset DayAfterTomorrow = new(
        2027,
        1,
        17,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset NextWeek = new(2027, 1, 22, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset InTwoWeeks = new(2027, 1, 29, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset LastNight = new(2027, 1, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset EndedLastNight = new(
        2027,
        1,
        14,
        22,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetClubHubCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryNoEntry_When_TheCalendarIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var result = await ReadTheHubAsync(_ => { }, ct);

                Assert.Empty(result.Calendar);
            }
        );
    }

    [Fact]
    public async Task Should_PutTheRunningEntryFirst_When_OneIsUnderway()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var result = await ReadTheHubAsync(
                    club =>
                        club.AddCalendarEntry("morgen", "Kostümprobe", Tomorrow)
                            .AddCalendarEntry(
                                "jetzt",
                                "Sitzung",
                                StartedAnHourAgo,
                                EndsThisAfternoon
                            ),
                    ct
                );

                Assert.Collection(
                    result.Calendar,
                    entry =>
                    {
                        Assert.Equal("Sitzung", entry.Title);
                        Assert.True(entry.IsRunning);
                    },
                    entry =>
                    {
                        Assert.Equal("Kostümprobe", entry.Title);
                        Assert.False(entry.IsRunning);
                    }
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryAtMostThreeEintraege_When_MoreAreRecorded()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var result = await ReadTheHubAsync(
                    club =>
                        club.AddCalendarEntry("morgen", "Kostümprobe", Tomorrow)
                            .AddCalendarEntry("uebermorgen", "Stellprobe", DayAfterTomorrow)
                            .AddCalendarEntry("naechste-woche", "Umzug", NextWeek)
                            .AddCalendarEntry("in-zwei-wochen", "Sommerfest", InTwoWeeks)
                            .AddCalendarEntry(
                                "jetzt",
                                "Sitzung",
                                StartedAnHourAgo,
                                EndsThisAfternoon
                            ),
                    ct
                );

                Assert.Equal(
                    new[] { "Sitzung", "Kostümprobe", "Stellprobe" },
                    result.Calendar.Select(entry => entry.Title).ToArray()
                );
            }
        );
    }

    [Fact]
    public async Task Should_KeepAnEntryThatBeganEarlierToday_When_ItHasNotEndedYet()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var result = await ReadTheHubAsync(
                    club =>
                        club.AddCalendarEntry("heute-morgen", "Aufbau", StartedTwoHoursAgo)
                            .AddCalendarEntry("im-morgengrauen", "Frühschoppen", StartedBeforeDawn)
                            .AddCalendarEntry("gestern", "Ausschuss", LastNight, EndedLastNight),
                    ct
                );

                var entry = Assert.Single(result.Calendar);
                Assert.Equal("Aufbau", entry.Title);
                Assert.True(entry.IsRunning);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAGroupEntry_When_TheGroupOwnsItAtClubVisibility()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var result = await ReadTheHubAsync(
                    club =>
                        club.AddCalendarEntry(
                                "gruppentraining",
                                "Training der Tanzgarde",
                                Tomorrow,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Club,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry("vereinsprobe", "Stellprobe", DayAfterTomorrow),
                    ct
                );

                var entry = Assert.Single(result.Calendar);
                Assert.Equal("Stellprobe", entry.Title);
            }
        );
    }

    [Fact]
    public async Task Should_NameTheVenue_When_TheEntryIsHeldSomewhere()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var result = await ReadTheHubAsync(
                    club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddCalendarEntry(
                                "morgen",
                                "Kostümprobe",
                                Tomorrow,
                                venueAlias: "buehnenhaus"
                            )
                            .AddCalendarEntry("uebermorgen", "Stellprobe", DayAfterTomorrow),
                    ct
                );

                Assert.Collection(
                    result.Calendar,
                    entry => Assert.Equal("Bühnenhaus", entry.VenueName),
                    entry => Assert.Null(entry.VenueName)
                );
            }
        );
    }

    private async Task<GetClubHubResponse> ReadTheHubAsync(
        Action<ClubSeedBuilder> club,
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Club(club),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
