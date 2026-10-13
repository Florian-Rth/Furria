namespace Furria.Application.Operations;

public sealed record MailOutboxDetails
{
    public static readonly MailOutboxDetails Unknown = new()
    {
        Pending = 0,
        Retrying = 0,
        OldestPendingAt = null,
    };

    public required int Pending { get; init; }

    public required int Retrying { get; init; }

    public required DateTimeOffset? OldestPendingAt { get; init; }
}
