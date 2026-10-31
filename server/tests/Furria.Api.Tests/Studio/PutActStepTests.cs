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
public sealed class PutActStepTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActStepTests(ApiTestFixture fixture)
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
    public async Task Should_StoreTheNameAndDescription_When_AnEditorWritesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepId = (await MarkAsync(admin, actId, 0))[0];

        var response = await PutAsync(admin, actId, stepId, " Einmarsch ", "Rechts beginnen");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var step = Assert.Single((await StudioOfAsync(admin, actId)).Studio!.Steps);
        Assert.Equal(("Einmarsch", "Rechts beginnen"), (step.Name, step.Description));
    }

    [Fact]
    public async Task Should_DropTheDescription_When_ItIsCleared()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepId = (await MarkAsync(admin, actId, 0))[0];
        await PutAsync(admin, actId, stepId, "Einmarsch", "Rechts beginnen");

        await PutAsync(admin, actId, stepId, "Einmarsch", "  ");

        var step = Assert.Single((await StudioOfAsync(admin, actId)).Studio!.Steps);
        Assert.Null(step.Description);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheStepBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var other = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, other, otherActId, 60, ct);
        var foreignStep = (await MarkAsync(other, otherActId, 0))[0];

        var response = await PutAsync(other, actId, foreignStep, "Einmarsch", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        int actId,
        int stepId,
        string name,
        string? description
    ) =>
        client.PUTAsync<PutActStep, PutActStepRequest>(
            new()
            {
                ActId = actId,
                StepId = stepId,
                Name = name,
                Description = description,
            }
        );
}
