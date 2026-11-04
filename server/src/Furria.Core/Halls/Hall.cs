using Furria.Core.Club;

namespace Furria.Core.Halls;

public sealed class Hall : ITimestamped
{
    public int Id { get; set; }

    public int VenueId { get; set; }

    public string Name { get; set; } = "";

    public HallDocument Document { get; set; } = HallDocument.Empty;

    public int Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Venue? Venue { get; set; }
}
