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

public sealed class PostCalendarReminderTests : IClassFixture<ApiTestFixture>
{
    private const string ClubMeeting = "Vereinssitzung";
    private const string SnackQuestion = "Was bringst du mit?";
    private const string HelperList = "Wer hilft beim Aufbau?";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset MeetingStart = new(2027, 1, 20, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset MeetingEnd = new(2027, 1, 20, 21, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PostCalendarReminderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PushEveryoneConcernedWithoutAnAnswer_When_AnOrganiserRemindsTheAttendance()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        var response = await RemindAtAsync(Now, ctx, "ilka", Attendance(entryId), ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await _fixture.CalendarPushesDrainedAsync(ct);
        var pushes = PushesAt(_fixture, devices.Mara);
        Assert.Equal([$"Erinnerung: {ClubMeeting}"], [.. pushes.Select(TitleOf)]);
        Assert.Equal([$"/calendar/{entryId}"], [.. pushes.Select(UrlOf)]);
        Assert.EndsWith("Bitte sag zu oder ab.", BodyOf(Assert.Single(pushes)));
        Assert.Empty(PushesAt(_fixture, devices.Chris));
        Assert.Empty(PushesAt(_fixture, devices.Ilka));
        Assert.Empty(PushesAt(_fixture, devices.Paula));
        Assert.Empty(PushesAt(_fixture, devices.Fred));
    }

    [Fact]
    public async Task Should_PushEveryoneConcernedWhoHasNotVoted_When_AnOrganiserRemindsAPoll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        var response = await RemindAtAsync(
            Now,
            ctx,
            "ilka",
            Reminder(entryId, CalendarEntryAddOnKind.Poll, pollId),
            ct
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await _fixture.CalendarPushesDrainedAsync(ct);
        Assert.EndsWith(
            $"Bitte stimm ab: {SnackQuestion}",
            BodyOf(Assert.Single(PushesAt(_fixture, devices.Chris)))
        );
        Assert.Empty(PushesAt(_fixture, devices.Mara));
    }

    [Fact]
    public async Task Should_PushEveryoneConcernedWithoutALine_When_AnOrganiserRemindsASignUpList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");
        var listId = ctx.Club.CalendarSignUpLists.IdOf("helpers");

        var response = await RemindAtAsync(
            Now,
            ctx,
            "ilka",
            Reminder(entryId, CalendarEntryAddOnKind.SignUpList, listId),
            ct
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await _fixture.CalendarPushesDrainedAsync(ct);
        Assert.EndsWith(
            $"Bitte trag dich ein: {HelperList}",
            BodyOf(Assert.Single(PushesAt(_fixture, devices.Mara)))
        );
        Assert.Empty(PushesAt(_fixture, devices.Chris));
    }

    [Fact]
    public async Task Should_RefuseASecondReminder_When_SixHoursHaveNotPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        await RemindAtAsync(Now, ctx, "ilka", Attendance(entryId), ct);
        var tooSoon = await RemindAtAsync(
            Now.AddHours(6).AddMinutes(-1),
            ctx,
            "ilka",
            Attendance(entryId),
            ct
        );
        var inTime = await RemindAtAsync(Now.AddHours(6), ctx, "ilka", Attendance(entryId), ct);

        Assert.Equal(HttpStatusCode.Conflict, tooSoon.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, inTime.StatusCode);
    }

    [Fact]
    public async Task Should_ThrottleEachFunctionOnItsOwn_When_AnotherFunctionWasJustReminded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        await RemindAtAsync(Now, ctx, "ilka", Attendance(entryId), ct);
        var response = await RemindAtAsync(
            Now,
            ctx,
            "ilka",
            Reminder(entryId, CalendarEntryAddOnKind.Poll, pollId),
            ct
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayNotEditTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        var response = await RemindAtAsync(Now, ctx, "chris", Attendance(entryId), ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("closed-poll", CalendarEntryAddOnKind.Poll)]
    [InlineData("full-list", CalendarEntryAddOnKind.SignUpList)]
    public async Task Should_RefuseReminding_When_TheFunctionIsClosedOrNobodyIsOpen(
        string addOnAlias,
        CalendarEntryAddOnKind kind
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");
        var addOnId =
            kind == CalendarEntryAddOnKind.Poll
                ? ctx.Club.CalendarPolls.IdOf(addOnAlias)
                : ctx.Club.CalendarSignUpLists.IdOf(addOnAlias);

        var response = await RemindAtAsync(Now, ctx, "ilka", Reminder(entryId, kind, addOnId), ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseRemindingTheAttendance_When_TheEntryIsOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        var response = await RemindAtAsync(MeetingEnd, ctx, "ilka", Attendance(entryId), ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePollBelongsToAnotherEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var otherEntryId = ctx.Club.CalendarEntries.IdOf("other");
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        var response = await RemindAtAsync(
            Now,
            ctx,
            "ilka",
            Reminder(otherEntryId, CalendarEntryAddOnKind.Poll, pollId),
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ShowOrganisersWhenTheyMayRemindAgain_When_AReminderWentOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        await RemindAtAsync(Now, ctx, "ilka", Attendance(entryId), ct);
        var organiser = await DetailAsync(ctx, "ilka", entryId, ct);
        var member = await DetailAsync(ctx, "chris", entryId, ct);

        Assert.Equal(Now, organiser.Attendance?.Reminder?.LastRemindedAt);
        Assert.Equal(Now.AddHours(6), organiser.Attendance?.Reminder?.RemindableFrom);
        Assert.Null(member.Attendance?.Reminder);
    }

    [Fact]
    public async Task Should_ShowOrganisersAnUnremindedState_When_NoReminderWentOutYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        var organiser = await DetailAsync(ctx, "ilka", entryId, ct);
        var poll = Assert.Single(
            organiser.AddOns,
            addOn => addOn.Poll?.PollId == ctx.Club.CalendarPolls.IdOf("snack")
        );

        Assert.NotNull(poll.Poll?.Reminder);
        Assert.Null(poll.Poll?.Reminder?.LastRemindedAt);
        Assert.Null(poll.Poll?.Reminder?.RemindableFrom);
    }

    private async Task<HttpResponseMessage> RemindAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        string callerAlias,
        PostCalendarReminderRequest request,
        CancellationToken ct
    )
    {
        HttpResponseMessage? response = null;
        await _fixture.AtInstantAsync(
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                response = await client.POSTAsync<
                    PostCalendarReminder,
                    PostCalendarReminderRequest
                >(request);
            }
        );

        return response ?? throw new InvalidOperationException("No response.");
    }

    private async Task<CalendarEntryDto> DetailAsync(
        SeededContext ctx,
        string callerAlias,
        int entryId,
        CancellationToken ct
    )
    {
        CalendarEntryDto? entry = null;
        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                var (response, result) = await client.GETAsync<
                    GetCalendarEntryById,
                    GetCalendarEntryByIdRequest,
                    GetCalendarEntryByIdResponse
                >(new GetCalendarEntryByIdRequest { CalendarEntryId = entryId });
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                entry = result.Entry;
            }
        );

        return entry ?? throw new InvalidOperationException("No entry.");
    }

