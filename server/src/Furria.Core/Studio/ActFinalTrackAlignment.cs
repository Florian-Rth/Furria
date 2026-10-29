using Furria.Core.Media;

namespace Furria.Core.Studio;

public sealed class ActFinalTrackAlignment
{
    public int FinalTrackId { get; set; }

    public int SourceMediaItemId { get; set; }

    public double OffsetSeconds { get; set; }

    public ActFinalTrack? FinalTrack { get; set; }

    public MediaItem? SourceMediaItem { get; set; }
}
