using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetGroupActsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetGroupActsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheGroupsActsWithTheViewersPart_When_AMemberOpensTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var ben = ctx.Identity.People.IdOf(Ben);
        var garde = ctx.Groups.Groups.IdOf(Garde);
        await GardetanzAsync(ctx, ct, name: "Marsch");
        await GardetanzAsync(ctx, ct, name: "Polka", removed: [ben]);
        var archived = await GardetanzAsync(ctx, ct, name: "Alter Tanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await admin.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = archived, Archived = true }
        );
        await CreateActAsync(admin, "Einzug", garde, ActKind.Point);
        var client = await ctx.Identity.ClientForAsync(Ben, ct);

        var (response, result) = await client.GETAsync<
            GetGroupActs,
            GetGroupActsRequest,
            GetGroupActsResponse
        >(new() { GroupId = garde });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [("Marsch", true), ("Polka", false)],
            result.Acts.Select(act => (act.Name, act.ViewerInCast))
        );
    }

    [Fact]
    public async Task Should_ListArchivedActsWithTheirCastSize_When_AGroupAdminOpensTheHistory()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var ben = ctx.Identity.People.IdOf(Ben);
        await GardetanzAsync(ctx, ct, name: "Marsch");
        await GardetanzAsync(ctx, ct, name: "Polka", removed: [ben]);
        var archived = await GardetanzAsync(ctx, ct, name: "Alter Tanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await admin.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = archived, Archived = true }
        );

        var (response, result) = await admin.GETAsync<
            GetGroupActs,
            GetGroupActsRequest,
            GetGroupActsResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf(Garde) });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [("Alter Tanz", true, 2), ("Marsch", false, 2), ("Polka", false, 1)],
            result.Acts.Select(act => (act.Name, act.Archived, act.CastSize))
        );
    }

    [Fact]
    public async Task Should_Forbid_When_TheViewerHasNoTieToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Clara, ct);

        var (response, _) = await client.GETAsync<
            GetGroupActs,
            GetGroupActsRequest,
            GetGroupActsResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf(Garde) });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
