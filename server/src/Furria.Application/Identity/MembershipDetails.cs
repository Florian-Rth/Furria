using Furria.Core.Identity;

namespace Furria.Application.Identity;

public sealed record MembershipDetails
{
    public required MembershipType Type { get; init; }

    public required MembershipStatus Status { get; init; }

    public required DateOnly StartedAt { get; init; }

    public required DateOnly? EndedAt { get; init; }
}
