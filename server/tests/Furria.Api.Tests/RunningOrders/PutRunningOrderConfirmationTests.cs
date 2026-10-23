using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class PutRunningOrderConfirmationTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutRunningOrderConfirmationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ConfirmTheOrderAndClearTheChangeMark_When_ThePlannerConfirmsAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch");
        var finale = await CreateActAsync(client, "Finale");
        var first = await SavedAsync(client, eventId, null, [Line(einmarsch, 0)]);
        await ConfirmAsync(client, eventId, confirmed: true);
        await SavedAsync(client, eventId, first.Version, [Line(einmarsch, null), Line(finale, 0)]);

        var (response, result) = await ConfirmAsync(client, eventId, confirmed: true);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), result.ConfirmedAt);
        Assert.False(result.ChangedSinceConfirmed);
        Assert.Equal(2, result.Lines.Count);
    }

    [Fact]
    public async Task Should_TakeTheConfirmationBack_When_ThePlannerUnconfirms()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        await SavedAsync(client, eventId, null, []);
        await ConfirmAsync(client, eventId, confirmed: true);

        var (_, result) = await ConfirmAsync(client, eventId, confirmed: false);

        Assert.Null(result.ConfirmedAt);
        Assert.False(result.ChangedSinceConfirmed);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEventHasNoRunningOrder()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);

        var (response, _) = await ConfirmAsync(client, ctx.Club.Events.IdOf(Gala), true);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
