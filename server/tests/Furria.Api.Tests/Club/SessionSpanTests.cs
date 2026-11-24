using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SessionSpanTests
{
    [Fact]
    public void Should_Contain_When_TheSessionIsTheLastOne()
    {
        Assert.True(Span(2025, 2027).Contains(2027));
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

    private static SessionSpan Span(int firstYear, int? lastYear) =>
        new() { FirstYear = firstYear, LastYear = lastYear };
}
