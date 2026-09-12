namespace Furria.Application.Roles;

public sealed record AddRoleHoldingCommand
{
    public required int RoleId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly SinceOn { get; init; }
}
