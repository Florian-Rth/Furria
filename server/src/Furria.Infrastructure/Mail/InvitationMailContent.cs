namespace Furria.Infrastructure.Mail;

public sealed record InvitationMailContent
{
    public required int PersonId { get; init; }

    public required string To { get; init; }

    public required string FirstName { get; init; }

    public required string? ClubName { get; init; }

    public required string Link { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
