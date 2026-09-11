using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public readonly record struct DatePeriod
{
    public required DateOnly Start { get; init; }

    public required DateOnly? End { get; init; }

    [Pure]
    public bool IsOpen => End is null;

    [Pure]
    public bool IsWellFormed => End is null || End >= Start;

    [Pure]
    public bool IsRunningOn(DateOnly today) => Start <= today && (End is null || End >= today);

    [Pure]
    public bool Overlaps(DatePeriod other) =>
        Start <= (other.End ?? DateOnly.MaxValue) && other.Start <= (End ?? DateOnly.MaxValue);
}
