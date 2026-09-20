namespace Furria.Application.Management;

public sealed record ManageHubRoles
{
    public required int RoleCount { get; init; }

    public required int VacantCount { get; init; }
}
