namespace Furria.Infrastructure.Identity;

public sealed record EmailConfirmationIssue
{
    public required EmailConfirmationSubject Subject { get; init; }

    public required string Email { get; init; }

    public required string NormalizedEmail { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string? ClubName { get; init; }

    public bool UpdatesContactEmail { get; init; }
}
