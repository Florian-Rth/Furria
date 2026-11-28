using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActStepStartTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActStepStartTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private async Task<(HttpClient Admin, int ActId, int[] StepIds)> TwoStepsAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 180, ct);
        int[] stepIds =
        [
            await CreateStepAsync(admin, actId, 10, 40),
            await CreateStepAsync(admin, actId, 90, 120),
        ];

        return (admin, actId, stepIds);
    }

    [Fact]
    public async Task Should_MoveOnlyItsOwnStart_When_AStartIsMovedEarlier()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, stepIds) = await TwoStepsAsync(ct);

        var response = await PutStartAsync(admin, actId, stepIds[1], 40);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(10, 40), (40, 120)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_NoLongerAskToCheckTheStart_When_TheStartIsMoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, stepIds) = await TwoStepsAsync(ct);
        await _fixture.FlagStepBordersForCheckAsync(stepIds[1], ct);

        var response = await PutStartAsync(admin, actId, stepIds[1], 80);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(false, false), (false, true)], await StepChecksOfAsync(admin, actId));
    }

    [Theory]
    [InlineData(1, 30)]
    [InlineData(0, 45)]
    public async Task Should_RefuseTheStart_When_ItLeavesTheFreeMusic(
        int stepIndex,
        double atSeconds
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, stepIds) = await TwoStepsAsync(ct);

        var response = await PutStartAsync(admin, actId, stepIds[stepIndex], atSeconds);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal([(10, 40), (90, 120)], await StepSpansOfAsync(admin, actId));
    }

    private static Task<HttpResponseMessage> PutStartAsync(
        HttpClient client,
        int actId,
        int stepId,
        double atSeconds
    ) =>
        client.PUTAsync<PutActStepStart, PutActStepStartRequest>(
            new()
            {
                ActId = actId,
                StepId = stepId,
                AtSeconds = atSeconds,
            }
        );
}
