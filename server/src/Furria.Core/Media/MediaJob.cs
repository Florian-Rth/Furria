namespace Furria.Core.Media;

public sealed class MediaJob
{
    public long Id { get; set; }

    public int MediaItemId { get; set; }

    public DateTimeOffset EnqueuedAt { get; set; }

    public DateTimeOffset AvailableAt { get; set; }

    public DateTimeOffset? ClaimedAt { get; set; }

    public Guid? LeaseId { get; set; }

    public DateTimeOffset? LeaseExpiresAt { get; set; }

    public int Attempts { get; set; }

    public MediaItem? MediaItem { get; set; }
}
