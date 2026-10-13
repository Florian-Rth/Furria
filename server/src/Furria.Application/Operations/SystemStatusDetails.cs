namespace Furria.Application.Operations;

public sealed record SystemStatusDetails
{
    public required SystemFacts Facts { get; init; }

    public required SystemVerdictDetails Verdict { get; init; }
}
