using System.Diagnostics.Contracts;
using FluentValidation;
using Furria.Core.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed record ChoreographyTrackDataDto
{
    public required int SpotId { get; init; }

    public required IReadOnlyList<ChoreographyKeyframeDataDto> Keyframes { get; init; }

    [Pure]
    public static ChoreographyDocument DocumentOf(IReadOnlyList<ChoreographyTrackDataDto> tracks) =>
        new([
            .. tracks.Select(track => new SpotTrack(
                track.SpotId,
                [.. track.Keyframes.Select(KeyframeOf)]
            )),
        ]);

    [Pure]
    private static Keyframe KeyframeOf(ChoreographyKeyframeDataDto keyframe) =>
        new(
            new MusicAnchor(keyframe.SourceMediaItemId, keyframe.Seconds),
            PointOf(keyframe.Position),
            keyframe.Bend is { } bend ? PointOf(bend) : null,
            keyframe.Easing,
            keyframe.FacingDegrees
        );

    [Pure]
    private static StagePoint PointOf(ChoreographyPointDataDto point) =>
        new(point.RightMetres, point.BackMetres);
}

public sealed record ChoreographyKeyframeDataDto
{
    public required int SourceMediaItemId { get; init; }

    public required double Seconds { get; init; }

    public required ChoreographyPointDataDto Position { get; init; }

    public required ChoreographyPointDataDto? Bend { get; init; }

    public required KeyframeEasing Easing { get; init; }

    public required double? FacingDegrees { get; init; }
}

public sealed record ChoreographyPointDataDto
{
    public required double RightMetres { get; init; }

    public required double BackMetres { get; init; }
}

public sealed class ChoreographyTrackDataValidator : AbstractValidator<ChoreographyTrackDataDto>
{
    private const int MostKeyframesPerTrack = 2000;

    public ChoreographyTrackDataValidator()
    {
        RuleFor(row => row.SpotId).GreaterThan(0);
        RuleFor(row => row.Keyframes)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(keyframes => keyframes.Count <= MostKeyframesPerTrack);
        RuleForEach(row => row.Keyframes).ChildRules(KeyframeRules);
    }

    private static void KeyframeRules(InlineValidator<ChoreographyKeyframeDataDto> keyframe)
    {
        keyframe.RuleFor(row => row.SourceMediaItemId).GreaterThan(0);
        keyframe.RuleFor(row => row.Seconds).GreaterThanOrEqualTo(0).Must(double.IsFinite);
        keyframe.RuleFor(row => row.Position).NotNull();
        keyframe.RuleFor(row => row.Easing).IsInEnum();
        keyframe
            .RuleFor(row => row.FacingDegrees)
            .Must(facing => facing is not { } degrees || double.IsFinite(degrees));
    }
}
