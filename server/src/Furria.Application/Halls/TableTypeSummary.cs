using Furria.Core.Halls;

namespace Furria.Application.Halls;

public sealed record TableTypeSummary
{
    public required int TableTypeId { get; init; }

    public required string Name { get; init; }

    public required TableShape Shape { get; init; }

    public required int LengthCm { get; init; }

    public required int WidthCm { get; init; }

    public required bool SeatsAtEnds { get; init; }

    public required bool IsArchived { get; init; }
}
