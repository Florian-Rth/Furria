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
public sealed class PostRunningOrderSuggestionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostRunningOrderSuggestionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ProposeTheCheapestOrderWithoutSaving_When_NeighboursShareAPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch", added: [anna]);
        var rede = await CreateActAsync(client, "Büttenrede", added: [anna]);
        var lied = await CreateActAsync(client, "Lied");
        var finale = await CreateActAsync(client, "Finale");

        var (response, result) = await SuggestAsync(
            client,
            eventId,
            [Line(einmarsch, 0, pinned: true), Line(rede, 1), Line(lied, 2), Line(finale, 3)]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal((1, 0), (result.ConflictsBefore, result.ConflictsAfter));
        Assert.Equal((1000, 0, true), (result.CostBefore, result.CostAfter, result.Proven));
        Assert.Contains(
            result.Steps,
            step => step is { Step: RunningOrderCostStep.NoChangeover, Before: 1000, After: 0 }
        );
        Assert.Equal($"act:{einmarsch}", result.Order[0]);
        var move = Assert.Single(result.Moves, move => move.LineKey == $"act:{rede}");
        Assert.Equal((1, move.LineKey), (move.From, result.Order[move.To]));
        var resolved = Assert.Single(move.Resolved);
        Assert.Equal(FindingKind.NoChangeover, resolved.Kind);
        Assert.Equal([$"act:{einmarsch}", $"act:{rede}"], resolved.LineKeys);
        Assert.Equal([anna], move.RoomFor);
        Assert.Equal((0, 4), (result.RoomBefore, result.RoomAfter));
        Assert.Contains(
            result.Steps,
            step => step is { Step: RunningOrderCostStep.ChangeoverRoom, Before: 0, After: 4 }
        );
        Assert.Empty(result.Holds);
        Assert.False(result.HoldsUnavoidable);
        await ctx.Expected.RunningOrder(eventId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_PlanAnUnplacedNummerFromNowhere_When_ItIsStillInTheTray()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        var einmarsch = await CreateActAsync(client, "Einmarsch", added: [anna]);
        var lied = await CreateActAsync(client, "Lied");
        var rede = await CreateActAsync(client, "Büttenrede", added: [anna]);

        var (response, result) = await SuggestAsync(
            client,
            ctx.Club.Events.IdOf(Gala),
            [Line(einmarsch, 0), Line(lied, 1), Line(rede, null)]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal([$"act:{einmarsch}", $"act:{lied}", $"act:{rede}"], result.Order);
        var move = Assert.Single(result.Moves);
        Assert.Equal(($"act:{rede}", null, 2), (move.LineKey, move.From, move.To));
    }

    [Fact]
    public async Task Should_NameOnlyThePinWhoseReleaseResolvesTheConflict_When_TheBestOrderStillHasOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        var einmarsch = await CreateActAsync(client, "Einmarsch", added: [anna]);
        var rede = await CreateActAsync(client, "Büttenrede", added: [anna]);
        var lied = await CreateActAsync(client, "Lied");

        var (response, result) = await SuggestAsync(
            client,
            ctx.Club.Events.IdOf(Gala),
            [Line(einmarsch, 0, pinned: true), Line(rede, 1, pinned: true), Line(lied, 2)]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, result.ConflictsAfter);
        var hold = Assert.Single(result.Holds);
        Assert.Equal($"act:{rede}", hold.LineKey);
        Assert.Equal(
            (RunningOrderHoldKind.Pin, null, null, null, 0),
            (hold.Kind, hold.BlockKey, hold.RuleIndex, hold.ActWishId, hold.ConflictsWithout)
        );
        Assert.False(result.HoldsUnavoidable);
    }

    [Fact]
    public async Task Should_RefuseTheState_When_ABlockIsSplit()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var a = await CreateActAsync(client, "Einmarsch");
        var b = await CreateActAsync(client, "Lied");
        var c = await CreateActAsync(client, "Finale");

        var (response, _) = await SuggestAsync(
            client,
            ctx.Club.Events.IdOf(Gala),
            [Line(a, 0, blockKey: 1), Line(c, 1), Line(b, 2, blockKey: 1)]
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private static Task<TestResult<PostRunningOrderSuggestionResponse>> SuggestAsync(
        HttpClient client,
        int eventId,
        IReadOnlyList<RunningOrderLineDataDto> lines
    ) =>
        client.POSTAsync<
            PostRunningOrderSuggestion,
            PostRunningOrderSuggestionRequest,
            PostRunningOrderSuggestionResponse
        >(
            new()
            {
                EventId = eventId,
                Lines = lines,
                Rules = [],
                SuspendedActWishIds = [],
            }
        );
}
