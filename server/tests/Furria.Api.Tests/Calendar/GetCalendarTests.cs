using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Api.Tests.RunningOrders;
using Furria.Api.Tests.Studio;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class GetCalendarTests : IClassFixture<ApiTestFixture>
{
    private const string ClubMeeting = "Vereinssitzung";
    private const string Parade = "Rosenmontagsumzug";
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const string DanceGuardPerformance = "Auftritt der Tanzgarde";
    private const string DanceGuardParty = "Gardefeier";
    private const string KinderTraining = "Training der Kindergarde";
    private const string KinderRehearsal = "Probe der Kindergarde";
    private const string FormerGuardReunion = "Treffen der Altgarde";
    private const string SurprisePlanning = "Überraschung planen";
    private const string Gala = "1. Prunksitzung";
    private const string ClubTrip = "Vereinsfahrt";
    private const string KickOff = "Auftakt";
    private const int NinetyMinutes = 90;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedLastSummer = new(2026, 6, 30);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheDanceGuardTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheDanceGuardPerformance = new(
        2027,
        1,
        19,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheMeeting = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheDanceGuardParty = new(
        2027,
        1,
        21,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheKinderTraining = new(
        2027,
        1,
        22,
        16,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheParade = new(2027, 2, 10, 11, 0, 0, TimeSpan.Zero);

    private static readonly DateOnly TheAuftrittDay = new(2027, 1, 19);
    private static readonly TimeOnly HalfPastSeven = new(19, 30);
    private static readonly TimeOnly NineInTheEvening = new(21, 0);
    private static readonly GetCalendarRequest UsualTimesWindow = new()
    {
        From = new DateOnly(2027, 1, 11),
        To = new DateOnly(2027, 1, 31),
    };
    private static readonly DateOnly TheMeetingDay = new(2027, 1, 20);

    private readonly ApiTestFixture _fixture;

    public GetCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("alice", DanceGuardTraining, false)]
    [InlineData("bea", DanceGuardTraining, true)]
    [InlineData("chris", DanceGuardTraining, true)]
    [InlineData("alice", ClubMeeting, true)]
    public async Task Should_TellWhetherSheMayAnswer_When_SheReadsTheCalendar(
        string alias,
        string title,
        bool mayAnswer
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(ctx, alias, new GetCalendarRequest(), ct);

                Assert.Equal(
                    mayAnswer,
                    result.Entries.Single(entry => entry.Title == title).MayAnswer
                );
            }
        );
    }

    [Theory]
    [InlineData("alice", false)]
    [InlineData("bea", true)]
    [InlineData("chris", true)]
    public async Task Should_ShowAChosenPeopleEntryOnlyToTheChosenAndItsScheduler_When_ItIsRead(
        string viewerAlias,
        bool shown
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildChosenPeopleEntryAsync(ct);

                var result = await ReadAsync(ctx, viewerAlias, new GetCalendarRequest(), ct);

                Assert.Equal(shown, TitlesOf(result).Contains(SurprisePlanning));
            }
        );
    }

    [Fact]
    public async Task Should_CarryOnlyHerGroupsEntries_When_SheRunsAGroupWithoutBeingAMember()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "dora",
                    new GetCalendarRequest { Scope = CalendarScope.All },
                    ct
                );

                Assert.Equal(
                    new[] { DanceGuardTraining, DanceGuardPerformance, DanceGuardParty },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_ListAGroupOnlyEntry_When_TheViewerIsInAParticipatingGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildGroupOnlyEntriesAsync(ct);

                var result = await ReadAsync(ctx, "bea", new GetCalendarRequest(), ct);

                Assert.Contains(KinderRehearsal, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnArchivedGroupsEntry_When_SheHasNoClubMembership()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildGroupOnlyEntriesAsync(ct);

                var result = await ReadAsync(ctx, "dora", new GetCalendarRequest(), ct);

                Assert.DoesNotContain(FormerGuardReunion, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_CarryAnEntryThatStartedBeforeTheWindow_When_ItStillRunsIntoIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(WholeClub)
                            .Club(club =>
                                club.AddCalendarEntry(
                                        "trip",
                                        ClubTrip,
                                        AtTheDanceGuardTraining,
                                        endsAt: AtTheMeeting
                                    )
                                    .AddCalendarEntry(
                                        "training",
                                        DanceGuardTraining,
                                        AtTheDanceGuardTraining
                                    )
                            ),
                    ct
                );

                var result = await ReadAsync(
                    ctx,
                    "alice",
                    new GetCalendarRequest { From = TheAuftrittDay, To = TheMeetingDay },
                    ct
                );

                Assert.Equal(new[] { ClubTrip }, TitlesOf(result));
            }
        );
    }

    [Theory]
    [InlineData(ClubTrip)]
    [InlineData(KickOff)]
    public async Task Should_CarryNoOpenFunction_When_EveryFunctionOfTheEntryHasClosed(string title)
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildOpenFunctionsAsync(ct);

                var result = await ReadAsync(ctx, "alice", new GetCalendarRequest(), ct);

                Assert.Empty(result.Entries.Single(entry => entry.Title == title).OpenFunctions);
            }
        );
    }

    private Task<SeededContext> BuildOpenFunctionsAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Club(club =>
                        club.AddCalendarEntry("club-meeting", ClubMeeting, AtTheMeeting)
                            .AddCalendarPoll(
                                "food",
                                "club-meeting",
                                "Was essen wir?",
                                ["Pizza", "Suppe"],
                                position: 0
                            )
                            .AddCalendarPollVote("food", "Pizza", "alice")
                            .AddCalendarPoll(
                                "drinks",
                                "club-meeting",
                                "Was trinken wir?",
                                ["Saft", "Tee"],
                                position: 1
                            )
                            .AddCalendarPollVote("drinks", "Tee", "bea")
                            .AddCalendarPoll(
                                "secret",
                                "club-meeting",
                                "Wer wird Prinz?",
                                ["Bea", "Dora"],
                                isAnonymous: true,
                                position: 2
                            )
                            .AddCalendarPollVote("secret", "Dora", "alice")
                            .AddCalendarSignUpList(
                                "bring",
                                "club-meeting",
                                "Mitbringen",
                                position: 3
                            )
                            .AddCalendarSignUpLine("alice-bring", "bring", "alice", "Salat")
                            .AddCalendarSignUpList("setup", "club-meeting", "Aufbau", position: 4)
                            .AddCalendarPoll(
                                "music",
                                "club-meeting",
                                "Welche Musik?",
                                ["Schlager", "Polka"],
                                closedAt: Now.AddDays(-1),
                                position: 5
                            )
                            .AddCalendarEntry("club-trip", ClubTrip, AtTheParade)
                            .AddCalendarPoll(
                                "bus",
                                "club-trip",
                                "Welcher Bus?",
                                ["Früh", "Spät"],
                                votesUntil: Now.AddHours(-1)
                            )
                            .AddCalendarPoll(
                                "parking",
                                "club-trip",
                                "Wo parken wir?",
                                ["Hof", "Straße"],
                                votesUntil: Now
                            )
                            .AddCalendarSignUpList(
                                "seats",
                                "club-trip",
                                "Sitzplätze",
                                closedAt: Now.AddDays(-2)
                            )
                            .AddCalendarEntry("kick-off", KickOff, Now.AddHours(-1))
                            .AddCalendarPoll(
                                "kick-off-snacks",
                                "kick-off",
                                "Welche Snacks?",
                                ["Brezeln", "Chips"]
                            )
                    ),
            ct
        );

    private static string[] TitlesOf(GetCalendarResponse result) =>
        [.. result.Entries.Select(entry => entry.Title)];

    [Fact]
    public async Task Should_LeaveOutTheEvent_When_ItIsStillInPreparation()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(WholeClub)
                            .Club(club =>
                                club.AddVenue("buergerhaus", "Bürgerhaus")
                                    .AddEvent("gala", Gala, AtTheMeeting, "buergerhaus")
                                    .AddEvent(
                                        "in-preparation",
                                        "Kappenabend",
                                        AtTheMeeting.AddDays(1),
                                        "buergerhaus",
                                        unpublished: true
                                    )
                            ),
                    ct
                );

                var result = await ReadAsync(
                    ctx,
                    "alice",
                    new GetCalendarRequest { Scope = CalendarScope.Club },
                    ct
                );

                Assert.Equal([Gala], TitlesOf(result));
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
            .AddMembership("bea-first", "bea", JoinedIn2017)
            .AddPerson("chris", "Chris", "Trainer")
            .AddAccount("chris")
            .AddMembership("chris-first", "chris", JoinedIn2017)
            .AddPerson("dora", "Dora", "Leitung")
            .AddAccount("dora");

    private Task<SeededContext> BuildCalendarAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "dora-tanzgarde",
                                "tanzgarde",
                                "dora",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                AtTheDanceGuardTraining,
                                kind: CalendarEntryKind.Training,
                                venueAlias: "buehnenhaus",
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-auftritt",
                                DanceGuardPerformance,
                                AtTheDanceGuardPerformance,
                                kind: CalendarEntryKind.Trip,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-feier",
                                DanceGuardParty,
                                AtTheDanceGuardParty,
                                kind: CalendarEntryKind.Plain,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "kinder-training",
                                KinderTraining,
                                AtTheKinderTraining,
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "kindergarde"
                            )
                            .AddCalendarEntry(
                                "club-meeting",
                                ClubMeeting,
                                AtTheMeeting,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "parade",
                                Parade,
                                AtTheParade,
                                kind: CalendarEntryKind.Trip
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

    private Task<SeededContext> BuildChosenPeopleEntryAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupMembership(
                                "alice-tanzgarde",
                                "tanzgarde",
                                "alice",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                            "garde-surprise",
                            SurprisePlanning,
                            AtTheMeeting,
                            ownerGroupAlias: "tanzgarde",
                            audiencePersonAliases: ["bea"]
                        )
                    ),
            ct
        );

    private Task<SeededContext> BuildGroupOnlyEntriesAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedLastSummer)
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupMembership("bea-altgarde", "altgarde", "bea", JoinedIn2017)
                            .AddGroupMembership("dora-altgarde", "altgarde", "dora", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "kinder-probe",
                                KinderRehearsal,
                                AtTheKinderTraining,
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "kindergarde",
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "altgarde-treffen",
                                FormerGuardReunion,
                                AtTheMeeting,
                                ownerGroupAlias: "altgarde"
                            )
                    ),
            ct
        );

    [Fact]
    public Task Should_ShowTheGroupOnlyTrainingAndAskHer_When_SheIsAGuestInTheCastOfTheGroupsAct() =>
        _fixture.AtInstantAsync(
            RunningOrderSeeds.InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var today = _fixture.Today;
                var ctx = await _fixture.BuildAsync(
                    builder =>
                    {
                        StudioSeeds.GardeWithDancers(today)(builder);
                        builder
                            .Identity(identity =>
                                identity.AddMembership(
                                    "clara-member",
                                    RunningOrderSeeds.Clara,
                                    JoinedIn2017
                                )
                            )
                            .Club(club =>
                                club.AddCalendarEntry(
                                    "garde-only-training",
                                    DanceGuardTraining,
                                    ClubClock.At(today.AddDays(2), new TimeOnly(18, 30)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: RunningOrderSeeds.Garde,
                                    asksForResponse: true
                                )
                            );
                    },
                    ct
                );
                await StudioSteps.GardetanzAsync(
                    ctx,
                    ct,
                    added: [ctx.Identity.People.IdOf(RunningOrderSeeds.Clara)]
                );

                var result = await ReadAsync(
                    ctx,
                    RunningOrderSeeds.Clara,
                    new GetCalendarRequest { From = today, To = today.AddDays(7) },
                    ct
                );

                var training = Assert.Single(
                    result.Entries,
                    entry =>
                        entry.CalendarEntryId
                        == ctx.Club.CalendarEntries.IdOf("garde-only-training")
                );
                Assert.True(training.AsksForResponse);
            }
        );

    [Fact]
    public Task Should_ShowACastGuestOnlyTheTrainingsOfHerActsSession_When_SheIsNoClubMember() =>
        _fixture.AtInstantAsync(
            RunningOrderSeeds.InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var today = _fixture.Today;
                var nextSession = today.AddYears(1);
                var ctx = await _fixture.BuildAsync(
                    builder =>
                    {
                        StudioSeeds.GardeWithDancers(today)(builder);
                        builder.Club(club =>
                            club.AddCalendarEntry(
                                    "this-session-training",
                                    DanceGuardTraining,
                                    ClubClock.At(today.AddDays(2), new TimeOnly(18, 30)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: RunningOrderSeeds.Garde,
                                    asksForResponse: true
                                )
                                .AddCalendarEntry(
                                    "next-session-training",
                                    DanceGuardTraining,
                                    ClubClock.At(nextSession, new TimeOnly(18, 30)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: RunningOrderSeeds.Garde,
                                    asksForResponse: true
                                )
                        );
                    },
                    ct
                );
                await StudioSteps.GardetanzAsync(
                    ctx,
                    ct,
                    added: [ctx.Identity.People.IdOf(RunningOrderSeeds.Clara)]
                );

                var result = await ReadAsync(
                    ctx,
                    RunningOrderSeeds.Clara,
                    new GetCalendarRequest { From = today, To = nextSession },
                    ct
                );

                Assert.Equal(
                    [ctx.Club.CalendarEntries.IdOf("this-session-training")],
                    result
                        .Entries.Where(entry => entry.Title == DanceGuardTraining)
                        .Select(entry => entry.CalendarEntryId)
                );
            }
        );

    [Fact]
    public async Task Should_CarryAGroupsUsualTrainingTimeOnEachComingWeekday_When_TheGroupStatesOne()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildUsualTimesAsync(club => club, ct);

                var result = await ReadAsync(ctx, "bea", UsualTimesWindow, ct);

                Assert.Equal(
                    [
                        (
                            ClubClock.At(new DateOnly(2027, 1, 19), HalfPastSeven),
                            ClubClock.At(new DateOnly(2027, 1, 19), NineInTheEvening),
                            (string?)"Bühnenhaus"
                        ),
                        (
                            ClubClock.At(new DateOnly(2027, 1, 26), HalfPastSeven),
                            ClubClock.At(new DateOnly(2027, 1, 26), NineInTheEvening),
                            (string?)"Bühnenhaus"
                        ),
                    ],
                    UsualOf(result, "Tanzgarde")
                        .Select(usual => (usual.StartsAt, usual.EndsAt, usual.VenueName))
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheUsualTrainingTime_When_TheGroupPlannedATrainingThatDay()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildUsualTimesAsync(
                    club =>
                        club.AddCalendarEntry(
                            "garde-training",
                            DanceGuardTraining,
                            ClubClock.At(new DateOnly(2027, 1, 19), new TimeOnly(18, 0)),
                            kind: CalendarEntryKind.Training,
                            ownerGroupAlias: "tanzgarde"
                        ),
                    ct
                );

                var result = await ReadAsync(ctx, "alice", UsualTimesWindow, ct);

                Assert.Equal(
                    [new DateOnly(2027, 1, 26)],
                    UsualOf(result, "Tanzgarde").Select(usual => ClubClock.DayOf(usual.StartsAt))
                );
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheUsualTrainingTime_When_TheGroupOnlyPerformsThatDay()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildUsualTimesAsync(
                    club =>
                        club.AddCalendarEntry(
                            "garde-auftritt",
                            DanceGuardPerformance,
                            ClubClock.At(new DateOnly(2027, 1, 19), new TimeOnly(18, 0)),
                            kind: CalendarEntryKind.Trip,
                            ownerGroupAlias: "tanzgarde"
                        ),
                    ct
                );

                var result = await ReadAsync(ctx, "bea", UsualTimesWindow, ct);

                Assert.Equal(2, UsualOf(result, "Tanzgarde").Count());
            }
        );
    }

    private static IEnumerable<UsualTrainingDto> UsualOf(
        GetCalendarResponse result,
        string groupName
    ) => result.UsualTrainings.Where(usual => usual.GroupName == groupName);

    private Task<SeededContext> BuildUsualTimesAsync(
        Func<ClubSeedBuilder, ClubSeedBuilder> planned,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedLastSummer)
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                    )
                    .Club(club =>
                        planned(
                            club.AddVenue("buehnenhaus", "Bühnenhaus")
                                .AddUsualTrainingTime(
                                    "garde-dienstags",
                                    "tanzgarde",
                                    DayOfWeek.Tuesday,
                                    HalfPastSeven,
                                    NinetyMinutes,
                                    "buehnenhaus"
                                )
                                .AddUsualTrainingTime(
                                    "kinder-freitags",
                                    "kindergarde",
                                    DayOfWeek.Friday,
                                    new TimeOnly(16, 0),
                                    NinetyMinutes
                                )
                                .AddUsualTrainingTime(
                                    "altgarde-mittwochs",
                                    "altgarde",
                                    DayOfWeek.Wednesday,
                                    HalfPastSeven,
                                    NinetyMinutes
                                )
                        )
                    ),
            ct
        );

    private static async Task<GetCalendarResponse> ReadAsync(
        SeededContext ctx,
        string alias,
        GetCalendarRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.GETAsync<
            GetCalendar,
            GetCalendarRequest,
            GetCalendarResponse
        >(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
