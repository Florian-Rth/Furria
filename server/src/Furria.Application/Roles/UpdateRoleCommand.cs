using Furria.Core.Club;

namespace Furria.Application.Roles;

public sealed record UpdateRoleCommand
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required ClubIcon? Icon { get; init; }
}
