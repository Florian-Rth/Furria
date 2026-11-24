using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActFinalTrackAlignmentTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActFinalTrackAlignmentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReplaceTheAlignmentsInsideThePiece_When_TheJoinedPieceIsAligned()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var (song, songId) = await SplitSongAsync(admin, actId, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await TuneOffsetAsync(admin, actId, finalTrackId, song, 3);
        await TuneOffsetAsync(admin, actId, finalTrackId, song, 10, fromSeconds: 30);
        await CutSongAsync(admin, actId, songId, (5, 60));

        var response = await TuneOffsetAsync(admin, actId, finalTrackId, song, 7, fromSeconds: 5);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(0.0, 3.0), (5.0, 7.0)], await AlignmentsOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_ReportConflict_When_TheFinalFileWasAdopted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await AdoptMatchedAsync(admin, actId, finalTrackId, song);

        var response = await TuneOffsetAsync(admin, actId, finalTrackId, song, 3);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private async Task<(int MediaItemId, int SongId)> SplitSongAsync(
        HttpClient admin,
        int actId,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(mediaItemId, 60, ct);
        var songId = await AddSongAsync(admin, actId, mediaItemId);
        (await CutSongAsync(admin, actId, songId, (0, 20), (30, 60))).EnsureSuccessStatusCode();

        return (mediaItemId, songId);
    }

    private static async Task<(double From, double Offset)[]> AlignmentsOfAsync(
        HttpClient admin,
        int actId
    ) =>
        [
            .. Assert
                .Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks)
                .Alignments.Select(alignment => (alignment.FromSeconds, alignment.OffsetSeconds)),
        ];
}
