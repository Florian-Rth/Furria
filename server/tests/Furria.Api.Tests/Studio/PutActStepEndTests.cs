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
public sealed class PutActStepEndTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActStepEndTests(ApiTestFixture fixture)
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
    public async Task Should_GrowTheStepIntoFreeMusic_When_ItsEndIsMovedLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, stepIds) = await TwoStepsAsync(ct);

        var response = await PutEndAsync(admin, actId, stepIds[0], 90);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(10, 90), (90, 120)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_NoLongerAskToCheckTheEnd_When_TheEndIsMoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, stepIds) = await TwoStepsAsync(ct);
        await _fixture.FlagStepBordersForCheckAsync(stepIds[0], ct);

        var response = await PutEndAsync(admin, actId, stepIds[0], 50);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(true, false), (false, false)], await StepChecksOfAsync(admin, actId));
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(0, 5)]
    [InlineData(1, 200)]
    public async Task Should_RefuseTheEnd_When_ItLeavesTheFreeMusic(int stepIndex, double atSeconds)
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, stepIds) = await TwoStepsAsync(ct);

        var response = await PutEndAsync(admin, actId, stepIds[stepIndex], atSeconds);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal([(10, 40), (90, 120)], await StepSpansOfAsync(admin, actId));
    }

    private static Task<HttpResponseMessage> PutEndAsync(
        HttpClient client,
        int actId,
        int stepId,
        double atSeconds
    ) =>
        client.PUTAsync<PutActStepEnd, PutActStepEndRequest>(
            new()
            {
                ActId = actId,
                StepId = stepId,
                AtSeconds = atSeconds,
            }
        );
}
