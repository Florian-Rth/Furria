using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class MusicChainMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeMusicIsAChainOfSongs = "20261128115051_StepsHaveTheirOwnEnd";

    private readonly ApiTestFixture _fixture;

    public MusicChainMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MakeOneSongOfEachPiece_When_ASongWasCutIntoSeveralPieces()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await SongOfAsync(_fixture, admin, actId, 180, ct);
        var finale = await SongOfAsync(_fixture, admin, actId, 80, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeMusicIsAChainOfSongs, ct);
        await _fixture.CutSongOnOldSchemaDirectlyAsync(actId, march, [(0, 30), (60, 90)], ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.Equal(
            [(march, 0, 30), (march, 60, 90), (finale, 0, 80)],
            await SongCutsOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_MakeTheAdoptedFinalFileTheOneSong_When_TheActHadAdoptedOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 100, ct);
        var final = await UploadSongAsync(admin, actId, ct, "Endfassung.wav");
        await _fixture.RenderSongDirectlyAsync(final, 120, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeMusicIsAChainOfSongs, ct);
        await _fixture.AddFinalTrackOnOldSchemaDirectlyAsync(actId, final, 1, adopted: true, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.Equal(
            [(final, 0, 120, 128)],
            (await StudioOfAsync(admin, actId)).Studio!.Songs.Select(song =>
                (song.MediaItemId, song.StartSeconds, song.EndSeconds, song.TempoBpm)
            )
        );
    }

    [Fact]
    public async Task Should_DeleteTheFinalFile_When_ItWasNeverAdopted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await SongOfAsync(_fixture, admin, actId, 100, ct);
        var pending = await UploadSongAsync(admin, actId, ct, "Endfassung.wav");
        await _fixture.RenderSongDirectlyAsync(pending, 120, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeMusicIsAChainOfSongs, ct);
        await _fixture.AddFinalTrackOnOldSchemaDirectlyAsync(actId, pending, 1, adopted: false, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.False(await _fixture.MediaItemExistsAsync(pending, ct));
    }
}
