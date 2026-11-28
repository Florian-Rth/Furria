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

internal static class SongReplacementSteps
{
    internal static readonly SoundSignal March = SoundSamples.Song(seed: 7, bpm: 120, seconds: 60);
    internal static readonly SoundSignal Polka = SoundSamples.Song(seed: 11, bpm: 132, seconds: 60);
    internal static readonly SoundSignal Waltz = SoundSamples.Song(seed: 99, bpm: 97, seconds: 45);
    internal static readonly SoundSignal FinalMix = Joined(
        SoundSamples.Excerpt(March, 5, 50),
        SoundSamples.Excerpt(Polka, 0, 40)
    );

    internal static readonly SoundSignal MarchWithoutABreak = Joined(
        SoundSamples.Excerpt(March, 5, 30),
        SoundSamples.Excerpt(March, 38, 55)
    );

    internal static readonly (double? Start, double? End)[] StepSpans =
    [
        (0, 10),
        (10, 40),
        (40, 80),
    ];

    internal static async Task<MarchAndPolka> MarchAndPolkaAsync(
        ApiTestFixture fixture,
        CancellationToken ct
    )
    {
        var ctx = await fixture.BuildAsync(GardeWithDancers(fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AnalysedSongAsync(fixture, admin, actId, March, 10, 50, ct);
        var polka = await AnalysedSongAsync(fixture, admin, actId, Polka, 0, 40, ct);
        await StepsBetweenAsync(admin, actId, 10, 40);

        return new MarchAndPolka(admin, actId, march, polka);
    }

    internal static async Task<MarchAndPolka> MarchAndPolkaWithABorderInTheBreakAsync(
        ApiTestFixture fixture,
        CancellationToken ct
    )
    {
        var ctx = await fixture.BuildAsync(GardeWithDancers(fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var march = await AnalysedSongAsync(fixture, admin, actId, March, 10, 50, ct);
        var polka = await AnalysedSongAsync(fixture, admin, actId, Polka, 0, 40, ct);
        await StepsBetweenAsync(admin, actId, 10, 24, 40);

        return new MarchAndPolka(admin, actId, march, polka);
    }

    internal static async Task<int> AnalysedVideoAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int actId,
        SoundSignal sound,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadVideoAsync(client, actId, ct);
        await fixture.RenderSongDirectlyAsync(mediaItemId, sound.DurationSeconds, ct);
        await KeepProfileAsync(fixture, mediaItemId, sound, ct);

        return await AddVideoAsync(client, actId, mediaItemId);
    }

    internal static async Task<(int MediaItemId, int SongId)> AnalysedSongAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int actId,
        SoundSignal sound,
        double startSeconds,
        double endSeconds,
        CancellationToken ct
    )
    {
        var mediaItemId = await AnalysedFileAsync(fixture, client, actId, sound, ct);
        var songId = await AddSongAsync(client, actId, mediaItemId);
        var cut = await CutSongAsync(client, actId, songId, startSeconds, endSeconds);
        Assert.Equal(HttpStatusCode.NoContent, cut.StatusCode);

        return (mediaItemId, songId);
    }

    internal static async Task<int> AnalysedFileAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int actId,
        SoundSignal sound,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadSongAsync(client, actId, ct);
        await fixture.RenderSongDirectlyAsync(mediaItemId, sound.DurationSeconds, ct);
        await KeepProfileAsync(fixture, mediaItemId, sound, ct);

        return mediaItemId;
    }

    private static async Task KeepProfileAsync(
        ApiTestFixture fixture,
        int mediaItemId,
        SoundSignal sound,
        CancellationToken ct
    )
    {
        var path = await fixture.SoundProfileOfAsync(mediaItemId, ct);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllBytesAsync(path, SoundProfile.Of(sound).ToBytes(), ct);
    }

    internal static SoundSignal Joined(SoundSignal first, SoundSignal second) =>
        new([.. first.Samples, .. second.Samples], first.SampleRate);

    internal static async Task<(HttpResponseMessage Response, int SongId)> ReplaceSongAsync(
        HttpClient client,
        int actId,
        int songId,
        int mediaItemId,
        params int[] withSongIds
    )
    {
        var (response, result) = await client.POSTAsync<
            PostActSongReplacement,
            PostActSongReplacementRequest,
            PostActSongReplacementResponse
        >(
            new()
            {
                ActId = actId,
                SongId = songId,
                MediaItemId = mediaItemId,
                WithSongIds = withSongIds,
            }
        );

        return (response, response.IsSuccessStatusCode ? result.SongId : 0);
    }

    internal static Task<HttpResponseMessage> UndoReplacementAsync(
        HttpClient client,
        int actId,
        int songId
    ) =>
        client.DELETEAsync<DeleteActSongReplacement, DeleteActSongReplacementRequest>(
            new() { ActId = actId, SongId = songId }
        );

    internal static ChoreographyTrackDataDto TrackWithKeyframeAt(
        int spotId,
        int songMediaItemId,
        double seconds
    ) =>
        new()
        {
            SpotId = spotId,
            Keyframes =
            [
                new()
                {
                    SourceMediaItemId = songMediaItemId,
                    Seconds = seconds,
                    Position = new() { RightMetres = 0, BackMetres = 1 },
                    Bend = null,
                    Easing = KeyframeEasing.Linear,
                    FacingDegrees = null,
                },
            ],
        };

    internal static async Task<IReadOnlyList<(int MediaItemId, double Seconds)>> KeyframesOfAsync(
        HttpClient client,
        int actId
    ) =>
        [
            .. (await StudioOfAsync(client, actId))
                .Studio!.Choreography!.Tracks.SelectMany(track => track.Keyframes)
                .Select(keyframe => (keyframe.SourceMediaItemId, keyframe.Seconds)),
        ];

    internal static void AssertNear(
        IReadOnlyList<(double? Start, double? End)> expected,
        IReadOnlyList<(double? Start, double? End)> actual
    )
    {
        Assert.Equal(expected.Count, actual.Count);
        foreach (var (wanted, found) in expected.Zip(actual))
        {
            Assert.Equal(wanted.Start!.Value, found.Start!.Value, 0.1);
            Assert.Equal(wanted.End!.Value, found.End!.Value, 0.1);
        }
    }

    internal sealed record MarchAndPolka(
        HttpClient Admin,
        int ActId,
        (int MediaItemId, int SongId) March,
        (int MediaItemId, int SongId) Polka
    );
}
