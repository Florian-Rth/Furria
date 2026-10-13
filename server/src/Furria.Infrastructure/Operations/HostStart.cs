namespace Furria.Infrastructure.Operations;

public sealed class HostStart
{
    public DateTimeOffset StartedAt { get; }

    public HostStart(TimeProvider timeProvider)
    {
        StartedAt = timeProvider.GetUtcNow();
    }
}
