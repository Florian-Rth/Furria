namespace Furria.Application.MembershipApplications;

public sealed record AdmissionDetails
{
    public required int PersonId { get; init; }

    public required int MembershipId { get; init; }

    public required AdmissionInvitation Invitation { get; init; }
}
