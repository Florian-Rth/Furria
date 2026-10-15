using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SessionCountTests
{
    private const int RelevantSessionYear = 2026;

    private static readonly IReadOnlyCollection<SessionSpan> NoPauses = [];

    [Fact]
    public void Should_BeZero_When_SheHasNoMembership()
    {
        Assert.Equal(0, SessionCount.Of([], NoPauses, RelevantSessionYear));
    }

    [Fact]
    public void Should_SkipTheGap_When_SheRejoined()
    {
        var chain = new[]
        {
            Period(new DateOnly(2010, 3, 1), new DateOnly(2014, 6, 30)),
            Period(new DateOnly(2020, 12, 1), null),
        };

        Assert.Equal(11, SessionCount.Of(chain, NoPauses, RelevantSessionYear));
    }

    [Fact]
    public void Should_KeepTheSessionsServed_When_TheRelevantSessionIsPaused()
    {
        var chain = new[] { Period(new DateOnly(2018, 11, 11), null) };

        Assert.Equal(7, SessionCount.Of(chain, [Span(2025, null)], RelevantSessionYear));
    }

    [Fact]
    public void Should_KeepTheSessionsServed_When_HerMembershipEnded()
    {
        var chain = new[] { Period(new DateOnly(2018, 11, 11), new DateOnly(2022, 6, 30)) };

        Assert.Equal(4, SessionCount.Of(chain, NoPauses, RelevantSessionYear));
    }

    [Fact]
    public void Should_BeZero_When_SheJoinsAfterTheSession()
    {
        var chain = new[] { Period(new DateOnly(2028, 1, 1), null) };

        Assert.Equal(0, SessionCount.Of(chain, NoPauses, RelevantSessionYear));
    }

    private static DatePeriod Period(DateOnly start, DateOnly? end) =>
        new() { Start = start, End = end };

    private static SessionSpan Span(int firstYear, int? lastYear) =>
        new() { FirstYear = firstYear, LastYear = lastYear };
}
