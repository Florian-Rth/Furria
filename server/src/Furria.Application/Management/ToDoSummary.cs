namespace Furria.Application.Management;

public sealed record ToDoSummary
{
    public required ToDoKind Kind { get; init; }

    public required int Count { get; init; }

    public required bool IsSeen { get; init; }

    public required int NewCount { get; init; }

    public required string Version { get; init; }

    public bool IsQuiet => IsSeen && NewCount == 0;
}
