using System.Diagnostics.Contracts;

namespace Furria.Core.Identity;

public static class AccountEligibility
{
    [Pure]
    public static AccountIneligibilityReason? ReasonAgainst(
        AccountCandidate candidate,
        DateOnly today,
        int ageOfConsent
    ) =>
        candidate switch
        {
            { IsAffiliated: false } => AccountIneligibilityReason.NotAffiliated,
            { BirthDate: null } => AccountIneligibilityReason.NoBirthDate,
            { BirthDate: { } birthDate } when !HasReached(birthDate, ageOfConsent, today) =>
                AccountIneligibilityReason.UnderAge,
            _ => null,
        };

    [Pure]
    public static AccountIneligibilityReason? ReasonAgainstWithVouchedAge(
        AccountCandidate candidate
    ) => candidate.IsAffiliated ? null : AccountIneligibilityReason.NotAffiliated;

    [Pure]
    public static bool CanBeMailed(AccountCandidate candidate) =>
        candidate.Email is not (null or "");

    [Pure]
    public static AccountAccessState StateOf(
        bool? accountIsDisabled,
        bool hasUnexpiredLiveInvitation
    ) =>
        accountIsDisabled switch
        {
            true => AccountAccessState.Disabled,
            false => AccountAccessState.Active,
            null when hasUnexpiredLiveInvitation => AccountAccessState.Invited,
            null => AccountAccessState.NoAccess,
        };

    [Pure]
    private static bool HasReached(DateOnly birthDate, int age, DateOnly today) =>
        birthDate.AddYears(age) <= today;
}
