namespace Furria.Core.Halls;

public sealed record TablePlanDocument
{
    public static readonly TablePlanDocument Empty = new()
    {
        Seating = SeatingMode.Comfortable,
        Rows = [],
        Groups = [],
    };

    public required SeatingMode Seating { get; init; }

    public required IReadOnlyList<TableRow> Rows { get; init; }

    public required IReadOnlyList<TableGroup> Groups { get; init; }
}
