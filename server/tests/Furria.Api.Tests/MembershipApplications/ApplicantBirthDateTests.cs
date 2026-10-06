using Furria.Core.MembershipApplications;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class ApplicantBirthDateTests
{
    private static readonly DateOnly BornOn = new(2008, 10, 2);
    private static readonly DateOnly BornOnALeapDay = new(2008, 2, 29);

    [Fact]
    public void Should_CountTheYear_When_TheBirthdayIsToday()
    {
        Assert.Equal(18, ApplicantBirthDate.AgeOn(BornOn, new DateOnly(2026, 10, 2)));
    }

    [Fact]
    public void Should_NotYetCountTheYear_When_TheBirthdayIsTomorrow()
    {
        Assert.Equal(17, ApplicantBirthDate.AgeOn(BornOn, new DateOnly(2026, 10, 1)));
    }

    [Fact]
    public void Should_CountTheYearOnTheTwentyEighth_When_SheWasBornOnALeapDay()
    {
        Assert.Equal(18, ApplicantBirthDate.AgeOn(BornOnALeapDay, new DateOnly(2026, 2, 28)));
    }

    [Fact]
    public void Should_MarkHerMinor_When_SheTurns18Tomorrow()
    {
        Assert.True(ApplicantBirthDate.IsMinorOn(BornOn, new DateOnly(2026, 10, 1)));
    }

    [Fact]
    public void Should_NotMarkHerMinor_When_SheTurns18Today()
    {
        Assert.False(ApplicantBirthDate.IsMinorOn(BornOn, new DateOnly(2026, 10, 2)));
    }
}
