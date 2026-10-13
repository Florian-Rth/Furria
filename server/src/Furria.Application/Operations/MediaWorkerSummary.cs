namespace Furria.Application.Operations;

public sealed record MediaWorkerSummary
{
    public required Guid InstanceId { get; init; }

    public required string HostName { get; init; }

    public required string Version { get; init; }

    public required string HardwareAcceleration { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset LastSeenAt { get; init; }

    public required bool IsAlive { get; init; }

    public required int? PhotoMediaItemId { get; init; }

    public required int? VideoMediaItemId { get; init; }
}
