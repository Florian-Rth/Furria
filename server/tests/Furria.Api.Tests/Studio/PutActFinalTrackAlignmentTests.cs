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
    public async Task Should_KeepTheFineTunedOffset_When_AnEditorMovesASongInTheFinalFile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await TuneOffsetAsync(admin, actId, finalTrackId, song, 3);

        var response = await TuneOffsetAsync(admin, actId, finalTrackId, song, 3.12, 0.98);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var alignment = Assert.Single(
            Assert.Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks).Alignments
        );
        Assert.Equal(
            (song, 3.12, 0.98),
            (alignment.SourceMediaItemId, alignment.OffsetSeconds, alignment.Stretch)
        );
    }

    [Fact]
    public async Task Should_AlignToThePreviousFinalFile_When_ANewerOneFollowsTheAdoptedOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var (firstId, firstMedia) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await AdoptMatchedAsync(admin, actId, firstId, song);
        var (secondId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 92, ct);

        var response = await TuneOffsetAsync(admin, actId, secondId, firstMedia, 2);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheMusicDoesNotPlayInTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var loose = await UploadSongAsync(admin, actId, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);

        var response = await TuneOffsetAsync(admin, actId, finalTrackId, loose, 3);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
}
