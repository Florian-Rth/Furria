using Furria.Core.Media;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class BarOneAnalysisMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeActAudioFindsTheBarsOne = "20261128175355_BordersAreCheckedOneByOne";

    private readonly ApiTestFixture _fixture;

    public BarOneAnalysisMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LetTheWorkerAnalyseEverySongAgain_When_TheDatabaseIsMigrated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await SongOfAsync(_fixture, admin, actId, 180, ct);
        await _fixture.AnalyseSongDirectlyAsync(march, 0.5, 120, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeActAudioFindsTheBarsOne, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);
        await _fixture.QueueOutdatedSoundAsync(ct);

        var claimed = false;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () => claimed = await _fixture.ClaimMediaJobAsync(MediaKind.Audio, ct)
        );
        Assert.True(claimed);
    }

    [Fact]
    public async Task Should_LetOnlyBeatsSetByHandOutliveTheNewAnalysis_When_TheDatabaseIsMigrated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await SongOfAsync(_fixture, admin, actId, 180, ct);
        var finale = await SongOfAsync(_fixture, admin, actId, 80, ct);
        await _fixture.AnalyseSongDirectlyAsync(march, 0.5, 120, ct);
        await _fixture.AnalyseSongDirectlyAsync(finale, 0.5, 120, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeActAudioFindsTheBarsOne, ct);
        await _fixture.SetSongBeatDirectlyAsync(actId, march, 0.5, 120, ct);
        await _fixture.SetSongBeatDirectlyAsync(actId, finale, 0.62, 118, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);
        await _fixture.AnalyseSongDirectlyAsync(march, 1.5, 121, ct);
        await _fixture.AnalyseSongDirectlyAsync(finale, 1.5, 121, ct);

        Assert.Equal(
            [(march, (double?)1.5, (double?)121), (finale, (double?)0.62, (double?)118)],
            (await StudioOfAsync(admin, actId))
                .Studio!.Songs.OrderBy(song => song.Position)
                .Select(song => (song.MediaItemId, song.FirstBeatSeconds, song.TempoBpm))
        );
    }
}
