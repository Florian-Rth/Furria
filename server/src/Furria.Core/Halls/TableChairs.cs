using System.Diagnostics.Contracts;

namespace Furria.Core.Halls;

public static class TableChairs
{
    [Pure]
    public static TablePlanCount CountOf(
        TablePlanDocument document,
        IReadOnlyDictionary<int, TableType> tableTypes,
        SeatingStandard standard
    ) =>
        new(
            document.Rows.Sum(row => row.Count),
            document.Rows.Sum(row => ChairsOf(row, tableTypes, document.Seating, standard))
        );

    [Pure]
    private static int ChairsOf(
        TableRow row,
        IReadOnlyDictionary<int, TableType> tableTypes,
        SeatingMode planSeating,
        SeatingStandard standard
    )
    {
        if (!tableTypes.TryGetValue(row.TableTypeId, out var tableType))
            return 0;

        var capacities = CapacitiesOf(
            row,
            tableType,
            SpacingOf(row.Seating ?? planSeating, standard),
            standard.ChairDepthCm
        );

        return capacities.Values.Sum() - RemovedCountOf(row.Chairs, capacities);
    }

    [Pure]
    private static int SpacingOf(SeatingMode seating, SeatingStandard standard) =>
        seating == SeatingMode.Maximum
            ? standard.MaximumChairSpacingCm
            : standard.ComfortableChairSpacingCm;

    [Pure]
    private static IReadOnlyDictionary<TableSide, int> CapacitiesOf(
        TableRow row,
        TableType tableType,
        int spacing,
        int chairDepthCm
    ) =>
        tableType.Shape == TableShape.Round
            ? new Dictionary<TableSide, int>
            {
                [TableSide.Around] =
                    row.Count * ChairsAroundOf(tableType.LengthCm, chairDepthCm, spacing),
            }
            : RectangleCapacitiesOf(row, tableType, spacing);

    [Pure]
    private static int ChairsAroundOf(int diameterCm, int chairDepthCm, int spacing) =>
        (int)Math.Floor(Math.PI * (diameterCm + chairDepthCm) / spacing);

    [Pure]
    private static Dictionary<TableSide, int> RectangleCapacitiesOf(
        TableRow row,
        TableType tableType,
        int spacing
    )
    {
        var longSide = row.Count * tableType.LengthCm / spacing;
        var endSide = tableType.SeatsAtEnds ? tableType.WidthCm / spacing : 0;

        return new Dictionary<TableSide, int>
        {
            [TableSide.Front] = row.Sides.Front ? longSide : 0,
            [TableSide.Back] = row.Sides.Back ? longSide : 0,
            [TableSide.Start] = row.Sides.Start ? endSide : 0,
            [TableSide.End] = row.Sides.End ? endSide : 0,
        };
    }

    [Pure]
    private static int RemovedCountOf(
        IEnumerable<ChairOverride> chairs,
        IReadOnlyDictionary<TableSide, int> capacities
    ) =>
        chairs
            .Where(chair =>
                chair.Removed
                && chair.Index >= 0
                && capacities.TryGetValue(chair.Side, out var capacity)
                && chair.Index < capacity
            )
            .Select(chair => (chair.Side, chair.Index))
            .Distinct()
            .Count();
}
