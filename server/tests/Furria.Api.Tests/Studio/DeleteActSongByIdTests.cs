using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Media;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class DeleteActSongByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActSongByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeTheSongOutOfTheMixButKeepTheFile_When_AnEditorRemovesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var marchSong = await AddSongAsync(admin, actId, march);
        var polkaSong = await AddedSongAsync(admin, actId, ct);

        var response = await DeleteAsync(admin, actId, marchSong);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal([polkaSong], studio.Studio!.Songs.Select(song => song.SongId));
        await ctx.Expected.MediaItem(march).ToBeOwnedBy(MediaOwner.Act(actId)).AssertAsync(ct);
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

        var response = await DeleteAsync(admin, actId, foreignSong);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var studio = await StudioOfAsync(admin, otherActId);
        Assert.Equal([foreignSong], studio.Studio!.Songs.Select(song => song.SongId));
    }

    private static Task<HttpResponseMessage> DeleteAsync(
        HttpClient client,
        int actId,
        int songId
    ) =>
        client.DELETEAsync<DeleteActSongById, DeleteActSongByIdRequest>(
            new() { ActId = actId, SongId = songId }
        );
}
