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

    private async Task<(HttpClient Admin, int ActId)> MusicAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 180, ct);

        return (admin, actId);
    }

    [Fact]
    public async Task Should_MoveTheBorder_When_AnEditorDragsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30);

        var response = await PutAsync(admin, actId, stepIds[1], 45);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(0, 45), (45, 180)], await StepSpansOfAsync(admin, actId));
    }

    [Theory]
    [InlineData(1, 100)]
    [InlineData(1, 0)]
    [InlineData(0, 10)]
    public async Task Should_RefuseTheMove_When_TheBorderWouldLeaveItsNeighbours(
        int stepIndex,
        double atSeconds
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);

        var response = await PutAsync(admin, actId, stepIds[stepIndex], atSeconds);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PutAsync(
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
