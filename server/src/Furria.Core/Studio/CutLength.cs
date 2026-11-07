using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class CutLength
{
    public const double ShortestSeconds = 0.5;

    private const double RoundingSeconds = 0.000001;

    [Pure]
    public static bool IsLongEnough(double startSeconds, double endSeconds) =>
        endSeconds - startSeconds >= ShortestSeconds - RoundingSeconds;
}
