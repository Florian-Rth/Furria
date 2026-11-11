using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.Push;

public static class PushRetrySchedule
{
    private static readonly IReadOnlyList<TimeSpan> DelaysAfterFailedAttempt =
    [
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(2),
        TimeSpan.FromMinutes(10),
    ];

    [Pure]
    public static TimeSpan? DelayAfterFailed(int attempt) =>
        attempt >= 1 && attempt <= DelaysAfterFailedAttempt.Count
            ? DelaysAfterFailedAttempt[attempt - 1]
            : null;
}
