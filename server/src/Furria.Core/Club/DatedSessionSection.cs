namespace Furria.Core.Club;

public sealed record DatedSessionSection<T>(
    int SessionStartYear,
    int? SessionNumber,
    IReadOnlyList<T> Items
);
