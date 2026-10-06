using System.Diagnostics.Contracts;

namespace Furria.Core.MembershipApplications;

public static class ApplicantBirthDate
{
    public const int OldestPlausibleAge = 120;
    public const int AgeOfMajority = 18;

    [Pure]
    public static ApplicantBirthDateRefusal? RefusalOf(
        DateOnly birthDate,
        DateOnly today,
        int ageOfConsent
    ) =>
        birthDate switch
        {
            _ when !IsPlausible(birthDate, today) => ApplicantBirthDateRefusal.Implausible,
            _ when birthDate.AddYears(ageOfConsent) > today =>
                ApplicantBirthDateRefusal.BelowAgeOfConsent,
            _ => null,
        };

    [Pure]
    public static int AgeOn(DateOnly birthDate, DateOnly day)
    {
        var years = day.Year - birthDate.Year;
        return birthDate.AddYears(years) > day ? years - 1 : years;
    }

    [Pure]
    public static bool IsMinorOn(DateOnly birthDate, DateOnly day) =>
        AgeOn(birthDate, day) < AgeOfMajority;

    [Pure]
    private static bool IsPlausible(DateOnly birthDate, DateOnly today) =>
        birthDate <= today && birthDate.AddYears(OldestPlausibleAge + 1) > today;
}
