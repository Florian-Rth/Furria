namespace Furria.Application.Halls;

public sealed record SeatingStandardDetails
{
    public required int ComfortableChairSpacingCm { get; init; }

    public required int MaximumChairSpacingCm { get; init; }

    public required int ChairDepthCm { get; init; }

    public required int AisleWidthCm { get; init; }

    public required int ExitClearanceCm { get; init; }
}
