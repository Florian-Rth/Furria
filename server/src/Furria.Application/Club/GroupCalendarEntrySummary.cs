namespace Furria.Application.Club;

public sealed record GroupCalendarEntrySummary
{
    public required CalendarEntrySummary Entry { get; init; }

    public required bool ViewerMayAnswer { get; init; }
}
