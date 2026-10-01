using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.Mail;

public static class MailRetrySchedule
{
    private static readonly IReadOnlyList<TimeSpan> DelaysAfterFailedAttempt =
    [
        TimeSpan.FromSeconds(5),
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(2),
        TimeSpan.FromMinutes(10),
        TimeSpan.FromHours(1),
        TimeSpan.FromHours(6),
    ];

    [Pure]
    public static TimeSpan? DelayAfterFailed(int attempt) =>
        attempt >= 1 && attempt <= DelaysAfterFailedAttempt.Count
            ? DelaysAfterFailedAttempt[attempt - 1]
            : null;
}
