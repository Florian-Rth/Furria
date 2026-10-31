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
public sealed class PutActFinalTrackTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActFinalTrackTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheCorrectedBeatGrid_When_AnEditorFixesTheFirstOneAndTheTempo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await AdoptAsync(admin, actId, finalTrackId);

        var response = await PutAsync(admin, actId, finalTrackId, 1.25, 128);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var track = Assert.Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks);
        Assert.Equal((1.25, 128.0), (track.FirstBeatSeconds, track.TempoBpm));
    }

    [Fact]
    public async Task Should_Refuse_When_TheFirstOneLiesPastTheEndOfTheFinalFile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);

        var response = await PutAsync(admin, actId, finalTrackId, 95, 128);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        int finalTrackId,
        double firstBeatSeconds,
        double tempoBpm
    ) =>
        client.PUTAsync<PutActFinalTrack, PutActFinalTrackRequest>(
            new()
            {
                ActId = actId,
                FinalTrackId = finalTrackId,
                FirstBeatSeconds = firstBeatSeconds,
                TempoBpm = tempoBpm,
            }
        );
}
