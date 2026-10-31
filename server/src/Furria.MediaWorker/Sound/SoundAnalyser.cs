using System.Runtime.InteropServices;
using Furria.Core.Sound;
using Furria.MediaWorker.Renditions;
using Furria.MediaWorker.Videos;
using Microsoft.Extensions.Options;

namespace Furria.MediaWorker.Sound;

public sealed class SoundAnalyser
{
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

    public async Task KeepSoundtrackProfileAsync(RenditionFiles files, CancellationToken ct) =>
        await KeepProfileAsync(files, SoundProfile.Of(await DecodeAsync(files, ct)), ct);

    private static float[] SamplesOf(string pcm)
    {
        using var stream = File.OpenRead(pcm);
        var samples = new float[stream.Length / sizeof(float)];
        stream.ReadExactly(MemoryMarshal.AsBytes(samples.AsSpan()));
        return samples;
    }
}
