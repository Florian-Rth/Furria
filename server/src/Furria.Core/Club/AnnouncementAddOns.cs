using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class AnnouncementAddOns
{
    [Pure]
    public static DateTimeOffset? ClosesAt(DateOnly? validUntil) =>
        validUntil is { } lastDay && lastDay < DateOnly.MaxValue
            ? ClubClock.StartOfDay(lastDay.AddDays(1))
            : null;
}
