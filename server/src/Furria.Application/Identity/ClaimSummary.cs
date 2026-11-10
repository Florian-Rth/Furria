namespace Furria.Application.Identity;

public sealed record ClaimSummary
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateTimeOffset ClaimedAt { get; init; }

    public required bool HasAccount { get; init; }
}
