namespace Furria.Infrastructure.Mail;

public sealed record EmailConfirmationMailContent
{
    public required int PersonId { get; init; }

    public required string To { get; init; }

    public required string FirstName { get; init; }

    public required string? ClubName { get; init; }

    public required string Code { get; init; }

    public required TimeSpan Lifetime { get; init; }
}
