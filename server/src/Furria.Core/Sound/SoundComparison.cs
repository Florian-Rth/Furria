using System.Diagnostics.Contracts;
using System.Numerics;

namespace Furria.Core.Sound;

public static class SoundComparison
{
    public const double MinimumOverlapSeconds = 3;

    private const int CoarseFactor = 10;
    private const double CoarseStretchStep = 0.002;
    private const double FineStretchStep = 0.0005;
    private const int NearLagFrames = 60;

    [Pure]
    public static SoundAlignment? Align(SoundProfile reference, SoundProfile other) =>
        new PreparedReference(reference).AlignedWith(other);

    [Pure]
    public static StretchedAlignment? AlignStretched(
        SoundProfile reference,
        SoundProfile other,
        double mostStretch
    )
    {
        var fine = new PreparedReference(reference);
        if (!fine.IsComparableWith(other))
            return null;

        var coarse = CoarseFitOf(reference, other, mostStretch);
        var centreLag = (int)Math.Round(coarse.LagSeconds * reference.FramesPerSecond);
        var stretch = FineStretchAround(fine, other, coarse.Stretch, centreLag);
        return fine.AlignedNear(other.Stretched(stretch), centreLag, NearLagFrames) is { } alignment
            ? new StretchedAlignment(alignment.OffsetSeconds, stretch, alignment.Confidence)
            : null;
    }

    [Pure]
    private static CoarseFit CoarseFitOf(
        SoundProfile reference,
        SoundProfile other,
        double mostStretch
    )
    {
        var coarse = new PreparedReference(reference.Coarsened(CoarseFactor));
        var heard = other.Coarsened(CoarseFactor);
        var steps = (int)Math.Round(mostStretch / CoarseStretchStep);
        var unfit = new CoarseFit(1, 0, double.MinValue);

        return Enumerable
            .Range(0, steps + 1)
            .SelectMany(step =>
                step == 0
                    ? [1.0]
                    : new[] { 1 - step * CoarseStretchStep, 1 + step * CoarseStretchStep }
            )
            .Select(stretch =>
                coarse.PeakWith(heard.Stretched(stretch)) is { } peak
                    ? new CoarseFit(
                        stretch,
                        (peak.Lag + peak.Shift) / coarse.FramesPerSecond,
                        peak.Strength
                    )
                    : unfit
            )
            .Aggregate(unfit, (best, fit) => fit.Strength > best.Strength ? fit : best);
    }

    [Pure]
    private static double FineStretchAround(
        PreparedReference fine,
        SoundProfile other,
        double coarseStretch,
        int centreLag
    )
    {
        var reach = (int)Math.Round(2 * CoarseStretchStep / FineStretchStep);
        var stretches = Enumerable
            .Range(-reach, 2 * reach + 1)
            .Select(step => coarseStretch + step * FineStretchStep)
            .ToArray();
        var strengths = stretches
            .Select(stretch =>
                fine.PeakNear(other.Stretched(stretch), centreLag, NearLagFrames)?.Strength
                ?? double.NegativeInfinity
            )
            .ToArray();
        var best = IndexOfMaximum(strengths);

        return stretches[best] + FiniteShiftAt(strengths, best) * FineStretchStep;
    }

    [Pure]
    private static double FiniteShiftAt(double[] strengths, int best) =>
        best > 0
        && best < strengths.Length - 1
        && double.IsFinite(strengths[best - 1])
        && double.IsFinite(strengths[best + 1])
            ? ParabolicPeak.ShiftAt(strengths, best)
            : 0;

    [Pure]
    private static int IndexOfMaximum(double[] values)
    {
        var best = 0;
        for (var index = 1; index < values.Length; index++)
            if (values[index] > values[best])
                best = index;
        return best;
    }

    private sealed record LagPeak(int Lag, double Shift, double Strength);

    private sealed record CoarseFit(double Stretch, double LagSeconds, double Strength);

    private sealed class PreparedReference
    {
        private readonly SoundProfile _reference;
        private readonly Dictionary<int, Complex[][]> _spectraBySize = [];

        public PreparedReference(SoundProfile reference)
        {
            _reference = reference;
        }

        public int FramesPerSecond => _reference.FramesPerSecond;

        private int MinimumOverlap => (int)(MinimumOverlapSeconds * _reference.FramesPerSecond);

        public bool IsComparableWith(SoundProfile other) =>
            _reference.FramesPerSecond == other.FramesPerSecond
            && _reference.Bands.Length == other.Bands.Length
            && _reference.FrameCount >= MinimumOverlap
            && other.FrameCount >= MinimumOverlap;

        public SoundAlignment? AlignedWith(SoundProfile other)
        {
            if (PeakWith(other) is not { } peak)
                return null;

            return new SoundAlignment(
                (peak.Lag + peak.Shift) / _reference.FramesPerSecond,
                Math.Clamp(CorrelationAt(other, peak.Lag), 0, 1)
            );
        }

