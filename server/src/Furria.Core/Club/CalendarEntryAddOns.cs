using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CalendarEntryAddOns
{
    [Pure]
    public static IReadOnlyList<CalendarEntryAddOnKind> InCardOrder(
        int? attendancePosition,
        int? participatingGroupsPosition
    ) =>
        [
            .. new (CalendarEntryAddOnKind Kind, int? Position)[]
            {
                (CalendarEntryAddOnKind.Attendance, attendancePosition),
                (CalendarEntryAddOnKind.ParticipatingGroups, participatingGroupsPosition),
            }
                .Where(addOn => addOn.Position is not null)
                .OrderBy(addOn => addOn.Position)
                .Select(addOn => addOn.Kind),
        ];

    public static void Attach(CalendarEntry entry, IReadOnlyList<CalendarEntryAddOnKind> addOns)
    {
        entry.AttendancePosition = PositionOf(addOns, CalendarEntryAddOnKind.Attendance);
        entry.ParticipatingGroupsPosition = PositionOf(
            addOns,
            CalendarEntryAddOnKind.ParticipatingGroups
        );
        entry.AsksForResponse = entry.AttendancePosition is not null;
    }

    [Pure]
    private static int? PositionOf(
        IReadOnlyList<CalendarEntryAddOnKind> addOns,
        CalendarEntryAddOnKind kind
    )
    {
        var position = addOns.ToList().IndexOf(kind);
        return position < 0 ? null : position;
    }
}
