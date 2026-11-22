namespace Furria.Application.Operations;

public sealed record WhatsAppOutboxDetails
{
    public static readonly WhatsAppOutboxDetails Unknown = new()
    {
        Waiting = 0,
        Retrying = 0,
        Failed = 0,
        OldestWaitingAt = null,
    };

    public required int Waiting { get; init; }

    public required int Retrying { get; init; }

    public required int Failed { get; init; }

    public required DateTimeOffset? OldestWaitingAt { get; init; }
}
