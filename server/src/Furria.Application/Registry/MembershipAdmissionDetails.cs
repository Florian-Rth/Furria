using Furria.Application.Groups;

namespace Furria.Application.Registry;

public sealed record MembershipAdmissionDetails
{
    public required int MembershipId { get; init; }

    public required DateTimeOffset AdmittedAt { get; init; }

    public required PersonReference? AdmittedBy { get; init; }

    public required bool GuardianConsentConfirmed { get; init; }
}
