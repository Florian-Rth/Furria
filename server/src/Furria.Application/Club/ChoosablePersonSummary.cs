namespace Furria.Application.Club;

public sealed record ChoosablePersonSummary
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required IReadOnlyList<int> GroupIds { get; init; }
}
