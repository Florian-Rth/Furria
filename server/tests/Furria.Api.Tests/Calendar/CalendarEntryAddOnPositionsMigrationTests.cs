using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class CalendarEntryAddOnPositionsMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeAddOns = "20261110134851_CalendarEntryAudience";
    private const string AskingTrip = "asking-trip";
    private const string Parade = "parade";
    private const string AskingMeeting = "asking-meeting";
    private const string PlainMeeting = "plain-meeting";

    private readonly ApiTestFixture _fixture;

    public CalendarEntryAddOnPositionsMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AttachTheAddOnsAnEntryAlreadyUses_When_TheyGetPositions()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(WithCalendar(_fixture.Today), ct);
        await _fixture.MigrateDatabaseToAsync(BeforeAddOns, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        Assert.Equal(
            [
                [CalendarEntryAddOnKind.Attendance, CalendarEntryAddOnKind.ParticipatingGroups],
                [CalendarEntryAddOnKind.ParticipatingGroups],
                [CalendarEntryAddOnKind.Attendance],
                [],
            ],
            await Task.WhenAll(
                new[] { AskingTrip, Parade, AskingMeeting, PlainMeeting }.Select(alias =>
                    AddOnsOfAsync(planner, ctx, alias)
                )
            )
        );
    }

    private static Action<SeedContextBuilder> WithCalendar(DateOnly today) =>
        builder =>
        {
            GardeWithDancers(today)(builder);
            builder.Club(club =>
                club.AddCalendarEntry(
                        AskingTrip,
                        "Ausflug",
                        On(today.AddDays(2)),
                        kind: CalendarEntryKind.Trip,
                        ownerGroupAlias: Garde,
                        asksForResponse: true,
                        participatingGroupAliases: [Elferrat]
                    )
                    .AddCalendarEntry(
                        Parade,
                        "Umzug",
                        On(today.AddDays(3)),
                        kind: CalendarEntryKind.Trip,
                        participatingGroupAliases: [Garde]
                    )
                    .AddCalendarEntry(
                        AskingMeeting,
                        "Sitzung",
                        On(today.AddDays(4)),
                        asksForResponse: true
                    )
                    .AddCalendarEntry(PlainMeeting, "Stammtisch", On(today.AddDays(5)))
            );
        };

    private static DateTimeOffset On(DateOnly day) => ClubClock.At(day, new TimeOnly(19, 0));

    private static async Task<CalendarEntryAddOnKind[]> AddOnsOfAsync(
        HttpClient client,
        SeededContext ctx,
        string alias
    )
    {
        var (response, result) = await client.GETAsync<
            GetCalendarEntryById,
            GetCalendarEntryByIdRequest,
            GetCalendarEntryByIdResponse
        >(new() { CalendarEntryId = ctx.Club.CalendarEntries.IdOf(alias) });
        response.EnsureSuccessStatusCode();

        return [.. result.Entry.AddOns.Select(addOn => addOn.Kind)];
    }
}
