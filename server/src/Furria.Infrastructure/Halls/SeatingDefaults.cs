using Furria.Core.Halls;

namespace Furria.Infrastructure.Halls;

public static class SeatingDefaults
{
    public const int ComfortableChairSpacingCm = 60;
    public const int MaximumChairSpacingCm = 45;
    public const int ChairDepthCm = 50;
    public const int AisleWidthCm = 120;
    public const int ExitClearanceCm = 120;

    public static SeatingStandard NewStandard() =>
        new()
        {
            ComfortableChairSpacingCm = ComfortableChairSpacingCm,
            MaximumChairSpacingCm = MaximumChairSpacingCm,
            ChairDepthCm = ChairDepthCm,
            AisleWidthCm = AisleWidthCm,
            ExitClearanceCm = ExitClearanceCm,
        };
}
