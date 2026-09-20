namespace Furria.Application.Groups;

public sealed record GroupKindCreateCommand
{
    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}
