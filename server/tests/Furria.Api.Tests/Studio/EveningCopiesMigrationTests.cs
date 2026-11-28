using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class EveningCopiesMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeOneVersionForEveryEvening = "20261128090152_ActCastIsTheGroup";
    private const int CopyVersion = 7;

    private readonly ApiTestFixture _fixture;

    public EveningCopiesMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepOnlyTheActsChoreography_When_AnEveningHadItsOwnCopy()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var (_, version) = await SaveChoreographyAsync(admin, actId, null, []);
        await SavedAsync(planner, gala, null, [Line(actId, 0)]);
        await _fixture.MigrateDatabaseToAsync(BeforeOneVersionForEveryEvening, ct);
        var copied = await _fixture.CopyChoreographyForEveningOnOldSchemaDirectlyAsync(
            actId,
            gala,
            CopyVersion,
            ct
        );
        await ctx
            .Expected.Act(actId)
            .ToHaveChoreographiesAtVersions(version, CopyVersion)
            .AssertAsync(ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.Equal(1, copied);
        await ctx
            .Expected.Act(actId)
            .ToHaveChoreographiesAtVersions(version)
            .Act(actId)
            .ToHaveChoreographyHistoryAtVersions(version)
            .AssertAsync(ct);
    }
}
