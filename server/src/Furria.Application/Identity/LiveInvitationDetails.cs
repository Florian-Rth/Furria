using Furria.Application.Groups;
using Furria.Core.Identity;

namespace Furria.Application.Identity;

public sealed record LiveInvitationDetails
{
    public required InvitationChannel Channel { get; init; }

    public required DateTimeOffset IssuedAt { get; init; }

    public required PersonReference? IssuedBy { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required bool IsExpired { get; init; }
}
