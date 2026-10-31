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
public sealed class DeleteActSpotByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActSpotByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheNumberGap_When_ASpotInTheMiddleIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var first = await AddSpotAsync(admin, actId);
        var middle = await AddSpotAsync(admin, actId);
        var last = await AddSpotAsync(admin, actId);

        var response = await DeleteSpotAsync(admin, actId, middle);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [(first, 1), (last, 2)],
            studio.Studio!.Spots.Select(spot => (spot.SpotId, spot.Number))
        );
    }

    [Fact]
    public async Task Should_DropTheSpotsTrackAndRaiseTheVersion_When_TheSpotIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var kept = await AddSpotAsync(admin, actId);
        var removed = await AddSpotAsync(admin, actId);
        var (_, version) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(kept, march, -1, 2), StandingTrack(removed, march, 1, 2)]
        );

        await DeleteSpotAsync(admin, actId, removed);

        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.Equal(
            (version + 1, kept),
            (choreography.Version, Assert.Single(choreography.Tracks).SpotId)
        );
    }

    [Fact]
    public async Task Should_RaiseTheVersion_When_TheRemovedSpotHadNoTrack()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var kept = await AddSpotAsync(admin, actId);
        var (_, version) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(kept, march, 0, 1)]
        );
        var untracked = await AddSpotAsync(admin, actId);

        await DeleteSpotAsync(admin, actId, untracked);

        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.Equal(version + 1, choreography.Version);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheSpotBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var foreignSpot = await AddSpotAsync(admin, otherActId);

        var response = await DeleteSpotAsync(admin, actId, foreignSpot);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
