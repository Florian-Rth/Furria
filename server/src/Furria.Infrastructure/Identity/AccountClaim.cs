using Furria.Application.Identity;

namespace Furria.Infrastructure.Identity;

public sealed record AccountClaim
{
    public required int InvitationId { get; init; }

    public required int KeeperPersonId { get; init; }

    public required string NormalizedLoginEmail { get; init; }

    public required ReauthenticationProof? ClaimProof { get; init; }
}
