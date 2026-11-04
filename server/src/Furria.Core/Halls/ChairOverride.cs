namespace Furria.Core.Halls;

public sealed record ChairOverride
{
    public required TableSide Side { get; init; }

    public required int Index { get; init; }

    public string? Number { get; init; }

    public string? Note { get; init; }

    public required bool Removed { get; init; }
}
