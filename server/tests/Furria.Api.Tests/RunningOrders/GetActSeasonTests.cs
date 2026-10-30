using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class GetActSeasonTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetActSeasonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PlaceEachActOnTheSessionsEvenings_When_APlannerOpensTheSeason()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await GardetanzAsync(ctx, ct);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        var lied = await CreateActAsync(planner, "Lied", kind: ActKind.Music);
        await SavedAsync(planner, eventId, null, [Line(tanz, 0), Line(rede, null)]);

        var (response, result) = await SeasonOfAsync(planner);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(result.Evenings, evening => evening.EventId == eventId);
        var cells = result.Acts.ToDictionary(
            act => act.ActId,
            act => act.Appearances.Select(cell => (cell.EventId, cell.Position)).ToList()
        );
        Assert.Equal([(eventId, (int?)0)], cells[tanz]);
        Assert.Equal([(eventId, (int?)null)], cells[rede]);
        Assert.Empty(cells[lied]);
    }

    [Fact]
    public async Task Should_ShowTheEveningChanges_When_TheGroupAdjustedTheEveningCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await GardetanzAsync(ctx, ct);
        await SavedAsync(planner, eventId, null, [Line(tanz, 0)]);
        (
            await CastForEveningAsync(admin, tanz, eventId, people.IdOf(Anna), dances: false)
        ).EnsureSuccessStatusCode();

        var (_, result) = await SeasonOfAsync(planner);

        var cell = Assert.Single(result.Acts.Single(act => act.ActId == tanz).Appearances);
        Assert.Equal([EveningChange.Cast], cell.Changes);
        Assert.Equal([people.IdOf(Anna)], cell.Removed.Select(person => person.PersonId));
        Assert.Empty(cell.Added);
    }

    [Fact]
    public async Task Should_DeriveTheReadinessByActKind_When_NothingIsBuiltYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var tanz = await GardetanzAsync(ctx, ct);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);

        var (_, result) = await SeasonOfAsync(planner);

        var readiness = result.Acts.ToDictionary(
            act => act.ActId,
            act => act.Readiness.Select(check => (check.Check, check.Done)).ToList()
        );
        Assert.Equal(
            [
                (ReadinessCheck.Music, false),
                (ReadinessCheck.Steps, false),
                (ReadinessCheck.Formation, false),
                (ReadinessCheck.Videos, false),
                (ReadinessCheck.FinalFile, false),
                (ReadinessCheck.Cast, true),
            ],
            readiness[tanz]
        );
        Assert.Equal([(ReadinessCheck.Cast, false)], readiness[rede]);
    }

    private static Task<TestResult<GetActSeasonResponse>> SeasonOfAsync(HttpClient client) =>
        client.GETAsync<GetActSeason, GetActSeasonRequest, GetActSeasonResponse>(new());
}
