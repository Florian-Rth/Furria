using Furria.Core.Groups;

namespace Furria.Core.Club;

public sealed class CalendarEntry : ITimestamped
{
    public int Id { get; set; }

    public int? VenueId { get; set; }

    public int? OwnerGroupId { get; set; }

    public string Title { get; set; } = "";

    public string? Description { get; set; }

    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset? EndsAt { get; set; }

    public CalendarEntryKind Kind { get; set; }

    public CalendarEntryVisibility Visibility { get; set; }

    public bool AsksForResponse { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Venue? Venue { get; set; }

    public Group? OwnerGroup { get; set; }
}
