using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppInboxRetrySchedule
{
    private static readonly IReadOnlyList<TimeSpan> DelaysAfterFailedAttempt =
    [
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(2),
        TimeSpan.FromMinutes(10),
        TimeSpan.FromHours(1),
    ];

    [Pure]
    public static TimeSpan? DelayAfterFailed(int attempt) =>
        attempt >= 1 && attempt <= DelaysAfterFailedAttempt.Count
            ? DelaysAfterFailedAttempt[attempt - 1]
            : null;
}
