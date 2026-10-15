using Furria.Core.Club;

namespace Furria.Application.Roles;

public sealed record CreateRoleCommand
{
    public required string Name { get; init; }

    public required string Description { get; init; }

    public required ClubIcon? Icon { get; init; }
}
