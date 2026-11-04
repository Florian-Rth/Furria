namespace Furria.Core.Halls;

public sealed record HallElement
{
    public required string Id { get; init; }

    public required HallElementKind Kind { get; init; }

    public IReadOnlyList<PlanPoint>? Points { get; init; }

    public double? ThicknessCm { get; init; }

    public PlanPoint? From { get; init; }

    public PlanPoint? To { get; init; }

    public DoorKind? Door { get; init; }

    public HallAreaKind? Area { get; init; }

    public double? X { get; init; }

    public double? Y { get; init; }

    public double? WidthCm { get; init; }

    public double? HeightCm { get; init; }

    public double? Rotation { get; init; }

    public string? Label { get; init; }

    public bool? Round { get; init; }

    public string? Text { get; init; }

    public HallTextSize? Size { get; init; }
}
