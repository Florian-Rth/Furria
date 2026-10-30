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
public sealed class PostActVideoTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActVideoTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheVideoUnaligned_When_TheGroupAdminAddsAnUploadedVideo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var mediaItemId = await UploadVideoAsync(admin, actId, ct);

        var videoId = await AddVideoAsync(admin, actId, mediaItemId);

        var video = await VideoInStudioAsync(admin, actId, videoId);
        Assert.Equal(
            (mediaItemId, VideoPlacement.Unaligned, (double?)null),
            (video.MediaItemId, video.Placement, video.StartSeconds)
        );
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheFileIsASongOfTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await UploadSongAsync(admin, actId, ct);

        var response = await PostAsync(admin, actId, song);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportConflict_When_TheVideoIsAddedTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var mediaItemId = await UploadVideoAsync(admin, actId, ct);
        await AddVideoAsync(admin, actId, mediaItemId);

        var response = await PostAsync(admin, actId, mediaItemId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static async Task<HttpResponseMessage> PostAsync(
        HttpClient client,
        int actId,
        int mediaItemId
    ) =>
        (
            await client.POSTAsync<PostActVideo, PostActVideoRequest, PostActVideoResponse>(
                new() { ActId = actId, MediaItemId = mediaItemId }
            )
        ).Response;
}
