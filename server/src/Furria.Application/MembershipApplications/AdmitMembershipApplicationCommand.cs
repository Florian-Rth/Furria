namespace Furria.Application.MembershipApplications;

public sealed record AdmitMembershipApplicationCommand
{
    public required int MembershipApplicationId { get; init; }

    public required int? PersonId { get; init; }

    public required DateOnly AdmittedOn { get; init; }

    public required bool GuardianConsentConfirmed { get; init; }

    public required int AdmitterPersonId { get; init; }
}
