namespace Furria.Core.Studio;

public readonly record struct AnchorPlace(AnchorPlacement Placement, double? TimelineSeconds)
{
    public static readonly AnchorPlace CutAway = new(AnchorPlacement.CutAway, null);

    public static readonly AnchorPlace MusicMissing = new(AnchorPlacement.MusicMissing, null);

    public static AnchorPlace At(double timelineSeconds) =>
        new(AnchorPlacement.OnTimeline, timelineSeconds);
}
