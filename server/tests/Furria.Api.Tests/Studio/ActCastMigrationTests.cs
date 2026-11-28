using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class ActCastMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeCastIsTheGroup = "20261124204706_ClubAssistantAnswers";

    private readonly ApiTestFixture _fixture;

    public ActCastMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FreeTheSpotAndEndTheCoEditing_When_TheHolderIsOutsideTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        var annasSpot = await AddSpotAsync(admin, actId);
        var guestsSpot = await AddSpotAsync(admin, actId);
        (await AssignSpotAsync(admin, actId, annasSpot, anna)).EnsureSuccessStatusCode();
        await GrantCoEditorAsync(admin, actId, anna);
        await _fixture.SeatAndEntrustDirectlyAsync(
            actId,
            guestsSpot,
            ctx.Identity.People.IdOf(Clara),
            ct
        );
        await _fixture.MigrateDatabaseToAsync(BeforeCastIsTheGroup, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        await ctx
            .Expected.Act(actId)
            .ToSeatExactly((annasSpot, anna), (guestsSpot, null))
            .Act(actId)
            .ToBeCoEditedByExactly(anna)
            .AssertAsync(ct);
    }
}
