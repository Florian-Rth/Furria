using System.Diagnostics.Contracts;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed record HallElementDto
{
    public required string Id { get; init; }

    public required HallElementKind Kind { get; init; }

    public IReadOnlyList<PlanPointDto>? Points { get; init; }

    public double? ThicknessCm { get; init; }

    public PlanPointDto? From { get; init; }

    public PlanPointDto? To { get; init; }

    public DoorKind? Door { get; init; }

    public HallAreaKind? Area { get; init; }

    public HallAreaShape? Shape { get; init; }

    public double? X { get; init; }

    public double? Y { get; init; }

    public double? WidthCm { get; init; }

    public double? HeightCm { get; init; }

    public double? Rotation { get; init; }

    public string? Label { get; init; }

    public bool? Round { get; init; }

    public string? Text { get; init; }

    public HallTextSize? Size { get; init; }

    [Pure]
    public static HallElementDto Of(HallElement element) =>
        new()
        {
            Id = element.Id,
            Kind = element.Kind,
            Points = element.Points?.Select(PlanPointDto.From).ToList(),
            ThicknessCm = element.ThicknessCm,
            From = element.From is null ? null : PlanPointDto.From(element.From),
            To = element.To is null ? null : PlanPointDto.From(element.To),
            Door = element.Door,
            Area = element.Area,
            Shape = ShapeOf(element),
            X = element.X,
            Y = element.Y,
            WidthCm = element.WidthCm,
            HeightCm = element.HeightCm,
            Rotation = element.Rotation,
            Label = element.Label,
            Round = element.Round,
            Text = element.Text,
            Size = element.Size,
        };

    [Pure]
    public HallElement ToElement() =>
        new()
        {
            Id = Id,
            Kind = Kind,
            Points = Points?.Select(point => point.ToPoint()).ToList(),
            ThicknessCm = ThicknessCm,
            From = From?.ToPoint(),
            To = To?.ToPoint(),
            Door = Door,
            Area = Area,
            Shape = Kind == HallElementKind.Area ? Shape ?? HallAreaShape.Rect : null,
            X = X,
            Y = Y,
            WidthCm = WidthCm,
            HeightCm = HeightCm,
            Rotation = Rotation,
            Label = Label,
            Round = Round,
            Text = Text,
            Size = Size,
        };

    [Pure]
    private static HallAreaShape? ShapeOf(HallElement element) =>
        element.Kind == HallElementKind.Area ? element.Shape ?? HallAreaShape.Rect : null;
}
