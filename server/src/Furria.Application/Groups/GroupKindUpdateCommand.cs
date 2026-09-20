namespace Furria.Application.Groups;

public sealed record GroupKindUpdateCommand
{
    public required int GroupKindId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}
