using System.Diagnostics;
using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

public static class StageClock
{
    private static readonly TimeSpan Changeover = TimeSpan.FromMinutes(2);

    [Pure]
    public static TimeSpan LengthOf(ActKind? kind, double musicSeconds) =>
        musicSeconds > 0 ? TimeSpan.FromSeconds(musicSeconds) : TypicalLengthOf(kind);

    [Pure]
    public static IReadOnlyList<DateTimeOffset> StartsOf(
        DateTimeOffset eveningStart,
        IReadOnlyList<TimeSpan> lengths
    )
    {
        var starts = new List<DateTimeOffset>(lengths.Count);
        var next = eveningStart;

        foreach (var length in lengths)
        {
            starts.Add(next);
            next += length + Changeover;
        }

        return starts;
    }

    [Pure]
    private static TimeSpan TypicalLengthOf(ActKind? kind) =>
        kind switch
        {
            ActKind.Dance => TimeSpan.FromMinutes(6),
            ActKind.Show => TimeSpan.FromMinutes(8),
            ActKind.Music => TimeSpan.FromMinutes(5),
            ActKind.Speech => TimeSpan.FromMinutes(10),
            ActKind.Point or null => TimeSpan.FromMinutes(5),
            _ => throw new UnreachableException(),
        };
}
