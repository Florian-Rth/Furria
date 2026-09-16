namespace Furria.Application.Roles;

public sealed record RoleHolder
{
    public required int RoleHoldingId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}
