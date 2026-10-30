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
public sealed class DeleteActVideoByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActVideoByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheVideoAndFreeItsPart_When_AnEditorDeletesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 120, ct);
        var stepIds = await MarkedAsync(admin, actId, 60);
        await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        var videoId = await VideoOfAsync(_fixture, admin, actId, 70, ct);
        await PlaceVideoAsync(admin, actId, videoId, 0);

        var response = await admin.DELETEAsync<DeleteActVideoById, DeleteActVideoByIdRequest>(
            new() { ActId = actId, VideoId = videoId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = (await StudioOfAsync(admin, actId)).Studio!;
        Assert.Equal((0, (int?)null), (studio.Videos.Count, studio.Parts[0].MainVideoId));
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheVideoBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var foreign = await AddVideoAsync(
            admin,
            otherActId,
            await UploadVideoAsync(admin, otherActId, ct)
        );

        var response = await admin.DELETEAsync<DeleteActVideoById, DeleteActVideoByIdRequest>(
            new() { ActId = actId, VideoId = foreign }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
