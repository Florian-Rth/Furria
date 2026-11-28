namespace Furria.Core.Studio;

public sealed record StepBorderMove(MusicAnchor? Anchor, StepRefusal? Refusal)
{
    public static StepBorderMove Refused(StepRefusal refusal) => new(null, refusal);

    public static StepBorderMove To(MusicAnchor anchor) => new(anchor, null);
}
