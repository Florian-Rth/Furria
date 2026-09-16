using Furria.Application.Identity;
using Furria.Core.Club;

namespace Furria.Application.Registry;

public sealed record ManagedPersonDetails
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required bool ContactVisibleToMembers { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required IReadOnlyList<MembershipDetails> Memberships { get; init; }

    public required IReadOnlyList<PersonFeeReduction> FeeReductions { get; init; }

    public required IReadOnlyList<PersonGroup> Groups { get; init; }

    public required IReadOnlyList<PersonRole> Roles { get; init; }
}
