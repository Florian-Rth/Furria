using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public sealed record WaveformPeaks(int PeaksPerSecond, IReadOnlyList<int> Peaks)
{
    public const int DefaultPeaksPerSecond = 100;
    public const int FullScale = 255;

    [Pure]
    public static WaveformPeaks Of(SoundSignal signal)
    {
        var bucket = signal.SampleRate / DefaultPeaksPerSecond;
        var count = (signal.Samples.Length + bucket - 1) / bucket;
        return new WaveformPeaks(
            DefaultPeaksPerSecond,
            [.. Enumerable.Range(0, count).Select(index => PeakOf(signal.Samples, index, bucket))]
        );
    }

    [Pure]
    private static int PeakOf(float[] samples, int index, int bucket)
    {
        var start = index * bucket;
        var end = Math.Min(samples.Length, start + bucket);
        var peak = 0f;
        for (var sample = start; sample < end; sample++)
            peak = Math.Max(peak, Math.Abs(samples[sample]));
        return (int)Math.Round(Math.Min(1, peak) * FullScale);
    }
}
