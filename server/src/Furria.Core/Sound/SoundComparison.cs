using System.Diagnostics.Contracts;
using System.Numerics;

namespace Furria.Core.Sound;

public static class SoundComparison
{
    public const double MinimumOverlapSeconds = 3;

    [Pure]
    public static SoundAlignment? Align(SoundProfile reference, SoundProfile other)
    {
        var minimumOverlap = (int)(MinimumOverlapSeconds * reference.FramesPerSecond);
        if (
            reference.FramesPerSecond != other.FramesPerSecond
            || reference.Bands.Length != other.Bands.Length
            || reference.FrameCount < minimumOverlap
            || other.FrameCount < minimumOverlap
        )
            return null;

        var strengths = StrengthsByLag(reference, other, minimumOverlap);
        var bestIndex = IndexOfMaximum(strengths.Values);
        var lag = strengths.FirstLag + bestIndex;

        return new SoundAlignment(
            (lag + ParabolicPeak.ShiftAt(strengths.Values, bestIndex)) / reference.FramesPerSecond,
            Math.Clamp(CorrelationAt(reference, other, lag), 0, 1)
        );
    }

    [Pure]
    private static LagStrengths StrengthsByLag(
        SoundProfile reference,
        SoundProfile other,
        int minimumOverlap
    )
    {
        var sums = CrossCorrelationSums(reference, other);
        var firstLag = minimumOverlap - other.FrameCount;
        var lastLag = reference.FrameCount - minimumOverlap;
        var values = new double[lastLag - firstLag + 1];
        for (var lag = firstLag; lag <= lastLag; lag++)
        {
            var sum = sums[lag >= 0 ? lag : sums.Length + lag].Real;
            values[lag - firstLag] =
                sum / Math.Sqrt(OverlapAt(reference, other, lag) * reference.Bands.Length);
        }

        return new LagStrengths(firstLag, values);
    }

    [Pure]
    private static Complex[] CrossCorrelationSums(SoundProfile reference, SoundProfile other)
    {
        var size = Fft.SizeFor(reference.FrameCount + other.FrameCount);
        var sums = new Complex[size];
        for (var band = 0; band < reference.Bands.Length; band++)
        {
            var referenceSpectrum = SpectrumOf(reference.Bands[band], size);
            var otherSpectrum = SpectrumOf(other.Bands[band], size);
            for (var bin = 0; bin < size; bin++)
                sums[bin] += referenceSpectrum[bin] * Complex.Conjugate(otherSpectrum[bin]);
        }

        Fft.Inverse(sums);
        return sums;
    }

    [Pure]
    private static Complex[] SpectrumOf(float[] values, int size)
    {
        var spectrum = new Complex[size];
        for (var index = 0; index < values.Length; index++)
            spectrum[index] = values[index];
        Fft.Forward(spectrum);
        return spectrum;
    }

    [Pure]
    private static int OverlapAt(SoundProfile reference, SoundProfile other, int lag) =>
        Math.Min(reference.FrameCount, lag + other.FrameCount) - Math.Max(0, lag);

    [Pure]
    private static int IndexOfMaximum(double[] values)
    {
        var best = 0;
        for (var index = 1; index < values.Length; index++)
            if (values[index] > values[best])
                best = index;
        return best;
    }

    [Pure]
    private static double CorrelationAt(SoundProfile reference, SoundProfile other, int lag)
    {
        var first = Math.Max(0, -lag);
        var last = Math.Min(other.FrameCount, reference.FrameCount - lag);
        var pairs = reference
            .Bands.Zip(other.Bands)
            .SelectMany(bands =>
                Enumerable
                    .Range(first, last - first)
                    .Select(frame =>
                        (Reference: bands.First[frame + lag], Other: bands.Second[frame])
                    )
            )
            .ToList();
        return PearsonOf(pairs);
    }

    [Pure]
    private static double PearsonOf(IReadOnlyList<(float Reference, float Other)> pairs)
    {
        var referenceMean = pairs.Average(pair => pair.Reference);
        var otherMean = pairs.Average(pair => pair.Other);
        double covariance = 0,
            referenceVariance = 0,
            otherVariance = 0;
        foreach (var (reference, other) in pairs)
        {
            covariance += (reference - referenceMean) * (other - otherMean);
            referenceVariance += (reference - referenceMean) * (reference - referenceMean);
            otherVariance += (other - otherMean) * (other - otherMean);
        }

        var spread = Math.Sqrt(referenceVariance * otherVariance);
        return spread <= 0 ? 0 : covariance / spread;
    }

    private sealed record LagStrengths(int FirstLag, double[] Values);
}
