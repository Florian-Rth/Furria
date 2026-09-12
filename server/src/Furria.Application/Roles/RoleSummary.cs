namespace Furria.Application.Roles;

public sealed record RoleSummary
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }

    public required IReadOnlyList<RoleHolderReference> Holders { get; init; }
}
