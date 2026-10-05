namespace Furria.Application.Management;

public sealed record ToDoSummary
{
    public required ToDoKind Kind { get; init; }

    public required int Count { get; init; }
}
