namespace Furria.Application.BeerList;

public sealed record BeerListEnrollmentEnder
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
