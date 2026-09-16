using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class ClubSessionTests
{
    [Fact]
    public void Should_StayInTheRunningSession_When_TheDayIsTheTenthOfNovember()
    {
        Assert.Equal(2024, ClubSession.YearOf(new DateOnly(2025, 11, 10)));
    }

    [Fact]
    public void Should_OpenTheNextSession_When_TheDayIsTheEleventhOfNovember()
    {
        Assert.Equal(2025, ClubSession.YearOf(new DateOnly(2025, 11, 11)));
    }

    [Fact]
    public void Should_StayInTheNewSession_When_TheDayIsTheTwelfthOfNovember()
    {
        Assert.Equal(2025, ClubSession.YearOf(new DateOnly(2025, 11, 12)));
    }

    [Fact]
    public void Should_BelongToTheSessionThatLastOpened_When_TheDayIsAfterAschermittwoch()
    {
        Assert.Equal(2025, ClubSession.YearOf(new DateOnly(2026, 6, 30)));
    }

    [Fact]
    public void Should_BelongToThePreviousSession_When_TheDayIsTheLeapDay()
    {
        Assert.Equal(2023, ClubSession.YearOf(new DateOnly(2024, 2, 29)));
    }

    [Fact]
    public void Should_StartAtOne_When_NumberingTheFoundingSession()
    {
        Assert.Equal(1, ClubSession.NumberOf(ClubSession.FoundingYear));
    }

    [Fact]
    public void Should_CountFromTheFoundingYear_When_NumberingALaterSession()
    {
        Assert.Equal(56, ClubSession.NumberOf(2026));
    }

    [Fact]
    public void Should_RenderBothYears_When_LabellingASession()
    {
        Assert.Equal("2025/26", ClubSession.LabelOf(2025));
    }

    [Fact]
    public void Should_PadTheSecondYear_When_TheSessionCrossesACentury()
    {
        Assert.Equal("1999/00", ClubSession.LabelOf(1999));
    }
}
