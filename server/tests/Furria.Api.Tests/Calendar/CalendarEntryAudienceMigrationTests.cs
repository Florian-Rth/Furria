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
public sealed class CalendarEntryAudienceMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeAudience = "20261110131048_CalendarEntryKindsPlainTrainingTrip";
    private const string ClubVisibleGardeTraining = "club-visible-garde-training";
    private const string GroupOnlyGardeTrip = "group-only-garde-trip";
    private const string PublicClubMeeting = "public-club-meeting";
    private const string Parade = "parade";

    private readonly ApiTestFixture _fixture;

    public CalendarEntryAudienceMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepWhoIsConcerned_When_TheVisibilityBecomesAnAudience()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(WithOldCalendar(_fixture.Today), ct);
        await _fixture.MigrateDatabaseToAsync(BeforeAudience, ct);
        await RewriteAsync(ctx, ClubVisibleGardeTraining, "Club", ct);
        await RewriteAsync(ctx, PublicClubMeeting, "Public", ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var garde = ctx.Groups.Groups.IdOf(Garde);
        var elferrat = ctx.Groups.Groups.IdOf(Elferrat);
        Assert.Equal(
            [
                (CalendarEntryAudience.Groups, $"{garde}", ""),
                (
                    CalendarEntryAudience.Groups,
                    string.Join(",", new[] { garde, elferrat }.Order()),
                    $"{elferrat}"
                ),
                (CalendarEntryAudience.Club, "", ""),
                (CalendarEntryAudience.Club, "", $"{garde}"),
            ],
            await Task.WhenAll(
                new[]
                {
                    ClubVisibleGardeTraining,
                    GroupOnlyGardeTrip,
                    PublicClubMeeting,
                    Parade,
                }.Select(alias => AudienceOfAsync(planner, ctx, alias))
            )
        );
    }

    private static Action<SeedContextBuilder> WithOldCalendar(DateOnly today) =>
        builder =>
        {
            GardeWithDancers(today)(builder);
            builder.Club(club =>
                club.AddCalendarEntry(
                        ClubVisibleGardeTraining,
                        "Training",
                        On(today.AddDays(2)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde
                    )
                    .AddCalendarEntry(
                        GroupOnlyGardeTrip,
                        "Ausflug",
                        On(today.AddDays(3)),
                        kind: CalendarEntryKind.Trip,
                        ownerGroupAlias: Garde,
                        participatingGroupAliases: [Elferrat]
                    )
                    .AddCalendarEntry(PublicClubMeeting, "Sitzung", On(today.AddDays(4)))
                    .AddCalendarEntry(
                        Parade,
                        "Umzug",
                        On(today.AddDays(5)),
                        kind: CalendarEntryKind.Trip,
                        participatingGroupAliases: [Garde]
                    )
            );
        };

    private static DateTimeOffset On(DateOnly day) => ClubClock.At(day, new TimeOnly(19, 0));

    private Task RewriteAsync(
        SeededContext ctx,
        string alias,
        string visibility,
        CancellationToken ct
    ) =>
        _fixture.RewriteCalendarEntryVisibilityDirectlyAsync(
            ctx.Club.CalendarEntries.IdOf(alias),
            visibility,
            ct
        );

    private static async Task<(CalendarEntryAudience, string, string)> AudienceOfAsync(
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
            string.Join(",", result.Entry.AudienceGroups.Select(group => group.GroupId).Order()),
            string.Join(",", result.Entry.ParticipatingGroups.Select(group => group.GroupId))
        );
    }
}
