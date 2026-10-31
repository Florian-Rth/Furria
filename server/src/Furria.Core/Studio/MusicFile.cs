using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class MusicFile
{
    private const double LengthToleranceSeconds = 0.01;

    [Pure]
    public static bool IsPastTheEnd(double? seconds, double? durationSeconds) =>
        seconds is { } moment
        && durationSeconds is { } duration
        && moment > duration + LengthToleranceSeconds;
}
