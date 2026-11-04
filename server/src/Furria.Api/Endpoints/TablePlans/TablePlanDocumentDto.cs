using System.Diagnostics.Contracts;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed record TablePlanDocumentDto
{
    public required SeatingMode Seating { get; init; }

    public required IReadOnlyList<TableRowDto> Rows { get; init; }

    public required IReadOnlyList<TableGroupDto> Groups { get; init; }

    [Pure]
    public static TablePlanDocumentDto Of(TablePlanDocument document) =>
        new()
        {
            Seating = document.Seating,
            Rows = [.. document.Rows.Select(TableRowDto.Of)],
            Groups = [.. document.Groups.Select(TableGroupDto.Of)],
        };

    [Pure]
    public TablePlanDocument ToDocument() =>
        new()
        {
            Seating = Seating,
            Rows = [.. Rows.Select(row => row.ToRow())],
            Groups = [.. Groups.Select(group => group.ToGroup())],
        };
}

public sealed record TableRowDto
{
    public required string Id { get; init; }

    public required int TableTypeId { get; init; }

    public required int Count { get; init; }

    public required double X { get; init; }

    public required double Y { get; init; }

    public required double Rotation { get; init; }

    public required SeatingMode? Seating { get; init; }

    public required string? GroupId { get; init; }

    public required TableRowSidesDto Sides { get; init; }

    public required string? Number { get; init; }

    public required string? Note { get; init; }

    public required IReadOnlyList<ChairOverrideDto> Chairs { get; init; }

    [Pure]
    public static TableRowDto Of(TableRow row) =>
        new()
        {
            Id = row.Id,
            TableTypeId = row.TableTypeId,
            Count = row.Count,
            X = row.X,
            Y = row.Y,
            Rotation = row.Rotation,
            Seating = row.Seating,
            GroupId = row.GroupId,
            Sides = TableRowSidesDto.Of(row.Sides),
            Number = row.Number,
            Note = row.Note,
            Chairs = [.. row.Chairs.Select(ChairOverrideDto.Of)],
        };

    [Pure]
    public TableRow ToRow() =>
        new()
        {
            Id = Id,
            TableTypeId = TableTypeId,
            Count = Count,
            X = X,
            Y = Y,
            Rotation = Rotation,
            Seating = Seating,
            GroupId = GroupId,
            Sides = Sides.ToSides(),
            Number = Number,
            Note = Note,
            Chairs = [.. Chairs.Select(chair => chair.ToOverride())],
        };
}

public sealed record TableRowSidesDto
{
    public required bool Front { get; init; }

    public required bool Back { get; init; }

    public required bool Start { get; init; }

    public required bool End { get; init; }

    [Pure]
    public static TableRowSidesDto Of(TableRowSides sides) =>
        new()
        {
            Front = sides.Front,
            Back = sides.Back,
            Start = sides.Start,
            End = sides.End,
        };

    [Pure]
    public TableRowSides ToSides() =>
        new()
        {
            Front = Front,
            Back = Back,
            Start = Start,
            End = End,
        };
}

public sealed record ChairOverrideDto
{
    public required TableSide Side { get; init; }

    public required int Index { get; init; }

    public required string? Number { get; init; }

    public required string? Note { get; init; }

    public required bool Removed { get; init; }

    [Pure]
    public static ChairOverrideDto Of(ChairOverride chair) =>
        new()
        {
            Side = chair.Side,
            Index = chair.Index,
            Number = chair.Number,
            Note = chair.Note,
            Removed = chair.Removed,
        };

    [Pure]
    public ChairOverride ToOverride() =>
        new()
        {
            Side = Side,
            Index = Index,
            Number = Number,
            Note = Note,
            Removed = Removed,
        };
}

public sealed record TableGroupDto
{
    public required string Id { get; init; }

    public required string? Number { get; init; }

    public required string? Note { get; init; }

    [Pure]
    public static TableGroupDto Of(TableGroup group) =>
        new()
        {
            Id = group.Id,
            Number = group.Number,
            Note = group.Note,
        };

    [Pure]
    public TableGroup ToGroup() =>
        new()
        {
            Id = Id,
            Number = Number,
            Note = Note,
        };
}
