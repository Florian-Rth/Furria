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
public sealed class PutActSongTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActSongTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StoreTheCutAndTheBeatGrid_When_AnEditorCutsTheSong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);

        var response = await PutAsync(admin, actId, songId, Cut(12.5, 95, 12.75, 128));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        var song = Assert.Single(studio.Studio!.Songs);
        Assert.Equal(
            (12.5, 95.0, 12.75, 128.0),
            (song.StartSeconds, song.EndSeconds, song.FirstBeatSeconds, song.TempoBpm)
        );
        Assert.Equal(82.5, studio.Studio.Music.LengthSeconds, 0.001);
    }

    [Fact]
    public async Task Should_FallBackToTheAnalysis_When_TheBeatGridCorrectionIsCleared()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);
        await PutAsync(admin, actId, songId, Cut(0, 180, 1.5, 120));

        await PutAsync(admin, actId, songId, Cut(0, 180, null, null));

        var studio = await StudioOfAsync(admin, actId);
        var song = Assert.Single(studio.Studio!.Songs);
        Assert.Equal((null, null), (song.FirstBeatSeconds, song.TempoBpm));
    }

    [Fact]
    public async Task Should_RefuseTheCut_When_ItEndsAfterTheSong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);

        var response = await PutAsync(admin, actId, songId, Cut(0, 181, null, null));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheBeatGrid_When_ItsFirstBeatLiesAfterTheSong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);

        var response = await PutAsync(admin, actId, songId, Cut(0, 180, 200, 120));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_StoreTheCut_When_TheSongIsStillBeingProcessed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var songId = await AddedSongAsync(admin, actId, ct);

        var response = await PutAsync(admin, actId, songId, Cut(3, 60, null, null));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        var song = Assert.Single(studio.Studio!.Songs);
        Assert.Equal((3.0, 60.0), (song.StartSeconds, song.EndSeconds));
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheSongBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var foreignSong = await AddedSongAsync(admin, otherActId, ct);

        var response = await PutAsync(admin, actId, foreignSong, Cut(0, 60, null, null));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static PutActSongRequest Cut(
        double start,
        double end,
        double? firstBeat,
        double? tempo
    ) =>
        new()
        {
            ActId = 0,
            SongId = 0,
            StartSeconds = start,
            EndSeconds = end,
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
