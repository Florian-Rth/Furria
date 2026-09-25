namespace Furria.Application.Identity;

public sealed record IssuedInvitationDetails
{
    public required DateTimeOffset ExpiresAt { get; init; }
}
