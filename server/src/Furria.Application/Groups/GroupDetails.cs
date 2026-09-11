namespace Furria.Application.Groups;

public sealed record GroupDetails
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required IReadOnlyList<GroupMember> Members { get; init; }

    public required IReadOnlyList<GroupAdministrator> Admins { get; init; }
}
