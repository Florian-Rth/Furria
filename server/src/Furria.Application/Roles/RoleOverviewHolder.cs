namespace Furria.Application.Roles;

public sealed record RoleOverviewHolder
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }
}
