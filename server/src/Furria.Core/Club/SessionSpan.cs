using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public readonly record struct SessionSpan
{
    public required int FirstYear { get; init; }

    public required int? LastYear { get; init; }

    [Pure]
    public bool IsWellFormed => LastYear is null || LastYear >= FirstYear;

    [Pure]
    public bool Contains(int sessionYear) =>
        FirstYear <= sessionYear && (LastYear is null || LastYear >= sessionYear);

    [Pure]
    public bool Overlaps(SessionSpan other) =>
        FirstYear <= (other.LastYear ?? int.MaxValue)
        && other.FirstYear <= (LastYear ?? int.MaxValue);
}
