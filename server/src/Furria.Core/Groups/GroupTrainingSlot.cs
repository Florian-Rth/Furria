using Furria.Core.Club;

namespace Furria.Core.Groups;

public sealed class GroupTrainingSlot : ITimestamped
{
    public int Id { get; set; }

    public int GroupId { get; set; }

    public int? VenueId { get; set; }

    public DayOfWeek Weekday { get; set; }

    public TimeOnly StartsAt { get; set; }

    public int DurationMinutes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Group? Group { get; set; }

    public Venue? Venue { get; set; }
}
