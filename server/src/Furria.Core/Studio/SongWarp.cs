using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed record SongWarp(SongPlacement Placement, IReadOnlyList<WarpPoint> Points)
{
    public double Stretch => Placement.Stretch;

    [Pure]
    public static SongWarp Of(SongPlacement placement) => new(placement, []);

    [Pure]
    public bool Found(double oldSeconds) => Points.Any(point => point.OldSeconds == oldSeconds);

    [Pure]
    public double NewSecondsOf(double oldSeconds)
    {
        if (Points.Count == 0)
            return Placement.NewSecondsOf(oldSeconds);

        var after = Points.TakeWhile(point => point.OldSeconds < oldSeconds).Count();
        if (after == 0)
            return Extended(Points[0], oldSeconds);
        if (after == Points.Count)
            return Extended(Points[^1], oldSeconds);

        return Between(Points[after - 1], Points[after], oldSeconds);
    }

    [Pure]
    private double Extended(WarpPoint point, double oldSeconds) =>
        point.NewSeconds + (oldSeconds - point.OldSeconds) * Stretch;

    [Pure]
    private static double Between(WarpPoint before, WarpPoint after, double oldSeconds) =>
        before.NewSeconds
        + (oldSeconds - before.OldSeconds)
            * (after.NewSeconds - before.NewSeconds)
            / (after.OldSeconds - before.OldSeconds);
}
