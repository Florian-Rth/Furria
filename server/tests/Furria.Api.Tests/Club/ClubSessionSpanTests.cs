using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class ClubSessionSpanTests
{
    [Fact]
    public void Should_LandOnTheFifthOfMarch_When_AschermittwochOf2025IsAsked()
    {
        Assert.Equal(new DateOnly(2025, 3, 5), ClubSession.AshWednesdayOf(2025));
    }

    [Fact]
    public void Should_CloseTheDayAfterAschermittwoch_When_ASessionYearIsGiven()
    {
        Assert.Equal(new DateOnly(2027, 2, 11), ClubSession.ClosingOf(2026));
    }

    [Fact]
    public void Should_BeBetweenSessions_When_TheDayIsTheOneAfterAschermittwoch()
    {
        Assert.True(ClubSession.IsBetweenSessions(new DateOnly(2026, 2, 19)));
    }

    [Fact]
    public void Should_LookForwardToTheComingSession_When_TheDayIsInTheZwischenzeit()
    {
        Assert.Equal(2026, ClubSession.RelevantYearOf(new DateOnly(2026, 7, 1)));
    }

    [Fact]
    public void Should_LookForwardToTheComingSession_When_TheDayIsTheTenthOfNovember()
    {
        Assert.Equal(2026, ClubSession.RelevantYearOf(new DateOnly(2026, 11, 10)));
    }
}
