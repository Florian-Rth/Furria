using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Tests.Common.Builder;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;

namespace Furria.Api.Tests.Calendar;

internal static class LiveSteps
{
    internal const string Mia = "mia";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    internal static Action<SeedContextBuilder> LiveEvening(DateOnly today) =>
        builder =>
        {
            PlannerWithGardeAdmin(today)(builder);
            builder.Identity(identity =>
                identity
                    .AddPerson(Mia, "Mia", "Mitglied")
                    .AddAccount(Mia)
                    .AddMembership("mia-member", Mia, JoinedIn2017)
                    .AddAccount(Ben)
            );
        };

    internal static Task<TestResult<GetCalendarEntryLiveResponse>> LiveOfAsync(
        HttpClient client,
        int eventId
    ) =>
        client.GETAsync<
            GetCalendarEntryLive,
            GetCalendarEntryLiveRequest,
            GetCalendarEntryLiveResponse
        >(new() { CalendarEntryId = eventId });

    internal static Task<TestResult<PutCalendarEntryLiveResponse>> MoveLiveAsync(
        HttpClient client,
        int eventId,
        int? from,
        int? to
    ) =>
        client.PUTAsync<
            PutCalendarEntryLive,
            PutCalendarEntryLiveRequest,
            PutCalendarEntryLiveResponse
        >(
            new()
            {
                CalendarEntryId = eventId,
                From = from,
                To = to,
            }
        );
}
