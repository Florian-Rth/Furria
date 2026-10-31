using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Tests.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActVideoAlignmentTests : IClassFixture<ApiTestFixture>
{
    private const double SongSeconds = 60;

    private static readonly SoundSignal March = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);
    private static readonly SoundSignal Polka = SoundSamples.Song(seed: 11, bpm: 132, seconds: 60);

    private readonly ApiTestFixture _fixture;

    public PostActVideoAlignmentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private async Task<(HttpClient Admin, int ActId)> MixAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await AnalysedSongAsync(admin, actId, March, ct);
        await AnalysedSongAsync(admin, actId, Polka, ct);

        return (admin, actId);
    }

    [Fact]
    public async Task Should_PlaceTheVideoWhereItsSoundMeetsTheMusic_When_ItWasFilmedInTheHall()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MixAsync(ct);
        var filmed = SoundSamples.RecordedInAHall(
            SoundSamples.Excerpt(Polka, 10, 40),
            roomSecondsBefore: 2.5,
            seed: 3
        );
        var videoId = await AnalysedVideoAsync(admin, actId, filmed, ct);

        var (response, result) = await PostAsync(admin, actId, videoId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SongSeconds + 7.5, result.StartSeconds, 0.05);
        var video = await VideoInStudioAsync(admin, actId, videoId);
        Assert.Equal(VideoPlacement.OnTimeline, video.Placement);
        Assert.Equal(result.StartSeconds, video.StartSeconds!.Value, 6);
    }

    [Fact]
    public async Task Should_LeaveTheVideoUnaligned_When_ItsSoundIsOtherMusic()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MixAsync(ct);
        var other = SoundSamples.Song(seed: 99, bpm: 97, seconds: 45);
        var videoId = await AnalysedVideoAsync(admin, actId, other, ct);

        var (response, _) = await PostAsync(admin, actId, videoId);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            VideoPlacement.Unaligned,
            (await VideoInStudioAsync(admin, actId, videoId)).Placement
        );
    }

    [Fact]
    public async Task Should_ReportConflict_When_TheVideoIsStillProcessing()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId) = await MixAsync(ct);
        var videoId = await AddVideoAsync(admin, actId, await UploadVideoAsync(admin, actId, ct));

        var (response, _) = await PostAsync(admin, actId, videoId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private async Task AnalysedSongAsync(
        HttpClient admin,
        int actId,
        SoundSignal sound,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(mediaItemId, SongSeconds, ct);
        await KeepProfileAsync(mediaItemId, sound, ct);
        await AddSongAsync(admin, actId, mediaItemId);
    }

    private async Task<int> AnalysedVideoAsync(
        HttpClient admin,
        int actId,
        SoundSignal sound,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadVideoAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(mediaItemId, sound.DurationSeconds, ct);
        await KeepProfileAsync(mediaItemId, sound, ct);

        return await AddVideoAsync(admin, actId, mediaItemId);
    }

    private async Task KeepProfileAsync(int mediaItemId, SoundSignal sound, CancellationToken ct)
    {
        var path = await _fixture.SoundProfileOfAsync(mediaItemId, ct);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllBytesAsync(path, SoundProfile.Of(sound).ToBytes(), ct);
    }

    private static Task<TestResult<PostActVideoAlignmentResponse>> PostAsync(
        HttpClient client,
        int actId,
        int videoId
    ) =>
        client.POSTAsync<
            PostActVideoAlignment,
            PostActVideoAlignmentRequest,
            PostActVideoAlignmentResponse
        >(new() { ActId = actId, VideoId = videoId });
}
