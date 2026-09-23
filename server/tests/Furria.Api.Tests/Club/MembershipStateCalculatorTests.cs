using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class MembershipStateCalculatorTests
{
    private const int RunningSessionYear = 2025;

    private static readonly DateOnly Today = new(2026, 2, 17);
    private static readonly IReadOnlyCollection<SessionSpan> NoPauses = [];

    [Fact]
    public void Should_BeNone_When_ThePersonNeverHeldAMembership()
    {
        Assert.Equal(MembershipState.None, Resolve([], NoPauses));
    }

    [Fact]
    public void Should_BeNone_When_TheOnlyPeriodStartsTomorrow()
    {
        Assert.Equal(MembershipState.None, Resolve([Period(Today.AddDays(1), null)], NoPauses));
    }

    [Fact]
    public void Should_BeEnded_When_EveryBegunPeriodIsOver()
    {
        var chain = new[]
        {
            Period(new DateOnly(2017, 9, 1), new DateOnly(2020, 3, 1)),
            Period(new DateOnly(2021, 1, 1), new DateOnly(2024, 12, 31)),
        };

        Assert.Equal(MembershipState.Ended, Resolve(chain, NoPauses));
    }

    [Fact]
    public void Should_BeActive_When_ThePeriodStartedTodayAndIsOpen()
    {
        Assert.Equal(MembershipState.Active, Resolve([Period(Today, null)], NoPauses));
    }

    [Fact]
    public void Should_BeActive_When_ThePeriodEndsToday()
    {
        Assert.Equal(
            MembershipState.Active,
            Resolve([Period(new DateOnly(2017, 9, 1), Today)], NoPauses)
        );
    }

    [Fact]
    public void Should_BeActive_When_AClosedPeriodIsFollowedByARunningOne()
    {
        var chain = new[]
        {
            Period(new DateOnly(2017, 9, 1), new DateOnly(2020, 3, 1)),
            Period(new DateOnly(2021, 1, 1), null),
        };

        Assert.Equal(MembershipState.Active, Resolve(chain, NoPauses));
    }

    [Fact]
    public void Should_BePaused_When_AMembershipPauseCoversTheRunningSession()
    {
        Assert.Equal(
            MembershipState.Paused,
            Resolve(
                [Period(new DateOnly(2017, 9, 1), null)],
                [Span(RunningSessionYear, RunningSessionYear)]
            )
        );
    }

    [Fact]
    public void Should_BePaused_When_TheMembershipPauseIsOpenEnded()
    {
        Assert.Equal(
            MembershipState.Paused,
            Resolve([Period(new DateOnly(2017, 9, 1), null)], [Span(RunningSessionYear - 1, null)])
        );
    }

    [Fact]
    public void Should_BeActive_When_TheMembershipPauseEndedWithTheLastSession()
    {
        Assert.Equal(
            MembershipState.Active,
            Resolve(
                [Period(new DateOnly(2017, 9, 1), null)],
                [Span(RunningSessionYear - 2, RunningSessionYear - 1)]
            )
        );
    }

    [Fact]
    public void Should_BeEnded_When_AMembershipPauseStillCoversTheSessionButNoPeriodRuns()
    {
        Assert.Equal(
            MembershipState.Ended,
            Resolve(
                [Period(new DateOnly(2017, 9, 1), new DateOnly(2024, 12, 31))],
                [Span(RunningSessionYear, null)]
            )
        );
    }

    [Fact]
    public void Should_HaveNoMemberSince_When_TheChainIsEmpty()
    {
        Assert.Null(MembershipStateCalculator.MemberSince([], Today));
    }

    [Fact]
    public void Should_HaveNoMemberSince_When_TheOnlyPeriodStartsTomorrow()
    {
        Assert.Null(MembershipStateCalculator.MemberSince([Period(Today.AddDays(1), null)], Today));
    }

    [Fact]
    public void Should_TakeTheEarliestStart_When_TheChainWasInterrupted()
    {
        var chain = new[]
        {
            Period(new DateOnly(2021, 1, 1), null),
            Period(new DateOnly(2017, 9, 1), new DateOnly(2020, 3, 1)),
        };

        Assert.Equal(new DateOnly(2017, 9, 1), MembershipStateCalculator.MemberSince(chain, Today));
    }

    [Fact]
    public void Should_IgnoreAFuturePeriod_When_ReadingMemberSince()
    {
        var chain = new[]
        {
            Period(Today.AddDays(1), null),
            Period(new DateOnly(2021, 1, 1), null),
        };

        Assert.Equal(new DateOnly(2021, 1, 1), MembershipStateCalculator.MemberSince(chain, Today));
    }

    [Fact]
    public void Should_StartOnTheDayItself_When_ThePeriodBeginsToday()
    {
        Assert.Equal(Today, MembershipStateCalculator.MemberSince([Period(Today, null)], Today));
    }

    private static MembershipState Resolve(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pausesOfRunningPeriod
    ) => MembershipStateCalculator.Resolve(periods, pausesOfRunningPeriod, Today);

    private static DatePeriod Period(DateOnly start, DateOnly? end) =>
        new() { Start = start, End = end };

    private static SessionSpan Span(int firstYear, int? lastYear) =>
        new() { FirstYear = firstYear, LastYear = lastYear };
}
