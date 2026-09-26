namespace Furria.Infrastructure.Mail;

public sealed record PasswordResetMailContent
{
    public required int PersonId { get; init; }

    public required string To { get; init; }

    public required string FirstName { get; init; }

    public required string? ClubName { get; init; }

    public required string Link { get; init; }
}
