using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntryAddOnInput
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required PollInput? Poll { get; init; }

    public required SignUpListInput? SignUpList { get; init; }

    public required CalendarDayScheduleInput? DaySchedule { get; init; }
}
