using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

[Collection("Api")]
public sealed class DeleteCalendarEntryByIdTests
{
    private const int UnknownEntryId = 999_999;
    private const string ClubMeeting = "Vereinssitzung";
    private const string DanceGuardTraining = "Training der Tanzgarde";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset MeetingStart = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset TrainingStart = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public DeleteCalendarEntryByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeTheResponsesWithIt_When_TheOwnerDeletesTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("club-meeting");
        var chrisId = ctx.Identity.People.IdOf("chris");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await DiscardAsync(client, entryId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToNotExist()
            .AttendanceResponsesFor(entryId)
            .ToCarryNoAnswerFrom(chrisId)
            .CalendarEntry(ctx.Club.CalendarEntries.IdOf("garde-training"))
            .ToHaveTitle(DanceGuardTraining)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetTheGroupAdminDelete_When_HerGroupOwnsTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var response = await DiscardAsync(client, entryId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.CalendarEntry(entryId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotOwnTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await DiscardAsync(client, entryId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.CalendarEntry(entryId).ToHaveTitle(DanceGuardTraining).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEntryIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await DiscardAsync(client, UnknownEntryId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> DiscardAsync(HttpClient client, int calendarEntryId) =>
        client.DELETEAsync<DeleteCalendarEntryById, DeleteCalendarEntryByIdRequest>(
            new DeleteCalendarEntryByIdRequest { CalendarEntryId = calendarEntryId }
        );

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
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "club-meeting",
                                ClubMeeting,
                                MeetingStart,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                TrainingStart,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Club,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddAttendanceResponse(
                                "chris-says-yes",
                                "club-meeting",
                                "chris",
                                AttendanceAnswer.Yes
                            )
                    ),
            ct
        );
}
