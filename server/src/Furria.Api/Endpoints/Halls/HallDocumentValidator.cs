using System.Diagnostics.Contracts;
using FluentValidation;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed class HallDocumentValidator : AbstractValidator<HallDocumentDto>
{
    public HallDocumentValidator()
    {
        RuleFor(document => document.Elements)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(elements => elements.Count <= HallLimits.MostElements)
            .Must(HaveDistinctIds)
            .WithMessage("Jedes Element des Saals braucht eine eigene Kennung.");
        RuleForEach(document => document.Elements).SetValidator(new HallElementValidator());
    }

    [Pure]
    private static bool HaveDistinctIds(IReadOnlyList<HallElementDto> elements) =>
        elements.Select(element => element.Id).Distinct(StringComparer.Ordinal).Count()
        == elements.Count;
}

public sealed class HallElementValidator : AbstractValidator<HallElementDto>
{
    public HallElementValidator()
    {
        RuleFor(element => element.Id).NotEmpty().MaximumLength(HallLimits.IdLength);
        RuleFor(element => element.Kind).IsInEnum();
        RuleFor(element => element.Label).MaximumLength(HallLimits.LabelLength);
        RuleFor(element => element)
            .Must(PlanBounds.HasItsShape)
            .WithMessage("Ein Element des Saals ist unvollständig oder zu groß.");
    }
}

internal static class PlanBounds
{
    [Pure]
    internal static bool IsCoordinate(double value) =>
        double.IsFinite(value) && Math.Abs(value) <= HallLimits.FarthestCoordinate;

    [Pure]
    internal static bool IsSize(double? value) =>
        value is { } size
        && double.IsFinite(size)
        && size > 0
        && size <= HallLimits.FarthestCoordinate;

    [Pure]
    internal static bool IsRotation(double? value) =>
        value is { } rotation && rotation >= 0 && rotation < HallLimits.FullTurn;

    [Pure]
    internal static bool HasItsShape(HallElementDto element) =>
        element.Kind switch
        {
            HallElementKind.Wall => IsPolyline(element.Points)
                && element.ThicknessCm is > 0 and <= HallLimits.MostThicknessCm,
            HallElementKind.Door => IsPoint(element.From)
                && IsPoint(element.To)
                && element.Door is { } door
                && Enum.IsDefined(door),
            HallElementKind.Area => IsAreaOutline(element)
                && element.Area is { } area
                && Enum.IsDefined(area),
            HallElementKind.Pillar => IsBox(element) && element.Round is not null,
            HallElementKind.Line => IsPolyline(element.Points),
            HallElementKind.Text => IsCentre(element)
                && IsRotation(element.Rotation)
                && element.Text is { Length: > 0 and <= HallLimits.TextLength }
                && !string.IsNullOrWhiteSpace(element.Text)
                && element.Size is { } size
                && Enum.IsDefined(size),
            _ => false,
        };

    [Pure]
    private static bool IsAreaOutline(HallElementDto element) =>
        element.Shape switch
        {
            null or HallAreaShape.Rect => IsBox(element) && IsRotation(element.Rotation),
            HallAreaShape.Polygon => IsPolygon(element.Points),
            _ => false,
        };

    [Pure]
    private static bool IsPolygon(IReadOnlyList<PlanPointDto>? points) =>
        points is { Count: >= 3 and <= HallLimits.MostPoints } && points.All(IsPoint);

    [Pure]
    private static bool IsPolyline(IReadOnlyList<PlanPointDto>? points) =>
        points is { Count: >= 2 and <= HallLimits.MostPoints } && points.All(IsPoint);

    [Pure]
    private static bool IsPoint(PlanPointDto? point) =>
        point is not null && IsCoordinate(point.X) && IsCoordinate(point.Y);

    [Pure]
    private static bool IsCentre(HallElementDto element) =>
        element.X is { } x && element.Y is { } y && IsCoordinate(x) && IsCoordinate(y);

    [Pure]
    private static bool IsBox(HallElementDto element) =>
        IsCentre(element) && IsSize(element.WidthCm) && IsSize(element.HeightCm);
}
