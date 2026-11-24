using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SessionOrdinalTests
{
    private const int RelevantSessionYear = 2026;

    private static readonly IReadOnlyCollection<SessionSpan> NoPauses = [];

    [Fact]
    public void Should_CountTheSession_When_SheJoinedOnAshWednesday()
    {
        Assert.Equal(
            2,
            SessionOrdinal.Of(
                [Period(new DateOnly(2026, 2, 18), null)],
                NoPauses,
                RelevantSessionYear
            )
        );
    }

    [Fact]
    public void Should_SkipPausedSessions_When_APauseCoversThem()
    {
        var chain = new[] { Period(new DateOnly(2018, 11, 11), null) };

        Assert.Equal(
            6,
            SessionOrdinal.Of(chain, [Span(2020, 2021), Span(2024, 2024)], RelevantSessionYear)
        );
    }

    [Fact]
    public void Should_ReturnNull_When_TheRelevantSessionIsPaused()
    {
        var chain = new[] { Period(new DateOnly(2018, 11, 11), null) };

        Assert.Null(SessionOrdinal.Of(chain, [Span(2025, null)], RelevantSessionYear));
    }

    [Fact]
    public void Should_ReturnNull_When_HerMembershipEndsBeforeTheRelevantSession()
    {
        var chain = new[] { Period(new DateOnly(2018, 11, 11), new DateOnly(2026, 11, 10)) };

        Assert.Null(SessionOrdinal.Of(chain, NoPauses, RelevantSessionYear));
    }

    private static DatePeriod Period(DateOnly start, DateOnly? end) =>
        new() { Start = start, End = end };

    private static SessionSpan Span(int firstYear, int? lastYear) =>
        new() { FirstYear = firstYear, LastYear = lastYear };
}
