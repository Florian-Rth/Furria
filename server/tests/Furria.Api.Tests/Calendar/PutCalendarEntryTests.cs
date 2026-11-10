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
    private const int UnknownEntryId = 999_999;
    private const string ValidationField = "request";
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
    private static readonly DateTimeOffset InsideTheAbendprobe = new(
        2027,
        1,
        20,
        19,
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
    public async Task Should_MoveTheEntryToTheClub_When_TheCallerMayOwnBothOwners()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("dana", ct);
        var (response, result) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, DanceGuardPerformance));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.VenueCollisions);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToBeClubOwned()
            .CalendarEntry(entryId)
            .ToHaveTitle(DanceGuardPerformance)
            .CalendarEntry(entryId)
            .ToHaveAudience(CalendarEntryAudience.Club)
            .AssertAsync(ct);
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
    public async Task Should_RefuseTheChanges_When_TheParticipatingGroupsAreNull()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = ctx.Club.CalendarEntries.IdOf("garde-training"),
                Title = DanceGuardPerformance,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = null,
                StartsAt = TrainingStart,
                EndsAt = TrainingEnd,
                Kind = CalendarEntryKind.Trip,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = null!,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_SaveTheChanges_When_TheOwnerStaysTheSame()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

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
                Description = "Auftritt statt Training.",
                OwnerGroupId = tanzgarde,
                VenueId = null,
                StartsAt = TrainingStart,
                EndsAt = TrainingEnd,
                Kind = CalendarEntryKind.Trip,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [tanzgarde],
                AudiencePersonIds = [],
                AddOns = [PutAddOn(CalendarEntryAddOnKind.Attendance)],
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveOwnerGroup(tanzgarde)
            .CalendarEntry(entryId)
            .ToHaveTitle(DanceGuardPerformance)
            .CalendarEntry(entryId)
            .ToHaveKind(CalendarEntryKind.Trip)
            .CalendarEntry(entryId)
            .ToHavePeriod(TrainingStart, TrainingEnd)
            .CalendarEntry(entryId)
            .ToAskForResponse(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WarnAboutTheVenueAndStillWrite_When_TheNewTimeClashesAtThatVenue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");
        var buehnenhaus = ctx.Club.Venues.IdOf("buehnenhaus");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, result) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = DanceGuardTraining,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = buehnenhaus,
                StartsAt = InsideTheAbendprobe,
                EndsAt = AfterTheAbendprobe,
                Kind = CalendarEntryKind.Training,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var collision = Assert.Single(result.VenueCollisions);
        Assert.Equal(ctx.Club.CalendarEntries.IdOf("abendprobe"), collision.CalendarEntryId);
        Assert.Equal(Abendprobe, collision.Title);
        Assert.Equal(AbendprobeStart, collision.StartsAt);
        Assert.Equal(AbendprobeEnd, collision.EndsAt);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveVenue(buehnenhaus)
            .CalendarEntry(entryId)
            .ToHavePeriod(InsideTheAbendprobe, AfterTheAbendprobe)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheVenue_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = DanceGuardTraining,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = ctx.Club.Venues.IdOf("altes-lager"),
                StartsAt = TrainingStart,
                EndsAt = TrainingEnd,
                Kind = CalendarEntryKind.Training,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ValidationField]
        );
        await ctx.Expected.CalendarEntry(entryId).ToBeHeldAt(null).AssertAsync(ct);
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
    public async Task Should_ReturnBadRequest_When_TheEntryWouldBecomeAnEvent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("abendprobe");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            ClubOwned(entryId, Abendprobe) with
            {
                Kind = CalendarEntryKind.Event,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveKind(CalendarEntryKind.Plain)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEntryIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("dana", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(UnknownEntryId, DanceGuardPerformance));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
    public async Task Should_ReturnUnprocessableEntity_When_SheIsNewlyChosenButMayNotUseTheApp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("abendprobe");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            ClubOwned(entryId, Abendprobe) with
            {
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [ctx.Identity.People.IdOf("frieda")],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
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
    public async Task Should_StartWithoutAnswers_When_TheAttendanceAddOnIsAttachedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("asking-meeting");
        await RewriteAsync(ctx, entryId, [], ct);

        var response = await RewriteAsync(ctx, entryId, [CalendarEntryAddOnKind.Attendance], ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.AttendanceResponsesFor(entryId)
            .ToCarryNoAnswer()
            .CalendarEntry(entryId)
            .ToAskForResponse(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheAnswers_When_TheAttendanceAddOnStaysAttached()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("asking-meeting");

        var response = await RewriteAsync(ctx, entryId, [CalendarEntryAddOnKind.Attendance], ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.AttendanceResponsesFor(entryId)
            .ToCarryAnswerFrom(ctx.Identity.People.IdOf("chris"), AttendanceAnswer.Yes)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AddAnOption_When_ThePollHoldsVotes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                Snack(
                    ctx,
                    ("snack:Kuchen", "Kuchen"),
                    ("snack:Brezeln", "Brezeln"),
                    (null, "Obst")
                ),
                Days(ctx),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");
        await ctx
            .Expected.CalendarPoll(pollId)
            .ToHaveOptions("Kuchen", "Brezeln", "Obst")
            .CalendarPoll(pollId)
            .ToHaveVotesOf(ctx.Identity.People.IdOf("chris"), "Kuchen")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RenameAnOption_When_ItHoldsNoVotes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [Snack(ctx, ("snack:Kuchen", "Kuchen"), ("snack:Brezeln", "Laugenbrezeln")), Days(ctx)],
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarPoll(ctx.Club.CalendarPolls.IdOf("snack"))
            .ToHaveOptions("Kuchen", "Laugenbrezeln")
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
            .Expected.CalendarPoll(ctx.Club.CalendarPolls.IdOf("snack"))
            .ToHaveOptions("Kuchen", "Brezeln")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DiscardThePollWithItsVotes_When_ThePollIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(ctx, [Days(ctx)], ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarPoll(ctx.Club.CalendarPolls.IdOf("snack"))
            .ToNotExist()
            .CalendarPoll(ctx.Club.CalendarPolls.IdOf("days"))
            .ToHaveVoteCount(2)
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
        await ctx
            .Expected.CalendarPoll(ctx.Club.CalendarPolls.IdOf("days"))
            .ToBeAnonymous(true)
            .AssertAsync(ct);
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
                PollId = ctx.Club.CalendarPolls.IdOf("elsewhere"),
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
            .Expected.CalendarPoll(ctx.Club.CalendarPolls.IdOf("snack"))
            .ToHaveOptions("Kuchen", "Brezeln")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheVotesCloseAfterTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var late = Days(ctx) with
        {
            Poll = Days(ctx).Poll! with { VotesUntil = TrainingStart.AddMinutes(1) },
        };

        var response = await RewriteAddOnsAsync(ctx, [late], ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_KeepTheLines_When_TheListSettingsChange()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("duties");

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                PutAddOn(CalendarEntryAddOnKind.Attendance),
                SignUpListAddOn(listId, "Wer hilft beim Aufbau?", "Ab 17 Uhr"),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveSettings("Wer hilft beim Aufbau?", "Ab 17 Uhr", null)
            .CalendarSignUpList(listId)
            .ToHaveLines((ctx.Identity.People.IdOf("chris"), "Tische"))
            .CalendarEntry(ctx.Club.CalendarEntries.IdOf("poll-meeting"))
            .ToHaveSignUpListsAt((1, "Wer hilft beim Aufbau?", "Ab 17 Uhr"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DiscardTheListWithItsLines_When_TheListIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(ctx, [Days(ctx)], ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarSignUpList(ctx.Club.CalendarSignUpLists.IdOf("duties"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheList_When_ItBelongsToAnotherEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [SignUpListAddOn(ctx.Club.CalendarSignUpLists.IdOf("elsewhere-list"), "Fremd", null)],
            ct
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.CalendarSignUpList(ctx.Club.CalendarSignUpLists.IdOf("duties"))
            .ToHaveLines((ctx.Identity.People.IdOf("chris"), "Tische"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_SigningUpClosesAfterTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var list = SignUpListAddOn(ctx.Club.CalendarSignUpLists.IdOf("duties"), "Aufbau", null);
        var late = list with
        {
            SignUpList = list.SignUpList! with { SignUpUntil = TrainingStart.AddMinutes(1) },
        };

        var response = await RewriteAddOnsAsync(ctx, [late], ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReplaceTheSteps_When_TheScheduleIsRewritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var scheduleId = ctx.Club.CalendarDaySchedules.IdOf("trip-plan");

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                DayScheduleAddOn(
                    scheduleId,
                    "Fahrt",
                    (null, 0, new TimeOnly(17, 0), "Abfahrt"),
                    (null, 0, new TimeOnly(16, 30), "Treffpunkt")
                ),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarDaySchedule(scheduleId)
            .ToHaveSteps(
                "Fahrt",
                (0, new TimeOnly(16, 30), "Treffpunkt"),
                (0, new TimeOnly(17, 0), "Abfahrt")
            )
            .CalendarEntry(ctx.Club.CalendarEntries.IdOf("poll-meeting"))
            .ToHaveDaySchedulesAt((0, "Fahrt"))
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
    public async Task Should_RefuseTheStep_When_ItBelongsToAnotherSchedule()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                DayScheduleAddOn(
                    ctx.Club.CalendarDaySchedules.IdOf("trip-plan"),
                    null,
                    (
                        ctx.Club.CalendarDayScheduleSteps.IdOf("elsewhere-meet"),
                        0,
                        new TimeOnly(17, 0),
                        "Abfahrt"
                    )
                ),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_DiscardTheSchedule_When_ItIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(ctx, [], ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarDaySchedule(ctx.Club.CalendarDaySchedules.IdOf("trip-plan"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheSchedule_When_ItBelongsToAnotherEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await RewriteAddOnsAsync(
            ctx,
            [
                DayScheduleAddOn(
                    ctx.Club.CalendarDaySchedules.IdOf("elsewhere-plan"),
                    null,
                    (null, 0, new TimeOnly(17, 0), "Abfahrt")
                ),
            ],
            ct
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.CalendarDaySchedule(ctx.Club.CalendarDaySchedules.IdOf("trip-plan"))
            .ToHaveSteps(null, (0, new TimeOnly(18, 0), "Treffpunkt"))
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
    ) => PollAddOn(ctx.Club.CalendarPolls.IdOf("snack"), SnackQuestion, false, false, ctx, options);

    private static PutCalendarEntryAddOnDataDto Days(SeededContext ctx) =>
        PollAddOn(
            ctx.Club.CalendarPolls.IdOf("days"),
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
                            ? ctx.Club.CalendarPollOptions.IdOf(alias)
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
