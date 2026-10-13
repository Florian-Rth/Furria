namespace Furria.Application.Operations;

public sealed record LogEntrySummary
{
    public required long Id { get; init; }

    public required DateTimeOffset LoggedAt { get; init; }

    public required LogSource Source { get; init; }

    public required string Instance { get; init; }

    public required LogEntryLevel Level { get; init; }

    public required string Category { get; init; }

    public required string Template { get; init; }

    public required string Message { get; init; }

    public required string? Exception { get; init; }
}
