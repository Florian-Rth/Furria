namespace Furria.Application.Operations;

public sealed record MediaQueueDetails
{
    public static readonly MediaQueueDetails Unknown = new()
    {
        Queued = 0,
        Running = 0,
        Retrying = 0,
        OldestQueuedAt = null,
    };

    public required int Queued { get; init; }

    public required int Running { get; init; }

    public required int Retrying { get; init; }

    public required DateTimeOffset? OldestQueuedAt { get; init; }

    public bool HoldsJobs => Queued + Running + Retrying > 0;
}
