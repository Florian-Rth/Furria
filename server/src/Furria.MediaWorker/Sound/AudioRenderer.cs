using System.Text.Json;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Core.Sound;
using Furria.MediaWorker.Renditions;
using Furria.MediaWorker.Videos;
using Microsoft.Extensions.Options;

namespace Furria.MediaWorker.Sound;

public sealed class AudioRenderer
{
    private static readonly JsonSerializerOptions PeaksJson = new(JsonSerializerDefaults.Web);

    private readonly MediaWorkerOptions _options;
    private readonly SoundAnalyser _analyser;

    public AudioRenderer(IOptions<MediaWorkerOptions> options, SoundAnalyser analyser)
    {
        _options = options.Value;
        _analyser = analyser;
    }

    public async Task<RenderedMedia> RenderAsync(RenditionFiles files, CancellationToken ct)
    {
        var probed = await ProbeAsync(files.OriginalPath, ct);
        var loudness = await MeasureAsync(files.OriginalPath, ct);
        await EncodeAsync(
            files,
            MediaRendition.Normalised,
            AudioEncoding.NormalisedBitrate,
            loudness,
            probed,
            ct
        );
        await EncodeAsync(
            files,
            MediaRendition.Preview,
            AudioEncoding.PreviewBitrate,
            loudness,
            probed,
            ct
        );

        var signal = await _analyser.DecodeAsync(files, ct);
        var onsets = BandOnsets.Of(signal);
        await KeepPeaksAsync(files, signal, ct);
        await _analyser.KeepProfileAsync(files, SoundProfile.Of(onsets), ct);

        return new RenderedMedia
        {
            DurationSeconds = probed.DurationSeconds ?? signal.DurationSeconds,
            Audio = FactsOf(probed, loudness, signal, BeatTracker.Of(signal, onsets)),
        };
    }

    private async Task<ProbedSound> ProbeAsync(string path, CancellationToken ct)
    {
        var report = await MediaTool.ProbeAsync(_options.FfprobePath, path, ct);
        return SoundProbeReport.FactsOf(report)
            ?? throw new MediaRenderingException("The file has no sound");
    }

    private async Task<LoudnessMeasurement> MeasureAsync(string path, CancellationToken ct) =>
        LoudnessMeasurement.Parse(
            await MediaTool.RunForDiagnosticsAsync(
                _options.FfmpegPath,
                AudioEncoding.MeasurementArgumentsFor(path),
                ct
            )
        ) ?? throw new MediaRenderingException("The loudness of the sound could not be measured");

    private async Task EncodeAsync(
        RenditionFiles files,
        MediaRendition rendition,
        string bitrate,
        LoudnessMeasurement loudness,
        ProbedSound probed,
        CancellationToken ct
    )
    {
        var scratch = files.ScratchFileFor(rendition, MediaRenditions.ExtensionOf(rendition));
        await MediaTool.RunAsync(
            _options.FfmpegPath,
            AudioEncoding.NormalisedArgumentsFor(
                files.OriginalPath,
                scratch,
                loudness,
                probed.SampleRate,
                bitrate
            ),
            ct
        );
        files.Publish(scratch, rendition);
    }

    private static async Task KeepPeaksAsync(
        RenditionFiles files,
        SoundSignal signal,
        CancellationToken ct
    )
    {
        var scratch = files.ScratchFileFor(MediaRendition.Peaks, ".json");
        await File.WriteAllBytesAsync(
            scratch,
            JsonSerializer.SerializeToUtf8Bytes(WaveformPeaks.Of(signal), PeaksJson),
            ct
        );
        files.Publish(scratch, MediaRendition.Peaks);
    }

    private static MediaAudioFactsDetails FactsOf(
        ProbedSound probed,
        LoudnessMeasurement loudness,
        SoundSignal signal,
        BeatGrid? grid
    ) =>
        new()
        {
            SampleRate = probed.SampleRate,
            LoudnessLufs = loudness.IntegratedLufs,
            TruePeakDbtp = loudness.TruePeakDbtp,
            LeadingSilenceSeconds = LeadingSilence.SecondsOf(signal),
            FirstBeatSeconds = grid?.FirstBeatSeconds,
            TempoBpm = grid?.TempoBpm,
        };
}
