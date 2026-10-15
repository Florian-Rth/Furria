using Furria.Core.Roles;

namespace Furria.Application.Roles;

public sealed record CreateRoleCommand
{
    public required string Name { get; init; }

    public required string Description { get; init; }

    public required RoleCoin? Coin { get; init; }
}
