using Furria.Api.Endpoints.Acts;
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
    public async Task Should_ListEveryWriteNewestFirstWithItsAuthor_When_TheChoreographyChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var kept = await AddSpotAsync(admin, actId);
        var removed = await AddSpotAsync(admin, actId);
        var (_, first) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(kept, march, 0, 1), StandingTrack(removed, march, 1, 1)]
        );
        await SaveChoreographyAsync(admin, actId, first, [StandingTrack(kept, march, 2, 1)]);
        await DeleteSpotAsync(admin, actId, removed);
        await RestoreAsync(admin, actId, first);

        var versions = await VersionsOfAsync(admin, actId);

        Assert.Equal(
            [
                (4, ChoreographyVersionKind.Restored, (int?)1),
                (3, ChoreographyVersionKind.SpotRemoved, null),
                (2, ChoreographyVersionKind.Saved, null),
                (1, ChoreographyVersionKind.Saved, null),
            ],
            versions.Select(version => (version.Version, version.Kind, version.RestoredFromVersion))
        );
        Assert.All(
            versions,
            version => Assert.Equal(ctx.Identity.People.IdOf(GardeAdmin), version.SavedBy?.PersonId)
        );
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

    [Fact]
    public async Task Should_KeepOnlyTheLastVersionOfEachOldDay_When_ANewVersionIsSaved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spot = await AddSpotAsync(admin, actId);
        var version = await SaveStandingAsync(admin, actId, null, spot, march, 0);
        version = await SaveStandingAsync(admin, actId, version, spot, march, 1);
        version = await SaveStandingAsync(admin, actId, version, spot, march, 2);
        IReadOnlyList<ChoreographyVersionSummaryDto> kept = [];

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(16),
            async () =>
            {
                var later = await ctx.Identity.SignInAgainAsync(GardeAdmin, ct);
                await SaveStandingAsync(later, actId, version, spot, march, 3);
                kept = await VersionsOfAsync(later, actId);
            }
        );

        Assert.Equal([4, 3], kept.Select(saved => saved.Version));
    }

    [Fact]
    public async Task Should_ListTheVersionsPageByPageNewestFirst_When_ThereAreMoreThanAPage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        var spot = await AddSpotAsync(admin, actId);
        int? version = null;
        for (var save = 0; save < 25; save++)
            version = await SaveStandingAsync(admin, actId, version, spot, march, save % 4);

        var newest = await VersionPageOfAsync(admin, actId, null);
        var oldest = await VersionPageOfAsync(admin, actId, newest.Versions[^1].Version);

        Assert.Equal((25, true), (newest.Total, newest.HasOlder));
        Assert.Equal(
            Enumerable.Range(6, 20).Reverse(),
            newest.Versions.Select(saved => saved.Version)
        );
        Assert.Equal((25, false), (oldest.Total, oldest.HasOlder));
        Assert.Equal(
            Enumerable.Range(1, 5).Reverse(),
            oldest.Versions.Select(saved => saved.Version)
        );
    }

    private static async Task<int> SaveStandingAsync(
        HttpClient admin,
        int actId,
        int? baseVersion,
        int spot,
        int march,
        double x
    )
    {
        var (response, version) = await SaveChoreographyAsync(
            admin,
            actId,
            baseVersion,
            [StandingTrack(spot, march, x, 1)]
        );
        response.EnsureSuccessStatusCode();

        return version;
    }
}
