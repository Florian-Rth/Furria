using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public readonly record struct StageSize(double WidthMetres, double DepthMetres)
{
    public static readonly StageSize Unconfigured = new(10, 8);

    [Pure]
    public bool Contains(StagePoint point) =>
        Math.Abs(point.RightMetres) <= WidthMetres / 2
        && point.BackMetres >= 0
        && point.BackMetres <= DepthMetres;
}
