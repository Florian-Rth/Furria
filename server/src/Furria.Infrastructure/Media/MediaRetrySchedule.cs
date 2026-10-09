using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.Media;

public static class MediaRetrySchedule
{
    private static readonly IReadOnlyList<TimeSpan> DelaysAfterFailedAttempt =
    [
        TimeSpan.FromMinutes(1),
        TimeSpan.FromMinutes(10),
    ];

    [Pure]
    public static TimeSpan? DelayAfterFailed(int attempt) =>
        attempt >= 1 && attempt <= DelaysAfterFailedAttempt.Count
            ? DelaysAfterFailedAttempt[attempt - 1]
            : null;
}
