namespace Furria.Application.Club;

public sealed record VenueOccupancy
{
    public required IReadOnlyList<CalendarEntrySummary> SeenEntries { get; init; }

    public required int UnseenEntryCount { get; init; }
}
