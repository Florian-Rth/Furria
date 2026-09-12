namespace Furria.Application.Groups;

public sealed record ManagedGroupSummary
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required int MemberCount { get; init; }

    public required IReadOnlyList<PersonReference> Admins { get; init; }
}
