namespace Furria.Tests.Common.Builder;

public sealed record SeededClub(
    IReadOnlyDictionary<string, int> SessionIds,
    IReadOnlyDictionary<string, int> VenueIds,
    IReadOnlyDictionary<string, int> AnnouncementIds,
    IReadOnlyDictionary<string, int> KeyHoldingIds,
    IReadOnlyDictionary<string, int> BoardOfficeIds,
    IReadOnlyDictionary<string, int> BoardSeatIds,
    IReadOnlyDictionary<string, int> TrainingSlotIds,
    IReadOnlyDictionary<string, int> CalendarEntryIds,
    IReadOnlyDictionary<string, int> AttendanceResponseIds
);
