using Furria.Core.Club;
using Furria.Core.Media;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActFinalTrack : ITimestamped
{
    public int Id { get; set; }

    public int ActId { get; set; }

    public int MediaItemId { get; set; }

    public int Version { get; set; }

    public DateTimeOffset? AdoptedAt { get; set; }

    public double? FirstBeatSeconds { get; set; }

    public double? TempoBpm { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Act? Act { get; set; }

    public MediaItem? MediaItem { get; set; }

    public ICollection<ActFinalTrackAlignment> Alignments { get; set; } = [];
}
