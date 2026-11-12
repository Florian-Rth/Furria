using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Push.SubscribedDevices;

namespace Furria.Api.Tests.Calendar;

public sealed class CalendarPushesTests : IClassFixture<ApiTestFixture>
{
    private const string ClubMeeting = "Vereinssitzung";
    private const string Farewell = "Abschied von Prinz Bernd";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset MeetingStart = new(2027, 1, 20, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset MeetingEnd = new(2027, 1, 20, 21, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset LaterStart = new(2027, 1, 27, 18, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public CalendarPushesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PushEveryoneItConcernsButTheScheduler_When_ANewEntryAsksForAResponse()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        var entryId = await CreateAsync(
            ctx,
            ClubEntry() with
            {
                AddOns = [PostAddOn(CalendarEntryAddOnKind.Attendance)],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        var pushes = PushesAt(_fixture, devices.Chris);
        Assert.Equal([$"/calendar/{entryId}"], [.. pushes.Select(UrlOf)]);
        Assert.Equal([ClubMeeting], [.. pushes.Select(TitleOf)]);
        Assert.Single(PushesAt(_fixture, devices.Mara));
        Assert.Empty(PushesAt(_fixture, devices.Ilka));
        Assert.Empty(PushesAt(_fixture, devices.Paula));
        Assert.Empty(PushesAt(_fixture, devices.Fred));
    }

    [Fact]
    public async Task Should_PushNobody_When_ANewEntryAsksNothing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        await CreateAsync(ctx, ClubEntry(), ct);

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, devices.Chris));
    }

    [Fact]
    public async Task Should_PushNobody_When_ANewEntryAskingForAResponseHasAlreadyStarted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var startedAnHourAgo = _fixture.TimeProvider.GetUtcNow().AddHours(-1);

        await CreateAsync(
            ctx,
            ClubEntry() with
            {
                StartsAt = startedAnHourAgo,
                EndsAt = startedAnHourAgo.AddHours(3),
                AddOns = [PostAddOn(CalendarEntryAddOnKind.Attendance)],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, devices.Chris));
    }

    [Fact]
    public async Task Should_PushTheChosenPeopleOnly_When_ANewEntryIsForChosenPeople()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        var entryId = await CreateAsync(
            ctx,
            ClubEntry() with
            {
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [ctx.Identity.People.IdOf("fred")],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Equal([$"/calendar/{entryId}"], [.. PushesAt(_fixture, devices.Fred).Select(UrlOf)]);
        Assert.Empty(PushesAt(_fixture, devices.Chris));
    }

    [Fact]
    public async Task Should_PushOncePerPerson_When_AChosenPeopleEntryAlsoAsksForAResponse()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        await CreateAsync(
            ctx,
            ClubEntry() with
            {
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [ctx.Identity.People.IdOf("fred")],
                AddOns = [PostAddOn(CalendarEntryAddOnKind.Attendance)],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Single(PushesAt(_fixture, devices.Fred));
    }

    [Fact]
    public async Task Should_PushOnlyTheNewlyChosen_When_PeopleAreAddedToAnEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                    "farewell",
                    Farewell,
                    MeetingStart,
                    MeetingEnd,
                    audiencePersonAliases: ["chris"]
                ),
            ct
        );
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("farewell");

