using Furria.Core.Club;

namespace Furria.Core.Halls;

public sealed class SeatingStandard : ITimestamped
{
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;

    public int ComfortableChairSpacingCm { get; set; }

    public int MaximumChairSpacingCm { get; set; }

    public int ChairDepthCm { get; set; }

    public int AisleWidthCm { get; set; }

    public int ExitClearanceCm { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
