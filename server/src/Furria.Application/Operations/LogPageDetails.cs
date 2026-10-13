namespace Furria.Application.Operations;

public sealed record LogPageDetails
{
    public required IReadOnlyList<LogEntrySummary> Entries { get; init; }

    public required long? NextBefore { get; init; }
}
