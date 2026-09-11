namespace Furria.Application.Groups;

public sealed record MyGroupDetails
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required IReadOnlyList<HubMember> Members { get; init; }

    public required IReadOnlyList<HubAdministrator> Admins { get; init; }

    public required IReadOnlyList<HubMember> PastMembers { get; init; }

    public required IReadOnlyList<HubAdministrator> PastAdmins { get; init; }
}
