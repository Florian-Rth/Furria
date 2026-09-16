using Furria.Core.Identity;

namespace Furria.Application.Registry;

public sealed record UpdateFeeReductionCommand
{
    public required int PersonId { get; init; }

    public required int FeeReductionId { get; init; }

    public required FeeReductionBasis Basis { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int LastSessionYear { get; init; }
}
