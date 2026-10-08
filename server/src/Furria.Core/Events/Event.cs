using Furria.Core.Club;

namespace Furria.Core.Events;

public sealed class Event : ITimestamped
{
    public int CalendarEntryId { get; set; }

    public TimeOnly? DoorsOpenAt { get; set; }

    public string Teaser { get; set; } = "";

    public string? AgeHint { get; set; }

    public int? PriceCents { get; set; }

    public DateTimeOffset? PresaleStartsAt { get; set; }

    public TicketAvailability TicketAvailability { get; set; }

    public DateTimeOffset? CancelledAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }
}
