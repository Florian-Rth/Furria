namespace Furria.Application.Management;

public sealed record ToDoMarkCommand
{
    public required int AccountId { get; init; }

    public required ToDoKind Kind { get; init; }

    public required string Version { get; init; }
}
