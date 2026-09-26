namespace Furria.Application.Registry;

public sealed record AdoptionCandidateDetails
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required bool HasAccount { get; init; }
}
