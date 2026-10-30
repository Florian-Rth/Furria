using System.Net;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Calendar.LiveSteps;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.EveningSteps;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class PutCalendarEntryLiveTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutCalendarEntryLiveTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MoveToTheNextActAndKeepTheStart_When_TheOperatorAdvances()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var (first, second) = await TwoActEveningAsync(planner, eventId);
        var (_, started) = await MoveLiveAsync(planner, eventId, null, first);

        var (response, moved) = await MoveLiveAsync(planner, eventId, first, second);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(second, moved.AppearanceId);
        Assert.Equal(started.StartedAt, moved.StartedAt);
    }

    [Fact]
    public async Task Should_Return409_When_ThePointerMovedSinceTheOperatorLooked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var (first, second) = await TwoActEveningAsync(planner, eventId);
        (await MoveLiveAsync(planner, eventId, null, first)).Response.EnsureSuccessStatusCode();

        var (response, _) = await MoveLiveAsync(planner, eventId, null, first);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var (_, live) = await LiveOfAsync(planner, eventId);
        Assert.Equal(first, live.Live?.AppearanceId);
        Assert.NotEqual(second, live.Live?.AppearanceId);
    }

    [Fact]
    public async Task Should_EndTheNight_When_TheOperatorMovesPastTheLastAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var (first, _) = await TwoActEveningAsync(planner, eventId);
        (await MoveLiveAsync(planner, eventId, null, first)).Response.EnsureSuccessStatusCode();

        var (response, ended) = await MoveLiveAsync(planner, eventId, first, null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(ended.AppearanceId);
    }

    [Fact]
    public async Task Should_Return404_When_TheActIsNotPlacedInThisEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LiveEvening(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var placed = await CreateActAsync(planner, "Einmarsch", kind: ActKind.Point);
        var unplaced = await CreateActAsync(planner, "Tombola", kind: ActKind.Point);
        await SavedAsync(planner, eventId, null, [Line(placed, 0), Line(unplaced, null)]);
        var ablauf = await AblaufOfAsync(planner, eventId);
        var inTray = ablauf.Lines.Single(line => line.Position is null).LineId;

        var (response, _) = await MoveLiveAsync(planner, eventId, null, inTray);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task<(int First, int Second)> TwoActEveningAsync(
        HttpClient planner,
        int eventId
    )
    {
        var einmarsch = await CreateActAsync(planner, "Einmarsch", kind: ActKind.Point);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        await SavedAsync(planner, eventId, null, [Line(einmarsch, 0), Line(rede, 1)]);
        var (_, live) = await LiveOfAsync(planner, eventId);

        return (live.Lines[0].AppearanceId, live.Lines[1].AppearanceId);
    }
}
