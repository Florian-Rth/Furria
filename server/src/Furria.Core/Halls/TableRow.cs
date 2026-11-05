namespace Furria.Core.Halls;

public sealed record TableRow
{
    public required string Id { get; init; }

    public required int TableTypeId { get; init; }

    public required int Count { get; init; }

    public required double X { get; init; }

    public required double Y { get; init; }

    public required double Rotation { get; init; }

    public SeatingMode? Seating { get; init; }

    public string? GroupId { get; init; }

    public required TableRowSides Sides { get; init; }

    public string? Number { get; init; }

    public string? Note { get; init; }

    public required IReadOnlyList<ChairOverride> Chairs { get; init; }
}
