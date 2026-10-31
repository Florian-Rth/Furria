using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Tests.Media;
using Furria.Core.Sound;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActFinalTrackAlignmentTests : IClassFixture<ApiTestFixture>
{
    private const double SongSeconds = 60;

    private static readonly SoundSignal March = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);
    private static readonly SoundSignal Polka = SoundSamples.Song(seed: 11, bpm: 132, seconds: 60);
    private static readonly SoundSignal JoinedByTech = Joined(
        SoundSamples.Excerpt(March, 5, 50),
        SoundSamples.Excerpt(Polka, 0, 40)
    );

    private readonly ApiTestFixture _fixture;

    public PostActFinalTrackAlignmentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FindEachSongInTheFinalFile_When_TechJoinedTheCuts()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, march, polka) = await MixAsync(ct);
        var finalTrackId = await AnalysedFinalTrackAsync(admin, actId, JoinedByTech, ct);

        var (response, result) = await PostAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal([march, polka], result.Matches.Select(match => match.SourceMediaItemId));
        var alignments = Assert
            .Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks)
            .Alignments.ToDictionary(
                alignment => alignment.SourceMediaItemId,
                alignment => alignment.OffsetSeconds
            );
        Assert.Equal(-5, alignments[march], 0.05);
        Assert.Equal(45, alignments[polka], 0.05);
    }

    [Fact]
    public async Task Should_FindTheFasterSongWithItsStretch_When_TheLiveMixPlaysItFaster()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, march, polka) = await MixAsync(ct);
        var live = Joined(
            SoundSamples.Excerpt(March, 5, 50),
            SoundSamples.Faster(SoundSamples.Excerpt(Polka, 0, 40), 1.02)
        );
        var finalTrackId = await AnalysedFinalTrackAsync(admin, actId, live, ct);

        var (response, _) = await PostAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var alignments = Assert
            .Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks)
            .Alignments.ToDictionary(alignment => alignment.SourceMediaItemId);
        Assert.Equal(-5, alignments[march].OffsetSeconds, 0.05);
        Assert.Equal(1, alignments[march].Stretch, 0.001);
        Assert.Equal(45, alignments[polka].OffsetSeconds, 0.05);
        Assert.Equal(1 / 1.02, alignments[polka].Stretch, 0.001);
    }

    [Fact]
    public async Task Should_Refuse_When_NoSongIsInTheFinalFile()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, _, _) = await MixAsync(ct);
        var other = SoundSamples.Song(seed: 99, bpm: 97, seconds: 45);
        var finalTrackId = await AnalysedFinalTrackAsync(admin, actId, other, ct);

        var (response, _) = await PostAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Empty(
            Assert.Single((await StudioOfAsync(admin, actId)).Studio!.FinalTracks).Alignments
        );
    }

    [Fact]
    public async Task Should_ReportConflict_When_TheFinalFileIsStillProcessing()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, _, _) = await MixAsync(ct);
        var (_, finalTrackId) = await PostFinalTrackAsync(
            admin,
            actId,
            await UploadSongAsync(admin, actId, ct)
        );

        var (response, _) = await PostAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private async Task<(HttpClient Admin, int ActId, int March, int Polka)> MixAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AnalysedSongAsync(admin, actId, March, 10, 50, ct);
        var polka = await AnalysedSongAsync(admin, actId, Polka, 0, 40, ct);

        return (admin, actId, march, polka);
    }

    private async Task<int> AnalysedSongAsync(
        HttpClient admin,
        int actId,
        SoundSignal sound,
        double startSeconds,
        double endSeconds,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadSongAsync(admin, actId, ct);
        await _fixture.RenderSongDirectlyAsync(mediaItemId, SongSeconds, ct);
        await KeepProfileAsync(mediaItemId, sound, ct);
        var songId = await AddSongAsync(admin, actId, mediaItemId);
        var cut = await admin.PUTAsync<PutActSong, PutActSongRequest>(
            new()
            {
                ActId = actId,
                SongId = songId,
                StartSeconds = startSeconds,
                EndSeconds = endSeconds,
                FirstBeatSeconds = null,
                TempoBpm = null,
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, cut.StatusCode);

        return mediaItemId;
    }

    private async Task<int> AnalysedFinalTrackAsync(
        HttpClient admin,
        int actId,
        SoundSignal sound,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadSongAsync(admin, actId, ct, "Endfassung.wav");
        await _fixture.RenderSongDirectlyAsync(mediaItemId, sound.DurationSeconds, ct);
        await KeepProfileAsync(mediaItemId, sound, ct);
        var (_, finalTrackId) = await PostFinalTrackAsync(admin, actId, mediaItemId);

        return finalTrackId;
    }

    private async Task KeepProfileAsync(int mediaItemId, SoundSignal sound, CancellationToken ct)
    {
        var path = await _fixture.SoundProfileOfAsync(mediaItemId, ct);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllBytesAsync(path, SoundProfile.Of(sound).ToBytes(), ct);
    }

    private static SoundSignal Joined(SoundSignal first, SoundSignal second) =>
        new([.. first.Samples, .. second.Samples], first.SampleRate);

    private static Task<TestResult<PostActFinalTrackAlignmentResponse>> PostAsync(
        HttpClient client,
        int actId,
        int finalTrackId
    ) =>
        client.POSTAsync<
            PostActFinalTrackAlignment,
            PostActFinalTrackAlignmentRequest,
            PostActFinalTrackAlignmentResponse
        >(new() { ActId = actId, FinalTrackId = finalTrackId });
}
