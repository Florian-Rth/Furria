using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntryAddOnDetails
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required PollDetails? Poll { get; init; }

    public required SignUpListDetails? SignUpList { get; init; }

    public required CalendarDayScheduleDetails? DaySchedule { get; init; }
}
