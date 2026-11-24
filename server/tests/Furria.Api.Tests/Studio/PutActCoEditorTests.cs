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
public sealed class PutActCoEditorTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActCoEditorTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Refuse_When_ThePersonIsNotInTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct, removed: [ctx.Identity.People.IdOf(Ben)]);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await admin.PUTAsync<PutActCoEditor, PutActCoEditorRequest>(
            new() { ActId = actId, PersonId = ctx.Identity.People.IdOf(Ben) }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Forbid_When_APlannerWhoLeadsNoGroupGrantsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);

        var response = await planner.PUTAsync<PutActCoEditor, PutActCoEditorRequest>(
            new() { ActId = actId, PersonId = ctx.Identity.People.IdOf(Anna) }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
