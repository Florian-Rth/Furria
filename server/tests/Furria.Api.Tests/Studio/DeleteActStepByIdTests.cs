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
public sealed class DeleteActStepByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActStepByIdTests(ApiTestFixture fixture)
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
    public async Task Should_GiveTheMusicToThePreviousStep_When_AStepIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);

        var response = await DeleteAsync(admin, actId, stepIds[1]);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal([(0, 90), (90, 180)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_LetThePartBeginAtTheNextStep_When_ItsFirstStepIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 60, 90);
        await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        await AddPartAsync(admin, actId, stepIds[1], "Hauptteil");

        await DeleteAsync(admin, actId, stepIds[1]);

        Assert.Equal(
            [
                [stepIds[0]],
                [stepIds[2], stepIds[3]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_RemoveThePart_When_ItsOnlyStepIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        await AddPartAsync(admin, actId, stepIds[2], "Ausmarsch");

        await DeleteAsync(admin, actId, stepIds[2]);

        var part = Assert.Single((await StudioOfAsync(admin, actId)).Studio!.Parts);
        Assert.Equal("Einmarsch", part.Name);
    }

    [Fact]
    public async Task Should_KeepTheFirstPart_When_TheStepItIsStoredOnIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[1], "Einmarsch");
        await AddPartAsync(admin, actId, stepIds[2], "Ausmarsch");

        await DeleteAsync(admin, actId, stepIds[1]);

        Assert.Equal(
            [
                [stepIds[0]],
                [stepIds[2]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    private static Task<HttpResponseMessage> DeleteAsync(
        HttpClient client,
        int actId,
        int stepId
    ) =>
        client.DELETEAsync<DeleteActStepById, DeleteActStepByIdRequest>(
            new() { ActId = actId, StepId = stepId }
        );
}
