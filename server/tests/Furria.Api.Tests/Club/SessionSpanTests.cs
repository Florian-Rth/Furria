using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SessionSpanTests
{
    [Fact]
    public void Should_Contain_When_TheSessionIsTheFirstOne()
    {
        Assert.True(Span(2025, 2027).Contains(2025));
    }

    [Fact]
    public void Should_Contain_When_TheSessionIsTheLastOne()
    {
        Assert.True(Span(2025, 2027).Contains(2027));
    }

    [Fact]
    public void Should_NotContain_When_TheSessionPrecedesTheSpan()
    {
        Assert.False(Span(2025, 2027).Contains(2024));
    }

    [Fact]
    public void Should_NotContain_When_TheSessionFollowsTheSpan()
    {
        Assert.False(Span(2025, 2027).Contains(2028));
    }

    [Fact]
    public void Should_ContainEveryLaterSession_When_TheSpanIsOpenEnded()
    {
        var span = Span(2025, null);

        Assert.True(span.Contains(2025));
        Assert.True(span.Contains(2099));
        Assert.False(span.Contains(2024));
    }

    [Fact]
    public void Should_Overlap_When_BothSpanTheSameSingleSession()
    {
        Assert.True(Span(2025, 2025).Overlaps(Span(2025, 2025)));
    }

    [Fact]
    public void Should_Overlap_When_AnOpenSpanReachesIntoALaterSpan()
    {
        Assert.True(Span(2020, null).Overlaps(Span(2025, 2026)));
        Assert.True(Span(2025, 2026).Overlaps(Span(2020, null)));
    }

    [Fact]
    public void Should_NotOverlap_When_OneEndsTheSessionBeforeTheOtherStarts()
    {
        Assert.False(Span(2020, 2024).Overlaps(Span(2025, null)));
        Assert.False(Span(2025, null).Overlaps(Span(2020, 2024)));
    }

    [Fact]
    public void Should_BeWellFormed_When_TheSpanIsASingleSession()
    {
        Assert.True(Span(2025, 2025).IsWellFormed);
    }

    [Fact]
    public void Should_BeWellFormed_When_TheSpanIsOpenEnded()
    {
        Assert.True(Span(2025, null).IsWellFormed);
    }

    [Fact]
    public void Should_BeMalformed_When_TheLastSessionPrecedesTheFirst()
    {
        Assert.False(Span(2025, 2024).IsWellFormed);
    }

    private static SessionSpan Span(int firstYear, int? lastYear) =>
        new() { FirstYear = firstYear, LastYear = lastYear };
}
