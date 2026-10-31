using Furria.Core.Media;

namespace Furria.MediaWorker.Videos;

public sealed record VideoBox(int LongEdge, int ShortEdge)
{
    public static VideoBox Full { get; } =
        new(MediaRenditions.VideoLongEdge, MediaRenditions.VideoShortEdge);

    public static VideoBox Compact { get; } =
        new(MediaRenditions.CompactLongEdge, MediaRenditions.CompactShortEdge);
}
