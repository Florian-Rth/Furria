using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class AnniversaryTests
{
    private static readonly DateOnly LeapDay = new(2000, 2, 29);

    [Fact]
    public void Should_FallOnTheTwentyEighth_When_TheOriginIsTheTwentyNinthOfFebruaryInACommonYear()
    {
        Assert.Equal(new DateOnly(2027, 2, 28), Anniversary.DayIn(LeapDay, 2027));
    }

    [Fact]
    public void Should_KeepTheTwentyNinth_When_TheYearIsALeapYear()
    {
        Assert.Equal(new DateOnly(2028, 2, 29), Anniversary.DayIn(LeapDay, 2028));
    }

    [Theory]
    [InlineData("1994-03-01", "2044-03-01", 50)]
    [InlineData("1994-03-01", "2044-02-28", 49)]
    [InlineData("1994-03-01", "2044-03-08", 50)]
    [InlineData("2000-02-29", "2027-02-28", 27)]
    [InlineData("2000-02-29", "2027-02-27", 26)]
    public void Should_CountTheCompletedYears_When_AskedOnADay(
        string origin,
        string day,
        int expected
    )
    {
        Assert.Equal(expected, Anniversary.YearsOn(DateOnly.Parse(origin), DateOnly.Parse(day)));
    }

    [Theory]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(11)]
    [InlineData(22)]
    [InlineData(33)]
    [InlineData(50)]
    [InlineData(55)]
    public void Should_CountAsRound_When_TheYearsAreAMultipleOfFiveOrEleven(int years)
    {
        Assert.True(Anniversary.IsRound(years));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(12)]
    [InlineData(27)]
    [InlineData(-5)]
    public void Should_NotCountAsRound_When_TheYearsAreNoPositiveMultipleOfFiveOrEleven(int years)
    {
        Assert.False(Anniversary.IsRound(years));
    }

    [Theory]
    [InlineData(null, 2026, null)]
    [InlineData(2026, 2026, null)]
    [InlineData(2025, 2026, null)]
    [InlineData(2022, 2026, null)]
    [InlineData(2021, 2026, 5)]
    [InlineData(2013, 2026, null)]
    [InlineData(1976, 2026, 50)]
    [InlineData(2030, 2026, null)]
    [InlineData(2031, 2026, null)]
    public void Should_ReturnJubileeYears_When_TheSessionYearIsAFifthYearFromTheFounding(
        int? foundedYear,
        int sessionYear,
        int? expected
    )
    {
        Assert.Equal(expected, Anniversary.GroupJubileeYears(foundedYear, sessionYear));
    }
}
