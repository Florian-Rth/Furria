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
        Venues = new AliasRegistry<int>("Ort", seeded.VenueIds);
        Announcements = new AliasRegistry<int>("Aushang", seeded.AnnouncementIds);
        KeyHoldings = new AliasRegistry<int>("Schluessel", seeded.KeyHoldingIds);
        BoardOffices = new AliasRegistry<int>("Vorstandsfunktion", seeded.BoardOfficeIds);
        BoardSeats = new AliasRegistry<int>("Vorstandssitz", seeded.BoardSeatIds);
        TrainingSlots = new AliasRegistry<int>("Trainingsslot", seeded.TrainingSlotIds);
        CalendarEntries = new AliasRegistry<int>("Kalendereintrag", seeded.CalendarEntryIds);
        AttendanceResponses = new AliasRegistry<int>("Zusage", seeded.AttendanceResponseIds);
    }
}
