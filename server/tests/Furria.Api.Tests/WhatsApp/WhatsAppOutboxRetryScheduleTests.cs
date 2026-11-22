using System.Net;
using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppOutboxRetryScheduleTests
{
    public static readonly TheoryData<int, TimeSpan> Retries = new()
    {
        { 1, TimeSpan.FromSeconds(30) },
        { 2, TimeSpan.FromMinutes(2) },
        { 3, TimeSpan.FromMinutes(10) },
        { 4, TimeSpan.FromHours(1) },
        { 5, TimeSpan.FromHours(6) },
    };

    public static readonly TheoryData<int, TimeSpan> BackOffs = new()
    {
        { 1, TimeSpan.FromMinutes(1) },
        { 2, TimeSpan.FromMinutes(2) },
        { 4, TimeSpan.FromMinutes(8) },
        { 7, TimeSpan.FromHours(1) },
        { 40, TimeSpan.FromHours(1) },
    };

    [Theory]
    [MemberData(nameof(Retries))]
    public void Should_RetryAfterTheScheduledDelay_When_AnAttemptFails(int attempt, TimeSpan delay)
    {
        Assert.Equal(delay, WhatsAppOutboxRetrySchedule.DelayAfterFailed(attempt));
    }

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

    [Theory]
    [InlineData(HttpStatusCode.TooManyRequests, "", true)]
    [InlineData(HttpStatusCode.InternalServerError, "{\"error\":\"rate-overlimit\"}", true)]
    [InlineData(
        HttpStatusCode.InternalServerError,
        "{\"error\":\"server returned error 463\"}",
        true
    )]
    [InlineData(HttpStatusCode.InternalServerError, "{\"error\":\"code 475\"}", true)]
    [InlineData(HttpStatusCode.InternalServerError, "{\"error\":\"491704637\"}", false)]
    [InlineData(HttpStatusCode.UnprocessableEntity, "{\"error\":\"session not working\"}", false)]
    [InlineData(HttpStatusCode.BadRequest, "{\"error\":\"group 463 not found\"}", false)]
    public void Should_TellARateSignal_When_WahaRefusesASend(
        HttpStatusCode status,
        string answer,
        bool isRateSignal
    )
    {
        Assert.Equal(isRateSignal, WahaCallFailedException.IsRateSignalOf(status, answer));
    }
}
