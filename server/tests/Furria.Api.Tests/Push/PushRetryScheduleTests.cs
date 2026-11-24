using Furria.Infrastructure.Push;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class PushRetryScheduleTests
{
    [Fact]
    public void Should_AbandonThePush_When_TheFourthAttemptFails()
    {
        Assert.Null(PushRetrySchedule.DelayAfterFailed(4));
    }
}
