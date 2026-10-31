namespace Furria.Application.Studio;

public sealed record ActVideoAlignmentDetails
{
    public required double StartSeconds { get; init; }

    public required double Confidence { get; init; }
}
