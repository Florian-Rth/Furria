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
public sealed class GroupEntryAudienceMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeGroupAudience = "20261116102753_DropPushNotifyClub";
    private const string ClubWideGardeEvening = "club-wide-garde-evening";
    private const string GardeOnlyTrip = "garde-only-trip";
    private const string ClubMeeting = "club-meeting";

    private readonly ApiTestFixture _fixture;

    public GroupEntryAudienceMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AddressTheOwnerGroup_When_AGroupEntryWasForTheWholeClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(WithCalendar(_fixture.Today), ct);
        await _fixture.MigrateDatabaseToAsync(BeforeGroupAudience, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var garde = ctx.Groups.Groups.IdOf(Garde);
        var elferrat = ctx.Groups.Groups.IdOf(Elferrat);
        Assert.Equal(
            [
                (CalendarEntryAudience.Groups, $"{garde}"),
                (CalendarEntryAudience.Groups, $"{elferrat}"),
                (CalendarEntryAudience.Club, ""),
            ],
            await Task.WhenAll(
                new[] { ClubWideGardeEvening, GardeOnlyTrip, ClubMeeting }.Select(alias =>
                    AudienceOfAsync(planner, ctx, alias)
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
                        ClubWideGardeEvening,
                        "Gardeabend",
                        On(today.AddDays(2)),
                        ownerGroupAlias: Garde,
                        audience: CalendarEntryAudience.Club
                    )
                    .AddCalendarEntry(
                        GardeOnlyTrip,
                        "Ausflug",
                        On(today.AddDays(3)),
                        kind: CalendarEntryKind.Trip,
                        ownerGroupAlias: Garde,
                        audienceGroupAliases: [Elferrat]
                    )
                    .AddCalendarEntry(ClubMeeting, "Sitzung", On(today.AddDays(4)))
            );
        };

    private static DateTimeOffset On(DateOnly day) => ClubClock.At(day, new TimeOnly(19, 0));

    private static async Task<(CalendarEntryAudience, string)> AudienceOfAsync(
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

        return (
            result.Entry.Audience,
            string.Join(",", result.Entry.AudienceGroups.Select(group => group.GroupId).Order())
        );
    }
}
