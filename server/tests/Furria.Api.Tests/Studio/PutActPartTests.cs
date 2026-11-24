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
public sealed class PutActPartTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActPartTests(ApiTestFixture fixture)
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
    public async Task Should_MoveThePartsEnds_When_ItIsRangedOverOtherSteps()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 60, 90);
        await AddPartAsync(admin, actId, stepIds[0], stepIds[0], "Einmarsch");
        var partId = await AddPartAsync(admin, actId, stepIds[2], stepIds[3], "Ausmarsch");

        var response = await PutAsync(
            admin,
            actId,
            partId,
            "Ausmarsch",
            (stepIds[1], stepIds[2]),
            null
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            [
                [stepIds[0]],
                [stepIds[1], stepIds[2]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_RefuseTheRange_When_ItReachesIntoAnotherPart()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[0], stepIds[0], "Einmarsch");
        var partId = await AddPartAsync(admin, actId, stepIds[2], stepIds[2], "Ausmarsch");

        var response = await PutAsync(
            admin,
            actId,
            partId,
            "Ausmarsch",
            (stepIds[0], stepIds[2]),
            null
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        int partId,
        string name,
        (int First, int Last) steps,
        int? mainVideoId
    ) =>
        client.PUTAsync<PutActPart, PutActPartRequest>(
            new()
            {
                ActId = actId,
                PartId = partId,
                Name = name,
                FirstStepId = steps.First,
                LastStepId = steps.Last,
                MainVideoId = mainVideoId,
            }
        );
}
