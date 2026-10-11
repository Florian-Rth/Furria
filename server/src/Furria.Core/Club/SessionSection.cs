namespace Furria.Core.Club;

public sealed record SessionSection<T>(
    int? SessionStartYear,
    int? SessionNumber,
    IReadOnlyList<T> Items
);
