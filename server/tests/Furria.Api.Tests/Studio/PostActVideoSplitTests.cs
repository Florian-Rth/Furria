using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActVideoSplitTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActVideoSplitTests(ApiTestFixture fixture)
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
    public async Task Should_SplitTheVideoIntoTwoClipsOfOneFile_When_AnEditorSplitsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var videoId = await VideoOfAsync(_fixture, admin, actId, 70, ct);
        await admin.PUTAsync<PutActVideo, PutActVideoRequest>(
            new()
            {
                ActId = actId,
                VideoId = videoId,
                Name = "Probe Halle",
            }
        );
        await PlaceVideoAsync(admin, actId, videoId, 5);

        var (response, tailId) = await SplitVideoAsync(admin, actId, videoId, 30.5);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var videos = (await StudioOfAsync(admin, actId)).Studio!.Videos;
        var head = videos.Single(video => video.VideoId == videoId);
        var tail = videos.Single(video => video.VideoId == tailId);
        Assert.Equal((0.0, 30.5), (head.ClipStartSeconds, head.ClipEndSeconds!.Value));
        Assert.Equal((30.5, 70.0), (tail.ClipStartSeconds, tail.ClipEndSeconds!.Value));
        Assert.Equal(
            (head.MediaItemId, "Probe Halle", 5.0, VideoPlacement.OnTimeline),
            (tail.MediaItemId, tail.Name, tail.StartSeconds!.Value, tail.Placement)
        );
    }
}
