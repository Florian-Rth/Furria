using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class StepEndsMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeStepsHaveTheirOwnEnd = "20261128103752_OneVersionForEveryEvening";

    private readonly ApiTestFixture _fixture;

    public StepEndsMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EndEveryStepWhereTheNextBegins_When_StepsHadOnlyStarts()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongOfAsync(_fixture, admin, actId, 100, ct);
        var finale = await SongOfAsync(_fixture, admin, actId, 80, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeStepsHaveTheirOwnEnd, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, finale, 30, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, opener, 150, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, opener, 0, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, opener, 40, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.Equal(
            [(0, 40), (40, 130), (130, 180), (null, null)],
            await StepSpansOfAsync(admin, actId)
        );
    }

    [Fact]
    public async Task Should_KeepTheEndInTheEarlierSong_When_TheNextStepBeganOnTheSongBorder()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongOfAsync(_fixture, admin, actId, 100, ct);
        var finale = await SongOfAsync(_fixture, admin, actId, 80, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeStepsHaveTheirOwnEnd, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, opener, 0, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, finale, 0, ct);
        await _fixture.RunDatabaseMigratorAsync(ct);
        var finaleSongId = (await StudioOfAsync(admin, actId))
            .Studio!.Songs.Single(song => song.MediaItemId == finale)
            .SongId;

        await admin.DELETEAsync<DeleteActSongById, DeleteActSongByIdRequest>(
            new() { ActId = actId, SongId = finaleSongId }
        );

        Assert.Equal([(0, 100), (null, null)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_StartTheFirstStepWithTheMusic_When_ItWasDrawnFromTheStartOfACutSong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(march, 180, ct);
        var songId = await AddSongAsync(admin, actId, march);
        await CutSongAsync(admin, actId, songId, (0, 30), (60, 90));
        await _fixture.MigrateDatabaseToAsync(BeforeStepsHaveTheirOwnEnd, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, march, 10, ct);
        await _fixture.MarkStepOnOldSchemaDirectlyAsync(actId, march, 70, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        Assert.Equal([(0, 40), (40, 60)], await StepSpansOfAsync(admin, actId));
    }
}
