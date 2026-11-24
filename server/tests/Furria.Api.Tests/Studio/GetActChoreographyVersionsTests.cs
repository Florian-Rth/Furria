using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetActChoreographyVersionsTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeChoreographyVersions = "20261030121215_UniqueStepStart";

    private readonly ApiTestFixture _fixture;

    public GetActChoreographyVersionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheCurrentVersionAsTheFirstEntry_When_ExistingChoreographiesAreMigrated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var front = await AddSpotAsync(admin, actId);
        var back = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(front, march, 0, 1), StandingTrack(back, march, 1, 1)]
        );
        var (_, second) = await SaveChoreographyAsync(
            admin,
            actId,
            first,
            [StandingTrack(front, march, 2, 1)]
        );

        await _fixture.MigrateDatabaseToAsync(BeforeChoreographyVersions, ct);
        await _fixture.RunDatabaseMigratorAsync(ct);

        var migrated = Assert.Single(await VersionsOfAsync(admin, actId));
        Assert.Equal(
            (second, ChoreographyVersionKind.Saved, (int?)null),
            (migrated.Version, migrated.Kind, migrated.SavedBy?.PersonId)
        );
        var (response, _) = await SaveChoreographyAsync(
            admin,
            actId,
            second,
            [StandingTrack(back, march, -1, 1)]
        );
        response.EnsureSuccessStatusCode();
    }
}
