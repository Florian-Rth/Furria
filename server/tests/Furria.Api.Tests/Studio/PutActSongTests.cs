using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
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
    public async Task Should_CutAwayTheSteps_When_AnEndOfTheirsFallsIntoTheGapBetweenTwoPieces()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);
        await StepsBetweenAsync(admin, actId, 30, 70);

        await PutAsync(admin, actId, songId, Cut([(0, 20), (50, 180)], null, null));

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
    public async Task Should_RefuseThePieces_When_TheyOverlap()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);

        var response = await PutAsync(admin, actId, songId, Cut([(0, 30), (29.5, 60)], null, null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static PutActSongRequest Cut(
        (double Start, double End)[] pieces,
        double? firstBeat,
        double? tempo
    ) =>
        new()
        {
            ActId = 0,
            SongId = 0,
            Pieces = PiecesOf(pieces),
            FirstBeatSeconds = firstBeat,
            TempoBpm = tempo,
        };

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        int songId,
        PutActSongRequest cut
    ) =>
        client.PUTAsync<PutActSong, PutActSongRequest>(cut with { ActId = actId, SongId = songId });
}
