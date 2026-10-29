using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Club;
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
public sealed class GetMyActsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetMyActsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheRelevantSessionsActsTheViewerDancesIn_When_AskedForTheirActs()
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
        await CreateActAsync(
            admin,
            "Nächstes Jahr",
            ctx.Groups.Groups.IdOf(Garde),
            ActKind.Dance,
            sessionYear: ClubSession.RelevantYearOf(_fixture.Today) + 1
        );
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        await CreateActAsync(planner, "Einmarsch", kind: ActKind.Point, added: [ben]);
        var client = await ctx.Identity.ClientForAsync(Ben, ct);

        var (_, result) = await client.GETAsync<GetMyActs, GetMyActsResponse>();

        Assert.Equal(["Marsch"], result.Acts.Select(act => act.Name));
        Assert.Equal("Tanzgarde", result.Acts[0].Group?.Name);
    }
}
