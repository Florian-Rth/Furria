namespace Furria.Infrastructure.Mail;

public sealed record AccessRequestMailContent
{
    public required int PersonId { get; init; }

    public required string To { get; init; }

    public required string? ClubName { get; init; }

    public required IReadOnlyList<AccessRequestMailLink> Links { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
