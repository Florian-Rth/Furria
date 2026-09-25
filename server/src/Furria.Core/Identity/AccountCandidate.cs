namespace Furria.Core.Identity;

public sealed record AccountCandidate
{
    public required bool IsAffiliated { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required string? Email { get; init; }
}
