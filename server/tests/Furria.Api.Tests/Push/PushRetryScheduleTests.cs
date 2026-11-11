using Furria.Infrastructure.Push;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class PushRetryScheduleTests
{
    public static readonly TheoryData<int, TimeSpan> Retries = new()
    {
        { 1, TimeSpan.FromSeconds(30) },
        { 2, TimeSpan.FromMinutes(2) },
        { 3, TimeSpan.FromMinutes(10) },
    };

    [Theory]
    [MemberData(nameof(Retries))]
    public void Should_RetryAfterTheScheduledDelay_When_AnAttemptFails(int attempt, TimeSpan delay)
    {
        Assert.Equal(delay, PushRetrySchedule.DelayAfterFailed(attempt));
    }

    [Fact]
    public void Should_AbandonThePush_When_TheFourthAttemptFails()
    {
        Assert.Null(PushRetrySchedule.DelayAfterFailed(4));
    }
}
