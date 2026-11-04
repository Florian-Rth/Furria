using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.BeerList;

public static class BeerListNoticeSchedule
{
    public const int StockWarningHorizonDays = 7;

    private static readonly TimeOnly FirstSendingTime = new(10, 0);
    private static readonly TimeOnly SendingEndTime = new(20, 0);

    public static readonly TimeSpan TabReminderInterval = TimeSpan.FromDays(7);

    [Pure]
    public static bool IsSendingTime(DateTimeOffset instant)
    {
        var clubTime = ClubClock.TimeOf(instant);

        return clubTime >= FirstSendingTime && clubTime < SendingEndTime;
    }

    [Pure]
    public static bool IsTabReminderDue(
        DateTimeOffset oldestOpenCrateBookedAt,
        DateTimeOffset? lastRemindedAt,
        DateTimeOffset now
    ) =>
        now - oldestOpenCrateBookedAt >= TabReminderInterval
        && (lastRemindedAt is not { } remindedAt || now - remindedAt >= TabReminderInterval);

    [Pure]
    public static bool IsStockWarningDue(DateOnly? projectedEmptyOn, DateOnly today) =>
        projectedEmptyOn is { } emptyOn && emptyOn <= today.AddDays(StockWarningHorizonDays);
}
