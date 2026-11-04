namespace Furria.Application.Halls;

public sealed record SeatingDetails
{
    public required SeatingStandardDetails Standard { get; init; }

    public required IReadOnlyList<TableTypeSummary> TableTypes { get; init; }
}
