using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class PutActArchivedTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActArchivedTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampTheArchiving_When_ThePlannerArchivesTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var actId = await CreateActAsync(client, "Tombola");

        var response = await SetAsync(client, actId, archived: true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Act(actId)
            .ToBeArchivedAt(_fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_BringTheActBack_When_ThePlannerRestoresIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var actId = await CreateActAsync(client, "Tombola");
        await SetAsync(client, actId, archived: true);

        var response = await SetAsync(client, actId, archived: false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Act(actId).ToBeInUse().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheActIsAlreadyInThatState()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var actId = await CreateActAsync(client, "Tombola");

        var response = await SetAsync(client, actId, archived: false);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_StampTheArchiving_When_AGroupAdminArchivesAnActOfHisGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var actId = await CreateActAsync(planner, "Gardetanz", ctx.Groups.Groups.IdOf(Garde));
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await SetAsync(admin, actId, archived: true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Act(actId)
            .ToBeArchivedAt(_fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(Elferrat)]
    [InlineData(null)]
    public async Task Should_ReturnForbidden_When_AGroupAdminArchivesAnActOutsideHisGroups(
        string? groupAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        int? groupId = groupAlias is null ? null : ctx.Groups.Groups.IdOf(groupAlias);
        var actId = await CreateActAsync(planner, "Fremder Auftritt", groupId);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await SetAsync(admin, actId, archived: true);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Act(actId).ToBeInUse().AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> SetAsync(
        HttpClient client,
        int actId,
        bool archived
    ) =>
        client.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = actId, Archived = archived }
        );
}
