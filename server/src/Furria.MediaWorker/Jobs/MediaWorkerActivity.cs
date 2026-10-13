using Furria.Core.Media;

namespace Furria.MediaWorker.Jobs;

public sealed class MediaWorkerActivity
{
    private const int Idle = 0;

    private int _photoMediaItemId;
    private int _videoMediaItemId;

    public int? PhotoMediaItemId => ItemOrNone(Volatile.Read(ref _photoMediaItemId));

    public int? VideoMediaItemId => ItemOrNone(Volatile.Read(ref _videoMediaItemId));

    public void Begin(MediaKind kind, int mediaItemId) =>
        Volatile.Write(ref LaneOf(kind), mediaItemId);

    public void End(MediaKind kind) => Volatile.Write(ref LaneOf(kind), Idle);

    private ref int LaneOf(MediaKind kind)
    {
        if (kind == MediaKind.Video)
            return ref _videoMediaItemId;
        return ref _photoMediaItemId;
    }

    private static int? ItemOrNone(int mediaItemId) => mediaItemId == Idle ? null : mediaItemId;
}
