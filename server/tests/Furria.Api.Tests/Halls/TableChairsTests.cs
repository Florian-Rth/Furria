using Furria.Core.Halls;
using Xunit;

namespace Furria.Api.Tests.Halls;

public sealed class TableChairsTests
{
    private const int Biertisch = 1;
    private const int Tisch = 2;
    private const int Rund = 3;

    private static readonly SeatingStandard Standard = new()
    {
        ComfortableChairSpacingCm = 60,
        MaximumChairSpacingCm = 45,
        ChairDepthCm = 50,
        AisleWidthCm = 120,
        ExitClearanceCm = 120,
    };

    private static readonly IReadOnlyDictionary<int, TableType> Types = new Dictionary<
        int,
        TableType
    >
    {
        [Biertisch] = new()
        {
            Id = Biertisch,
            Name = "Biertisch",
            Shape = TableShape.Rectangle,
            LengthCm = 220,
            WidthCm = 50,
            SeatsAtEnds = false,
        },
        [Tisch] = new()
        {
            Id = Tisch,
            Name = "Tisch",
            Shape = TableShape.Rectangle,
            LengthCm = 120,
            WidthCm = 80,
            SeatsAtEnds = true,
        },
        [Rund] = new()
        {
            Id = Rund,
            Name = "Rund",
            Shape = TableShape.Round,
            LengthCm = 160,
            WidthCm = 160,
            SeatsAtEnds = false,
        },
    };

    [Theory]
    [InlineData(Biertisch, 1, null, null, "FB", "", 6)]
    [InlineData(Biertisch, 1, SeatingMode.Maximum, null, "FB", "", 8)]
    [InlineData(Biertisch, 4, null, null, "FB", "", 28)]
    [InlineData(Tisch, 1, null, null, "FBSE", "", 6)]
    [InlineData(Tisch, 1, SeatingMode.Maximum, null, "FBSE", "", 6)]
    [InlineData(Tisch, 3, null, null, "FE", "", 7)]
    [InlineData(Biertisch, 1, null, null, "FBSE", "", 6)]
    [InlineData(Rund, 1, null, null, "FB", "", 10)]
    [InlineData(Rund, 2, null, SeatingMode.Maximum, "FB", "", 28)]
    [InlineData(Rund, 1, null, null, "", "", 10)]
    [InlineData(Tisch, 1, null, null, "FBSE", "front:0 start:0 front:5", 4)]
    [InlineData(Biertisch, 1, SeatingMode.Comfortable, SeatingMode.Maximum, "FB", "", 8)]
    [InlineData(Rund, 2, null, null, "FB", "around:12 around:25", 19)]
    [InlineData(Tisch, 1, null, null, "FBSE", "front:0 front:0", 5)]
    [InlineData(Tisch, 1, null, null, "FBSE", "around:0", 6)]
    [InlineData(Rund, 1, null, null, "FB", "front:0", 10)]
    [InlineData(Biertisch, 1, null, null, "", "", 0)]
    [InlineData(Tisch, 2, null, null, "B", "back:3", 3)]
    public void Should_CountTheChairsOfARow_When_ItStandsAsGiven(
        int tableTypeId,
        int count,
        SeatingMode? planSeating,
        SeatingMode? rowSeating,
        string sides,
        string removed,
        int expected
    )
    {
        var document = new TablePlanDocument
        {
            Seating = planSeating ?? SeatingMode.Comfortable,
            Rows = [RowOf(tableTypeId, count, rowSeating, sides, removed)],
            Groups = [],
        };

        var counted = TableChairs.CountOf(document, Types, Standard);

        Assert.Equal(new TablePlanCount(count, expected), counted);
    }

    [Fact]
    public void Should_SumEveryRow_When_ThePlanHoldsSeveralRows()
    {
        var document = new TablePlanDocument
        {
            Seating = SeatingMode.Comfortable,
            Rows = [RowOf(Biertisch, 4, null, "FB", ""), RowOf(Rund, 2, null, "", "")],
            Groups = [],
        };

        var counted = TableChairs.CountOf(document, Types, Standard);

        Assert.Equal(new TablePlanCount(6, 48), counted);
    }

    private static TableRow RowOf(
        int tableTypeId,
        int count,
        SeatingMode? seating,
        string sides,
        string removed
    ) =>
        new()
        {
            Id = $"r{tableTypeId}-{count}",
            TableTypeId = tableTypeId,
            Count = count,
            X = 0,
            Y = 0,
            Rotation = 0,
            Seating = seating,
            GroupId = null,
            Sides = new TableRowSides
            {
                Front = sides.Contains('F'),
                Back = sides.Contains('B'),
                Start = sides.Contains('S'),
                End = sides.Contains('E'),
            },
            Number = null,
            Note = null,
            Chairs =
            [
                .. removed.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(RemovedOf),
            ],
        };

    private static ChairOverride RemovedOf(string key)
    {
        var parts = key.Split(':');

        return new ChairOverride
        {
            Side = Enum.Parse<TableSide>(parts[0], ignoreCase: true),
            Index = int.Parse(parts[1]),
            Number = null,
            Note = null,
            Removed = true,
        };
    }
}
