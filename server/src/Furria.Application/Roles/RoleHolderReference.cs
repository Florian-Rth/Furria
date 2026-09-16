namespace Furria.Application.Roles;

public sealed record RoleHolderReference
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
