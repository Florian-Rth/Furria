namespace Furria.Application.Groups;

public sealed record PersonReference
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
