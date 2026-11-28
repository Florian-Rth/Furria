using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class MusicReplacedMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeSongsAreReplacedInPlace = "20261128125436_MusicIsAChainOfSongs";

    private readonly ApiTestFixture _fixture;

    public MusicReplacedMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepAnAdoptionAsAMusicReplacement_When_TheVersionKindIsRenamed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongOfAsync(_fixture, admin, actId, 100, ct);
        var spotId = await AddSpotAsync(admin, actId);
        await SaveChoreographyAsync(admin, actId, null, [StandingTrack(spotId, song, 0, 1)]);
        await _fixture.MigrateDatabaseToAsync(BeforeSongsAreReplacedInPlace, ct);
        await _fixture.MarkMusicAdoptedOnOldSchemaDirectlyAsync(actId, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.Equal(
            ChoreographyVersionKind.MusicReplaced,
            Assert.Single(await VersionsOfAsync(admin, actId)).Kind
        );
    }
}
