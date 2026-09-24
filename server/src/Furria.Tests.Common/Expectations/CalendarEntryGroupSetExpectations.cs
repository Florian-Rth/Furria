namespace Furria.Tests.Common.Expectations;

public sealed class CalendarEntryGroupSetExpectations
{
    internal Expected Expected { get; }

    internal int CalendarEntryId { get; }

    internal CalendarEntryGroupSetExpectations(Expected expected, int calendarEntryId)
    {
        Expected = expected;
        CalendarEntryId = calendarEntryId;
    }
}
