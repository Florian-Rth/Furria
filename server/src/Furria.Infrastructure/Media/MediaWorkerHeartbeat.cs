namespace Furria.Infrastructure.Media;

public sealed class MediaWorkerHeartbeat
{
    public const int HostNameLength = 255;
    public const int VersionLength = 100;
    public const int HardwareAccelerationLength = 16;

    public Guid InstanceId { get; set; }

    public string HostName { get; set; } = "";

    public string Version { get; set; } = "";

    public string HardwareAcceleration { get; set; } = "";

    public DateTimeOffset StartedAt { get; set; }

    public DateTimeOffset LastSeenAt { get; set; }

    public int? PhotoMediaItemId { get; set; }

    public int? VideoMediaItemId { get; set; }
}
