using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppOutboxRetrySchedule
{
    private static readonly IReadOnlyList<TimeSpan> DelaysAfterFailedAttempt =
    [
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(2),
        TimeSpan.FromMinutes(10),
        TimeSpan.FromHours(1),
        TimeSpan.FromHours(6),
    ];

    private static readonly TimeSpan FirstRateBackOff = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan LongestRateBackOff = TimeSpan.FromHours(1);

    [Pure]
    public static TimeSpan? DelayAfterFailed(int attempt) =>
        attempt >= 1 && attempt <= DelaysAfterFailedAttempt.Count
            ? DelaysAfterFailedAttempt[attempt - 1]
            : null;

    [Pure]
    public static TimeSpan RateBackOffAfter(int rateSignalsInARow) =>
        rateSignalsInARow < 1
            ? TimeSpan.Zero
            : TimeSpan.FromTicks(
                Math.Min(
                    LongestRateBackOff.Ticks,
                    FirstRateBackOff.Ticks * (1L << Math.Min(rateSignalsInARow - 1, 16))
                )
            );
}
