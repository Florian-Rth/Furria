using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class PutCalendarEntryTests : IClassFixture<ApiTestFixture>
{
    private const string ValidationField = "request";
    private const string AudienceField = "audience";
    private const string ConflictField = "conflict";
    private const string Gala = "1. Prunksitzung";
    private const string EventsLiveInTheWorkbench =
        "Eine Veranstaltung wird in den Veranstaltungen gepflegt.";
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const string DanceGuardPerformance = "Auftritt der Tanzgarde";
    private const string Farewell = "Abschied planen";
    private const string Abendprobe = "Abendprobe";
    private const string SnackQuestion = "Was bringst du mit?";
    private const string DaysQuestion = "Wann hast du Zeit?";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);

    private static readonly DateTimeOffset TrainingStart = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset TrainingEnd = new(2027, 1, 18, 21, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AbendprobeStart = new(
        2027,
        1,
        20,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AbendprobeEnd = new(
        2027,
        1,
        20,
        21,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset EarlyMeetingStart = new(
        2027,
        2,
        10,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AfterTheAbendprobe = new(
        2027,
        1,
        20,
        22,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutCalendarEntryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayOwnOnlyTheNewOwner()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, DanceGuardPerformance));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveOwnerGroup(ctx.Groups.Groups.IdOf("tanzgarde"))
            .CalendarEntry(entryId)
            .ToHaveTitle(DanceGuardTraining)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayOwnOnlyTheOldOwner()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, DanceGuardPerformance));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveOwnerGroup(ctx.Groups.Groups.IdOf("tanzgarde"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepAnArchivedParticipatingGroup_When_TheEntryAlreadyHoldsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-parade");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = DanceGuardPerformance,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = null,
                StartsAt = TrainingStart.AddDays(2),
                EndsAt = null,
                Kind = CalendarEntryKind.Trip,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
                AudiencePersonIds = [],
                AddOns = [PutAddOn(CalendarEntryAddOnKind.ParticipatingGroups)],
                ParticipatingGroupIds = [ctx.Groups.Groups.IdOf("altgarde")],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveTitle(DanceGuardPerformance)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseANewArchivedParticipatingGroup_When_AnotherArchivedOneIsHeld()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-parade");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = DanceGuardPerformance,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = null,
                StartsAt = TrainingStart.AddDays(2),
                EndsAt = null,
                Kind = CalendarEntryKind.Trip,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
                AudiencePersonIds = [],
                AddOns = [PutAddOn(CalendarEntryAddOnKind.ParticipatingGroups)],
                ParticipatingGroupIds =
                [
                    ctx.Groups.Groups.IdOf("altgarde"),
                    ctx.Groups.Groups.IdOf("seniorengarde"),
                ],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine archivierte Gruppe kann nicht mitwirken."], failures[ValidationField]);
        await ctx.Expected.CalendarEntry(entryId).ToHaveTitle(DanceGuardTraining).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheEntryIsAnEvent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var galaId = ctx.Club.Events.IdOf("gala");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(galaId, DanceGuardPerformance));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([EventsLiveInTheWorkbench], failures[ConflictField]);
        await ctx
            .Expected.CalendarEntry(galaId)
            .ToHaveTitle(Gala)
            .CalendarEntry(galaId)
            .ToHaveKind(CalendarEntryKind.Event)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupAdminWidensHerEntryToTheWholeClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var response = await PutAsGroupAdminAsync(
            ctx,
            GardeTraining(ctx, entryId) with
            {
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
            },
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveAudience(CalendarEntryAudience.Groups)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheWholeClub_When_TheGroupEntryAlreadyHoldsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-ball");

        var response = await PutAsGroupAdminAsync(
            ctx,
            GardeTraining(ctx, entryId) with
            {
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
            },
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveAudience(CalendarEntryAudience.Club)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepAChosenPerson_When_SheMayNoLongerUseTheAppButStaysOnTheList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("farewell");
        var frieda = ctx.Identity.People.IdOf("frieda");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            ClubOwned(entryId, Farewell) with
            {
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [frieda],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.CalendarEntry(entryId).ToChoosePeople(frieda).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DiscardTheAnswers_When_TheAttendanceAddOnIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("asking-meeting");

        var response = await RewriteAsync(ctx, entryId, [], ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.AttendanceResponsesFor(entryId)
            .ToCarryNoAnswer()
            .CalendarEntry(entryId)
            .ToAskForResponse(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropEveryTakenOverAddOn_When_TheEntryNarrowsToChosenPeople()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("asking-meeting");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            ClubOwned(entryId, Farewell) with
            {
                AddOns = [PutAddOn(CalendarEntryAddOnKind.Attendance)],
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [ctx.Identity.People.IdOf("ilka")],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Announcement(ctx.Club.Announcements.IdOf("aushang"))
            .ToHaveLoans(
                (
                    AnnouncementAddOnKind.Poll,
                    ctx.Club.CalendarEntries.IdOf("poll-meeting"),
                    ctx.Club.Polls.IdOf("snack"),
                    1
                )
            )
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("Torte", "Brezeln")]
    [InlineData(null, "Brezeln")]
    public async Task Should_RefuseTheChange_When_AnOptionWithVotesIsRenamedOrRemoved(
        string? kuchenLabel,
        string brezelnLabel
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        (string?, string)[] options = kuchenLabel is null
            ? [("snack:Brezeln", brezelnLabel), (null, "Obst")]
            : [("snack:Kuchen", kuchenLabel), ("snack:Brezeln", brezelnLabel)];

        var response = await RewriteAddOnsAsync(ctx, [Snack(ctx, options), Days(ctx)], ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.Poll(ctx.Club.Polls.IdOf("snack"))
            .ToHaveOptions("Kuchen", "Brezeln")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepThePollAndListClosed_When_TheEntryMovesLaterAfterItStarted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var meetingStart = AbendprobeStart.AddDays(6);

        await _fixture.AtInstantAsync(
            meetingStart.AddHours(1),
            async () =>
            {
                var response = await MoveEntryAsync(
                    ctx,
                    "poll-meeting",
                    meetingStart.AddDays(7),
                    [
                        Snack(ctx, ("snack:Kuchen", "Kuchen"), ("snack:Brezeln", "Brezeln")),
                        Days(ctx),
                        Duties(ctx),
                    ],
                    ct
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            }
        );

        await ctx
            .Expected.Poll(ctx.Club.Polls.IdOf("snack"))
            .ToBeClosedAt(meetingStart, null)
            .SignUpList(ctx.Club.SignUpLists.IdOf("duties"))
            .ToBeClosedAt(meetingStart, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheChange_When_AClosedPollIsEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var meetingStart = AbendprobeStart.AddDays(6);
        var snack = Snack(
            ctx,
            ("snack:Kuchen", "Kuchen"),
            ("snack:Brezeln", "Brezeln"),
            (null, "Obst")
        );

        await _fixture.AtInstantAsync(
            meetingStart.AddHours(1),
            async () =>
            {
                var response = await MoveEntryAsync(
                    ctx,
                    "poll-meeting",
                    meetingStart,
                    [snack, Days(ctx), Duties(ctx)],
                    ct
                );

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );

        await ctx
            .Expected.Poll(ctx.Club.Polls.IdOf("snack"))
            .ToHaveOptions("Kuchen", "Brezeln")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseLiftingAnonymity_When_ThePollHoldsVotes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                Snack(ctx, ("snack:Kuchen", "Kuchen"), ("snack:Brezeln", "Brezeln")),
                Days(ctx) with
                {
                    Poll = Days(ctx).Poll! with { IsAnonymous = false },
                },
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Poll(ctx.Club.Polls.IdOf("days")).ToBeAnonymous(true).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseSingleChoice_When_SomeoneHoldsSeveralVotes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                Snack(ctx, ("snack:Kuchen", "Kuchen"), ("snack:Brezeln", "Brezeln")),
                Days(ctx) with
                {
                    Poll = Days(ctx).Poll! with { AllowsMultipleChoices = false },
                },
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseThePoll_When_ItBelongsToAnotherEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var foreign = Days(ctx) with
        {
            Poll = Days(ctx).Poll! with
            {
                PollId = ctx.Club.Polls.IdOf("elsewhere"),
                Options =
                [
                    new() { OptionId = null, Label = "Ja" },
                    new() { OptionId = null, Label = "Nein" },
                ],
            },
        };

        var response = await RewriteAddOnsAsync(ctx, [foreign], ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.Poll(ctx.Club.Polls.IdOf("snack"))
            .ToHaveOptions("Kuchen", "Brezeln")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepAHeldStep_When_ItsTextChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var scheduleId = ctx.Club.CalendarDaySchedules.IdOf("trip-plan");
        var stepId = ctx.Club.CalendarDayScheduleSteps.IdOf("trip-meet");

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                DayScheduleAddOn(
                    scheduleId,
                    null,
                    (stepId, 0, new TimeOnly(18, 15), "Treffpunkt Bus")
                ),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarDaySchedule(scheduleId)
            .ToHaveStep(stepId, 0, new TimeOnly(18, 15), "Treffpunkt Bus")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheEntryNoLongerReachesAStepsDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                DayScheduleAddOn(
                    ctx.Club.CalendarDaySchedules.IdOf("trip-plan"),
                    null,
                    (null, 1, new TimeOnly(9, 0), "Frühstück")
                ),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static PutCalendarEntryAddOnDataDto DayScheduleAddOn(
        int dayScheduleId,
        string? title,
        params (int? StepId, int Day, TimeOnly Time, string Text)[] steps
    ) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.DaySchedule,
            Poll = null,
            SignUpList = null,
            DaySchedule = new()
            {
                DayScheduleId = dayScheduleId,
                Title = title,
                Steps =
                [
                    .. steps.Select(step => new PutCalendarEntryDayScheduleStepDataDto
                    {
                        StepId = step.StepId,
                        Day = step.Day,
                        Time = step.Time,
                        Text = step.Text,
                    }),
                ],
            },
        };

    private static PutCalendarEntryAddOnDataDto SignUpListAddOn(
        int signUpListId,
        string title,
        string? hint
    ) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.SignUpList,
            Poll = null,
            SignUpList = new()
            {
                SignUpListId = signUpListId,
                Title = title,
                Hint = hint,
                SignUpUntil = null,
            },
            DaySchedule = null,
        };

    private static PutCalendarEntryAddOnDataDto Duties(SeededContext ctx) =>
        SignUpListAddOn(ctx.Club.SignUpLists.IdOf("duties"), "Aufbau", null);

    private static async Task<HttpResponseMessage> MoveEntryAsync(
        SeededContext ctx,
        string entryAlias,
        DateTimeOffset startsAt,
        IReadOnlyList<PutCalendarEntryAddOnDataDto> addOns,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            ClubOwned(ctx.Club.CalendarEntries.IdOf(entryAlias), Farewell) with
            {
                StartsAt = startsAt,
                EndsAt = null,
                AddOns = addOns,
            }
        );

        return response;
    }

    private static async Task<HttpResponseMessage> RewriteAddOnsAsync(
        SeededContext ctx,
        IReadOnlyList<PutCalendarEntryAddOnDataDto> addOns,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            ClubOwned(ctx.Club.CalendarEntries.IdOf("poll-meeting"), Farewell) with
            {
                AddOns = addOns,
            }
        );

        return response;
    }

    private static PutCalendarEntryAddOnDataDto Snack(
        SeededContext ctx,
        params (string? OptionAlias, string Label)[] options
    ) => PollAddOn(ctx.Club.Polls.IdOf("snack"), SnackQuestion, false, false, ctx, options);

    private static PutCalendarEntryAddOnDataDto Days(SeededContext ctx) =>
        PollAddOn(
            ctx.Club.Polls.IdOf("days"),
            DaysQuestion,
            true,
            true,
            ctx,
            ("days:Montag", "Montag"),
            ("days:Dienstag", "Dienstag")
        );

    private static PutCalendarEntryAddOnDataDto PollAddOn(
        int pollId,
        string question,
        bool allowsMultipleChoices,
        bool isAnonymous,
        SeededContext ctx,
        params (string? OptionAlias, string Label)[] options
    ) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.Poll,
            SignUpList = null,
            DaySchedule = null,
            Poll = new()
            {
                PollId = pollId,
                Question = question,
                AllowsMultipleChoices = allowsMultipleChoices,
                IsAnonymous = isAnonymous,
                VotesUntil = null,
                Options =
                [
                    .. options.Select(option => new PutCalendarEntryPollOptionDataDto
                    {
                        OptionId = option.OptionAlias is { } alias
                            ? ctx.Club.PollOptions.IdOf(alias)
                            : null,
                        Label = option.Label,
                    }),
                ],
            },
        };

    private static async Task<HttpResponseMessage> RewriteAsync(
        SeededContext ctx,
        int entryId,
        IReadOnlyList<CalendarEntryAddOnKind> addOns,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, Farewell) with { AddOns = [.. addOns.Select(PutAddOn)] });

        return response;
    }

    private static PutCalendarEntryRequest GardeTraining(SeededContext ctx, int calendarEntryId) =>
        new()
        {
            CalendarEntryId = calendarEntryId,
            Title = DanceGuardTraining,
            Description = null,
            OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            VenueId = null,
            StartsAt = TrainingStart,
            EndsAt = TrainingEnd,
            Kind = CalendarEntryKind.Training,
            Audience = CalendarEntryAudience.Groups,
            AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
        };

    private static async Task<HttpResponseMessage> PutAsGroupAdminAsync(
        SeededContext ctx,
        PutCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(request);

        return response;
    }

    private static PutCalendarEntryRequest ClubOwned(int calendarEntryId, string title) =>
        new()
        {
            CalendarEntryId = calendarEntryId,
            Title = title,
            Description = null,
            OwnerGroupId = null,
            VenueId = null,
            StartsAt = TrainingStart,
            EndsAt = TrainingEnd,
            Kind = CalendarEntryKind.Trip,
            Audience = CalendarEntryAudience.Club,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
        };

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Trainer")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("dana", "Dana", "Doppelt")
                            .AddAccount("dana")
                            .AddMembership("dana-first", "dana", JoinedIn2017)
                            .AddPerson("frieda", "Frieda", "Ehemalig")
                            .AddPerson("kalle", "Kalle", "Kindergarde")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "terminpflege",
                                "ilka-terminpflege",
                                "Terminpflege",
                                "ilka",
                                FurriaPermissions.CalendarManageClub
                            )
                            .AddRoleHolding("dana-terminpflege", "terminpflege", "dana")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership(
                                "kalle-kindergarde",
                                "kindergarde",
                                "kalle",
                                JoinedIn2017
                            )
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2026)
                            .AddGroup("seniorengarde", "Seniorengarde", archivedOn: ArchivedIn2026)
                            .AddGroupAdmin(
                                "dana-tanzgarde",
                                "tanzgarde",
                                "dana",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2026)
                            .AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                TrainingStart,
                                TrainingEnd,
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-parade",
                                DanceGuardTraining,
                                TrainingStart.AddDays(2),
                                kind: CalendarEntryKind.Trip,
                                ownerGroupAlias: "tanzgarde",
                                audience: CalendarEntryAudience.Club,
                                participatingGroupAliases: ["altgarde"]
                            )
                            .AddCalendarEntry(
                                "garde-joint",
                                DanceGuardTraining,
                                TrainingStart.AddDays(5),
                                ownerGroupAlias: "tanzgarde",
                                audienceGroupAliases: ["tanzgarde", "kindergarde"]
                            )
                            .AddCalendarEntry(
                                "garde-ball",
                                DanceGuardTraining,
                                TrainingStart.AddDays(4),
                                ownerGroupAlias: "tanzgarde",
                                audience: CalendarEntryAudience.Club
                            )
                            .AddCalendarEntry(
                                "abendprobe",
                                Abendprobe,
                                AbendprobeStart,
                                AbendprobeEnd,
                                venueAlias: "buehnenhaus"
                            )
                            .AddCalendarEntry(
                                "farewell",
                                Farewell,
                                AbendprobeStart.AddDays(3),
                                audiencePersonAliases: ["frieda", "ilka"]
                            )
                            .AddCalendarEntry(
                                "asking-meeting",
                                Farewell,
                                AbendprobeStart.AddDays(5),
                                asksForResponse: true
                            )
                            .AddAnnouncement("aushang", "ilka", "Aushang", "Bitte antworten.")
                            .AddAnnouncementLoan(
                                "aushang",
                                "asking-meeting",
                                AnnouncementAddOnKind.Attendance,
                                addOnAlias: null,
                                position: 0
                            )
                            .AddAnnouncementLoan(
                                "aushang",
                                "poll-meeting",
                                AnnouncementAddOnKind.Poll,
                                "snack",
                                position: 1
                            )
                            .AddCalendarEntry("poll-meeting", Farewell, AbendprobeStart.AddDays(6))
                            .AddCalendarPoll(
                                "snack",
                                "poll-meeting",
                                SnackQuestion,
                                ["Kuchen", "Brezeln"],
                                position: 0
                            )
                            .AddCalendarPollVote("snack", "Kuchen", "chris")
                            .AddCalendarPoll(
                                "days",
                                "poll-meeting",
                                DaysQuestion,
                                ["Montag", "Dienstag"],
                                allowsMultipleChoices: true,
                                isAnonymous: true,
                                position: 1
                            )
                            .AddCalendarPollVote("days", "Montag", "dana")
                            .AddCalendarPollVote("days", "Dienstag", "dana")
                            .AddCalendarPoll("elsewhere", "farewell", DaysQuestion, ["Ja", "Nein"])
                            .AddCalendarSignUpList("duties", "poll-meeting", "Aufbau", position: 2)
                            .AddCalendarEntry("early-meeting", Farewell, EarlyMeetingStart)
                            .AddCalendarPoll(
                                "early",
                                "early-meeting",
                                "Wer fährt?",
                                ["Ich", "Du"],
                                votesUntil: EarlyMeetingStart.AddDays(-1)
                            )
                            .AddCalendarSignUpLine("chris-duty", "duties", "chris", "Tische")
                            .AddCalendarSignUpList("elsewhere-list", "farewell", "Geschenk")
                            .AddCalendarDaySchedule("trip-plan", "poll-meeting", null, position: 4)
                            .AddCalendarDayScheduleStep(
                                "trip-meet",
                                "trip-plan",
                                0,
                                new TimeOnly(18, 0),
                                "Treffpunkt"
                            )
                            .AddCalendarDaySchedule("elsewhere-plan", "farewell", null)
                            .AddCalendarDayScheduleStep(
                                "elsewhere-meet",
                                "elsewhere-plan",
                                0,
                                new TimeOnly(18, 0),
                                "Treffpunkt"
                            )
                            .AddAttendanceResponse(
                                "chris-says-yes",
                                "asking-meeting",
                                "chris",
                                AttendanceAnswer.Yes
                            )
                            .AddEvent("gala", Gala, AfterTheAbendprobe, "buehnenhaus")
                    ),
            ct
        );

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }

    private static PutCalendarEntryAddOnDataDto PutAddOn(CalendarEntryAddOnKind kind) =>
        new()
        {
            Kind = kind,
            Poll = null,
            SignUpList = null,
            DaySchedule = null,
        };
}
