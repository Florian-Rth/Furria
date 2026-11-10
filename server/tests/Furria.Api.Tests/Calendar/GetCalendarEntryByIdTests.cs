using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Api.Tests.RunningOrders;
using Furria.Api.Tests.Studio;
using Furria.Application.Authorization;
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
    private const string SurprisePlanning = "Überraschung planen";

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

    private static readonly DateTimeOffset AtTheWorkshopEnd = new(
        2027,
        1,
        22,
        21,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheCastTraining = ClubClock.At(
        new DateOnly(2027, 2, 2),
        new TimeOnly(18, 30)
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
    public async Task Should_AnswerNotFound_When_SheIsNotChosenForTheEntry()
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
                    ctx.Club.CalendarEntries.IdOf("garde-surprise"),
                    ct
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheChosenPeople_When_SheIsChosenForTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, entry) = await ReadAsync(
                    ctx,
                    "bea",
                    ctx.Club.CalendarEntries.IdOf("garde-surprise"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(
                    (CalendarEntryAudience.People, $"{ctx.Identity.People.IdOf("bea")}"),
                    (
                        entry.Entry.Audience,
                        string.Join(
                            ",",
                            entry.Entry.AudiencePeople.Select(person => person.PersonId)
                        )
                    )
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryHerGroupsEntry_When_SheRunsTheGroupWithoutBeingAMember()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, result) = await ReadAsync(
                    ctx,
                    "dora",
                    ctx.Club.CalendarEntries.IdOf("garde-training"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(DanceGuardTraining, result.Entry.Title);
            }
        );
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_SheRunsAGroupAndReadsAClubEntry()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (response, _) = await ReadAsync(
                    ctx,
                    "dora",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
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

    [Fact]
    public async Task Should_SplitTheAnswers_When_TheEntryAsksForResponses()
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
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(
                    [CalendarEntryAddOnKind.Attendance],
                    result.Entry.AddOns.Select(addOn => addOn.Kind)
                );
                var attendance = result.Entry.Attendance!;
                Assert.Equal((1, 1, 1), (attendance.Yes, attendance.Maybe, attendance.No));
                Assert.False(attendance.IsClosed);
            }
        );
    }

    [Fact]
    public async Task Should_NameEveryAnswerAndWhoRecordedIt_When_SheSeesTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.Equal(
                    [
                        ("Bea", AttendanceAnswer.Yes, (string?)null),
                        ("Dora", AttendanceAnswer.No, null),
                        ("Mona", AttendanceAnswer.Maybe, "Bea"),
                    ],
                    result.Entry.Attendance!.Answers!.Select(answer =>
                        (answer.FirstName, answer.Answer, answer.RecordedByFirstName)
                    )
                );
            }
        );
    }

    [Fact]
    public async Task Should_KeepWhoHasNotAnsweredHidden_When_SheMayNotEditTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.Null(result.Entry.Attendance!.NotAnswered);
            }
        );
    }

    [Fact]
    public async Task Should_ListEveryoneConcernedWithoutAnAnswer_When_SheManagesTheClubCalendar()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "ilka",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                var attendance = result.Entry.Attendance!;
                Assert.Equal(
                    ["Alice", "Ilka", "Kai"],
                    attendance.NotAnswered!.Select(person => person.FirstName)
                );
                Assert.Contains("Dora", attendance.Answers!.Select(answer => answer.FirstName));
            }
        );
    }

    [Fact]
    public async Task Should_ListOnlyTheGroupWithoutAnAnswer_When_SheRunsTheOwnerGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "dora",
                    ctx.Club.CalendarEntries.IdOf("garde-call"),
                    ct
                );

                Assert.Equal(
                    ["Kai"],
                    result.Entry.Attendance!.NotAnswered!.Select(person => person.FirstName)
                );
            }
        );
    }

    [Fact]
    public async Task Should_ListOnlyTheChosenWithoutAnAnswer_When_TheEntryIsForChosenPeople()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "dora",
                    ctx.Club.CalendarEntries.IdOf("garde-dinner"),
                    ct
                );

                Assert.Equal(
                    ["Kai"],
                    result.Entry.Attendance!.NotAnswered!.Select(person => person.FirstName)
                );
            }
        );
    }

    [Theory]
    [InlineData("paul")]
    [InlineData("erik")]
    public async Task Should_LeaveOutTheMember_When_HerMembershipIsPausedOrEnded(string alias)
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "ilka",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.DoesNotContain(
                    ctx.Identity.People.IdOf(alias),
                    result.Entry.Attendance!.NotAnswered!.Select(person => person.PersonId)
                );
            }
        );
    }

    [Theory]
    [InlineData(-1, false)]
    [InlineData(0, true)]
    [InlineData(60, true)]
    public async Task Should_CloseTheAnswersAtTheEnd_When_TheEntryHasAnEnd(
        int minutesAfterTheEnd,
        bool isClosed
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AtTheWorkshopEnd.AddMinutes(minutesAfterTheEnd),
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("workshop"),
                    ct
                );

                Assert.Equal(isClosed, result.Entry.Attendance!.IsClosed);
            }
        );
    }

    [Fact]
    public Task Should_ListTheAddedCastWithoutAnAnswer_When_TheTrainingAsksTheCast() =>
        _fixture.AtInstantAsync(
            RunningOrderSeeds.InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await BuildCastTrainingAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    RunningOrderSeeds.GardeAdmin,
                    ctx.Club.CalendarEntries.IdOf("cast-training"),
                    ct
                );

                Assert.Equal(
                    ["Anna", "Ben", "Clara"],
                    result.Result.Entry.Attendance!.NotAnswered!.Select(person => person.FirstName)
                );
            }
        );

    [Fact]
    public async Task Should_ListTheFrozenCastWithoutAnAnswer_When_TheSessionHasClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        await _fixture.AtInstantAsync(
            RunningOrderSeeds.InTheRunningSession,
            async () => ctx = await BuildCastTrainingAsync(ct)
        );

        await _fixture.AtInstantAsync(
            RunningOrderSeeds.AfterItsAshWednesday,
            async () =>
            {
                await _fixture.FreezeActCastsAsync(ct);
                var seeded = ctx!;

                var client = await seeded.Identity.SignInAgainAsync(
                    RunningOrderSeeds.GardeAdmin,
                    ct
                );
                var result = await client.GETAsync<
                    GetCalendarEntryById,
                    GetCalendarEntryByIdRequest,
                    GetCalendarEntryByIdResponse
                >(
                    new GetCalendarEntryByIdRequest
                    {
                        CalendarEntryId = seeded.Club.CalendarEntries.IdOf("cast-training"),
                    }
                );

                Assert.Equal(HttpStatusCode.OK, result.Response.StatusCode);
                Assert.Equal(
                    ["Anna", "Clara", "Dora"],
                    result.Result.Entry.Attendance!.NotAnswered!.Select(person => person.FirstName)
                );
            }
        );
    }

    private async Task<SeededContext> BuildCastTrainingAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                StudioSeeds.GardeWithDancers(_fixture.Today)(builder);
                builder.Club(club =>
                    club.AddCalendarEntry(
                        "cast-training",
                        DanceGuardTraining,
                        AtTheCastTraining,
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

        return ctx;
    }

    [Fact]
    public async Task Should_CloseTheAnswers_When_TheEntryIsOver()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AtTheMeeting.AddHours(CalendarDefaults.OpenEndedHours),
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.True(result.Entry.Attendance!.IsClosed);
                Assert.Equal(3, result.Entry.Attendance.Answers!.Count);
            }
        );
    }

    [Fact]
    public async Task Should_CarryNoAttendance_When_TheEntryDoesNotAsk()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("festival"),
                    ct
                );

                Assert.Null(result.Entry.Attendance);
            }
        );
    }

    [Fact]
    public async Task Should_ShowCountsAndNamedVoters_When_ThePollIsNotAnonymous()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (response, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(
                    [
                        CalendarEntryAddOnKind.Attendance,
                        CalendarEntryAddOnKind.Poll,
                        CalendarEntryAddOnKind.Poll,
                        CalendarEntryAddOnKind.SignUpList,
                        CalendarEntryAddOnKind.SignUpList,
                    ],
                    result.Entry.AddOns.Select(addOn => addOn.Kind)
                );
                var poll = result.Entry.AddOns[1].Poll!;
                Assert.False(poll.IsClosed);
                Assert.Equal(2, poll.VoterCount);
                Assert.Equal(
                    [("Pizza", 2, true), ("Suppe", 0, false)],
                    poll.Options.Select(option =>
                        (option.Label, option.VoteCount, option.ViewerChose)
                    )
                );
                Assert.Equal(
                    ["Alice", "Bea"],
                    poll.Options[0].Voters.Select(voter => voter.FirstName)
                );
            }
        );
    }

    [Fact]
    public async Task Should_ShowOnlyCounts_When_ThePollIsAnonymous()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "bea",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                var poll = result.Entry.AddOns[2].Poll!;
                Assert.Equal([1, 0], poll.Options.Select(option => option.VoteCount));
                Assert.True(poll.Options[0].ViewerChose);
                Assert.All(poll.Options, option => Assert.Empty(option.Voters));
            }
        );
    }

    [Fact]
    public async Task Should_ShowThePollClosed_When_TheEntryHasStarted()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AtTheMeeting.AddMinutes(1),
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.All(
                    result.Entry.AddOns.Where(addOn => addOn.Poll is not null),
                    addOn => Assert.True(addOn.Poll!.IsClosed)
                );
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheStepsByDayThenTime_When_TheEntryCarriesADaySchedule()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (response, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("weekend-trip"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var schedule = Assert.Single(
                    result
                        .Entry.AddOns.Select(addOn => addOn.DaySchedule)
                        .OfType<CalendarDayScheduleDto>()
                );
                Assert.Equal("Ausflug", schedule.Title);
                Assert.Equal(
                    [
                        (0, new TimeOnly(8, 0), "Abfahrt"),
                        (0, new TimeOnly(20, 0), "Abendessen"),
                        (1, new TimeOnly(9, 0), "Frühstück"),
                        (1, new TimeOnly(15, 0), "Rückfahrt"),
                    ],
                    schedule.Steps.Select(step => (step.Day, step.Time, step.Text))
                );
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheLinesInSignUpOrderMarkingHerOwn_When_TheEntryCarriesAList()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (response, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var lists = result
                    .Entry.AddOns.Select(addOn => addOn.SignUpList)
                    .OfType<CalendarSignUpListDto>()
                    .ToList();
                Assert.Equal(
                    [("Mitbringen", false), ("Aufbau", true)],
                    lists.Select(list => (list.Title, list.IsClosed))
                );
                Assert.Equal(
                    [("Bea", "Salat", false), ("Alice", (string?)null, true)],
                    lists[0].Lines.Select(line => (line.FirstName, line.Text, line.ByViewer))
                );
            }
        );
    }

    [Theory]
    [InlineData("alice", "club-meeting", true)]
    [InlineData("alice", "garde-call", false)]
    [InlineData("bea", "garde-call", true)]
    [InlineData("dora", "garde-call", true)]
    [InlineData("ilka", "garde-call", false)]
    public async Task Should_TellWhetherSheMayAnswer_When_SheReadsTheEntry(
        string alias,
        string entryAlias,
        bool mayAnswer
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    alias,
                    ctx.Club.CalendarEntries.IdOf(entryAlias),
                    ct
                );

                Assert.Equal(mayAnswer, result.Entry.MayAnswer);
            }
        );
    }

    [Fact]
    public async Task Should_ListWhoHasNotVotedOrSignedUp_When_SheManagesTheClubCalendar()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "ilka",
                    ctx.Club.CalendarEntries.IdOf("club-meeting"),
                    ct
                );

                var food = PollOf(result, "Was essen wir?");
                var secret = PollOf(result, "Wer wird Prinz?");
                var bring = ListOf(result, "Mitbringen");
                Assert.Equal(5, food.ConcernedCount);
                Assert.Equal(["Ilka", "Kai", "Mona"], FirstNamesOf(food.NotAnswered));
                Assert.Equal(["Alice", "Ilka", "Kai", "Mona"], FirstNamesOf(secret.NotAnswered));
                Assert.Equal(5, bring.ConcernedCount);
                Assert.Equal(["Ilka", "Kai", "Mona"], FirstNamesOf(bring.NotAnswered));
            }
        );
    }

    [Fact]
    public async Task Should_CountEveryoneWhoAnsweredInTheTotal_When_AnOrganiserOutsideTheAudienceTakesPart()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "dora",
                    ctx.Club.CalendarEntries.IdOf("garde-party"),
                    ct
                );

                var drinks = PollOf(result, "Was trinken wir?");
                var chairs = ListOf(result, "Stühle");
                Assert.Equal(3, drinks.ConcernedCount);
                Assert.Equal(["Kai"], FirstNamesOf(drinks.NotAnswered));
                Assert.Equal(3, chairs.ConcernedCount);
                Assert.Equal(["Bea", "Kai"], FirstNamesOf(chairs.NotAnswered));
            }
        );
    }

    [Fact]
    public async Task Should_CountTheConcernedButHideWhoIsMissing_When_TheEntryIsNotMeantForHer()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPollsAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "alice",
                    ctx.Club.CalendarEntries.IdOf("garde-party"),
                    ct
                );

                var drinks = PollOf(result, "Was trinken wir?");
                var chairs = ListOf(result, "Stühle");
                Assert.False(result.Entry.MayAnswer);
                Assert.Equal(3, drinks.ConcernedCount);
                Assert.Null(drinks.NotAnswered);
                Assert.Equal(3, chairs.ConcernedCount);
                Assert.Null(chairs.NotAnswered);
            }
        );
    }

    private static CalendarPollDto PollOf(GetCalendarEntryByIdResponse result, string question) =>
        result
            .Entry.AddOns.Select(addOn => addOn.Poll)
            .OfType<CalendarPollDto>()
            .Single(poll => poll.Question == question);

    private static CalendarSignUpListDto ListOf(
        GetCalendarEntryByIdResponse result,
        string title
    ) =>
        result
            .Entry.AddOns.Select(addOn => addOn.SignUpList)
            .OfType<CalendarSignUpListDto>()
            .Single(list => list.Title == title);

    private static IReadOnlyList<string> FirstNamesOf(
        IReadOnlyList<CalendarAttendancePersonDto>? people
    ) => people is null ? [] : [.. people.Select(person => person.FirstName)];

    private Task<SeededContext> BuildPollsAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupMembership("kai-tanzgarde", "tanzgarde", "kai", JoinedIn2017)
                            .AddGroupAdmin(
                                "dora-tanzgarde",
                                "tanzgarde",
                                "dora",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "garde-party",
                                "Gardefeier",
                                AtTheMeeting.AddDays(1),
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarPoll(
                                "garde-drinks",
                                "garde-party",
                                "Was trinken wir?",
                                ["Saft", "Tee"]
                            )
                            .AddCalendarPollVote("garde-drinks", "Saft", "bea")
                            .AddCalendarPollVote("garde-drinks", "Tee", "dora")
                            .AddCalendarSignUpList("garde-chairs", "garde-party", "Stühle")
                            .AddCalendarSignUpLine("dora-chairs", "garde-chairs", "dora")
                            .AddCalendarEntry(
                                "club-meeting",
                                ClubMeeting,
                                AtTheMeeting,
                                asksForResponse: true
                            )
                            .AddCalendarPoll(
                                "food",
                                "club-meeting",
                                "Was essen wir?",
                                ["Pizza", "Suppe"],
                                position: 1
                            )
                            .AddCalendarPollVote("food", "Pizza", "bea")
                            .AddCalendarPollVote("food", "Pizza", "alice")
                            .AddCalendarPoll(
                                "secret",
                                "club-meeting",
                                "Wer wird Prinz?",
                                ["Bea", "Dora"],
                                isAnonymous: true,
                                position: 2
                            )
                            .AddCalendarPollVote("secret", "Bea", "bea")
                            .AddCalendarSignUpList(
                                "bring",
                                "club-meeting",
                                "Mitbringen",
                                position: 3
                            )
                            .AddCalendarSignUpLine("bea-bring", "bring", "bea", "Salat")
                            .AddCalendarSignUpLine("alice-bring", "bring", "alice")
                            .AddCalendarSignUpList(
                                "setup",
                                "club-meeting",
                                "Aufbau",
                                closedAt: Now.AddDays(-1),
                                position: 4
                            )
                            .AddCalendarEntry(
                                "weekend-trip",
                                "Wochenendfahrt",
                                AtTheMeeting.AddDays(3),
                                AtTheMeeting.AddDays(4)
                            )
                            .AddCalendarDaySchedule("weekend-plan", "weekend-trip", "Ausflug")
                            .AddCalendarDayScheduleStep(
                                "weekend-back",
                                "weekend-plan",
                                1,
                                new TimeOnly(15, 0),
                                "Rückfahrt"
                            )
                            .AddCalendarDayScheduleStep(
                                "weekend-dinner",
                                "weekend-plan",
                                0,
                                new TimeOnly(20, 0),
                                "Abendessen"
                            )
                            .AddCalendarDayScheduleStep(
                                "weekend-breakfast",
                                "weekend-plan",
                                1,
                                new TimeOnly(9, 0),
                                "Frühstück"
                            )
                            .AddCalendarDayScheduleStep(
                                "weekend-leave",
                                "weekend-plan",
                                0,
                                new TimeOnly(8, 0),
                                "Abfahrt"
                            )
                    ),
            ct
        );

    private static void WholeClub(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("alice", "Alice", "Muster")
            .AddAccount("alice")
            .AddMembership("alice-first", "alice", JoinedIn2017)
            .AddPerson("bea", "Bea", "Garde")
            .AddAccount("bea")
            .AddMembership("bea-first", "bea", JoinedIn2017)
            .AddPerson("dora", "Dora", "Leitung")
            .AddAccount("dora")
            .AddPerson("ilka", "Ilka", "Kalender")
            .AddAccount("ilka")
            .AddMembership("ilka-first", "ilka", JoinedIn2017)
            .AddPerson("kai", "Kai", "Kind")
            .AddMembership("kai-first", "kai", JoinedIn2017)
            .AddPerson("mona", "Mona", "Mitglied")
            .AddMembership("mona-first", "mona", JoinedIn2017)
            .AddPerson("paul", "Paul", "Pause")
            .AddMembership("paul-first", "paul", JoinedIn2017)
            .AddMembershipPause("paul-pause", "paul-first", 2026)
            .AddPerson("erik", "Erik", "Ehemalig")
            .AddMembership("erik-first", "erik", JoinedIn2017, new DateOnly(2026, 12, 31));

    private Task<SeededContext> BuildCalendarAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupMembership("kai-tanzgarde", "tanzgarde", "kai", JoinedIn2017)
                            .AddGroupAdmin(
                                "dora-tanzgarde",
                                "tanzgarde",
                                "dora",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                AtTheTraining,
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-surprise",
                                SurprisePlanning,
                                AtTheTraining.AddDays(1),
                                ownerGroupAlias: "tanzgarde",
                                audiencePersonAliases: ["bea"]
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
                                kind: CalendarEntryKind.Trip
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
                            .AddAttendanceResponse(
                                "dora-says-no",
                                "club-meeting",
                                "dora",
                                AttendanceAnswer.No
                            )
                            .AddAttendanceResponse(
                                "mona-marked-maybe",
                                "club-meeting",
                                "mona",
                                AttendanceAnswer.Maybe,
                                recordedByAlias: "bea"
                            )
                            .AddCalendarEntry(
                                "garde-call",
                                "Probe der Tanzgarde",
                                AtTheTraining.AddDays(2),
                                ownerGroupAlias: "tanzgarde",
                                asksForResponse: true
                            )
                            .AddAttendanceResponse(
                                "bea-comes",
                                "garde-call",
                                "bea",
                                AttendanceAnswer.Yes
                            )
                            .AddCalendarEntry(
                                "garde-dinner",
                                "Essen mit der Garde",
                                AtTheTraining.AddDays(3),
                                ownerGroupAlias: "tanzgarde",
                                asksForResponse: true,
                                audiencePersonAliases: ["bea", "kai"]
                            )
                            .AddAttendanceResponse(
                                "bea-dines",
                                "garde-dinner",
                                "bea",
                                AttendanceAnswer.Yes
                            )
                            .AddCalendarEntry(
                                "workshop",
                                "Werkstatt",
                                AtTheWorkshopEnd.AddHours(-2),
                                AtTheWorkshopEnd,
                                asksForResponse: true
                            )
                    ),
            ct
        );

    [Fact]
    public Task Should_NotFindATrainingOfAnotherSession_When_HerOnlyTieIsTheCastOfTheGroupsAct() =>
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
                        builder.Club(club =>
                            club.AddCalendarEntry(
                                "next-session-training",
                                DanceGuardTraining,
                                ClubClock.At(today.AddYears(1), new TimeOnly(18, 30)),
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
                    ctx.Club.CalendarEntries.IdOf("next-session-training"),
                    ct
                );

                Assert.Equal(HttpStatusCode.NotFound, result.Response.StatusCode);
            }
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
