using Furria.Core.Club;
using Furria.Core.MembershipApplications;

namespace Furria.Application.MembershipApplications;

public sealed record AdmissionCandidate
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required string? Email { get; init; }

    public required string? City { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required bool IsMember { get; init; }

    public required IReadOnlyList<string> Groups { get; init; }

    public required IReadOnlyList<string> Roles { get; init; }

    public required bool HasAccount { get; init; }

    public required bool IsAffiliated { get; init; }

    public required IReadOnlyList<RegistryGap> Gaps { get; init; }
}
