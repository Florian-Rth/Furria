using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActVideoClipTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActVideoClipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private async Task<(HttpClient Admin, int ActId)> MusicAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 120, ct);

        return (admin, actId);
    }

    [Fact]
    public async Task Should_KeepTheOlderVideoCurrent_When_TheNewerOneIsTrimmedShort()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var older = await VideoOfAsync(_fixture, admin, actId, 70, ct);
        await PlaceVideoAsync(admin, actId, older, 0);
        var newer = await VideoOfAsync(_fixture, admin, actId, 70, ct);
        await PlaceVideoAsync(admin, actId, newer, 0);

        await ClipVideoAsync(admin, actId, newer, 0, 20);

        Assert.False((await VideoInStudioAsync(admin, actId, older)).Outdated);
    }
}
