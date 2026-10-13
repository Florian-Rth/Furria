namespace Furria.Application.Operations;

public sealed record LogEntryQuery
{
    public const int DefaultTake = 100;
    public const int MaximumTake = 200;

    public LogSource? Source { get; init; }

    public LogEntryLevel? MinimumLevel { get; init; }

    public string? Search { get; init; }

    public long? Before { get; init; }

    public int Take { get; init; } = DefaultTake;
}
