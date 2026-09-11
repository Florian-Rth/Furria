using Furria.Core.Club;

namespace Furria.Application.Registry;

public sealed record MemberDetails
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required IReadOnlyList<MemberGroup> Groups { get; init; }

    public required IReadOnlyList<MemberRole> Roles { get; init; }

    public required MemberContact Contact { get; init; }
}
