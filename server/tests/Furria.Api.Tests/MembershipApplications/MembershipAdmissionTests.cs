using Furria.Core.MembershipApplications;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class MembershipAdmissionTests
{
    private static readonly DateOnly AppliedOn = new(2026, 9, 29);
    private static readonly DateOnly AdultBirthDate = new(1996, 4, 3);
    private static readonly DateOnly TurnsEighteenOnOctober2 = new(2008, 10, 2);

    [Fact]
    public void Should_AdmitHer_When_SheIsAdmittedOnTheDaySheApplied()
    {
        Assert.Null(
            MembershipAdmission.RefusalOf(
                AppliedOn,
                AppliedOn,
                AdultBirthDate,
                guardianConsentConfirmed: false
            )
        );
    }

    [Fact]
    public void Should_Refuse_When_TheAdmissionIsDatedTheDayBeforeSheApplied()
    {
        Assert.Equal(
            AdmissionRefusal.BeforeApplication,
            MembershipAdmission.RefusalOf(
                AppliedOn.AddDays(-1),
                AppliedOn,
                AdultBirthDate,
                guardianConsentConfirmed: false
            )
        );
    }

    [Fact]
    public void Should_AskForTheGuardianConsent_When_SheTurns18TheDayAfterTheAdmission()
    {
        Assert.Equal(
            AdmissionRefusal.GuardianConsentMissing,
            MembershipAdmission.RefusalOf(
                new DateOnly(2026, 10, 1),
                AppliedOn,
                TurnsEighteenOnOctober2,
                guardianConsentConfirmed: false
            )
        );
    }

    [Fact]
    public void Should_NotAskForTheGuardianConsent_When_SheTurns18OnTheAdmissionDay()
    {
        Assert.Null(
            MembershipAdmission.RefusalOf(
                new DateOnly(2026, 10, 2),
                AppliedOn,
                TurnsEighteenOnOctober2,
                guardianConsentConfirmed: false
            )
        );
    }

    [Fact]
    public void Should_AdmitAMinor_When_HerGuardianConsentIsConfirmed()
    {
        Assert.Null(
            MembershipAdmission.RefusalOf(
                new DateOnly(2026, 10, 1),
                AppliedOn,
                TurnsEighteenOnOctober2,
                guardianConsentConfirmed: true
            )
        );
    }
}
