namespace Furria.Application.Operations;

public sealed record BackgroundRunSummary
{
    public required BackgroundJob Job { get; init; }

    public required int? CadenceSeconds { get; init; }

    public required DateTimeOffset? LastRunAt { get; init; }

    public required string? LastFailure { get; init; }

    public required int ConsecutiveFailures { get; init; }

    public required DateTimeOffset? NextDueAt { get; init; }

    public required bool IsRunning { get; init; }
}
