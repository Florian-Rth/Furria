namespace Furria.Application.Roles;

public sealed record EndRoleHoldingCommand
{
    public required int RoleId { get; init; }

    public required int RoleHoldingId { get; init; }

    public required DateOnly EndedOn { get; init; }
}