        await UpdateAsync(
            ctx,
            ClubEntryUpdate(entryId) with
            {
                Title = Farewell,
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds =
                [
                    ctx.Identity.People.IdOf("chris"),
                    ctx.Identity.People.IdOf("fred"),
                ],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Equal([$"/calendar/{entryId}"], [.. PushesAt(_fixture, devices.Fred).Select(UrlOf)]);
        Assert.Empty(PushesAt(_fixture, devices.Chris));
    }

    [Theory]
    [InlineData(false, true)]
    [InlineData(true, false)]
    public async Task Should_PushWhoeverAnsweredYesOrMaybe_When_TheEntryMovesInTimeOrPlace(
        bool moves,
        bool changesVenue
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAnsweredMeetingAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("club-meeting");

        await UpdateAsync(
            ctx,
            ClubEntryUpdate(entryId) with
            {
                StartsAt = moves ? LaterStart : MeetingStart,
                EndsAt = moves ? LaterStart.AddHours(3) : MeetingEnd,
                VenueId = changesVenue ? ctx.Club.Venues.IdOf("buehnenhaus") : null,
                AddOns = [PutAddOn(CalendarEntryAddOnKind.Attendance)],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Equal(
            [$"/calendar/{entryId}"],
            [.. PushesAt(_fixture, devices.Chris).Select(UrlOf)]
        );
        Assert.Single(PushesAt(_fixture, devices.Mara));
        Assert.Empty(PushesAt(_fixture, devices.Paula));
        Assert.Empty(PushesAt(_fixture, devices.Ilka));
    }

    [Fact]
    public async Task Should_PushNobody_When_TheEntryKeepsItsTimeAndPlace()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAnsweredMeetingAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("club-meeting");

        await UpdateAsync(
            ctx,
            ClubEntryUpdate(entryId) with
            {
                Title = "Vereinssitzung mit Wahlen",
                AddOns = [PutAddOn(CalendarEntryAddOnKind.Attendance)],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, devices.Chris));
        Assert.Empty(PushesAt(_fixture, devices.Mara));
    }

    [Fact]
    public async Task Should_PushWhoeverAnsweredYesOrMaybe_When_TheEntryIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAnsweredMeetingAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("club-meeting");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.DELETEAsync<
            DeleteCalendarEntryById,
            DeleteCalendarEntryByIdRequest
        >(new() { CalendarEntryId = entryId });
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        await _fixture.PushesDrainedAsync(ct);
        Assert.Equal(
            ["/calendar?day=2027-01-20"],
            [.. PushesAt(_fixture, devices.Chris).Select(UrlOf)]
        );
        Assert.Single(PushesAt(_fixture, devices.Mara));
        Assert.Empty(PushesAt(_fixture, devices.Paula));
        Assert.Empty(PushesAt(_fixture, devices.Ilka));
    }

    [Fact]
    public async Task Should_SpareWhoeverWasTakenOffTheList_When_AChosenPeopleEntryIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildFormerlyChosenAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.DELETEAsync<
            DeleteCalendarEntryById,
            DeleteCalendarEntryByIdRequest
        >(new() { CalendarEntryId = ctx.Club.CalendarEntries.IdOf("farewell") });
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        await _fixture.PushesDrainedAsync(ct);
        Assert.Single(PushesAt(_fixture, devices.Chris));
        Assert.Empty(PushesAt(_fixture, devices.Mara));
    }

    [Fact]
    public async Task Should_SpareWhoeverWasTakenOffTheList_When_AChosenPeopleEntryMoves()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildFormerlyChosenAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("farewell");

        await UpdateAsync(
            ctx,
            ClubEntryUpdate(entryId) with
            {
                Title = Farewell,
                StartsAt = LaterStart,
                EndsAt = LaterStart.AddHours(3),
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [ctx.Identity.People.IdOf("chris")],
                AddOns = [PutAddOn(CalendarEntryAddOnKind.Attendance)],
            },
            ct
        );

