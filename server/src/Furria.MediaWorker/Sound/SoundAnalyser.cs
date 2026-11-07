using System.Runtime.InteropServices;
using System.Text.Json;
using Furria.Core.Media;
using Furria.Core.Sound;
using Furria.MediaWorker.Renditions;
using Furria.MediaWorker.Videos;
using Microsoft.Extensions.Options;

namespace Furria.MediaWorker.Sound;

public sealed class SoundAnalyser
{
    private static readonly JsonSerializerOptions PeaksJson = new(JsonSerializerDefaults.Web);

    private readonly MediaWorkerOptions _options;

    public SoundAnalyser(IOptions<MediaWorkerOptions> options)
    {
        _options = options.Value;
    }

    public async Task<SoundSignal> DecodeAsync(RenditionFiles files, CancellationToken ct)
    {
        var pcm = files.ScratchFileForSound();
        await MediaTool.RunAsync(
            _options.FfmpegPath,
            AudioEncoding.AnalysisArgumentsFor(files.OriginalPath, pcm),
            ct
        );
        return new SoundSignal(SamplesOf(pcm), SoundSignal.AnalysisSampleRate);
    }

    public async Task KeepProfileAsync(
        RenditionFiles files,
        SoundProfile profile,
        CancellationToken ct
    )
    {
        var scratch = files.ScratchFileForSoundProfile();
        await File.WriteAllBytesAsync(scratch, profile.ToBytes(), ct);
        files.PublishSoundProfile(scratch);
    }

    public async Task KeepPeaksAsync(
        RenditionFiles files,
        WaveformPeaks peaks,
        CancellationToken ct
    )
    {
        var scratch = files.ScratchFileFor(MediaRendition.Peaks, ".json");
        await File.WriteAllBytesAsync(
            scratch,
            JsonSerializer.SerializeToUtf8Bytes(peaks, PeaksJson),
            ct
        );
        files.Publish(scratch, MediaRendition.Peaks);
    }

    public async Task KeepSoundtrackAsync(RenditionFiles files, CancellationToken ct)
    {
        var signal = await DecodeAsync(files, ct);
        await KeepProfileAsync(files, SoundProfile.Of(signal), ct);
        await KeepPeaksAsync(files, WaveformPeaks.Of(signal), ct);
    }

    private static float[] SamplesOf(string pcm)
    {
        using var stream = File.OpenRead(pcm);
        var samples = new float[stream.Length / sizeof(float)];
        stream.ReadExactly(MemoryMarshal.AsBytes(samples.AsSpan()));
        return samples;
    }
}
