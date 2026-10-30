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
public sealed class PutActPartTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActPartTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private async Task<(HttpClient Admin, int ActId)> MusicAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 180, ct);

        return (admin, actId);
    }

    [Fact]
    public async Task Should_RenameThePartAndSetItsMainVideo_When_AnEditorSettlesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30);
        var partId = await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        var videoId = await VideoOfAsync(admin, actId, ct);

        var response = await PutAsync(admin, actId, partId, "Auftakt", stepIds[0], videoId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var part = Assert.Single((await StudioOfAsync(admin, actId)).Studio!.Parts);
        Assert.Equal(("Auftakt", videoId), (part.Name, part.MainVideoId));
    }

    [Fact]
    public async Task Should_KeepTheFirstPartReachingBack_When_ItIsRenamedAtItsFirstShownStep()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30);
        var partId = await AddPartAsync(admin, actId, stepIds[1], "Einmarsch");

        var response = await PutAsync(admin, actId, partId, "Auftakt", stepIds[0], null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            [
                [stepIds[0], stepIds[1]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_MoveThePartsBorder_When_ItBeginsOnAnotherStep()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        var partId = await AddPartAsync(admin, actId, stepIds[2], "Ausmarsch");

        await PutAsync(admin, actId, partId, "Ausmarsch", stepIds[1], null);

        Assert.Equal(
            [
                [stepIds[0]],
                [stepIds[1], stepIds[2]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_KeepTheFirstPartReachingBack_When_TheNextPartMovesOntoItsStoredStep()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[1], "Einmarsch");
        var partId = await AddPartAsync(admin, actId, stepIds[2], "Ausmarsch");

        var response = await PutAsync(admin, actId, partId, "Ausmarsch", stepIds[1], null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            [
                [stepIds[0]],
                [stepIds[1], stepIds[2]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_RefuseTheBorder_When_ItPassesThePreviousPart()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[1], "Einmarsch");
        var partId = await AddPartAsync(admin, actId, stepIds[2], "Ausmarsch");

        var response = await PutAsync(admin, actId, partId, "Ausmarsch", stepIds[0], null);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheMainVideoBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 180, ct);
        var stepIds = await MarkedAsync(admin, actId, 30);
        var partId = await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        var foreignVideo = await VideoOfAsync(admin, otherActId, ct);

        var response = await PutAsync(admin, actId, partId, "Einmarsch", stepIds[0], foreignVideo);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<int> VideoOfAsync(HttpClient client, int actId, CancellationToken ct) =>
        await _fixture.AddActVideoDirectlyAsync(
            actId,
            await UploadSongAsync(client, actId, ct, "Probe.wav"),
            ct
        );

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        int partId,
        string name,
        int firstStepId,
        int? mainVideoId
    ) =>
        client.PUTAsync<PutActPart, PutActPartRequest>(
            new()
            {
                ActId = actId,
                PartId = partId,
                Name = name,
                FirstStepId = firstStepId,
                MainVideoId = mainVideoId,
            }
        );
}
