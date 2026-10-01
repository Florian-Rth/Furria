using Furria.Infrastructure.Mail;
using Xunit;

namespace Furria.Api.Tests.Mail;

public sealed class MailRetryScheduleTests
{
    public static readonly TheoryData<int, TimeSpan> Retries = new()
    {
        { 1, TimeSpan.FromSeconds(5) },
        { 2, TimeSpan.FromSeconds(30) },
        { 3, TimeSpan.FromMinutes(2) },
        { 4, TimeSpan.FromMinutes(10) },
        { 5, TimeSpan.FromHours(1) },
        { 6, TimeSpan.FromHours(6) },
    };

    [Theory]
    [MemberData(nameof(Retries))]
    public void Should_RetryAfterTheScheduledDelay_When_AnAttemptFails(int attempt, TimeSpan delay)
    {
        Assert.Equal(delay, MailRetrySchedule.DelayAfterFailed(attempt));
    }

    [Fact]
    public void Should_AbandonTheMail_When_TheSeventhAttemptFails()
    {
        Assert.Null(MailRetrySchedule.DelayAfterFailed(7));
    }
}