    private static PostCalendarReminderRequest Attendance(int entryId) =>
        Reminder(entryId, CalendarEntryAddOnKind.Attendance, null);

    private static PostCalendarReminderRequest Reminder(
        int entryId,
        CalendarEntryAddOnKind kind,
        int? addOnId
    ) =>
        new()
        {
            CalendarEntryId = entryId,
            Kind = kind,
            AddOnId = addOnId,
        };

    private async Task<ClubDevices> DevicesAsync(SeededContext ctx, CancellationToken ct)
    {
        var run = Guid.NewGuid().ToString("N");
        ClubDevices? devices = null;
        await _fixture.AtInstantAsync(
            Now,
            async () =>
                devices = new(
                    await SubscribedDeviceAsync(ctx, "ilka", $"ilka-{run}", ct),
                    await SubscribedDeviceAsync(ctx, "chris", $"chris-{run}", ct),
                    await SubscribedDeviceAsync(ctx, "mara", $"mara-{run}", ct),
                    await SubscribedDeviceAsync(ctx, "paula", $"paula-{run}", ct),
                    await SubscribedDeviceAsync(ctx, "fred", $"fred-{run}", ct)
                )
        );

        return devices ?? throw new InvalidOperationException("No devices.");
    }

    private static string TitleOf(JsonElement push) => push.GetProperty("title").GetString() ?? "";

    private static string BodyOf(JsonElement push) => push.GetProperty("body").GetString() ?? "";

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
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
                            .AddPerson("mara", "Mara", "Offen")
                            .AddAccount("mara")
                            .AddMembership("mara-first", "mara", JoinedIn2017)
                            .AddPerson("paula", "Paula", "Pause")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddMembershipPause("paula-pause", "paula-first", 2026, 2026)
                            .AddPerson("fred", "Fred", "Fremd")
                            .AddAccount("fred")
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
                    .Club(club =>
                        club.AddCalendarEntry(
                                "meeting",
                                ClubMeeting,
                                MeetingStart,
                                MeetingEnd,
                                asksForResponse: true
                            )
                            .AddAttendanceResponse(
                                "chris-yes",
                                "meeting",
                                "chris",
                                AttendanceAnswer.Yes
                            )
                            .AddCalendarPoll("snack", "meeting", SnackQuestion, ["Kuchen", "Obst"])
                            .AddCalendarPollVote("snack", "Kuchen", "mara")
                            .AddCalendarPoll(
                                "closed-poll",
                                "meeting",
                                "Welche Farbe?",
                                ["Rot", "Gold"],
                                closedAt: Now.AddDays(-1),
                                position: 5
                            )
                            .AddCalendarSignUpList("helpers", "meeting", HelperList)
                            .AddCalendarSignUpLine("chris-helps", "helpers", "chris", "Stühle")
                            .AddCalendarSignUpList(
                                "full-list",
                                "meeting",
                                "Wer kommt mit?",
                                position: 6
                            )
                            .AddCalendarSignUpLine("ilka-full", "full-list", "ilka")
                            .AddCalendarSignUpLine("chris-full", "full-list", "chris")
                            .AddCalendarSignUpLine("mara-full", "full-list", "mara")
                            .AddCalendarEntry("other", "Andere Sitzung", MeetingStart.AddDays(7))
                    ),
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
