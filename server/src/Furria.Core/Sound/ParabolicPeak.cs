using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public static class ParabolicPeak
{
    private const double LargestShift = 0.5;

    [Pure]
    public static double ShiftAt(IReadOnlyList<double> values, int peak)
    {
        if (peak == 0 || peak == values.Count - 1)
            return 0;

        var (before, at, after) = (values[peak - 1], values[peak], values[peak + 1]);
        var curvature = before - 2 * at + after;
        return curvature >= 0
            ? 0
            : Math.Clamp(0.5 * (before - after) / curvature, -LargestShift, LargestShift);
    }
}