        public LagPeak? PeakWith(SoundProfile other)
        {
            if (!IsComparableWith(other))
                return null;

            var (firstLag, strengths) = StrengthsByLag(other);
            var bestIndex = IndexOfMaximum(strengths);

            return new LagPeak(
                firstLag + bestIndex,
                ParabolicPeak.ShiftAt(strengths, bestIndex),
                strengths[bestIndex]
            );
        }

        public SoundAlignment? AlignedNear(SoundProfile other, int centreLag, int reach)
        {
            if (PeakNear(other, centreLag, reach) is not { } peak)
                return null;

            return new SoundAlignment(
                (peak.Lag + peak.Shift) / _reference.FramesPerSecond,
                Math.Clamp(CorrelationAt(other, peak.Lag), 0, 1)
            );
        }

        public LagPeak? PeakNear(SoundProfile other, int centreLag, int reach)
        {
            if (!IsComparableWith(other))
                return null;

            var firstLag = Math.Max(MinimumOverlap - other.FrameCount, centreLag - reach);
            var lastLag = Math.Min(_reference.FrameCount - MinimumOverlap, centreLag + reach);
            if (lastLag < firstLag)
                return null;

            var strengths = new double[lastLag - firstLag + 1];
            for (var lag = firstLag; lag <= lastLag; lag++)
                strengths[lag - firstLag] =
                    DirectSumAt(other, lag)
                    / Math.Sqrt(OverlapAt(other, lag) * _reference.Bands.Length);
            var bestIndex = IndexOfMaximum(strengths);

            return new LagPeak(
                firstLag + bestIndex,
                ParabolicPeak.ShiftAt(strengths, bestIndex),
                strengths[bestIndex]
            );
        }

        private double DirectSumAt(SoundProfile other, int lag)
        {
            var first = Math.Max(0, -lag);
            var last = Math.Min(other.FrameCount, _reference.FrameCount - lag);
            var sum = 0.0;
            for (var band = 0; band < _reference.Bands.Length; band++)
            {
                var reference = _reference.Bands[band];
                var heard = other.Bands[band];
                for (var frame = first; frame < last; frame++)
                    sum += reference[frame + lag] * heard[frame];
            }

            return sum;
        }

        private (int FirstLag, double[] Strengths) StrengthsByLag(SoundProfile other)
        {
            var sums = CrossCorrelationSums(other);
            var firstLag = MinimumOverlap - other.FrameCount;
            var lastLag = _reference.FrameCount - MinimumOverlap;
            var values = new double[lastLag - firstLag + 1];
            for (var lag = firstLag; lag <= lastLag; lag++)
            {
                var sum = sums[lag >= 0 ? lag : sums.Length + lag].Real;
                values[lag - firstLag] =
                    sum / Math.Sqrt(OverlapAt(other, lag) * _reference.Bands.Length);
            }

            return (firstLag, values);
        }

        private Complex[] CrossCorrelationSums(SoundProfile other)
        {
            var size = Fft.SizeFor(_reference.FrameCount + other.FrameCount);
            var referenceSpectra = SpectraOfSize(size);
            var sums = new Complex[size];
            for (var band = 0; band < _reference.Bands.Length; band++)
            {
                var otherSpectrum = SpectrumOf(other.Bands[band], size);
                for (var bin = 0; bin < size; bin++)
                    sums[bin] +=
                        referenceSpectra[band][bin] * Complex.Conjugate(otherSpectrum[bin]);
            }

            Fft.Inverse(sums);
            return sums;
        }

        private Complex[][] SpectraOfSize(int size)
        {
            if (!_spectraBySize.TryGetValue(size, out var spectra))
            {
                spectra = [.. _reference.Bands.Select(band => SpectrumOf(band, size))];
                _spectraBySize[size] = spectra;
            }

            return spectra;
        }

        private int OverlapAt(SoundProfile other, int lag) =>
            Math.Min(_reference.FrameCount, lag + other.FrameCount) - Math.Max(0, lag);

        private double CorrelationAt(SoundProfile other, int lag)
        {
            var first = Math.Max(0, -lag);
            var last = Math.Min(other.FrameCount, _reference.FrameCount - lag);
            var pairs = _reference
                .Bands.Zip(other.Bands)
                .SelectMany(bands =>
                    Enumerable
                        .Range(first, Math.Max(0, last - first))
                        .Select(frame =>
                            (Reference: bands.First[frame + lag], Other: bands.Second[frame])
                        )
                )
                .ToList();
            return PearsonOf(pairs);
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
        private static double PearsonOf(IReadOnlyList<(float Reference, float Other)> pairs)
        {
            if (pairs.Count == 0)
                return 0;

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
    }
}
