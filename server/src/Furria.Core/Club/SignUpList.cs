using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class SignUpList : ITimestamped
{
    public int Id { get; set; }

    public int? CalendarEntryId { get; set; }

    public int? AnnouncementId { get; set; }

    public int Position { get; set; }

    public string Title { get; set; } = "";

    public string? Hint { get; set; }

    public DateTimeOffset? SignUpUntil { get; set; }

    public DateTimeOffset? ClosedAt { get; set; }

    public int? ClosedByPersonId { get; set; }

    public DateTimeOffset? LastRemindedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Announcement? Announcement { get; set; }

    public Person? ClosedBy { get; set; }

    public ICollection<SignUpLine> Lines { get; set; } = [];
}
