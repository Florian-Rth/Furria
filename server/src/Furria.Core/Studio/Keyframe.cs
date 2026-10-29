namespace Furria.Core.Studio;

public sealed record Keyframe(
    MusicAnchor At,
    StagePoint Position,
    StagePoint? Bend,
    KeyframeEasing Easing,
    double? FacingDegrees
);
