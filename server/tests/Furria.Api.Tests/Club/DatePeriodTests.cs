using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class DatePeriodTests
{
    private static readonly DateOnly Today = new(2026, 2, 17);

    [Fact]
    public void Should_Run_When_TheStartAndTheEndAreBothToday()
    {
        Assert.True(Period(Today, Today).IsRunningOn(Today));
    }

    [Fact]
    public void Should_Run_When_ThePeriodEndsToday()
    {
        Assert.True(Period(new DateOnly(2017, 9, 1), Today).IsRunningOn(Today));
    }

    [Fact]
    public void Should_Run_When_ThePeriodStartsToday()
    {
        Assert.True(Period(Today, null).IsRunningOn(Today));
    }

    [Fact]
    public void Should_NotRun_When_ThePeriodEndedYesterday()
    {
        Assert.False(Period(new DateOnly(2017, 9, 1), Today.AddDays(-1)).IsRunningOn(Today));
    }

    [Fact]
    public void Should_NotRun_When_ThePeriodStartsTomorrow()
    {
        Assert.False(Period(Today.AddDays(1), null).IsRunningOn(Today));
    }

    [Fact]
    public void Should_BeOpenWithoutRunning_When_ThePeriodStartsTomorrow()
    {
        var period = Period(Today.AddDays(1), null);

        Assert.True(period.IsOpen);
        Assert.False(period.IsRunningOn(Today));
    }

    [Fact]
    public void Should_Overlap_When_OneEndsOnTheDayTheOtherStarts()
    {
        var earlier = Period(new DateOnly(2017, 9, 1), new DateOnly(2020, 11, 11));
        var later = Period(new DateOnly(2020, 11, 11), null);

        Assert.True(earlier.Overlaps(later));
        Assert.True(later.Overlaps(earlier));
    }

    [Fact]
    public void Should_NotOverlap_When_OneEndsTheDayBeforeTheOtherStarts()
    {
        var earlier = Period(new DateOnly(2017, 9, 1), new DateOnly(2020, 11, 10));
        var later = Period(new DateOnly(2020, 11, 11), null);

        Assert.False(earlier.Overlaps(later));
        Assert.False(later.Overlaps(earlier));
    }

    [Fact]
    public void Should_Overlap_When_AnOpenPeriodPrecedesAClosedOne()
    {
        var open = Period(new DateOnly(2017, 9, 1), null);
        var closed = Period(new DateOnly(2024, 1, 1), new DateOnly(2024, 12, 31));

        Assert.True(open.Overlaps(closed));
    }

    [Fact]
    public void Should_BeWellFormed_When_TheEndIsTheStart()
    {
        Assert.True(Period(Today, Today).IsWellFormed);
    }

    [Fact]
    public void Should_BeMalformed_When_TheEndPrecedesTheStart()
    {
        Assert.False(Period(Today, Today.AddDays(-1)).IsWellFormed);
    }

    private static DatePeriod Period(DateOnly start, DateOnly? end) =>
        new() { Start = start, End = end };
}
