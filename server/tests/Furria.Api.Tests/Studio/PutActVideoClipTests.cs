using System.Net;
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
    public async Task Should_PlayOnlyTheClip_When_AnEditorTrimsTheVideo()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var videoId = await VideoOfAsync(_fixture, admin, actId, 70, ct);
        await PlaceVideoAsync(admin, actId, videoId, 5);

        var response = await ClipVideoAsync(admin, actId, videoId, 10.25, 40);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var video = await VideoInStudioAsync(admin, actId, videoId);
        Assert.Equal(
            (5.0, 10.25, 40.0),
            (video.StartSeconds!.Value, video.ClipStartSeconds, video.ClipEndSeconds!.Value)
        );
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

    [Fact]
    public async Task Should_RefuseTheClip_When_ItEndsAfterTheVideo()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var videoId = await VideoOfAsync(_fixture, admin, actId, 70, ct);

        var response = await ClipVideoAsync(admin, actId, videoId, 10, 71);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportConflict_When_TheVideoIsStillProcessing()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var videoId = await AddVideoAsync(admin, actId, await UploadVideoAsync(admin, actId, ct));

        var response = await ClipVideoAsync(admin, actId, videoId, 0, 10);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
