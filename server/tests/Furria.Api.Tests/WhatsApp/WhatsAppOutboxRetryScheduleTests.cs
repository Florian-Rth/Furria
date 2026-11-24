using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppOutboxRetryScheduleTests
{
    public static readonly TheoryData<int, TimeSpan> BackOffs = new()
    {
        { 1, TimeSpan.FromMinutes(1) },
        { 2, TimeSpan.FromMinutes(2) },
        { 4, TimeSpan.FromMinutes(8) },
        { 7, TimeSpan.FromHours(1) },
        { 40, TimeSpan.FromHours(1) },
    };

    [Fact]
    public void Should_GiveTheOperationUp_When_TheSixthAttemptFails()
    {
        Assert.Null(WhatsAppOutboxRetrySchedule.DelayAfterFailed(6));
    }

    [Theory]
    [MemberData(nameof(BackOffs))]
    public void Should_DoubleTheBackOffUpToAnHour_When_RateSignalsRepeat(
        int rateSignalsInARow,
        TimeSpan backOff
    )
    {
        Assert.Equal(backOff, WhatsAppOutboxRetrySchedule.RateBackOffAfter(rateSignalsInARow));
    }
}
