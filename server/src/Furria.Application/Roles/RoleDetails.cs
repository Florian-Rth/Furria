namespace Furria.Application.Roles;

public sealed record RoleDetails
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }

    public required IReadOnlyList<RoleHolder> Holders { get; init; }

    public required IReadOnlyList<RoleHolder> PastHolders { get; init; }
}
