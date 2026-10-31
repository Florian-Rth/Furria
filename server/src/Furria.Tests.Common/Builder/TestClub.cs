namespace Furria.Tests.Common.Builder;

public sealed class TestClub
{
    public AliasRegistry<int> Sessions { get; }

    public AliasRegistry<int> Venues { get; }

    public AliasRegistry<int> Announcements { get; }

    public AliasRegistry<int> KeyHoldings { get; }

    public AliasRegistry<int> BoardOffices { get; }

    public AliasRegistry<int> BoardSeats { get; }

    public AliasRegistry<int> UsualTrainingTimes { get; }

    public AliasRegistry<int> CalendarEntries { get; }

    public AliasRegistry<int> AttendanceResponses { get; }

    public AliasRegistry<int> Events { get; }

    internal TestClub(SeededClub seeded)
    {
        Sessions = new AliasRegistry<int>("Session", seeded.SessionIds);
        Venues = new AliasRegistry<int>("Venue", seeded.VenueIds);
        Announcements = new AliasRegistry<int>("Announcement", seeded.AnnouncementIds);
        KeyHoldings = new AliasRegistry<int>("KeyHolding", seeded.KeyHoldingIds);
        BoardOffices = new AliasRegistry<int>("BoardOffice", seeded.BoardOfficeIds);
        BoardSeats = new AliasRegistry<int>("BoardSeat", seeded.BoardSeatIds);
        UsualTrainingTimes = new AliasRegistry<int>(
            "UsualTrainingTime",
            seeded.UsualTrainingTimeIds
        );
        CalendarEntries = new AliasRegistry<int>("CalendarEntry", seeded.CalendarEntryIds);
        AttendanceResponses = new AliasRegistry<int>(
            "AttendanceResponse",
            seeded.AttendanceResponseIds
        );
        Events = new AliasRegistry<int>("Event", seeded.EventIds);
    }
}
