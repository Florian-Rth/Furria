namespace Furria.Application.Identity;

public sealed record IssuedInPersonInvitationDetails
{
    public required string Link { get; init; }

    public required string Code { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
