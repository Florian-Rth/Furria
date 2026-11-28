using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class HandSetBeat
{
    private const double SameValueTolerance = 1e-6;

    [Pure]
    public static double? Of(double? sent, double? analysed) =>
        sent is { } value && analysed is { } found && Math.Abs(value - found) < SameValueTolerance
            ? null
            : sent;
}
