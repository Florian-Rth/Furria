using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public static class WindowSearch
{
    private const int CoarseFactor = 10;
    private const double RivalDistanceSeconds = 0.75;

    [Pure]
    public static WindowAlignment? AlignWithin(
        SoundProfile reference,
        SoundProfile window,
        double fromSeconds,
        double toSeconds
    )
    {
        if (!AreComparable(reference, window))
            return null;
        if (LagRangeOf(reference, window, fromSeconds, toSeconds) is not { } lags)
            return null;

        var framesPerSecond = reference.FramesPerSecond;
        var searched = reference.Excerpt(
            (double)lags.First / framesPerSecond,
            (double)(lags.Last + window.FrameCount) / framesPerSecond
        );
        var coarse = CoarsePeakOf(searched, window, lags.Span);
        var fine = FinePeakNear(searched, window, coarse.Lag, lags.Span);

        return new WindowAlignment(
            (lags.First + fine.Lag + fine.Shift) / framesPerSecond,
            Math.Clamp(MomentsAt(searched, window, fine.Lag).Correlation, 0, 1),
            coarse.Distinctness
        );
    }

    [Pure]
    private static LagRange? LagRangeOf(
        SoundProfile reference,
        SoundProfile window,
        double fromSeconds,
        double toSeconds
    )
    {
        var first = Math.Max(0, (int)Math.Floor(fromSeconds * reference.FramesPerSecond));
        var last = Math.Min(
            reference.FrameCount - window.FrameCount,
            (int)Math.Ceiling(toSeconds * reference.FramesPerSecond)
        );
        return last < first ? null : new LagRange(first, last);
    }

    [Pure]
    private static bool AreComparable(SoundProfile reference, SoundProfile window) =>
        reference.FramesPerSecond == window.FramesPerSecond
        && reference.Bands.Length == window.Bands.Length
        && window.FrameCount >= SoundComparison.MinimumOverlapSeconds * window.FramesPerSecond
        && reference.FrameCount >= window.FrameCount;

    [Pure]
    private static CoarsePeak CoarsePeakOf(SoundProfile searched, SoundProfile window, int lastLag)
    {
        var coarseSearched = searched.Coarsened(CoarseFactor);
        var coarseWindow = window.Coarsened(CoarseFactor);
        var lastCoarseLag = Math.Min(
            lastLag / CoarseFactor,
            coarseSearched.FrameCount - coarseWindow.FrameCount
        );
        if (lastCoarseLag <= 0)
            return new CoarsePeak(0, 1);

        var strengths = Enumerable
            .Range(0, lastCoarseLag + 1)
            .Select(lag => MeanProductAt(coarseSearched, coarseWindow, lag))
            .ToArray();
        var best = IndexOfMaximum(strengths);
        var rivalDistance = (int)
            Math.Ceiling(RivalDistanceSeconds * coarseSearched.FramesPerSecond);

        return new CoarsePeak(
            best * CoarseFactor,
            DistinctnessOf(strengths[best], RivalOf(strengths, best, rivalDistance))
        );
    }

    [Pure]
    private static FinePeak FinePeakNear(
        SoundProfile searched,
        SoundProfile window,
        int centreLag,
        int lastLag
    )
    {
        var firstLag = Math.Max(0, centreLag - CoarseFactor);
        var finalLag = Math.Min(lastLag, centreLag + CoarseFactor);
        var strengths = Enumerable
            .Range(firstLag, finalLag - firstLag + 1)
            .Select(lag => MeanProductAt(searched, window, lag))
            .ToArray();
        var best = IndexOfMaximum(strengths);

        return new FinePeak(firstLag + best, ParabolicPeak.ShiftAt(strengths, best));
    }

    [Pure]
    private static double MeanProductAt(SoundProfile searched, SoundProfile window, int lag)
    {
        var sum = 0.0;
        for (var band = 0; band < window.Bands.Length; band++)
        {
            var reference = searched.Bands[band];
            var heard = window.Bands[band];
            for (var frame = 0; frame < heard.Length; frame++)
                sum += reference[frame + lag] * heard[frame];
        }

        return sum / (window.FrameCount * window.Bands.Length);
    }

    [Pure]
    private static double RivalOf(double[] strengths, int best, int rivalDistance)
    {
        var rival = double.NegativeInfinity;
        for (var lag = 0; lag < strengths.Length; lag++)
            if (Math.Abs(lag - best) > rivalDistance)
                rival = Math.Max(rival, strengths[lag]);
        return rival;
    }

    [Pure]
    private static double DistinctnessOf(double best, double rival) =>
        best <= 0 ? 0 : Math.Clamp(1 - Math.Max(0, rival) / best, 0, 1);

    [Pure]
    private static Moments MomentsAt(SoundProfile searched, SoundProfile window, int lag)
    {
        var moments = new Moments(window.FrameCount * window.Bands.Length, 0, 0, 0, 0, 0);
        for (var band = 0; band < window.Bands.Length; band++)
        {
            var reference = searched.Bands[band];
            var heard = window.Bands[band];
            for (var frame = 0; frame < heard.Length; frame++)
                moments = moments.With(reference[frame + lag], heard[frame]);
        }

        return moments;
    }

    [Pure]
    private static int IndexOfMaximum(double[] values)
    {
        var best = 0;
        for (var index = 1; index < values.Length; index++)
            if (values[index] > values[best])
                best = index;
        return best;
    }

    private readonly record struct LagRange(int First, int Last)
    {
        public int Span => Last - First;
    }

    private readonly record struct Moments(
        int Count,
        double SumReference,
        double SumHeard,
        double SumProduct,
        double SumReferenceSquares,
        double SumHeardSquares
    )
    {
        public double Correlation
        {
            get
            {
                var covariance = SumProduct - SumReference * SumHeard / Count;
                var spread = Math.Sqrt(
                    (SumReferenceSquares - SumReference * SumReference / Count)
                        * (SumHeardSquares - SumHeard * SumHeard / Count)
                );
                return spread <= 0 ? 0 : covariance / spread;
            }
        }

        [Pure]
        public Moments With(double reference, double heard) =>
            this with
            {
                SumReference = SumReference + reference,
                SumHeard = SumHeard + heard,
                SumProduct = SumProduct + reference * heard,
                SumReferenceSquares = SumReferenceSquares + reference * reference,
                SumHeardSquares = SumHeardSquares + heard * heard,
            };
    }

    private readonly record struct CoarsePeak(int Lag, double Distinctness);

    private readonly record struct FinePeak(int Lag, double Shift);
}
