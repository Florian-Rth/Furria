using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActFinalTrackTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActFinalTrackTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheFirstFinalFileAsVersionOne_When_AnEditorUploadsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var mediaItemId = await UploadSongAsync(admin, actId, ct, "Endfassung.wav");

        var (response, finalTrackId) = await PostFinalTrackAsync(admin, actId, mediaItemId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var track = Assert.Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks);
        Assert.Equal(
            (finalTrackId, mediaItemId, 1, false, "Endfassung.wav"),
            (track.FinalTrackId, track.MediaItemId, track.Version, track.Adopted, track.FileName)
        );
    }

    [Fact]
    public async Task Should_CountTheVersionOn_When_ANewFinalFileFollowsTheAdoptedOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var (firstId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);
        await AdoptMatchedAsync(admin, actId, firstId, song);

        var (response, secondId) = await PostFinalTrackAsync(
            admin,
            actId,
            await UploadSongAsync(admin, actId, ct)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tracks = (await StudioOfAsync(admin, actId)).Studio!.FinalTracks;
        Assert.Equal(
            [(secondId, 2, false), (firstId, 1, true)],
            tracks.Select(track => (track.FinalTrackId, track.Version, track.Adopted))
        );
    }

    [Fact]
    public async Task Should_Refuse_When_ANewerFinalFileStillWaits()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await FinalTrackOfAsync(_fixture, admin, actId, 90, ct);

        var (response, _) = await PostFinalTrackAsync(
            admin,
            actId,
            await UploadSongAsync(admin, actId, ct)
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheFileIsASongOfTheMix()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var song = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);

        var (response, _) = await PostFinalTrackAsync(admin, actId, song);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheFileBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Polka");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var (response, _) = await PostFinalTrackAsync(
            admin,
            actId,
            await UploadSongAsync(admin, otherActId, ct)
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
