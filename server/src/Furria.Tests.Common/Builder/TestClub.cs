namespace Furria.Tests.Common.Builder;

public sealed class TestClub
{
    public AliasRegistry<int> Sessions { get; }

    public AliasRegistry<int> Venues { get; }

    public AliasRegistry<int> Announcements { get; }

    public AliasRegistry<int> KeyHoldings { get; }

    public AliasRegistry<int> BoardOffices { get; }

    public AliasRegistry<int> BoardSeats { get; }

    public AliasRegistry<int> TrainingSlots { get; }

    public AliasRegistry<int> CalendarEntries { get; }

    public AliasRegistry<int> AttendanceResponses { get; }

    internal TestClub(SeededClub seeded)
    {
        Sessions = new AliasRegistry<int>("Session", seeded.SessionIds);
        Venues = new AliasRegistry<int>("Venue", seeded.VenueIds);
        Announcements = new AliasRegistry<int>("Announcement", seeded.AnnouncementIds);
        KeyHoldings = new AliasRegistry<int>("KeyHolding", seeded.KeyHoldingIds);
        BoardOffices = new AliasRegistry<int>("BoardOffice", seeded.BoardOfficeIds);
        BoardSeats = new AliasRegistry<int>("BoardSeat", seeded.BoardSeatIds);
        TrainingSlots = new AliasRegistry<int>("TrainingSlot", seeded.TrainingSlotIds);
        CalendarEntries = new AliasRegistry<int>("CalendarEntry", seeded.CalendarEntryIds);
        AttendanceResponses = new AliasRegistry<int>(
            "AttendanceResponse",
            seeded.AttendanceResponseIds
        );
    }
}
