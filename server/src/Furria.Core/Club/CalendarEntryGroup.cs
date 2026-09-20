using Furria.Core.Groups;

namespace Furria.Core.Club;

public sealed class CalendarEntryGroup : ITimestamped
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public int GroupId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Group? Group { get; set; }
}
