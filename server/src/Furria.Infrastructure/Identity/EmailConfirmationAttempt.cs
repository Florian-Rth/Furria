namespace Furria.Infrastructure.Identity;

public sealed record EmailConfirmationAttempt
{
    public required EmailConfirmationSubject Subject { get; init; }

    public required string NormalizedEmail { get; init; }

    public required string Code { get; init; }
}
