using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class ClubSessionSpanTests
{
    [Fact]
    public void Should_OpenOnTheEleventhOfNovember_When_ASessionYearIsGiven()
    {
        Assert.Equal(new DateOnly(2026, 11, 11), ClubSession.OpeningOf(2026));
    }

    [Fact]
    public void Should_LandOnTheTenthOfFebruary_When_AschermittwochOf2027IsAsked()
    {
        Assert.Equal(new DateOnly(2027, 2, 10), ClubSession.AshWednesdayOf(2027));
    }

    [Fact]
    public void Should_LandOnTheEighteenthOfFebruary_When_AschermittwochOf2026IsAsked()
    {
        Assert.Equal(new DateOnly(2026, 2, 18), ClubSession.AshWednesdayOf(2026));
    }

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
    public void Should_StillRun_When_TheDayIsAschermittwochItself()
    {
        Assert.False(ClubSession.IsBetweenSessions(new DateOnly(2026, 2, 18)));
    }

    [Fact]
    public void Should_BeBetweenSessions_When_TheDayIsTheOneAfterAschermittwoch()
    {
        Assert.True(ClubSession.IsBetweenSessions(new DateOnly(2026, 2, 19)));
    }

    [Fact]
    public void Should_BeBetweenSessions_When_TheDayIsInHighSummer()
    {
        Assert.True(ClubSession.IsBetweenSessions(new DateOnly(2026, 7, 1)));
    }

    [Fact]
    public void Should_NotBeBetweenSessions_When_TheDayIsTheOpening()
    {
        Assert.False(ClubSession.IsBetweenSessions(new DateOnly(2026, 11, 11)));
    }

    [Fact]
    public void Should_LookForwardToTheComingSession_When_TheDayIsInTheZwischenzeit()
    {
        Assert.Equal(2026, ClubSession.RelevantYearOf(new DateOnly(2026, 7, 1)));
    }

    [Fact]
    public void Should_NameTheRunningSession_When_TheDayIsInsideIt()
    {
        Assert.Equal(2025, ClubSession.RelevantYearOf(new DateOnly(2026, 1, 15)));
    }

    [Fact]
    public void Should_NameTheJustOpenedSession_When_TheDayIsTheEleventhOfNovember()
    {
        Assert.Equal(2026, ClubSession.RelevantYearOf(new DateOnly(2026, 11, 11)));
    }

    [Fact]
    public void Should_LookForwardToTheComingSession_When_TheDayIsTheTenthOfNovember()
    {
        Assert.Equal(2026, ClubSession.RelevantYearOf(new DateOnly(2026, 11, 10)));
    }
}
