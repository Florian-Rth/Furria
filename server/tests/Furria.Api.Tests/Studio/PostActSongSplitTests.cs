using System.Net;
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
public sealed class PostActSongSplitTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActSongSplitTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MakeTwoSongsOfOneFile_When_ASongIsSplitAtTheLine()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongOfAsync(_fixture, admin, actId, 100, ct);
        var finale = await SongOfAsync(_fixture, admin, actId, 80, ct);

        var (_, secondHalf) = await SplitSongAsync(
            admin,
            actId,
            await SongIdOfAsync(admin, actId, opener),
            40
        );

        Assert.Equal(
            [(opener, 0, 40, false), (opener, 40, 100, true), (finale, 0, 80, false)],
            (await StudioOfAsync(admin, actId))
                .Studio!.Songs.OrderBy(song => song.Position)
                .Select(song =>
                    (
                        song.MediaItemId,
                        song.StartSeconds,
                        song.EndSeconds,
                        song.SongId == secondHalf
                    )
                )
        );
    }

    [Fact]
    public async Task Should_KeepTheStepInTheFirstHalf_When_TheSplitFallsOnItsEnd()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongOfAsync(_fixture, admin, actId, 100, ct);
        await StepsBetweenAsync(admin, actId, 40);
        var (_, secondHalf) = await SplitSongAsync(
            admin,
            actId,
            await SongIdOfAsync(admin, actId, opener),
            40
        );

        var removed = await admin.DELETEAsync<DeleteActSongById, DeleteActSongByIdRequest>(
            new() { ActId = actId, SongId = secondHalf }
        );

        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);
        Assert.Equal([(0, 40), (null, null)], await StepSpansOfAsync(admin, actId));
    }

    [Fact]
    public async Task Should_RefuseTheSplit_When_AHalfWouldStayShorterThanHalfASecond()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongOfAsync(_fixture, admin, actId, 100, ct);

        var (response, _) = await SplitSongAsync(
            admin,
            actId,
            await SongIdOfAsync(admin, actId, opener),
            0.3
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private static async Task<int> SongIdOfAsync(HttpClient client, int actId, int mediaItemId) =>
        (await StudioOfAsync(client, actId))
            .Studio!.Songs.Single(song => song.MediaItemId == mediaItemId)
            .SongId;
}
