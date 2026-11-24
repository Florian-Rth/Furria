using Furria.Core.RunningOrders;
using Xunit;

namespace Furria.Api.Tests.RunningOrders;

public sealed class ActSessionTests
{
    private static readonly DateOnly InTheRunningSession = new(2026, 1, 10);

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

    [Theory]
    [InlineData(null, 2025, 11, 20, null)]
    [InlineData(2025, 2025, 11, 20, null)]
    [InlineData(2025, 2026, 6, 20, AppearanceSessionProblem.OtherSession)]
    [InlineData(2026, 2026, 6, 20, null)]
    [InlineData(2024, 2025, 1, 20, AppearanceSessionProblem.SessionEnded)]
    public void Should_JudgeTheActsSession_When_ItAppearsOnAnEvening(
        int? sessionYear,
        int year,
        int month,
        int day,
        AppearanceSessionProblem? expected
    )
    {
        Assert.Equal(
            expected,
            ActSession.AppearanceProblemOf(
                sessionYear,
                new DateOnly(year, month, day),
                InTheRunningSession
            )
        );
    }

    [Fact]
    public void Should_FreezeTheCastOnAshWednesday_When_TheSessionCloses()
    {
        Assert.Equal(new DateOnly(2026, 2, 18), ActSession.CastFreezeDayOf(2025));
    }
}
