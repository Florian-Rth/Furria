using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class RestoreActChoreographyVersionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public RestoreActChoreographyVersionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteTheOldDocumentAsANewVersion_When_AnEditorRestoresIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, -1, 1)]
        );
        var (_, second) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(spotId, march, 3, 1)]
        );

        var (response, restored) = await RestoreAsync(admin, actId, first);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.Equal(
            (second + 1, restored, -1.0),
            (
                choreography.Version,
                restored,
                choreography.Tracks.Single().Keyframes.Single().Position.RightMetres
            )
        );
    }

    [Fact]
    public async Task Should_LeaveOutTracksOfRemovedSpots_When_AnOlderVersionIsRestored()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var kept = await AddSpotAsync(admin, actId);
        var removed = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(kept, march, 0, 1), StandingTrack(removed, march, 1, 1)]
        );
        await DeleteSpotAsync(admin, actId, removed);

        var (response, _) = await RestoreAsync(admin, actId, first);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var choreography = (await StudioOfAsync(admin, actId)).Studio!.Choreography!;
        Assert.Equal(kept, Assert.Single(choreography.Tracks).SpotId);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheVersionWasNeverWritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, march, 0, 1)]
        );

        var (response, _) = await RestoreAsync(admin, actId, first + 1);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
