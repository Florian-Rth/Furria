namespace Furria.Application.Club;

public sealed record CalendarEntryWriteResult
{
    public required int CalendarEntryId { get; init; }

    public required IReadOnlyList<CalendarEntrySummary> VenueCollisions { get; init; }
}
