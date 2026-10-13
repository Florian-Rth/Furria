namespace Furria.Application.Operations;

public sealed record SystemReason
{
    public required SystemCheck Check { get; init; }

    public required SystemLevel Level { get; init; }

    public required SystemReasonCode Code { get; init; }

    public double? Value { get; init; }

    public string? Subject { get; init; }
}
