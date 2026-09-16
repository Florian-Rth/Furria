namespace Furria.Application.Registry;

public sealed record PersonSearchSummary
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
