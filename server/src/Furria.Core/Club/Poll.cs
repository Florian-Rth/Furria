using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class Poll : ITimestamped
{
    public int Id { get; set; }

    public int? CalendarEntryId { get; set; }

    public int? AnnouncementId { get; set; }

    public int Position { get; set; }

    public string Question { get; set; } = "";

    public bool AllowsMultipleChoices { get; set; }

    public bool IsAnonymous { get; set; }

    public DateTimeOffset? VotesUntil { get; set; }

    public DateTimeOffset? ClosedAt { get; set; }

    public int? ClosedByPersonId { get; set; }

    public DateTimeOffset? LastRemindedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Announcement? Announcement { get; set; }

    public Person? ClosedBy { get; set; }

    public ICollection<PollOption> Options { get; set; } = [];
}
