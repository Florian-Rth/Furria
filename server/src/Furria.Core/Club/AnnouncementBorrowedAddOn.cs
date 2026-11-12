namespace Furria.Core.Club;

public sealed class AnnouncementBorrowedAddOn
{
    public int Id { get; set; }

    public int AnnouncementId { get; set; }

    public AnnouncementAddOnKind Kind { get; set; }

    public int CalendarEntryId { get; set; }

    public int? PollId { get; set; }

    public int? SignUpListId { get; set; }

    public int Position { get; set; }

    public Announcement? Announcement { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Poll? Poll { get; set; }

    public SignUpList? SignUpList { get; set; }
}
