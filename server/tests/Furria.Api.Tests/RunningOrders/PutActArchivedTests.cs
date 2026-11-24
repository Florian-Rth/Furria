using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
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

    [Fact]
    public async Task Should_ReturnConflict_When_TheActsSessionHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        var actId = 0;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);
                actId = await CreateActAsync(client, "Gardetanz", kind: ActKind.Dance);
            }
        );

        await _fixture.AtInstantAsync(
            AfterItsAshWednesday,
            async () =>
            {
                var client = await ctx!.Identity.SignInAgainAsync(Planner, ct);

                var response = await SetAsync(client, actId, archived: true);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                await ctx.Expected.Act(actId).ToBeInUse().AssertAsync(ct);
            }
        );
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
