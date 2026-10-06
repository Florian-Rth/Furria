using System.Diagnostics.Contracts;

namespace Furria.Core.MembershipApplications;

public static class MembershipAdmission
{
    [Pure]
    public static AdmissionRefusal? RefusalOf(
        DateOnly admittedOn,
        DateOnly appliedOn,
        DateOnly birthDate,
        bool guardianConsentConfirmed
    ) =>
        admittedOn switch
        {
            _ when admittedOn < appliedOn => AdmissionRefusal.BeforeApplication,
            _ when NeedsGuardianConsent(birthDate, admittedOn) && !guardianConsentConfirmed =>
                AdmissionRefusal.GuardianConsentMissing,
            _ => null,
        };

    [Pure]
    public static bool NeedsGuardianConsent(DateOnly birthDate, DateOnly admittedOn) =>
        ApplicantBirthDate.IsMinorOn(birthDate, admittedOn);
}
