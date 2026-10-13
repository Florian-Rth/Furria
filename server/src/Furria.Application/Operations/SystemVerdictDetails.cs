namespace Furria.Application.Operations;

public sealed record SystemVerdictDetails
{
    public required SystemLevel Level { get; init; }

    public required IReadOnlyList<SystemReason> Reasons { get; init; }
}
