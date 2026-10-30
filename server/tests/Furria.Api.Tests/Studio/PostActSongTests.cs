using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Tests.Media;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActSongTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActSongTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AppendEachSongToTheWorkingMix_When_TheGroupAdminAddsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct, "Gardemarsch.wav");
        var polka = await UploadSongAsync(admin, actId, ct, "Polka.wav");

        var marchSong = await AddSongAsync(admin, actId, march);
        var polkaSong = await AddSongAsync(admin, actId, polka);

        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [(marchSong, march, 0, "Gardemarsch.wav"), (polkaSong, polka, 1, "Polka.wav")],
            studio.Studio!.Songs.Select(song =>
                (song.SongId, song.MediaItemId, song.Position, song.FileName)
            )
        );
    }

    [Fact]
    public async Task Should_AddTheSong_When_ACoEditorInTheCastAddsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await GrantCoEditorAsync(admin, actId, ctx.Identity.People.IdOf(Anna));
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);
        var march = await UploadSongAsync(admin, actId, ct);

        var songId = await AddSongAsync(anna, actId, march);

        var studio = await StudioOfAsync(anna, actId);
        Assert.Equal([songId], studio.Studio!.Songs.Select(song => song.SongId));
    }

    [Fact]
    public async Task Should_Forbid_When_ACastMemberWhoIsNoCoEditorAddsASong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);
        var march = await UploadSongAsync(admin, actId, ct);

        var response = await PostAsync(anna, actId, march);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheActIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await admin.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = actId, Archived = true }
        );

        var response = await PostAsync(admin, actId, march);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheSongBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var foreignSong = await UploadSongAsync(admin, otherActId, ct);

        var response = await PostAsync(admin, actId, foreignSong);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheMediaItemIsAVideo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var video = await TusUploadSteps.UploadAsync(
            admin,
            TusUploadSteps.ActOwner(actId),
            "Training.mp4",
            MediaSamples.Mp4(4096),
            4096,
            ct
        );

        var response = await PostAsync(admin, actId, video);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheSongIsAlreadyInTheWorkingMix()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await UploadSongAsync(admin, actId, ct);
        await AddSongAsync(admin, actId, march);

        var response = await PostAsync(admin, actId, march);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheFileIsAFinalTrack()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var finalTrack = await UploadSongAsync(admin, actId, ct, "Endfassung.wav");
        await _fixture.AddFinalTrackDirectlyAsync(actId, finalTrack, ct);

        var response = await PostAsync(admin, actId, finalTrack);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PostAsync(
        HttpClient client,
        int actId,
        int mediaItemId
    ) =>
        client.POSTAsync<PostActSong, PostActSongRequest>(
            new() { ActId = actId, MediaItemId = mediaItemId }
        );
}
