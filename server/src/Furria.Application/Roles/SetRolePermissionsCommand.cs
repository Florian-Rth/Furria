namespace Furria.Application.Roles;

public sealed record SetRolePermissionsCommand
{
    public required int RoleId { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }
}
