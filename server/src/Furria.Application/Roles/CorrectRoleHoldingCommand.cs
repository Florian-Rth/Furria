namespace Furria.Application.Roles;

public sealed record CorrectRoleHoldingCommand
{
    public required int RoleId { get; init; }

    public required int RoleHoldingId { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
