using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public readonly record struct SongPlacement(double OffsetSeconds, double Stretch)
{
    [Pure]
    public double NewSecondsOf(double oldSeconds) => OffsetSeconds + oldSeconds * Stretch;
}
