namespace Furria.Infrastructure.Media;

public sealed class MediaFileTombstone
{
    public Guid StorageKey { get; set; }

    public DateTimeOffset BuriedAt { get; set; }
}
