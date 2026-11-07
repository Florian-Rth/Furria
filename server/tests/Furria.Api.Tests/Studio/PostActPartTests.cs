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
    public async Task Should_GroupOnlyTheRangedSteps_When_PartsSpanSomeSteps()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 60, 90);

        await AddPartAsync(admin, actId, stepIds[1], stepIds[2], "Hauptteil");
        await AddPartAsync(admin, actId, stepIds[3], stepIds[3], "Ausmarsch");

        var parts = (await StudioOfAsync(admin, actId)).Studio!.Parts;
        Assert.Equal(
            [
                ("Hauptteil", stepIds[1], stepIds[2], new[] { stepIds[1], stepIds[2] }),
                ("Ausmarsch", stepIds[3], stepIds[3], new[] { stepIds[3] }),
            ],
            parts.Select(part =>
                (part.Name, part.FirstStepId, part.LastStepId, part.StepIds.ToArray())
            )
        );
    }

    [Fact]
    public async Task Should_RefuseThePart_When_ItEndsBeforeItBegins()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 90);

        var response = await PostAsync(admin, actId, stepIds[2], stepIds[1]);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(2, 3)]
    [InlineData(0, 3)]
    public async Task Should_RefuseThePart_When_ItOverlapsAnotherPart(int first, int last)
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MusicAsync(ct);
        var stepIds = await MarkedAsync(admin, actId, 30, 60, 90);
        await AddPartAsync(admin, actId, stepIds[1], stepIds[2], "Hauptteil");

        var response = await PostAsync(admin, actId, stepIds[first], stepIds[last]);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Single((await StudioOfAsync(admin, actId)).Studio!.Parts);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheLastStepBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 180, ct);
        await SongOfAsync(_fixture, admin, otherActId, 180, ct);
        var stepIds = await MarkedAsync(admin, actId, 30);
        var foreignStepIds = await MarkedAsync(admin, otherActId, 30);

        var response = await PostAsync(admin, actId, stepIds[0], foreignStepIds[1]);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PostAsync(
        HttpClient client,
        int actId,
        int firstStepId,
        int lastStepId
    ) =>
        client.POSTAsync<PostActPart, PostActPartRequest>(
            new()
            {
                ActId = actId,
                FirstStepId = firstStepId,
                LastStepId = lastStepId,
                Name = "Noch einer",
            }
        );
}
