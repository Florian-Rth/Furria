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
public sealed class DeleteActFinalTrackByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActFinalTrackByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheWaitingFinalFile_When_AnEditorDiscardsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await TuneOffsetAsync(admin, actId, finalTrackId, song, 3);

        var response = await DeleteAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty((await StudioOfAsync(admin, actId)).Studio!.FinalTracks);
    }

    [Fact]
    public async Task Should_Refuse_When_TheFinalFileWasAdopted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await AdoptMatchedAsync(admin, actId, finalTrackId, song);

        var response = await DeleteAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Task<HttpResponseMessage> DeleteAsync(
        HttpClient client,
        int actId,
        int finalTrackId
    ) =>
        client.DELETEAsync<DeleteActFinalTrackById, DeleteActFinalTrackByIdRequest>(
            new() { ActId = actId, FinalTrackId = finalTrackId }
        );
}
