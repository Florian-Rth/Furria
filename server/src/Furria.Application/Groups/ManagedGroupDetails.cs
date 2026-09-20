namespace Furria.Application.Groups;

public sealed record ManagedGroupDetails
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required int? GroupKindId { get; init; }

    public required string? GroupKindName { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<ManagedMember> Members { get; init; }

    public required IReadOnlyList<ManagedAdministrator> Admins { get; init; }

    public required IReadOnlyList<ManagedMember> PastMembers { get; init; }

    public required IReadOnlyList<ManagedAdministrator> PastAdmins { get; init; }
}
