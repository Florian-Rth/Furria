using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActVideoStartTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActVideoStartTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private async Task<(HttpClient Admin, int ActId)> MusicAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 60, ct);
        await SongOfAsync(_fixture, admin, actId, 60, ct);

        return (admin, actId);
    }

    [Fact]
    public async Task Should_MakeThePlacedVideoTheMainVideo_When_ItsPartHasNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 60);
        await AddPartAsync(admin, actId, stepIds[0], stepIds[0], "Marsch");
        await AddPartAsync(admin, actId, stepIds[1], stepIds[1], "Polka");
        var videoId = await VideoOfAsync(_fixture, admin, actId, 50, ct);

        await PlaceVideoAsync(admin, actId, videoId, 62);

        var parts = (await StudioOfAsync(admin, actId)).Studio!.Parts;
        Assert.Equal([null, videoId], parts.Select(part => part.MainVideoId));
    }

    [Fact]
    public async Task Should_OutdateTheOlderVideoAndHandOverItsPart_When_ANewerVideoCoversIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 60);
        await AddPartAsync(admin, actId, stepIds[0], stepIds[0], "Marsch");
        await AddPartAsync(admin, actId, stepIds[1], stepIds[1], "Polka");
        var older = await VideoOfAsync(_fixture, admin, actId, 40, ct);
        await PlaceVideoAsync(admin, actId, older, 65);
        var newer = await VideoOfAsync(_fixture, admin, actId, 58, ct);

        await PlaceVideoAsync(admin, actId, newer, 61);

        var studio = (await StudioOfAsync(admin, actId)).Studio!;
        Assert.Equal(
            [(older, true), (newer, false)],
            studio.Videos.Select(video => (video.VideoId, video.Outdated))
        );
        Assert.Equal(newer, studio.Parts[1].MainVideoId);
    }
}
