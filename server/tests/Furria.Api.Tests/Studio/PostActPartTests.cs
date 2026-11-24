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

    [Theory]
    [InlineData(0, 1)]
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
