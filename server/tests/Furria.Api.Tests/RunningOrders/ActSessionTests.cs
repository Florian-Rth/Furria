using Furria.Core.RunningOrders;
using Xunit;

namespace Furria.Api.Tests.RunningOrders;

public sealed class ActSessionTests
{
    private static readonly DateOnly InTheRunningSession = new(2026, 1, 10);
    private static readonly DateOnly BetweenSessions = new(2026, 6, 30);

    [Theory]
    [InlineData(null)]
    [InlineData(ActKind.Point)]
    public void Should_StayTimeless_When_TheKindTrainsNothing(ActKind? kind)
    {
        Assert.Null(ActSession.YearFor(kind, null, InTheRunningSession));
    }

    [Fact]
    public void Should_TakeTheRunningSession_When_ANewDanceNamesNoSession()
    {
        Assert.Equal(2025, ActSession.YearFor(ActKind.Dance, null, InTheRunningSession));
    }

    [Fact]
    public void Should_TakeTheComingSession_When_ANewDanceIsCreatedAfterAshWednesday()
    {
        Assert.Equal(2026, ActSession.YearFor(ActKind.Dance, null, BetweenSessions));
    }

    [Fact]
    public void Should_KeepTheNamedSession_When_ADanceNamesTheNextSession()
    {
        Assert.Equal(2026, ActSession.YearFor(ActKind.Show, 2026, InTheRunningSession));
    }

    [Theory]
    [InlineData(ActKind.Dance, 2025, null)]
    [InlineData(ActKind.Dance, null, null)]
    [InlineData(ActKind.Dance, 2024, ActSessionProblem.PastSession)]
    [InlineData(ActKind.Point, 2025, ActSessionProblem.SessionOnTimelessAct)]
    [InlineData(null, 2025, ActSessionProblem.SessionOnTimelessAct)]
    public void Should_JudgeTheNamedSession_When_TheSessionIsChosen(
        ActKind? kind,
        int? requested,
        ActSessionProblem? expected
    )
    {
        Assert.Equal(expected, ActSession.ProblemOf(kind, requested, InTheRunningSession));
    }

    [Fact]
    public void Should_RefuseTheEndedSession_When_ItIsChosenAfterAshWednesday()
    {
        Assert.Equal(
            ActSessionProblem.PastSession,
            ActSession.ProblemOf(ActKind.Dance, 2025, BetweenSessions)
        );
    }

    [Theory]
    [InlineData(null, false)]
    [InlineData(2025, false)]
    [InlineData(2024, true)]
    public void Should_CloseTheSession_When_ItsAshWednesdayHasPassed(int? sessionYear, bool closed)
    {
        Assert.Equal(closed, ActSession.IsClosed(sessionYear, InTheRunningSession));
    }

    [Theory]
    [InlineData(2026, 2, 18, false)]
    [InlineData(2026, 2, 19, true)]
    public void Should_CloseTheRunningSession_When_TheDayAfterAshWednesdayBegins(
        int year,
        int month,
        int day,
        bool closed
    )
    {
        Assert.Equal(closed, ActSession.IsClosed(2025, new DateOnly(year, month, day)));
    }

    [Fact]
    public void Should_FreezeTheCastOnAshWednesday_When_TheSessionCloses()
    {
        Assert.Equal(new DateOnly(2026, 2, 18), ActSession.CastFreezeDayOf(2025));
    }
}
