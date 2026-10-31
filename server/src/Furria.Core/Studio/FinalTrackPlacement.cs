using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public readonly record struct FinalTrackPlacement(double OffsetSeconds, double Stretch)
{
    public const double Unstretched = 1;
    public const double LeastStretch = 0.9;
    public const double MostStretch = 1.1;

    [Pure]
    public double FinalSecondsOf(double sourceSeconds) => OffsetSeconds + sourceSeconds * Stretch;
}
