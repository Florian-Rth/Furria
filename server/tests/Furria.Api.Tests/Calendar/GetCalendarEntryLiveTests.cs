using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Calendar.LiveSteps;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class GetCalendarEntryLiveTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetCalendarEntryLiveTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListThePlacedActsWithTheirEveningCast_When_TheNightHasNotStarted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        var tanz = await GardetanzAsync(ctx, ct);
        await SavedAsync(planner, eventId, null, [Line(tanz, 0), Line(rede, 1)]);
        var member = await ctx.Identity.ClientForAsync(Mia, ct);

        var (response, result) = await LiveOfAsync(member, eventId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.Live);
        Assert.False(result.CanDirect);
        Assert.Equal([tanz, rede], result.Lines.Select(line => line.ActId));
        Assert.Equal(
            [people.IdOf(Anna), people.IdOf(Dora)],
            result.Lines[0].Cast.Select(person => person.PersonId).Order()
        );
    }

    [Fact]
    public async Task Should_NameWhoIsMissingAndWhoStandsIn_When_TheEveningCastChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await GardetanzAsync(ctx, ct);
        await SavedAsync(planner, eventId, null, [Line(tanz, 0)]);
        (
            await CastForEveningAsync(admin, tanz, eventId, people.IdOf(Anna), dances: false)
        ).EnsureSuccessStatusCode();
        (
            await CastForEveningAsync(admin, tanz, eventId, people.IdOf(Clara), dances: true)
        ).EnsureSuccessStatusCode();

        var (_, result) = await LiveOfAsync(planner, eventId);

        var line = Assert.Single(result.Lines);
        Assert.Equal([people.IdOf(Anna)], line.Missing.Select(person => person.PersonId));
        Assert.Equal(
            [(people.IdOf(Clara), true), (people.IdOf(Dora), false)],
            line.Cast.Select(person => (person.PersonId, person.StandsIn))
        );
        Assert.True(result.CanDirect);
    }

    [Fact]
    public async Task Should_ShowTheActOnStage_When_TheOperatorStartedTheNight()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        await SavedAsync(planner, eventId, null, [Line(rede, 0)]);
        var (_, before) = await LiveOfAsync(planner, eventId);
        var onStage = before.Lines[0].AppearanceId;
        (await MoveLiveAsync(planner, eventId, null, onStage)).Response.EnsureSuccessStatusCode();
        var member = await ctx.Identity.ClientForAsync(Mia, ct);

        var (_, result) = await LiveOfAsync(member, eventId);

        Assert.NotNull(result.Live);
        Assert.Equal(onStage, result.Live.AppearanceId);
    }

    [Fact]
    public async Task Should_Return404_When_TheViewerCannotSeeTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var outsider = await ctx.Identity.ClientForAsync(Ben, ct);

        var (response, _) = await LiveOfAsync(outsider, ctx.Club.Events.IdOf(Gala));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
