using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CalendarReminderRules
{
    public static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    [Pure]
    public static DateTimeOffset? RemindableFrom(DateTimeOffset? lastRemindedAt) =>
        lastRemindedAt + Interval;

    [Pure]
    public static bool MayRemind(DateTimeOffset? lastRemindedAt, DateTimeOffset now) =>
        RemindableFrom(lastRemindedAt) is not { } remindableFrom || now >= remindableFrom;

    [Pure]
    public static bool Reminds(CalendarEntryAddOnKind kind) =>
        kind
            is CalendarEntryAddOnKind.Attendance
                or CalendarEntryAddOnKind.Poll
                or CalendarEntryAddOnKind.SignUpList;
}
