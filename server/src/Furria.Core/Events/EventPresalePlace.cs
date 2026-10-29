using Furria.Core.Club;

namespace Furria.Core.Events;

public sealed class EventPresalePlace
{
    public int EventId { get; set; }

    public int VenueId { get; set; }

    public int SortOrder { get; set; }

    public Event? Event { get; set; }

    public Venue? Venue { get; set; }
}
