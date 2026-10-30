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
public sealed class PostActPartTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActPartTests(ApiTestFixture fixture)
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
    public async Task Should_GroupTheStepsFromThere_When_PartsBeginOnSteps()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);

        await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");
        await AddPartAsync(admin, actId, stepIds[2], "Ausmarsch");

        Assert.Equal(
            [
                [stepIds[0], stepIds[1]],
                [stepIds[2]],
            ],
            await PartStepsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_KeepTheEarlierStepsInTheFirstPart_When_ANewPartBeginsWhereItWasAnchored()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);
        await AddPartAsync(admin, actId, stepIds[1], "Einmarsch");

        await AddPartAsync(admin, actId, stepIds[1], "Hauptteil");

        var parts = (await StudioOfAsync(admin, actId)).Studio!.Parts;
        Assert.Equal(
            [("Einmarsch", new[] { stepIds[0] }), ("Hauptteil", new[] { stepIds[1], stepIds[2] })],
            parts.Select(part => (part.Name, part.StepIds.ToArray()))
        );
    }

    [Fact]
    public async Task Should_RefuseThePart_When_OneAlreadyBeginsThere()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30);
        await AddPartAsync(admin, actId, stepIds[0], "Einmarsch");

        var response = await admin.POSTAsync<PostActPart, PostActPartRequest>(
            new()
            {
                ActId = actId,
                FirstStepId = stepIds[0],
                Name = "Noch einer",
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
