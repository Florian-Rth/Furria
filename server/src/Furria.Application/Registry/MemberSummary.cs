using Furria.Core.Club;

namespace Furria.Application.Registry;

public sealed record MemberSummary
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required IReadOnlyList<GroupReference> Groups { get; init; }

    public required IReadOnlyList<RoleReference> Roles { get; init; }
}
