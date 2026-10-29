using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public static class BeatTracker
{
    private const double FramesPerSecond = BandOnsets.FramesPerSecond;
    private const double SecondsPerMinute = 60;
    private const double SlowestBpm = 70;
    private const double FastestBpm = 180;
    private const double PreferredBpm = 120;
    private const double PreferenceWidthOctaves = 1;
    private const double RefinementSpan = 0.02;
    private const int RefinementSteps = 400;
    private const double PhaseStep = 0.5;
    private const int LocalMeanRadius = 25;
    private const double ShortestSeconds = 4;

    [Pure]
    public static BeatGrid? Of(SoundSignal signal) => Of(signal, BandOnsets.Of(signal));

    [Pure]
    public static BeatGrid? Of(SoundSignal signal, float[][] onsets)
    {
        if (signal.DurationSeconds < ShortestSeconds)
            return null;

        var envelope = EnvelopeOf(onsets);
        if (RoughPeriodOf(envelope) is not { } roughPeriod)
            return null;

        var (period, phase) = RefinedGridOf(envelope, roughPeriod);
        var firstSound = LeadingSilence.SecondsOf(signal) * FramesPerSecond;
        return new BeatGrid(
            FirstBeatAfter(firstSound - period / 4, period, phase) / FramesPerSecond,
            SecondsPerMinute * FramesPerSecond / period
        );
    }

    [Pure]
    private static double FirstBeatAfter(double earliest, double period, double phase) =>
        phase + Math.Max(0, Math.Ceiling((earliest - phase) / period)) * period;

    [Pure]
    private static double[] EnvelopeOf(float[][] onsets)
    {
        var sums = new double[onsets[0].Length];
        foreach (var band in onsets)
            for (var frame = 0; frame < sums.Length; frame++)
                sums[frame] += band[frame];
        return WithoutLocalMean(sums);
    }

    [Pure]
    private static double[] WithoutLocalMean(double[] values)
    {
        var prefix = new double[values.Length + 1];
        for (var index = 0; index < values.Length; index++)
            prefix[index + 1] = prefix[index] + values[index];

        var peaks = new double[values.Length];
        for (var index = 0; index < values.Length; index++)
        {
            var start = Math.Max(0, index - LocalMeanRadius);
            var end = Math.Min(values.Length, index + LocalMeanRadius + 1);
            peaks[index] = Math.Max(
                0,
                values[index] - (prefix[end] - prefix[start]) / (end - start)
            );
        }

        return peaks;
    }

    [Pure]
    private static double? RoughPeriodOf(double[] envelope)
    {
        var shortest = (int)Math.Floor(SecondsPerMinute * FramesPerSecond / FastestBpm);
        var longest = (int)Math.Ceiling(SecondsPerMinute * FramesPerSecond / SlowestBpm);
        var strengths = Enumerable
            .Range(shortest, longest - shortest + 1)
            .Select(lag => AutocorrelationAt(envelope, lag) * PreferenceOf(lag))
            .ToArray();
        var best = Array.IndexOf(strengths, strengths.Max());
        return strengths[best] <= 0
            ? null
            : shortest + best + ParabolicPeak.ShiftAt(strengths, best);
    }

    [Pure]
    private static double AutocorrelationAt(double[] envelope, int lag)
    {
        var sum = 0.0;
        for (var frame = 0; frame + lag < envelope.Length; frame++)
            sum += envelope[frame] * envelope[frame + lag];
        return sum / Math.Max(1, envelope.Length - lag);
    }

    [Pure]
    private static double PreferenceOf(int lag)
    {
        var octaves = Math.Log2(SecondsPerMinute * FramesPerSecond / lag / PreferredBpm);
        return Math.Exp(-0.5 * Math.Pow(octaves / PreferenceWidthOctaves, 2));
    }

    [Pure]
    private static (double Period, double Phase) RefinedGridOf(double[] envelope, double rough)
    {
        var best = (Period: rough, Phase: 0.0, Score: double.MinValue);
        for (var step = -RefinementSteps / 2; step <= RefinementSteps / 2; step++)
        {
            var period = rough * (1 + RefinementSpan * step / (RefinementSteps / 2));
            var (phase, score) = BestPhaseOf(envelope, period);
            if (score > best.Score)
                best = (period, phase, score);
        }

        return (best.Period, best.Phase);
    }

    [Pure]
    private static (double Phase, double Score) BestPhaseOf(double[] envelope, double period)
    {
        var best = (Phase: 0.0, Score: double.MinValue);
        for (var phase = 0.0; phase < period; phase += PhaseStep)
        {
            var score = CombScoreOf(envelope, period, phase);
            if (score > best.Score)
                best = (phase, score);
        }

        return best;
    }

    [Pure]
    private static double CombScoreOf(double[] envelope, double period, double phase)
    {
        var sum = 0.0;
        var beats = 0;
        for (var position = phase; position < envelope.Length - 1; position += period, beats++)
        {
            var frame = (int)position;
            var weight = position - frame;
            sum += envelope[frame] * (1 - weight) + envelope[frame + 1] * weight;
        }

        return beats == 0 ? 0 : sum / beats;
    }
}
