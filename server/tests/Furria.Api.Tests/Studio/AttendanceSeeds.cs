using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;

namespace Furria.Api.Tests.Studio;

internal static class AttendanceSeeds
{
    internal const string Kim = "kim";
    internal const string GardeTraining = "garde-training";
    internal const string ElferratTraining = "elferrat-training";

    internal static Action<SeedContextBuilder> GardeWithTrainings(DateOnly today) =>
        builder =>
        {
            StudioSeeds.GardeWithDancers(today)(builder);
            builder
                .Identity(identity => identity.AddPerson(Kim, "Kim", "Klein"))
                .Groups(groups =>
                    groups.AddGroupMembership("kim-garde", Garde, Kim, today.AddDays(-100))
                )
                .Club(club =>
                    club.AddCalendarEntry(
                            GardeTraining,
                            "Training",
                            TrainingOn(today.AddDays(2)),
                            kind: CalendarEntryKind.Training,
                            ownerGroupAlias: Garde
                        )
                        .AddCalendarEntry(
                            ElferratTraining,
                            "Elferrat-Training",
                            TrainingOn(today.AddDays(3)),
                            kind: CalendarEntryKind.Training,
                            ownerGroupAlias: Elferrat
                        )
                );
        };

    internal static Task<HttpResponseMessage> MarkAttendanceAsync(
        HttpClient client,
        int actId,
        int calendarEntryId,
        int personId,
        AttendanceAnswer answer
    ) =>
        client.PUTAsync<PutActTrainingAttendance, PutActTrainingAttendanceRequest>(
            new()
            {
                ActId = actId,
                CalendarEntryId = calendarEntryId,
                PersonId = personId,
                Answer = answer,
            }
        );

    internal static Task<HttpResponseMessage> WithdrawAttendanceAsync(
        HttpClient client,
        int actId,
        int calendarEntryId,
        int personId
    ) =>
        client.DELETEAsync<DeleteActTrainingAttendance, DeleteActTrainingAttendanceRequest>(
            new()
            {
                ActId = actId,
                CalendarEntryId = calendarEntryId,
                PersonId = personId,
            }
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

    private static DateTimeOffset TrainingOn(DateOnly day) =>
        ClubClock.At(day, new TimeOnly(18, 30));
}
