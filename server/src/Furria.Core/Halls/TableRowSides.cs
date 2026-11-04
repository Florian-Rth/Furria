namespace Furria.Core.Halls;

public sealed record TableRowSides
{
    public required bool Front { get; init; }

    public required bool Back { get; init; }

    public required bool Start { get; init; }

    public required bool End { get; init; }
}
