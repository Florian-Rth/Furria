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
public sealed class PutActSongOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActSongOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PlayTheSongsInTheNewOrder_When_AnEditorReordersThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AddedSongAsync(admin, actId, ct);
        var polka = await AddedSongAsync(admin, actId, ct);
        var finale = await AddedSongAsync(admin, actId, ct);

        var response = await PutAsync(admin, actId, [finale, march, polka]);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [(finale, 0), (march, 1), (polka, 2)],
            studio.Studio!.Songs.Select(song => (song.SongId, song.Position))
        );
    }

    [Fact]
    public async Task Should_RefuseAndKeepTheOrder_When_TheListMissesASongAddedMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AddedSongAsync(admin, actId, ct);
        var polka = await AddedSongAsync(admin, actId, ct);
        var addedMeanwhile = await AddedSongAsync(admin, actId, ct);

        var response = await PutAsync(admin, actId, [polka, march]);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [march, polka, addedMeanwhile],
            studio.Studio!.Songs.Select(song => song.SongId)
        );
    }

    [Fact]
    public async Task Should_Refuse_When_TheListNamesASongTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AddedSongAsync(admin, actId, ct);
        await AddedSongAsync(admin, actId, ct);

        var response = await PutAsync(admin, actId, [march, march]);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheListSwapsInASongOfAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AddedSongAsync(admin, actId, ct);
        await AddedSongAsync(admin, actId, ct);
        var foreignSong = await AddedSongAsync(admin, otherActId, ct);

        var response = await PutAsync(admin, actId, [foreignSong, march]);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        IReadOnlyList<int> songIds
    ) =>
        client.PUTAsync<PutActSongOrder, PutActSongOrderRequest>(
            new() { ActId = actId, SongIds = songIds }
        );
}
