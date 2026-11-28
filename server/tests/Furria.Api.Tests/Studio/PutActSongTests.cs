using System.Net;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActSongTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActSongTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CutAwayTheSteps_When_AnEndOfTheirsFallsIntoTheGapBetweenTheHalves()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);
        await StepsBetweenAsync(admin, actId, 30, 70);
        var (_, secondHalf) = await SplitSongAsync(admin, actId, songId, 20);

        await CutSongAsync(admin, actId, secondHalf, 50, 180);

        var steps = (await StudioOfAsync(admin, actId)).Studio!.Steps;
        Assert.Equal(
            [
                ((double?)40, (double?)150, AnchorPlacement.OnTimeline, AnchorPlacement.OnTimeline),
                (null, null, AnchorPlacement.OnTimeline, AnchorPlacement.CutAway),
                (null, null, AnchorPlacement.CutAway, AnchorPlacement.OnTimeline),
            ],
            steps.Select(step =>
                (step.StartSeconds, step.EndSeconds, step.Placement, step.EndPlacement)
            )
        );
    }

    [Fact]
    public async Task Should_RefuseTheCut_When_ItReachesIntoTheOtherHalfOfItsFile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);
        await SplitSongAsync(admin, actId, songId, 30);

        var response = await CutSongAsync(admin, actId, songId, 0, 40);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
