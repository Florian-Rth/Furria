using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class DeleteActOpenAppearancesTests : IClassFixture<ApiTestFixture>
{
    private const string Kappenabend = "kappenabend";

    private readonly ApiTestFixture _fixture;

    public DeleteActOpenAppearancesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeTheActOutOfEveryUpcomingEveningAndCloseItsGap_When_ThePlannerWithdrawsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var summer = ctx.Club.Events.IdOf(SummerParty);
        var einmarsch = await CreateActAsync(client, "Einmarsch");
        var pause = await CreateActAsync(client, "Pause");
        var finale = await CreateActAsync(client, "Finale");
        var galaBefore = await SavedAsync(
            client,
            gala,
            null,
            [Line(einmarsch, 0), Line(pause, 1, blockKey: 7), Line(finale, 2, blockKey: 7)],
            [Rule(RunningOrderRuleKind.Before, pause, finale)]
        );
        await SavedAsync(client, summer, null, [Line(pause, null), Line(finale, 0)]);

        var response = await WithdrawAsync(client, pause);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var galaAfter = await RunningOrderOfAsync(client, gala);
        Assert.Equal(
            [(einmarsch, (int?)0, (int?)null), (finale, 1, null)],
            galaAfter.Lines.Select(line => (line.Act.ActId, line.Position, line.BlockKey))
        );
        Assert.Empty(galaAfter.Rules);
        Assert.True(galaAfter.Version > galaBefore.Version);
        var summerAfter = await RunningOrderOfAsync(client, summer);
        Assert.Equal([finale], summerAfter.Lines.Select(line => line.Act.ActId));
    }

    [Fact]
    public async Task Should_LeaveAnEveningThatIsOver_When_ThePlannerWithdrawsTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            PlannerWithGala(
                _fixture.Today,
                club =>
                    club.AddEvent(
                        Kappenabend,
                        "Kappenabend",
                        ClubClock.At(_fixture.Today.AddDays(-3), new TimeOnly(19, 11)),
                        "buergerhaus"
                    )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var over = ctx.Club.Events.IdOf(Kappenabend);
        var gala = ctx.Club.Events.IdOf(Gala);
        var pause = await CreateActAsync(client, "Pause");
        await SavedAsync(client, over, null, [Line(pause, 0)]);
        await SavedAsync(client, gala, null, [Line(pause, 0)]);

        var response = await WithdrawAsync(client, pause);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Single((await RunningOrderOfAsync(client, over)).Lines);
        Assert.Empty((await RunningOrderOfAsync(client, gala)).Lines);
    }

    private static Task<HttpResponseMessage> WithdrawAsync(HttpClient client, int actId) =>
        client.DELETEAsync<DeleteActOpenAppearances, DeleteActOpenAppearancesRequest>(
            new() { ActId = actId }
        );

    private static async Task<GetRunningOrderResponse> RunningOrderOfAsync(
        HttpClient client,
        int eventId
    )
    {
        var (response, result) = await client.GETAsync<
            GetRunningOrder,
            GetRunningOrderRequest,
            GetRunningOrderResponse
        >(new() { EventId = eventId });
        response.EnsureSuccessStatusCode();

        return result;
    }
}
