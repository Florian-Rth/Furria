using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class ClubSessionTests
{
    [Fact]
    public void Should_StayInTheRunningSession_When_TheDayIsTheTenthOfNovember()
    {
        Assert.Equal(2024, ClubSession.YearOf(new DateOnly(2025, 11, 10)));
    }

    [Fact]
    public void Should_OpenTheNextSession_When_TheDayIsTheEleventhOfNovember()
    {
        Assert.Equal(2025, ClubSession.YearOf(new DateOnly(2025, 11, 11)));
    }

    [Fact]
    public void Should_PadTheSecondYear_When_TheSessionCrossesACentury()
    {
        Assert.Equal("1999/00", ClubSession.LabelOf(1999));
    }
}
