namespace Furria.Application.Groups;

public sealed record GroupKindDetails
{
    public required int GroupKindId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required int GroupCount { get; init; }
}