        await _fixture.PushesDrainedAsync(ct);
        Assert.Single(PushesAt(_fixture, devices.Chris));
        Assert.Empty(PushesAt(_fixture, devices.Mara));
    }

    private Task<SeededContext> BuildFormerlyChosenAsync(CancellationToken ct) =>
        BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "farewell",
                        Farewell,
                        MeetingStart,
                        MeetingEnd,
                        asksForResponse: true,
                        audiencePersonAliases: ["chris"]
                    )
                    .AddAttendanceResponse("chris-yes", "farewell", "chris", AttendanceAnswer.Yes)
                    .AddAttendanceResponse("mara-yes", "farewell", "mara", AttendanceAnswer.Yes),
            ct
        );

    private async Task<int> CreateAsync(
        SeededContext ctx,
        PostCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.CalendarEntryId;
    }

    private static async Task UpdateAsync(
        SeededContext ctx,
        PutCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static async Task<ClubDevices> DevicesAsync(SeededContext ctx, CancellationToken ct)
    {
        var run = Guid.NewGuid().ToString("N");

        return new(
            await SubscribedDeviceAsync(ctx, "ilka", $"ilka-{run}", ct),
            await SubscribedDeviceAsync(ctx, "chris", $"chris-{run}", ct),
            await SubscribedDeviceAsync(ctx, "mara", $"mara-{run}", ct),
            await SubscribedDeviceAsync(ctx, "paula", $"paula-{run}", ct),
            await SubscribedDeviceAsync(ctx, "fred", $"fred-{run}", ct)
        );
    }

    private static string TitleOf(JsonElement push) => push.GetProperty("title").GetString() ?? "";

    private static PostCalendarEntryRequest ClubEntry() =>
        new()
        {
            Title = ClubMeeting,
            Description = null,
            OwnerGroupId = null,
            VenueId = null,
            StartsAt = MeetingStart,
            EndsAt = MeetingEnd,
            Kind = CalendarEntryKind.Plain,
            Audience = CalendarEntryAudience.Club,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
        };

    private static PutCalendarEntryRequest ClubEntryUpdate(int calendarEntryId) =>
        new()
        {
            CalendarEntryId = calendarEntryId,
            Title = ClubMeeting,
            Description = null,
            OwnerGroupId = null,
            VenueId = null,
            StartsAt = MeetingStart,
            EndsAt = MeetingEnd,
            Kind = CalendarEntryKind.Plain,
            Audience = CalendarEntryAudience.Club,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
        };

    private static PostCalendarEntryAddOnDataDto PostAddOn(CalendarEntryAddOnKind kind) =>
        new()
        {
            Kind = kind,
            Poll = null,
            SignUpList = null,
            DaySchedule = null,
        };

    private static PutCalendarEntryAddOnDataDto PutAddOn(CalendarEntryAddOnKind kind) =>
        new()
        {
            Kind = kind,
            Poll = null,
            SignUpList = null,
            DaySchedule = null,
        };

    private Task<SeededContext> BuildAnsweredMeetingAsync(CancellationToken ct) =>
        BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "club-meeting",
                        ClubMeeting,
                        MeetingStart,
                        MeetingEnd,
                        asksForResponse: true
                    )
                    .AddAttendanceResponse(
                        "chris-yes",
                        "club-meeting",
                        "chris",
                        AttendanceAnswer.Yes
                    )
                    .AddAttendanceResponse(
                        "mara-maybe",
                        "club-meeting",
                        "mara",
                        AttendanceAnswer.Maybe
                    )
                    .AddAttendanceResponse("paula-no", "club-meeting", "paula", AttendanceAnswer.No)
                    .AddAttendanceResponse(
                        "ilka-yes",
                        "club-meeting",
                        "ilka",
                        AttendanceAnswer.Yes
                    ),
            ct
        );

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        BuildClubAsync(club => club, ct);

    private Task<SeededContext> BuildClubAsync(
        Func<ClubSeedBuilder, ClubSeedBuilder> entries,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Mitglied")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("mara", "Mara", "Vielleicht")
                            .AddAccount("mara")
                            .AddMembership("mara-first", "mara", JoinedIn2017)
                            .AddPerson("paula", "Paula", "Pause")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddMembershipPause("paula-pause", "paula-first", 2026, 2026)
                            .AddPerson("fred", "Fred", "Fremd")
                            .AddAccount("fred")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("fred-tanzgarde", "tanzgarde", "fred", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Club(club => entries(club.AddVenue("buehnenhaus", "Bühnenhaus"))),
            ct
        );

    private sealed record ClubDevices(
        string Ilka,
        string Chris,
        string Mara,
        string Paula,
        string Fred
    );
}
