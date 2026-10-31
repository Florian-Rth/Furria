using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class DeleteRunningOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteRunningOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheRunningOrderButKeepItsActs_When_ThePlannerDeletesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch");
        await SavedAsync(client, eventId, null, [Line(einmarsch, 0)]);

        var response = await client.DELETEAsync<DeleteRunningOrder, DeleteRunningOrderRequest>(
            new() { EventId = eventId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RunningOrder(eventId)
            .ToNotExist()
            .RunningOrder(eventId)
            .ToHaveAppearancesOf()
            .Act(einmarsch)
            .ToHaveName("Einmarsch")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseToDeleteTheRunningOrder_When_AnAppearanceChangesTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await CreateActAsync(client, "Gardetanz", ctx.Groups.Groups.IdOf(Garde));
        await SavedAsync(client, eventId, null, [Line(tanz, 0)]);
        await _fixture.ChangeEveningCastDirectlyAsync(
            eventId,
            tanz,
            ctx.Identity.People.IdOf(Anna),
            CastChange.Removed,
            ct
        );

        var response = await client.DELETEAsync<DeleteRunningOrder, DeleteRunningOrderRequest>(
            new() { EventId = eventId }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal(
            "Für diesen Abend angepasst, die Anpassung ginge verloren: „Gardetanz“ (Besetzung).",
            await RefusalOfAsync(response)
        );
        await ctx
            .Expected.RunningOrder(eventId)
            .ToHaveVersion(1)
            .RunningOrder(eventId)
            .ToHaveAppearancesOf(tanz)
            .AssertAsync(ct);
    }
}
