namespace Furria.Application.Registry;

public sealed record AddAdmittedMembershipCommand
{
    public required int PersonId { get; init; }

    public required DateOnly AdmittedOn { get; init; }

    public required DateTimeOffset AdmittedAt { get; init; }

    public required int? AdmittedByPersonId { get; init; }

    public required bool GuardianConsentConfirmed { get; init; }
}
