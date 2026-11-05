using System.Diagnostics.Contracts;
using Furria.Application.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed record SeatingStandardDto
{
    public required int ComfortableChairSpacingCm { get; init; }

    public required int MaximumChairSpacingCm { get; init; }

    public required int ChairDepthCm { get; init; }

    public required int AisleWidthCm { get; init; }

    public required int ExitClearanceCm { get; init; }

    [Pure]
    public static SeatingStandardDto From(SeatingStandardDetails standard) =>
        new()
        {
            ComfortableChairSpacingCm = standard.ComfortableChairSpacingCm,
            MaximumChairSpacingCm = standard.MaximumChairSpacingCm,
            ChairDepthCm = standard.ChairDepthCm,
            AisleWidthCm = standard.AisleWidthCm,
            ExitClearanceCm = standard.ExitClearanceCm,
        };
}
