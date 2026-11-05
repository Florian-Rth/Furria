namespace Furria.Application.BeerList;

public sealed record BeerListEnrollmentSummary
{
    public required int EnrollmentId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset? EndedAt { get; init; }

    public required BeerListPerson? EndedBy { get; init; }
}
