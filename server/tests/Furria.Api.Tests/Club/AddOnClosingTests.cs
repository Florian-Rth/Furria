using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class AddOnClosingTests
{
    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData(null, 2, 2)]
    [InlineData(1, 2, 1)]
    [InlineData(3, 2, 2)]
    [InlineData(1, null, 1)]
    [InlineData(null, null, null)]
    public void Should_CloseAtTheEarlierOfDeadlineAndHost_When_EitherIsSet(
        int? deadlineInHours,
        int? hostClosesInHours,
        int? expectedInHours
    )
    {
        Assert.Equal(
            InHours(expectedInHours),
            AddOnClosing.ClosesAt(InHours(deadlineInHours), InHours(hostClosesInHours))
        );
    }

    [Theory]
    [InlineData(null, -1, true)]
    [InlineData(-1, null, true)]
    [InlineData(1, 2, false)]
    [InlineData(null, null, false)]
    public void Should_BeClosed_When_TheEarlierClosingHasPassed(
        int? deadlineInHours,
        int? hostClosesInHours,
        bool expected
    )
    {
        Assert.Equal(
            expected,
            AddOnClosing.IsClosed(null, InHours(deadlineInHours), InHours(hostClosesInHours), Now)
        );
    }

    [Fact]
    public void Should_StampTheCloserAndNow_When_ClosedByHandBeforeAnyClosing()
    {
        Assert.Equal(new AddOnClose(Now, 7), AddOnClosing.CloseOf(null, null, Now, 7));
    }

    [Fact]
    public void Should_KeepTheEarlierClosingAndNoCloser_When_ClosedByHandAfterItPassed()
    {
        Assert.Equal(
            new AddOnClose(Now.AddHours(-2), null),
            AddOnClosing.CloseOf(Now.AddHours(-2), Now.AddHours(-1), Now, 7)
        );
    }

    private static DateTimeOffset? InHours(int? hours) =>
        hours is { } offset ? Now.AddHours(offset) : null;
}
