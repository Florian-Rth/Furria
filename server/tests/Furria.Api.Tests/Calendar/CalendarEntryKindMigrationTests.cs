using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class CalendarEntryKindMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforePlainTrainingTrip = "20261109181655_MoreClubIcons";
    private const string GardeTraining = "garde-training";
    private const string LinkedGardeTraining = "linked-garde-training";
    private const string PastGardeTraining = "past-garde-training";
    private const string ElferratTraining = "elferrat-training";
    private const string GardeRehearsal = "garde-rehearsal";
    private const string ClubMeeting = "club-meeting";
    private const string ClubParty = "club-party";
    private const string Parade = "parade";

    private readonly ApiTestFixture _fixture;

    public CalendarEntryKindMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MapEveryOldKindAndKeepUpcomingCastTrainingsAsking_When_TheKindsAreMigrated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(WithOldCalendar(_fixture.Today), ct);
        await GardetanzAsync(ctx, ct);
        await _fixture.MigrateDatabaseToAsync(BeforePlainTrainingTrip, ct);
        await RewriteAsync(ctx, GardeRehearsal, "Rehearsal", ct);
        await RewriteAsync(ctx, ClubMeeting, "Meeting", ct);
        await RewriteAsync(ctx, ClubParty, "Party", ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var asksTheActsSession =
            CastAttendance.SessionYearOf(SoonOf(_fixture.Today))
            == ClubSession.RelevantYearOf(_fixture.Today);
        Assert.Equal(
            [
                (CalendarEntryKind.Training, asksTheActsSession),
                (CalendarEntryKind.Training, asksTheActsSession),
                (CalendarEntryKind.Training, false),
                (CalendarEntryKind.Training, false),
                (CalendarEntryKind.Plain, false),
                (CalendarEntryKind.Plain, false),
                (CalendarEntryKind.Plain, false),
                (CalendarEntryKind.Trip, false),
            ],
            await Task.WhenAll(
                new[]
                {
                    GardeTraining,
                    LinkedGardeTraining,
                    PastGardeTraining,
                    ElferratTraining,
                    GardeRehearsal,
                    ClubMeeting,
                    ClubParty,
                    Parade,
                }.Select(alias => KindAndAskingOfAsync(planner, ctx, alias))
            )
        );
    }

    private static Action<SeedContextBuilder> WithOldCalendar(DateOnly today) =>
        builder =>
        {
            GardeWithDancers(today)(builder);
            builder.Club(club =>
                club.AddCalendarEntry(
                        GardeTraining,
                        "Training",
                        SoonOf(today),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde
                    )
                    .AddCalendarEntry(
                        LinkedGardeTraining,
                        "Gemeinsames Training",
                        SoonOf(today).AddHours(1),
                        kind: CalendarEntryKind.Training,
                        participatingGroupAliases: [Garde]
                    )
                    .AddCalendarEntry(
                        PastGardeTraining,
                        "Training",
                        On(today.AddDays(-2)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Garde
                    )
                    .AddCalendarEntry(
                        ElferratTraining,
                        "Elferrat-Training",
                        On(today.AddDays(3)),
                        kind: CalendarEntryKind.Training,
                        ownerGroupAlias: Elferrat
                    )
                    .AddCalendarEntry(
                        GardeRehearsal,
                        "Probe",
                        On(today.AddDays(4)),
                        ownerGroupAlias: Garde
                    )
                    .AddCalendarEntry(ClubMeeting, "Sitzung", On(today.AddDays(5)))
                    .AddCalendarEntry(ClubParty, "Feier", On(today.AddDays(6)))
                    .AddCalendarEntry(
                        Parade,
                        "Umzug",
                        On(today.AddDays(7)),
                        kind: CalendarEntryKind.Trip,
                        participatingGroupAliases: [Garde]
                    )
            );
        };

    private static DateTimeOffset On(DateOnly day) => ClubClock.At(day, new TimeOnly(19, 0));

    private static DateTimeOffset SoonOf(DateOnly today) => On(today.AddDays(2));

    private Task RewriteAsync(
        SeededContext ctx,
        string alias,
        string oldKind,
        CancellationToken ct
    ) =>
        _fixture.RewriteCalendarEntryKindDirectlyAsync(
            ctx.Club.CalendarEntries.IdOf(alias),
            oldKind,
            ct
        );

    private static async Task<(CalendarEntryKind, bool)> KindAndAskingOfAsync(
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

        return (result.Entry.Kind, result.Entry.AsksForResponse);
    }
}
