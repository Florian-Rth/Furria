using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Xunit;

namespace Furria.Api.Tests.Calendar;

internal static class MarkingSeeds
{
    internal const string Gerd = "gerd";
    internal const string Anna = "anna";
    internal const string Kim = "kim";
    internal const string Erik = "erik";
    internal const string Emil = "emil";
    internal const string Garde = "garde";
    internal const string Elferrat = "elferrat";
    internal const string GardeTraining = "garde-training";
    internal const string JointTraining = "joint-training";
    internal const string SilentTraining = "silent-training";
    internal const string PastTraining = "past-training";
    internal const string GardeMeeting = "garde-meeting";

    private static readonly DateOnly Today = new(2026, 12, 1);
    private static readonly DateOnly JoinedLastYear = Today.AddYears(-1);

    internal static readonly DateTimeOffset Now = ClubClock.At(Today, new TimeOnly(12, 0));

    internal static void GardeAndElferrat(SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson(Gerd, "Gerd", "Gardist")
                    .AddAccount(Gerd)
                    .AddPerson(Anna, "Anna", "Albers")
                    .AddAccount(Anna)
                    .AddPerson(Kim, "Kim", "Klein")
                    .AddPerson(Erik, "Erik", "Elfer")
                    .AddAccount(Erik)
                    .AddPerson(Emil, "Emil", "Ernst")
            )
            .Groups(groups =>
                groups
                    .AddGroup(Garde, "Tanzgarde")
                    .AddGroup(Elferrat, "Elferrat")
                    .AddGroupAdmin("gerd-leitet", Garde, Gerd, "Trainer")
                    .AddGroupAdmin("erik-leitet", Elferrat, Erik, "Präsident")
                    .AddGroupMembership("anna-garde", Garde, Anna, JoinedLastYear)
                    .AddGroupMembership("kim-garde", Garde, Kim, JoinedLastYear)
                    .AddGroupMembership("emil-elferrat", Elferrat, Emil, JoinedLastYear)
            )
            .Club(club =>
                club.AddCalendarEntry(
                        GardeTraining,
                        "Training",
                        EveningOf(Today.AddDays(2)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde,
                        asksForResponse: true
                    )
                    .AddCalendarEntry(
                        JointTraining,
                        "Gemeinsames Training",
                        EveningOf(Today.AddDays(3)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde,
                        asksForResponse: true,
                        audienceGroupAliases: [Garde, Elferrat]
                    )
                    .AddCalendarEntry(
                        SilentTraining,
                        "Training ohne Zu-/Absage",
                        EveningOf(Today.AddDays(4)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde
                    )
                    .AddCalendarEntry(
                        PastTraining,
                        "Letztes Training",
                        EveningOf(Today.AddDays(-1)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde,
                        asksForResponse: true
                    )
                    .AddCalendarEntry(
                        GardeMeeting,
                        "Gardetreffen",
                        EveningOf(Today.AddDays(5)),
                        ownerGroupAlias: Garde,
                        asksForResponse: true
                    )
            );

    internal static Task<HttpResponseMessage> MarkAsync(
        HttpClient client,
        int calendarEntryId,
        int personId,
        AttendanceAnswer answer
    ) =>
        client.PUTAsync<PutCalendarAttendance, PutCalendarAttendanceRequest>(
            new()
            {
                CalendarEntryId = calendarEntryId,
                PersonId = personId,
                Answer = answer,
            }
        );

    internal static Task<HttpResponseMessage> WithdrawMarkAsync(
        HttpClient client,
        int calendarEntryId,
        int personId
    ) =>
        client.DELETEAsync<DeleteCalendarAttendance, DeleteCalendarAttendanceRequest>(
            new() { CalendarEntryId = calendarEntryId, PersonId = personId }
        );

    internal static async Task AnswerAsync(
        HttpClient client,
        int calendarEntryId,
        AttendanceAnswer answer
    )
    {
        var response = await client.POSTAsync<PostCalendarResponse, PostCalendarResponseRequest>(
            new() { CalendarEntryId = calendarEntryId, Answer = answer }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private static DateTimeOffset EveningOf(DateOnly day) =>
        ClubClock.At(day, new TimeOnly(18, 30));
}
